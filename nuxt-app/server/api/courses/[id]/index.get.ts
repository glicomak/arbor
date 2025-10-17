import { db } from "~/../src/db/db";
import { coursesTable, targetsTable, weeksTable } from "~/../src/db/schema";
import { asc, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const idString = event.context.params?.id;

  if (!idString) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Course ID is missing from the request path."
    });
  }
  
  const courseId = parseInt(idString, 10);
  if (isNaN(courseId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid course ID format: ${idString}. Must be an integer.`
    });
  }

  try {
    const course = await db.query.coursesTable.findFirst({
      where: eq(coursesTable.id, courseId),
      with: {
        program: true,
        weeks: {
          orderBy: [asc(weeksTable.serial)], 
          with: { targets: { orderBy: [asc(targetsTable.serial)] } }
        }
      }
    });

    if (!course) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: `Course with ID ${courseId} not found.`
      });
    }

    return course;
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Failed to retrieve course data from the database."
    });
  }
});
