import { useDirection } from "@radix-ui/react-direction"
import { useQueryClient } from "@tanstack/react-query"
import type { Table } from "@tanstack/react-table"
import { ChevronDown, Eye, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { Task } from "@/db/types"

interface ActionsMenuProps {
  table: Table<Task>
}

export function ActionsMenu({ table }: ActionsMenuProps) {
  const dir = useDirection()
  const queryClient = useQueryClient()

  const selectedRows = table.getSelectedRowModel().rows
  const selectedCount = selectedRows.length

  if (selectedCount === 0) return null

  const isSingle = selectedCount === 1
  const selectedTasks = selectedRows.map((row) => row.original)

  const onViewDetails = () => {
    const task = selectedTasks[0]
    if (!task) return
    toast.info(task.title, {
      description: task.description ?? "No description"
    })
  }

  const onDelete = () => {
    toast.success(`Deleted ${selectedCount} item${selectedCount > 1 ? "s" : ""}`)
    table.resetRowSelection()
  }

  const onProcess = async () => {
    await toast.promise(
      new Promise<void>((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Processing ${selectedCount} item${selectedCount > 1 ? "s" : ""}...`,
        success: `Processed ${selectedCount} item${selectedCount > 1 ? "s" : ""}`,
        error: "Failed to process items"
      }
    )

    await queryClient.invalidateQueries({ queryKey: ["data-grid-tasks"] })
    table.resetRowSelection()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button dir={dir} variant="outline" size="sm" className="h-8 font-normal" />}>
        Actions
        <ChevronDown className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent dir={dir} align="start" className="w-48">
        {isSingle && (
          <DropdownMenuItem onClick={onViewDetails}>
            <Eye />
            View details
          </DropdownMenuItem>
        )}
        {!isSingle && (
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 />
            Delete {selectedCount} items
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onProcess}>
          <RefreshCw />
          Process {isSingle ? "item" : `${selectedCount} items`}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
