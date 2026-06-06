import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"
import { and, asc, desc, type SQL } from "drizzle-orm"
import db from "@/db"
import { tasks } from "@/db/schema"
import {
  buildCursorPayload,
  buildDrizzleOrderBy,
  buildDrizzleWhere,
  buildKeysetWhere,
  decodeCursor,
  encodeCursor
} from "@/lib/server-grid-filters"

// One place that says which columns can be filtered/sorted, what Drizzle column they map to,
// and how to coerce their values. Point a key at any table's column to filter/sort across joins.
const COLUMN_MAP = {
  id: tasks.id,
  title: tasks.title,
  description: tasks.description,
  status: tasks.status,
  label: tasks.label,
  priority: tasks.priority,
  assignee: tasks.assignee,
  dueDate: tasks.dueDate,
  createdAt: tasks.createdAt,
  updatedAt: tasks.updatedAt
}

const VARIANTS = {
  id: "short-text",
  title: "text",
  description: "long-text",
  status: "multiSelect",
  label: "short-text",
  priority: "select",
  assignee: "short-text",
  dueDate: "date",
  createdAt: "date",
  updatedAt: "date"
} as const

const DEFAULT_SORT: SortingState = [{ id: "createdAt", desc: true }]

export type TaskGridParams = {
  pageParam?: string
  pageSize?: number
  sorting?: SortingState
  filters?: ColumnFiltersState
}

export async function listTasksCursor(params: TaskGridParams = {}) {
  const { pageParam, pageSize = 50, sorting = [], filters = [] } = params

  const effectiveSort = sorting.length > 0 ? sorting : DEFAULT_SORT
  const lastDesc = effectiveSort[effectiveSort.length - 1]?.desc ?? true
  const sortingWithId = [...effectiveSort, { id: "id", desc: lastDesc }]

  const filterWhere = buildDrizzleWhere(filters, COLUMN_MAP, VARIANTS)

  const decoded = pageParam ? decodeCursor(pageParam) : null
  const keysetWhere = decoded ? buildKeysetWhere(decoded, sortingWithId, COLUMN_MAP, VARIANTS) : undefined

  const where: SQL | undefined =
    filterWhere && keysetWhere ? and(filterWhere, keysetWhere) : (filterWhere ?? keysetWhere)

  const orderBy = buildDrizzleOrderBy(effectiveSort, COLUMN_MAP)
  const finalOrderBy = [...orderBy, lastDesc ? desc(tasks.id) : asc(tasks.id)]

  const rows = await db
    .select()
    .from(tasks)
    .where(where)
    .orderBy(...finalOrderBy)
    .limit(pageSize + 1)

  const hasMore = rows.length > pageSize
  const pageRows = hasMore ? rows.slice(0, pageSize) : rows
  const last = pageRows[pageRows.length - 1]
  const nextCursor = hasMore && last ? encodeCursor(buildCursorPayload(last, sortingWithId)) : undefined

  return { data: pageRows, nextCursor }
}
