import { useInfiniteQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { ColumnFiltersState, SortingState, Updater } from "@tanstack/react-table"
import * as React from "react"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridFilterMenu } from "@/components/data-grid/data-grid-filter-menu"
import { DataGridKeyboardShortcuts } from "@/components/data-grid/data-grid-keyboard-shortcuts"
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu"
import {
  DataGridSkeleton,
  DataGridSkeletonGrid,
  DataGridSkeletonToolbar
} from "@/components/data-grid/data-grid-skeleton"
import { DataGridSortMenu } from "@/components/data-grid/data-grid-sort-menu"
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu"
import { arrIncludesSome, dateFilter } from "@/components/data-table/client/filter-functions"
import type { Task } from "@/db/types"
import { getTasksGridFn } from "@/functions"
import { useDataGrid } from "@/hooks/use-data-grid"
import { useWindowSize } from "@/hooks/use-window-size"
import { getColumns } from "./-components/columns"

// How many px from the bottom of the grid's scroll container before we fetch
// the next page. Needs to be generous enough to feel seamless.
const SCROLL_THRESHOLD_PX = 400

export const Route = createFileRoute("/data-grid/")({
  component: RouteComponent
})

const PAGE_SIZE = 50

function RouteComponent() {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const windowSize = useWindowSize({ defaultHeight: 760 })
  const height = Math.max(400, windowSize.height - 150)

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
    initialState: {
      columnPinning: {
        left: ["select"]
      },
      columnVisibility: {
        createdAt: false,
        updatedAt: false
      }
    }
  })

  // The grid scrolls internally (overflow-auto with maxHeight). The sentinel
  // approach doesn't work because the sentinel lives outside that scroll
  // container, so IntersectionObserver never fires. Instead, listen to scroll
  // events directly on the grid's scroll element.
  const hasNextPageRef = React.useRef(hasNextPage)
  const isFetchingNextPageRef = React.useRef(isFetchingNextPage)
  hasNextPageRef.current = hasNextPage
  isFetchingNextPageRef.current = isFetchingNextPage

  React.useEffect(() => {
    const container = grid.dataGridRef.current
    if (!container) return

    function handleScroll() {
      if (!hasNextPageRef.current || isFetchingNextPageRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = container!
      if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD_PX) {
        fetchNextPage()
      }
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  // isLoading is included so the effect re-runs once the grid mounts after
  // the skeleton is replaced — grid.dataGridRef.current is null until then.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNextPage, isLoading])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden p-6">
        <h1 className="mb-6 font-bold text-2xl">Data Grid</h1>
        <DataGridSkeleton>
          <DataGridSkeletonToolbar />
          <DataGridSkeletonGrid />
        </DataGridSkeleton>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6 pb-8">
      {/* <h1 className="mb-6 shrink-0 font-bold text-2xl">Data Grid</h1> */}
      <div className="mb-3 flex shrink-0 items-center gap-2">
        <DataGridFilterMenu table={grid.table} />
        <DataGridSortMenu table={grid.table} />
        <DataGridRowHeightMenu table={grid.table} />
        <div className="ml-auto flex items-center gap-2">
          <DataGridViewMenu table={grid.table} />
          <DataGridKeyboardShortcuts enableSearch enablePaste />
        </div>
      </div>
      <DataGrid {...grid} height={height} />
    </div>
  )
}
