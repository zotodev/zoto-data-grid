import type { FilterFn, Row } from "@tanstack/react-table"

export const arrIncludesSome = (row: Row<unknown>, columnId: string, filterValue: unknown): boolean => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true

  const rowValue = row.getValue(columnId)
  return rowValue != null && filterValue.includes(rowValue)
}

export const dateFilter = (row: Row<unknown>, columnId: string, filterValue: unknown): boolean => {
  if (filterValue == null) return true

  const rowValue = row.getValue(columnId)
  if (rowValue == null) return false

  return new Date(filterValue as number).toDateString() === new Date(rowValue as string | number).toDateString()
}

declare module "@tanstack/react-table" {
  interface FilterFns {
    arrIncludesSome: FilterFn<unknown>
    dateFilter: FilterFn<unknown>
  }
}
