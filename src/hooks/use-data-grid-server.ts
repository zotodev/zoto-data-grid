import { useNavigate } from "@tanstack/react-router"
import type { ColumnFiltersState, SortingState, TableState, Updater } from "@tanstack/react-table"
import * as React from "react"
import { type UseDataGridProps, useDataGrid } from "@/hooks/use-data-grid"

interface DataGridServerSearch {
  sortBy?: string
  sortOrder?: "asc" | "desc"
  [key: string]: unknown
}

interface UseDataGridServerProps<TData>
  extends Omit<
    UseDataGridProps<TData>,
    "state" | "getCoreRowModel" | "manualFiltering" | "manualPagination" | "manualSorting"
  > {
  search: DataGridServerSearch
  initialState?: Partial<TableState>
}

export function useDataGridServer<TData>({ search, columns, initialState, ...props }: UseDataGridServerProps<TData>) {
  const navigate = useNavigate()
  const sorting = React.useMemo<SortingState>(
    () => (search.sortBy ? [{ id: search.sortBy, desc: search.sortOrder === "desc" }] : (initialState?.sorting ?? [])),
    [initialState?.sorting, search.sortBy, search.sortOrder]
  )

  const filterableColumns = React.useMemo(() => columns.filter((column) => column.enableColumnFilter), [columns])
  const filterSearchKey = filterableColumns
    .map((column) => {
      const id = column.id ?? ("accessorKey" in column ? String(column.accessorKey) : "")
      return [id, search[id]]
    })
    .map(([id, value]) => `${id}:${JSON.stringify(value)}`)
    .join("|")

  const columnFilters = React.useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = []

    for (const column of filterableColumns) {
      const id = column.id ?? ("accessorKey" in column ? String(column.accessorKey) : "")
      const value = search[id]

      if (value === undefined || value === null || value === "") continue

      const variant = column.meta?.filter?.variant
      if (variant === "select" || variant === "multiSelect") {
        filters.push({ id, value: String(value).split(",").filter(Boolean) })
      } else {
        filters.push({ id, value })
      }
    }

    return filters
  }, [filterableColumns, filterSearchKey])

  const onSortingChange = React.useCallback(
    (updater: Updater<SortingState>) => {
      const nextSorting = typeof updater === "function" ? updater(sorting) : updater
      const firstSort = nextSorting[0]

      navigate({
        to: ".",
        search: (previous: Record<string, unknown>) => ({
          ...previous,
          sortBy: firstSort?.id,
          sortOrder: firstSort ? (firstSort.desc ? ("desc" as const) : ("asc" as const)) : undefined
        })
      })
    },
    [navigate, sorting]
  )

  const onColumnFiltersChange = React.useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      const filters = typeof updater === "function" ? updater(columnFilters) : updater
      const updates: Record<string, string | number | undefined> = {}

      for (const column of filterableColumns) {
        const id = column.id ?? ("accessorKey" in column ? String(column.accessorKey) : "")
        const filter = filters.find((item) => item.id === id)

        if (Array.isArray(filter?.value)) {
          updates[id] = filter.value.length > 0 ? filter.value.join(",") : undefined
        } else if (typeof filter?.value === "string") {
          updates[id] = filter.value.trim() || undefined
        } else if (typeof filter?.value === "number") {
          updates[id] = filter.value
        } else {
          updates[id] = undefined
        }
      }

      navigate({
        to: ".",
        search: (previous: Record<string, unknown>) => ({
          ...previous,
          ...updates
        })
      })
    },
    [columnFilters, filterableColumns, navigate]
  )

  return useDataGrid({
    ...props,
    columns,
    initialState,
    state: {
      sorting,
      columnFilters
    },
    onSortingChange,
    onColumnFiltersChange,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    enableMultiSort: false
  })
}
