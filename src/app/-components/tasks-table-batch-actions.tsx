"use client"

import type { Table } from "@tanstack/react-table"
import * as React from "react"
import { toast } from "sonner"
import { DataTableBatchActions } from "@/components/data-table"
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu"
import { type Task, taskPriority, taskStatus } from "@/db/schema"

interface TasksTableBatchActionsProps {
  table: Table<Task>
}

export function TasksTableBatchActions({ table }: TasksTableBatchActionsProps) {
  const rows = table.getFilteredSelectedRowModel().rows
  const isProcessingRef = React.useRef(false)

  const onTaskUpdate = React.useCallback(
    async (field: "status" | "priority", value: Task["status"] | Task["priority"]) => {
      isProcessingRef.current = true
      const ids = rows.map((row) => row.original.id)
      toast.info(`Updating ${field}...`)
      console.log("update tasks", { ids, [field]: value })
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`)
      isProcessingRef.current = false
      table.toggleAllRowsSelected(false)
    },
    [rows, table]
  )

  const onTaskDelete = React.useCallback(async () => {
    isProcessingRef.current = true
    const ids = rows.map((row) => row.original.id)
    toast.info("Deleting tasks...")
    console.log("delete tasks", { ids })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    toast.success("Tasks deleted successfully")
    isProcessingRef.current = false
    table.toggleAllRowsSelected(false)
  }, [rows, table])

  return (
    <DataTableBatchActions table={table}>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {taskStatus.map((status) => (
              <DropdownMenuItem key={status} className="capitalize" onClick={() => onTaskUpdate("status", status)}>
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Priority</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {taskPriority.map((priority) => (
              <DropdownMenuItem
                key={priority}
                className="capitalize"
                onClick={() => onTaskUpdate("priority", priority)}
              >
                {priority}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onTaskDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DataTableBatchActions>
  )
}
