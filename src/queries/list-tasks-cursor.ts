import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"
import { and, asc, desc, type SQL } from "drizzle-orm"
import db from "@/db"
import { tasks } from "@/db/schema"
import {
  buildCursorPayload,
  buildDrizzleOrderBy,
  buildDrizzleWhere,
  buildKeysetWhere,
  type DrizzleColumnMap,
  decodeCursor,
  encodeCursor,
  type VariantMap
} from "@/lib/server-grid-filters"
import type { CellOpts } from "@/types/data-grid"

export type TaskGridParams = {
  pageParam?: string
  pageSize?: number
  sorting?: SortingState
  filters?: ColumnFiltersState
}

const COLUMN_MAP: DrizzleColumnMap = {
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

const VARIANTS: VariantMap = {
  id: "short-text",
  title: "short-text",
  description: "long-text",
  status: "select",
  label: "short-text",
  priority: "select",
  assignee: "short-text",
  dueDate: "date",
  createdAt: "date",
  updatedAt: "date"
} satisfies Record<string, CellOpts["variant"]>

const DEFAULT_SORT: SortingState = [{ id: "createdAt", desc: true }]

export async function listTasksCursor(params: TaskGridParams = {}) {
  const { pageParam, pageSize = 50, sorting = [], filters = [] } = params

  console.log("pageParam", JSON.stringify(params, null, 2))

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
  const nextCursor =
    hasMore && last
      ? encodeCursor(buildCursorPayload(last as unknown as Record<string, unknown>, sortingWithId))
      : undefined

  return { data: pageRows, nextCursor }
}
