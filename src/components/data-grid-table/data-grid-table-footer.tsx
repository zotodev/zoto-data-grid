"use client"

import type { Table } from "@tanstack/react-table"
import type * as React from "react"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export interface DataGridTableFooterProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>
  hasNextPage?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => unknown
}

export function DataGridTableFooter<TData>({
  table,
  hasNextPage = false,
  isLoadingMore = false,
  onLoadMore,
  className,
  ...props
}: DataGridTableFooterProps<TData>) {
  const rowCount = table.getRowModel().rows.length
  const selectedCount = table.getSelectedRowModel().rows.length

  return (
    <div
      data-slot="data-grid-table-footer"
      className={cn(
        "sticky bottom-0 z-10 grid min-h-10 w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-b-md border-x border-b bg-sidebar px-3 text-muted-foreground text-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <span className="font-medium text-foreground tabular-nums">{rowCount}</span>
        <span>rows</span>
        {selectedCount > 0 && (
          <>
            <span className="text-border">|</span>
            <span className="font-medium text-foreground tabular-nums">{selectedCount}</span>
            <span>selected</span>
          </>
        )}
      </div>

      <div className="flex items-center justify-center">
        {hasNextPage ? (
          <button
            type="button"
            disabled={isLoadingMore}
            onClick={() => void onLoadMore?.()}
            className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:pointer-events-none disabled:opacity-60"
          >
            {isLoadingMore && <Spinner className="size-3.5" />}
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        ) : (
          <span className="text-xs">All rows loaded</span>
        )}
      </div>

      <div aria-hidden="true" />
    </div>
  )
}
