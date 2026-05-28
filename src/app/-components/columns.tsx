import type { ColumnDef } from "@tanstack/react-table"
import { Settings } from "lucide-react"
import { toast } from "sonner"
import { DataTableColumnHeader } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { Task } from "@/db/types"

const statusLabels: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done"
}

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High"
}

export function getColumns(): ColumnDef<Task>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
      minSize: 40
    },
    {
      id: "id",
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} label="ID" />,
      enableSorting: false
    },
    {
      id: "title",
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Title" />,
      meta: {
        label: "Title",
        variant: "text"
      },
      enableSorting: true,
      enableColumnFilter: true
    },
    {
      id: "description",
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Description" />,
      cell: ({ row }) => {
        const desc = row.original.description
        return desc ? (
          <span className="text-orange-500">{desc.length > 50 ? `${desc.slice(0, 50)}...` : desc}</span>
        ) : (
          "-"
        )
      },
      enableSorting: false
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Status" />,
      cell: ({ row }) => {
        const status = row.original.status ?? "TODO"
        return <Badge variant="outline">{statusLabels[status] ?? status}</Badge>
      },
      meta: {
        label: "Status",
        variant: "multiSelect" as const,
        options: [
          { label: "Todo", value: "TODO" },
          { label: "In Progress", value: "IN_PROGRESS" },
          { label: "Done", value: "DONE" }
        ]
      },
      enableSorting: false,
      enableColumnFilter: true
    },
    {
      id: "label",
      accessorKey: "label",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Label" />,
      enableSorting: true
    },
    {
      id: "priority",
      accessorKey: "priority",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Priority" />,
      cell: ({ row }) => {
        const priority = row.original.priority ?? "low"
        return <Badge variant="outline">{priorityLabels[priority] ?? priority}</Badge>
      },
      meta: {
        label: "Priority",
        variant: "select",
        options: [
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" }
        ]
      },
      enableSorting: true,
      enableColumnFilter: true
    },
    {
      id: "Assignee",
      accessorKey: "assignee",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Assignee" />,
      cell: ({ row }) => row.original.assignee ?? "-",
      enableSorting: true
    },
    {
      id: "dueDate",
      accessorKey: "dueDate",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Due Date" />,
      cell: ({ row }) => {
        const date = row.original.dueDate
        return date ? new Date(date).toLocaleDateString() : "-"
      },
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        label: "Due Date",
        variant: "date"
      }
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Created" />,
      cell: ({ row }) => {
        const date = row.original.createdAt
        return date ? new Date(date).toLocaleDateString() : "-"
      },
      enableSorting: true
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Updated" />,
      cell: ({ row }) => {
        const date = row.original.updatedAt
        return date ? new Date(date).toLocaleDateString() : "-"
      },
      enableSorting: true
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button aria-label="Open menu" variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted" />
            }
          >
            <Settings className="size-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => toast.info(`Edited: ${row.original.id}`)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.success(`Deleted ID: ${row.original.id}`)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 40,
      enableHiding: false
    }
  ]
}
