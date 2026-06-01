import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { getDataGridSelectColumn } from "@/components/data-grid/data-grid-select-column"
import type { Task } from "@/db/types"

const statusOptions = [
  { label: "Todo", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" }
]

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" }
]

export function getColumns(): ColumnDef<Task>[] {
  return [
    getDataGridSelectColumn<Task>({ enableRowMarkers: true }),
    {
      id: "title",
      accessorKey: "title",
      header: "Title",
      size: 250,
      enableColumnFilter: true,
      meta: {
        label: "Title",
        filter: {
          variant: "text",
          placeholder: "Filter title..."
        },
        cell: { variant: "primary-name" },
        onPrimaryNameClick: ({ row }) => {
          toast.info(row.title, {
            description: row.description ?? undefined
          })
        }
      }
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
      size: 300,
      meta: {
        label: "Description",
        cell: { variant: "long-text" }
      }
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      size: 150,
      enableColumnFilter: true,
      meta: {
        label: "Status",
        filter: {
          variant: "multiSelect",
          options: statusOptions
        },
        cell: {
          variant: "select",
          options: statusOptions
        }
      }
    },
    {
      id: "label",
      accessorKey: "label",
      header: "Label",
      size: 150,
      meta: {
        label: "Label",
        cell: { variant: "short-text" }
      }
    },
    {
      id: "priority",
      accessorKey: "priority",
      header: "Priority",
      size: 150,
      enableColumnFilter: true,
      meta: {
        label: "Priority",
        filter: {
          variant: "select",
          options: priorityOptions
        },
        cell: {
          variant: "select",
          options: priorityOptions
        }
      }
    },
    {
      id: "assignee",
      accessorKey: "assignee",
      header: "Assignee",
      size: 180,
      meta: {
        label: "Assignee",
        cell: { variant: "short-text" }
      }
    },
    {
      id: "dueDate",
      accessorKey: "dueDate",
      header: "Due Date",
      size: 150,
      enableColumnFilter: true,
      meta: {
        label: "Due Date",
        filter: {
          variant: "date"
        },
        cell: { variant: "date" }
      }
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Created",
      size: 150,
      meta: {
        label: "Created",
        cell: { variant: "date" }
      }
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: "Updated",
      size: 150,
      meta: {
        label: "Updated",
        cell: { variant: "date" }
      }
    }
  ]
}
