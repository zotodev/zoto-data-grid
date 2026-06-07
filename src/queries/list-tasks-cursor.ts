import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm"
import db from "@/db"
import { tasks } from "@/db/schema"

const sortableColumns = {
  title: tasks.title,
  description: tasks.description,
  status: tasks.status,
  label: tasks.label,
  priority: tasks.priority,
  assignee: tasks.assignee,
  dueDate: tasks.dueDate,
  createdAt: tasks.createdAt,
  updatedAt: tasks.updatedAt
} as const

export type TaskGridParams = {
  cursor?: string
  perPage?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  q?: string
  status?: string
  priority?: string
  dueDate?: number
}

export async function listTasksCursor(params: TaskGridParams = {}) {
  const { cursor, perPage = 50, sortBy, sortOrder, q, priority, dueDate } = params
  const status = params.status?.split(",").filter(Boolean)
  const conditions = []

  if (status?.length) {
    conditions.push(status.length === 1 ? eq(tasks.status, status[0]) : inArray(tasks.status, status))
  }

  if (priority) {
    conditions.push(eq(tasks.priority, priority))
  }

  if (dueDate !== undefined) {
    conditions.push(eq(tasks.dueDate, new Date(dueDate)))
  }

  if (q) {
    const search = or(
      sql`${tasks.title} LIKE ${`%${q}%`} COLLATE NOCASE`,
      sql`${tasks.label} LIKE ${`%${q}%`} COLLATE NOCASE`
    )
    if (search) conditions.push(search)
  }

  const orderBy =
    sortBy && sortBy in sortableColumns
      ? [
          sortOrder === "asc"
            ? asc(sortableColumns[sortBy as keyof typeof sortableColumns])
            : desc(sortableColumns[sortBy as keyof typeof sortableColumns])
        ]
      : [desc(tasks.createdAt)]

  const offset = cursor ? Number.parseInt(cursor, 10) : 0

  const rows = await db
    .select()
    .from(tasks)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(perPage + 1)
    .offset(Number.isNaN(offset) ? 0 : offset)

  const hasNextPage = rows.length > perPage
  const nextOffset = (Number.isNaN(offset) ? 0 : offset) + perPage

  return {
    data: rows.slice(0, perPage),
    nextCursor: hasNextPage ? String(nextOffset) : undefined
  }
}
