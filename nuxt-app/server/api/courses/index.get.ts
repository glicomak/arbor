import { db } from "~/../src/db/db";
import { coursesTable } from "~/../src/db/schema";
import { asc } from "drizzle-orm";

export default defineEventHandler(async (_) => {
  try {
    const allCourses = await db.query.coursesTable.findMany({
      with: { program: true },
      orderBy: [asc(coursesTable.id)]
    });
    return allCourses;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to retrieve course data from the database.",
      message: "A database error occurred."
    });
  }
})
