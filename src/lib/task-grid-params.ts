import type { SortingState } from "@tanstack/react-table"

export const TASK_GRID_SORT_IDS = [
  "title",
  "description",
  "status",
  "label",
  "priority",
  "assignee",
  "dueDate",
  "createdAt",
  "updatedAt"
] as const

export type TaskGridSortId = (typeof TASK_GRID_SORT_IDS)[number]

export const DEFAULT_TASK_GRID_SORTING: SortingState = [{ id: "createdAt", desc: true }]

const taskGridSortIds = new Set<string>(TASK_GRID_SORT_IDS)

export function normalizeTaskGridSorting(value: SortingState | undefined): SortingState {
  if (!value?.length) return DEFAULT_TASK_GRID_SORTING

  const seen = new Set<string>()
  const sorting: SortingState = []

  for (const sort of value) {
    if (!taskGridSortIds.has(sort.id) || seen.has(sort.id)) continue
    seen.add(sort.id)
    sorting.push({ id: sort.id, desc: Boolean(sort.desc) })
  }

  return sorting.length > 0 ? sorting : DEFAULT_TASK_GRID_SORTING
}
