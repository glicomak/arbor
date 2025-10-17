import { db } from "~/../src/db/db";
import { weeksTable } from "~/../src/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const idString = event.context.params?.id;
  if (!idString) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Week ID is missing from the request path."
    });
  }
  const weekId = parseInt(idString, 10);
  if (isNaN(weekId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid week ID format: ${idString}. Must be an integer.`
    });
  }

  const { status } = await readBody(event);
  if (!["pending", "complete"].includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid status: ${status}.`
    });
  }

  try {
    const week = await db.query.weeksTable.findFirst({ where: eq(weeksTable.id, weekId) });
    if (!week) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: `Course with ID ${weekId} not found.`
      });
    }

    await db.update(weeksTable).set({ status }).where(eq(weeksTable.id, weekId));
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
