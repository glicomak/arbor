import { db } from "~/../src/db/db";
import { coursesTable, programsTable } from "~/../src/db/schema";
import { eq, asc } from "drizzle-orm";

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
    const program = await db.query.programsTable.findFirst({
      where: eq(programsTable.id, programId),
      with: {
        courses: { orderBy: [asc(coursesTable.id)] }
      }
    });

    if (!program) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: `Program with ID ${programId} not found.`
      });
    }

    return program;
  } catch (error) {
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
