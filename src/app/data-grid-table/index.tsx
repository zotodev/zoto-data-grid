import { useInfiniteQuery } from "@tanstack/react-query"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import * as React from "react"
import { toast } from "sonner"
import {
  DataGridTable,
  DataGridTableFooter,
  DataGridTableToolbar,
  useDataGridTable
} from "@/components/data-grid-table"
import type { Task } from "@/db/types"
import { getTasksGridFn } from "@/functions"
import { useWindowSize } from "@/hooks/use-window-size"
import { ActionsMenu } from "../data-grid/-components/actions-menu"
import { getColumns } from "../data-grid/-components/columns"
import { dataGridSearchSchema, defaultDataGridSearch } from "../data-grid/-lib/search"

export const Route = createFileRoute("/data-grid-table/")({
  validateSearch: dataGridSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultDataGridSearch)]
  },
  component: RouteComponent
})

function RouteComponent() {
  const search = Route.useSearch()
  const queryParams = {
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
    q: search.title,
    status: search.status,
    priority: search.priority,
    dueDate: search.dueDate
  }

  const windowSize = useWindowSize({ defaultHeight: 760 })
  const height = Math.max(400, windowSize.height - 190)

  const {
    data: result,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending
  } = useInfiniteQuery({
    queryKey: ["data-grid-table-tasks", queryParams],
    queryFn: ({ pageParam }) =>
      getTasksGridFn({
        data: {
          cursor: pageParam,
          perPage: 50,
          ...queryParams
        }
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  const data = result?.pages.flatMap((page) => page.data) ?? []
  const columns = React.useMemo(() => getColumns(), [])

  const { table } = useDataGridTable<Task>({
    data,
    columns,
    search,
    readOnly: true,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: {
        left: ["select"]
      },
      columnVisibility: {
        createdAt: false,
        updatedAt: false
      }
    }
  })

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6">
      <DataGridTable
        table={table}
        height={height}
        isLoading={isPending}
        onRowClick={(row) => toast.info(`Task: ${row.original.id}`)}
      >
        <DataGridTableToolbar table={table} isLoading={isPending} batchActions={<ActionsMenu table={table} />} />
      </DataGridTable>
      <DataGridTableFooter
        table={table}
        hasNextPage={hasNextPage}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </div>
  )
}
