import { db } from "~/../src/db/db";
import { programsTable } from "~/../src/db/schema";
import { asc } from "drizzle-orm";

export default defineEventHandler(async (_) => {
  try {
    const allPrograms = await db.query.programsTable.findMany({
      orderBy: [asc(programsTable.id)]
    });
    return allPrograms;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to retrieve program data from the database.",
      message: "A database error occurred."
    });
  }
})
