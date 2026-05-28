import { useQuery } from "@tanstack/react-query"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"
import { DataTableServer, DataTableToolbar, dataTableSearchSchema, useDataTableServer } from "@/components/data-table"
import { getTasksFn } from "@/functions"
import { getColumns } from "./-components/columns"
import { TasksTableBatchActions } from "./-components/tasks-table-batch-actions"

const tasksSearchSchema = dataTableSearchSchema.extend({
  status: z.string().optional().catch(undefined),
  priority: z.string().optional().catch(undefined),
  title: z.string().optional().catch(undefined)
})

const defaultSearch = tasksSearchSchema.parse({})

export const Route = createFileRoute("/")({
  validateSearch: tasksSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultSearch)]
  },
  component: TasksPage
})

function TasksPage() {
  const search = Route.useSearch()

  const { data: result, isPending } = useQuery({
    queryKey: ["tasks", search],
    queryFn: () =>
      getTasksFn({
        data: {
          page: search.page,
          perPage: search.perPage,
          sortBy: search.sortBy,
          sortOrder: search.sortOrder,
          status: search.status,
          priority: search.priority,
          q: search.title
        }
      })
  })

  const data = result?.data ?? []

  const columns = React.useMemo(() => getColumns(), [])

  const { table } = useDataTableServer({
    columns,
    data,
    hasNextPage: result?.hasNextPage,
    search,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: {
        left: ["select"],
        right: ["actions"]
      },
      columnVisibility: {
        id: false,
        Assignee: false,
        createdAt: false,
        updatedAt: false
      }
    }
  })

  return (
    <div className="mx-auto p-6">
      <h1 className="mb-6 font-bold text-2xl">Tasks</h1>
      <DataTableServer table={table} isLoading={isPending} onRowClick={(row) => toast.info(`Task: ${row.original.id}`)}>
        <DataTableToolbar table={table} batchActions={<TasksTableBatchActions table={table} />} />
      </DataTableServer>
    </div>
  )
}
