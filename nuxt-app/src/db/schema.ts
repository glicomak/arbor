import { serial, integer, pgTable, varchar, boolean, text } from "drizzle-orm/pg-core";

export const programsTable = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description")
});

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  programId: integer("program_id")
    .notNull()
    .references(() => programsTable.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isDraft: boolean("is_draft").default(true).notNull(),
  credits: integer("credits").notNull()
});

export const weeksTable = pgTable("weeks", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => coursesTable.id),
  weekIndex: integer("week_index").notNull(),
  name: varchar("name", { length: 255 }),
});

export const targetsTable = pgTable("targets", {
  id: serial("id").primaryKey(),
  weekId: integer("week_id")
    .notNull()
    .references(() => weeksTable.id),
  text: text("text").notNull(), 
  status: varchar("status", { length: 50 }).default("pending").notNull()
});

export const schema = {
  programsTable,
  coursesTable,
  weeksTable,
  targetsTable
};
