import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import React from "react"
import { toast } from "sonner"
import { DataTableClient, useDataTableClient } from "@/components/data-table"
import { getTasksClientFn } from "@/functions"
import { getColumns } from "./-components/columns"
import { TasksTableBatchActions } from "./-components/tasks-table-batch-actions"

export const Route = createFileRoute("/data-table-client/")({
  component: RouteComponent
})

function RouteComponent() {
  const { data: result, isLoading } = useQuery({
    queryKey: ["client-tasks"],
    queryFn: async () => await getTasksClientFn()
  })

  const data = result?.data ?? []

  const columns = React.useMemo(() => getColumns(), [])

  const { table } = useDataTableClient({
    columns,
    data,
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
      <h1 className="mb-6 font-bold text-2xl">Tasks Client</h1>
      <DataTableClient
        table={table}
        isLoading={isLoading}
        onRowClick={(row) => toast.info(`TaskClient: ${row.original.id}`)}
        batchActions={<TasksTableBatchActions table={table} />}
      />
    </div>
  )
}
