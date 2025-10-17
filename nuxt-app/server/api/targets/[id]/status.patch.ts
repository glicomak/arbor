import { db } from "~/../src/db/db";
import { targetsTable } from "~/../src/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const idString = event.context.params?.id;
  if (!idString) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "target ID is missing from the request path."
    });
  }
  const targetId = parseInt(idString, 10);
  if (isNaN(targetId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid target ID format: ${idString}. Must be an integer.`
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
    const target = await db.query.targetsTable.findFirst({ where: eq(targetsTable.id, targetId) });
    if (!target) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: `Course with ID ${targetId} not found.`
      });
    }

    await db.update(targetsTable).set({ status }).where(eq(targetsTable.id, targetId));
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
