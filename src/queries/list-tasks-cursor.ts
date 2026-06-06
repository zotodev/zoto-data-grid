import type { SortingState } from "@tanstack/react-table"
import { and, asc, desc, eq, inArray, or, type SQL, sql } from "drizzle-orm"
import db from "@/db"
import { tasks } from "@/db/schema"
import { normalizeTaskGridSorting } from "@/lib/task-grid-params"

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
  sorting?: SortingState
  q?: string
  status?: string
  priority?: string
  dueDate?: number
}

export async function listTasksCursor(params: TaskGridParams = {}) {
  const { cursor, perPage = 50, q, priority, dueDate } = params
  const sorting = normalizeTaskGridSorting(params.sorting)
  const status = params.status?.split(",").filter(Boolean)
  const conditions: SQL[] = []

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

  const orderBy = sorting.flatMap((sort) => {
    const column = sortableColumns[sort.id as keyof typeof sortableColumns]
    return column ? [sort.desc ? desc(column) : asc(column)] : []
  })

  const lastSortDescending = sorting[sorting.length - 1]?.desc ?? true
  orderBy.push(lastSortDescending ? desc(tasks.id) : asc(tasks.id))

  const offset = cursor ? Number.parseInt(cursor, 10) : 0

  const data = await db
    .select()
    .from(tasks)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(perPage)
    .offset(Number.isNaN(offset) ? 0 : offset)

  const hasNextPage = data.length === perPage
  const nextOffset = (Number.isNaN(offset) ? 0 : offset) + perPage

  return {
    data,
    nextCursor: hasNextPage ? String(nextOffset) : undefined
  }
}
