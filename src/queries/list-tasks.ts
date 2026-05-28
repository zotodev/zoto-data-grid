import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm"
import db from "@/db"
import { tasks } from "@/db/schema"

export type TasksFilter = {
  q?: string
  status?: string[]
  priority?: string[]
  page?: number
  perPage?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

const sortableColumns = {
  title: tasks.title,
  status: tasks.status,
  label: tasks.label,
  priority: tasks.priority,
  createdAt: tasks.createdAt
} as const

function parseArrayParam(param: string | string[] | undefined): string[] | undefined {
  if (!param) return undefined
  if (Array.isArray(param)) return param
  return param.split(",").filter(Boolean)
}

export async function listTasks(filter: TasksFilter = {}) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const { q, page = 1, perPage = 10, sortBy, sortOrder } = filter
  const status = parseArrayParam(filter.status)
  const priority = parseArrayParam(filter.priority)

  const conditions = []

  if (status && status.length > 0) {
    conditions.push(status.length === 1 ? eq(tasks.status, status[0]) : inArray(tasks.status, status))
  }

  if (priority && priority.length > 0) {
    conditions.push(priority.length === 1 ? eq(tasks.priority, priority[0]) : inArray(tasks.priority, priority))
  }

  if (q) {
    const searchCondition = or(
      sql`${tasks.title} LIKE ${`%${q}%`} COLLATE NOCASE`,
      sql`${tasks.label} LIKE ${`%${q}%`} COLLATE NOCASE`
    )
    if (searchCondition) {
      conditions.push(searchCondition)
    }
  }

  const orderBy =
    sortBy && sortBy in sortableColumns
      ? [
          sortOrder === "asc"
            ? asc(sortableColumns[sortBy as keyof typeof sortableColumns])
            : desc(sortableColumns[sortBy as keyof typeof sortableColumns])
        ]
      : [desc(tasks.createdAt)]

  const offset = (page - 1) * perPage

  const rows = await db
    .select()
    .from(tasks)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(perPage + 1)
    .offset(offset)

  const hasNextPage = rows.length > perPage

  return {
    data: rows.slice(0, perPage),
    hasNextPage
  }
}
