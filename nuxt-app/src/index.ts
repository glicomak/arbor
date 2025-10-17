import "dotenv/config";
import { programsTable } from "./db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool, { schema: { programsTable } });

async function main() {
  const miscellaneousProgram = {
    name: "Miscellaneous",
    description: "A collection of general, interdisciplinary, or non-departmental courses.",
    isDefault: true
  };

  try {
    await db
      .insert(programsTable)
      .values(miscellaneousProgram);
  } catch (error) {
    console.error("Error: ", error);
  } finally {
    await pool.end();
  }
}

main();
