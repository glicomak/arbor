import { boolean, date, integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const programsTable = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false)
});

export const programsRelations = relations(programsTable, ({ many }) => ({
  courses: many(coursesTable)
}));

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  programId: integer("program_id")
    .notNull()
    .references(() => programsTable.id),
  name: text("name").notNull(),
  description: text("description"),
  prompt: text("prompt"),
  credits: integer("credits").notNull(),
  status: text("status").default("draft").notNull()
});

export const coursesRelations = relations(coursesTable, ({ one, many }) => ({
  program: one(programsTable, {
    fields: [coursesTable.programId],
    references: [programsTable.id]
  }),
  weeks: many(weeksTable)
}));


export const weeksTable = pgTable("weeks", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => coursesTable.id),
  serial: integer("serial").notNull(),
  name: text("name"),
  status: text("status").default("pending").notNull(),
  startDate: date("start_date")
});

export const weeksRelations = relations(weeksTable, ({ one, many }) => ({
  course: one(coursesTable, {
    fields: [weeksTable.courseId],
    references: [coursesTable.id]
  }),
  targets: many(targetsTable)
}));


export const targetsTable = pgTable("targets", {
  id: serial("id").primaryKey(),
  weekId: integer("week_id")
    .notNull()
    .references(() => weeksTable.id),
  serial: integer("serial").notNull(),
  text: text("text").notNull(), 
  status: text("status").default("pending").notNull()
});

export const targetsRelations = relations(targetsTable, ({ one }) => ({
  week: one(weeksTable, {
    fields: [targetsTable.weekId],
    references: [weeksTable.id]
  })
}));
