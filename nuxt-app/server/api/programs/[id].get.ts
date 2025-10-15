import { db } from "~/../src/db/db";
import { coursesTable, programsTable } from "~/../src/db/schema";
import { asc, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const idString = event.context.params?.id;

  if (!idString) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Program ID is missing from the request path."
    });
  }
  
  const programId = parseInt(idString, 10);
  if (isNaN(programId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid program ID format: ${idString}. Must be an integer.`
    });
  }

  try {
    const programWithWeeks = await db.query.programsTable.findFirst({
      where: eq(programsTable.id, programId),
      with: {
        courses: {
          with: { weeks: true },
          orderBy: [asc(coursesTable.id)]
        }
      }
    });

    if (!programWithWeeks) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: `Program with ID ${programId} not found.`
      });
    }

    const coursesWithWeeks = programWithWeeks.courses;

    const courses = coursesWithWeeks.map(courseWithWeeks => {
      const totalWeeks = courseWithWeeks.weeks.length;
      const completedWeeks = courseWithWeeks.weeks.filter(week => week.status == "complete").length;
      const completion = (totalWeeks > 0) ? (completedWeeks / totalWeeks) : 0;

      const { weeks, ...courseWithoutWeeks } = courseWithWeeks;
      const course = {
        ...courseWithoutWeeks,
        completion
      }

      return course
    });

    const { courses: _, ...programWithoutCourses } = programWithWeeks;
    const program = {
      courses,
      ...programWithoutCourses
    }

    return program;
  } catch (error: any) {
    if (error.statusCode) {
        throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Failed to retrieve program data from the database."
    });
  }
})
