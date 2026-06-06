import { useInfiniteQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { ColumnFiltersState, SortingState, Updater } from "@tanstack/react-table"
import * as React from "react"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridFilterToolbar } from "@/components/data-grid/data-grid-filter-toolbar"
import { DataGridKeyboardShortcuts } from "@/components/data-grid/data-grid-keyboard-shortcuts"
import { DataGridSortMenu } from "@/components/data-grid/data-grid-sort-menu"
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu"
import { arrIncludesSome, dateFilter } from "@/components/data-table/client/filter-functions"
import { Spinner } from "@/components/ui/spinner"
import type { Task } from "@/db/types"
import { getTasksGridFn } from "@/functions"
import { useDataGrid } from "@/hooks/use-data-grid"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { useWindowSize } from "@/hooks/use-window-size"
import { ActionsMenu } from "./-components/actions-menu"
import { getColumns } from "./-components/columns"

export const Route = createFileRoute("/data-grid/")({
  component: RouteComponent
})

const PAGE_SIZE = 50

const DEFAULT_SORTING: SortingState = [{ id: "createdAt", desc: true }]

function RouteComponent() {
  const [sorting, setSorting] = React.useState<SortingState>(DEFAULT_SORTING)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  // Track viewport size; 760 is the SSR/fallback height before the window is measured.
  const windowSize = useWindowSize({ defaultHeight: 760 })
  // Fill remaining page space below the app header, toolbar, and padding (150px), with a 400px minimum.
  const height = Math.max(400, windowSize.height - 170)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["data-grid-tasks", sorting, columnFilters],
    queryFn: async ({ pageParam }) => {
      return getTasksGridFn({
        data: {
          pageParam: pageParam as string | undefined,
          pageSize: PAGE_SIZE,
          sorting,
          filters: columnFilters
        }
      })
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  const allData = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? []
  }, [data])

  const columns = React.useMemo(() => getColumns(), [])

  const onSortingChange = React.useCallback((updater: Updater<SortingState>) => {
    setSorting(updater)
  }, [])

  const onColumnFiltersChange = React.useCallback((updater: Updater<ColumnFiltersState>) => {
    setColumnFilters(updater)
  }, [])

  const grid = useDataGrid<Task>({
    data: allData,
    columns,
    filterFns: {
      arrIncludesSome,
      dateFilter
    },
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    onSortingChange,
    onColumnFiltersChange,
    enableSearch: true,
    enablePaste: true,
    readOnly: true,
    initialState: {
      sorting: DEFAULT_SORTING,
      columnPinning: {
        left: ["select"]
      },
      columnVisibility: {
        createdAt: false,
        updatedAt: false
      }
    }
  })

  const { rowVirtualizer, ...dataGrid } = grid
  const rows = dataGrid.table.getRowModel().rows
  const selectedCount = dataGrid.table.getSelectedRowModel().rows.length
  const onFetchNextPage = React.useCallback(() => {
    fetchNextPage()
  }, [fetchNextPage])

  useInfiniteScroll<HTMLDivElement>({
    scrollRef: dataGrid.dataGridRef,
    rowVirtualizer,
    rowCount: rows.length,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    fetchNextPage: onFetchNextPage,
    threshold: 5
  })

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6">
      <div className="mb-3 flex shrink-0 items-center gap-2">
        <DataGridFilterToolbar table={grid.table} />
        <div className="ml-auto flex items-center gap-2">
          <ActionsMenu table={grid.table} />
          {(isLoading || isFetchingNextPage) && <Spinner className="size-3.5 text-muted-foreground" />}
          <DataGridSortMenu table={grid.table} />
          <DataGridViewMenu table={grid.table} />
          <DataGridKeyboardShortcuts enableSearch enablePaste />
        </div>
      </div>
      <DataGrid {...dataGrid} height={height} isLoading={isLoading} />
      <div className="mt-2 flex shrink-0 items-center gap-4 text-muted-foreground text-sm">
        <span>Rows: {rows.length}</span>
        {selectedCount > 0 && <span>Selected: {selectedCount}</span>}
      </div>
    </div>
  )
}
