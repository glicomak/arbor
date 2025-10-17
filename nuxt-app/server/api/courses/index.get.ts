import { db } from "~/../src/db/db";
import { coursesTable } from "~/../src/db/schema";
import { asc, eq } from "drizzle-orm";

export default defineEventHandler(async (_) => {
  try {
    const coursesWithWeeks = await db.query.coursesTable.findMany({
      where: eq(coursesTable.status, "active"),
      with: {
        program: true,
        weeks: true
      },
      orderBy: [asc(coursesTable.id)]
    });

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

    return courses;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to retrieve course data from the database.",
      message: "A database error occurred."
    });
  }
})
