"use client"

import type { Table } from "@tanstack/react-table"
import * as React from "react"
import { DataGridFilterToolbar } from "@/components/data-grid/data-grid-filter-toolbar"
import { DataGridKeyboardShortcuts } from "@/components/data-grid/data-grid-keyboard-shortcuts"
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu"
import { DataGridSortMenu } from "@/components/data-grid/data-grid-sort-menu"
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu"
import { getDataGridTableController } from "@/components/data-grid-table/internal-controller"
import { Spinner } from "@/components/ui/spinner"
import type { DataGridTableController } from "@/hooks/use-data-grid-table"
import { cn } from "@/lib/utils"

export interface DataGridTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>
  batchActions?: React.ReactNode
  isLoading?: boolean
}

export function DataGridTableToolbar<TData>({
  table,
  batchActions,
  isLoading = false,
  className,
  ...props
}: DataGridTableToolbarProps<TData>) {
  const controller = getDataGridTableController<TData, DataGridTableController<TData>>(table)

  return (
    <div className={cn("mb-3 flex shrink-0 items-center gap-2", className)} {...props}>
      <DataGridFilterToolbar table={table} />
      <div className="ml-auto flex items-center gap-2">
        {batchActions}
        {isLoading && <Spinner className="size-3.5 text-muted-foreground" />}
        <DataGridSortMenu table={table} />
        <DataGridViewMenu table={table} />
        <DataGridRowHeightMenu table={table} />
        <DataGridKeyboardShortcuts
          enableSearch={Boolean(controller.searchState)}
          enablePaste={Boolean(table.options.meta?.onCellsPaste)}
          enableRowsDelete={Boolean(table.options.meta?.onRowsDelete)}
        />
      </div>
    </div>
  )
}
