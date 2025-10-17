import { db } from "~/../src/db/db";
import { coursesTable, weeksTable } from "~/../src/db/schema";
import { and, asc, eq, ne } from "drizzle-orm";

function getMondayOfCurrentWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  const daysSinceMonday = (day + 6) % 7;
  d.setDate(d.getDate() - daysSinceMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

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

  const { status } = await readBody(event);
  if (!["pending", "active", "complete"].includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid status: ${status}.`
    });
  }

  try {
    const course = await db.query.coursesTable.findFirst({ where: eq(coursesTable.id, courseId) });
    if (!course) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: `Course with ID ${courseId} not found.`
      });
    } else if (course.status == "draft") {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Course with ID ${courseId} is draft.`
      });
    }

    await db.update(coursesTable).set({ status }).where(eq(coursesTable.id, courseId));

    if (status == "pending") {
      await db
        .update(weeksTable)
        .set({ startDate: null })
        .where(and(
            eq(weeksTable.courseId, courseId),
            ne(weeksTable.status, "complete")
          ));
    } else if (status === "active") {
      const currentMonday = getMondayOfCurrentWeek();
      
      await db.transaction(async (tx) => {
        const weeks = await tx.query.weeksTable.findMany({
          where: and(
            eq(weeksTable.courseId, courseId),
            ne(weeksTable.status, "complete")
          ),
          orderBy: asc(weeksTable.serial),
        });

        for (let i = 0; i < weeks.length; i++) {
          const week = weeks[i];
          const startDate = addWeeks(currentMonday, i);
          const formattedDate = startDate.toLocaleDateString("en-CA");

          await tx
            .update(weeksTable)
            .set({ startDate: formattedDate })
            .where(eq(weeksTable.id, week.id));
        }
      });
    }
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
});
