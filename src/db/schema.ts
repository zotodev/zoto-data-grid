import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 21)

export const taskStatus = ["TODO", "IN_PROGRESS", "DONE"] as const
export type TaskStatus = (typeof taskStatus)[number]

export const taskPriority = ["low", "medium", "high"] as const
export type TaskPriority = (typeof taskPriority)[number]

export const tasks = sqliteTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `task_${nanoid()}`),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("TODO"),
  label: text("label").notNull(),
  priority: text("priority").notNull().default("low"),
  assignee: text("assignee"),
  dueDate: integer("due_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(() => new Date())
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
