"use client"

import type { Row, Table } from "@tanstack/react-table"
import * as React from "react"
import { DataGridColumnHeader } from "@/components/data-grid/data-grid-column-header"
import { DataGridContextMenu } from "@/components/data-grid/data-grid-context-menu"
import { DataGridPasteDialog } from "@/components/data-grid/data-grid-paste-dialog"
import { DataGridRow } from "@/components/data-grid/data-grid-row"
import { DataGridSearch } from "@/components/data-grid/data-grid-search"
import { getDataGridTableController } from "@/components/data-grid-table/internal-controller"
import { Skeleton } from "@/components/ui/skeleton"
import type { DataGridTableController } from "@/hooks/use-data-grid-table"
import { flexRender, getColumnBorderVisibility, getColumnPinningStyle } from "@/lib/data-grid"
import { cn } from "@/lib/utils"

const EMPTY_CELL_SELECTION_SET = new Set<string>()

export interface DataGridTableProps<TData> extends Omit<React.ComponentProps<"div">, "onRowClick"> {
  table: Table<TData>
  height?: number | string
  stretchColumns?: boolean
  isLoading?: boolean
  onRowClick?: (row: Row<TData>) => void
  emptyState?: React.ReactNode
}

export function DataGridTable<TData>({
  table,
  height = 600,
  stretchColumns = false,
  isLoading = false,
  onRowClick,
  emptyState = "No results.",
  children,
  className,
  ...props
}: DataGridTableProps<TData>) {
  const controller = getDataGridTableController<TData, DataGridTableController<TData>>(table)
  const {
    dataGridRef,
    headerRef,
    rowMapRef,
    dir,
    tableMeta,
    virtualTotalSize,
    virtualItems,
    measureElement,
    columns,
    columnSizeVars,
    searchState,
    searchMatchesByRow,
    activeSearchMatch,
    cellSelectionMap,
    focusedCell,
    editingCell,
    rowHeight,
    contextMenu,
    pasteDialog,
    adjustLayout
  } = controller
  const rows = table.getRowModel().rows
  const readOnly = tableMeta?.readOnly ?? false
  const columnVisibility = table.getState().columnVisibility
  const columnPinning = table.getState().columnPinning

  const onDataGridContextMenu = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const onDataGridClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!onRowClick) return

      const target = event.target as HTMLElement
      const rowElement = target.closest<HTMLElement>("[data-slot='grid-row']")
      if (!rowElement) return

      const rowIndex = Number(rowElement.dataset.index)
      const row = rows[rowIndex]
      if (!row || editingCell?.rowIndex === rowIndex) return

      const interactiveElement = target.closest<HTMLElement>(
        "button, a, input, textarea, select, [role='button'], [role='checkbox'], [contenteditable='true']"
      )
      if (interactiveElement && interactiveElement.dataset.slot !== "grid-cell-wrapper") return

      const cellElement = target.closest<HTMLElement>("[data-slot='grid-cell']")
      if (cellElement) {
        const cellElements = Array.from(
          cellElement.parentElement?.querySelectorAll<HTMLElement>("[data-slot='grid-cell']") ?? []
        )
        const columnId = row.getVisibleCells()[cellElements.indexOf(cellElement)]?.column.id
        if (columnId === "select" || columnId === "actions") return
      }

      onRowClick(row)
    },
    [editingCell?.rowIndex, onRowClick, rows]
  )

  const onDataGridKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Enter" || !onRowClick) return

      const target = event.target as HTMLElement
      const rowElement = target.closest<HTMLElement>("[data-slot='grid-row']")
      const rowIndex = Number(rowElement?.dataset.index)
      const row = rows[rowIndex]
      if (!row || editingCell?.rowIndex === rowIndex) return

      const cellElement = target.closest<HTMLElement>("[data-slot='grid-cell']")
      if (cellElement) {
        const cellElements = Array.from(
          cellElement.parentElement?.querySelectorAll<HTMLElement>("[data-slot='grid-cell']") ?? []
        )
        const columnId = row.getVisibleCells()[cellElements.indexOf(cellElement)]?.column.id
        if (columnId === "select" || columnId === "actions") return
      }

      onRowClick(row)
    },
    [editingCell?.rowIndex, onRowClick, rows]
  )

  return (
    <div data-slot="grid-wrapper" dir={dir} {...props} className={cn("relative flex w-full flex-col", className)}>
      {children}
      {searchState && <DataGridSearch {...searchState} />}
      <DataGridContextMenu tableMeta={tableMeta} columns={columns} contextMenu={contextMenu} />
      <DataGridPasteDialog tableMeta={tableMeta} pasteDialog={pasteDialog} />
      <div
        role="grid"
        aria-label="Data grid"
        aria-rowcount={rows.length}
        aria-colcount={columns.length}
        data-slot="grid"
        tabIndex={0}
        ref={dataGridRef}
        className="relative grid select-none overflow-auto rounded-t-md border focus:outline-none"
        style={{
          ...columnSizeVars,
          maxHeight: typeof height === "number" ? `${height}px` : height
        }}
        onContextMenu={onDataGridContextMenu}
        onClick={onDataGridClick}
        onKeyDown={onDataGridKeyDown}
      >
        <div
          role="rowgroup"
          data-slot="grid-header"
          ref={headerRef}
          className="sticky top-0 z-10 grid border-b bg-sidebar"
        >
          {table.getHeaderGroups().map((headerGroup, rowIndex) => (
            <div
              key={headerGroup.id}
              role="row"
              aria-rowindex={rowIndex + 1}
              data-slot="grid-header-row"
              tabIndex={-1}
              className="flex w-full"
            >
              {headerGroup.headers.map((header, colIndex) => {
                const sorting = table.getState().sorting
                const currentSort = sorting.find((sort) => sort.id === header.column.id)
                const isSortable = header.column.getCanSort()

                const nextHeader = headerGroup.headers[colIndex + 1]
                const isLastColumn = colIndex === headerGroup.headers.length - 1

                const { showEndBorder, showStartBorder } = getColumnBorderVisibility({
                  column: header.column,
                  nextColumn: nextHeader?.column,
                  isLastColumn
                })

                return (
                  <div
                    key={header.id}
                    role="columnheader"
                    aria-colindex={colIndex + 1}
                    aria-sort={
                      currentSort?.desc === false
                        ? "ascending"
                        : currentSort?.desc === true
                          ? "descending"
                          : isSortable
                            ? "none"
                            : undefined
                    }
                    data-slot="grid-header-cell"
                    tabIndex={-1}
                    className={cn("relative", {
                      grow: stretchColumns && header.column.id !== "select",
                      "border-e": showEndBorder && header.column.id !== "select",
                      "border-s": showStartBorder && header.column.id !== "select"
                    })}
                    style={{
                      ...getColumnPinningStyle({
                        column: header.column,
                        dir,
                        background: "var(--sidebar)"
                      }),
                      width: `calc(var(--header-${header.id}-size) * 1px)`
                    }}
                  >
                    {header.isPlaceholder ? null : typeof header.column.columnDef.header === "function" ? (
                      <div className="size-full px-3 py-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    ) : (
                      <DataGridColumnHeader header={header} table={table} />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div
          role="rowgroup"
          data-slot="grid-body"
          className="relative grid"
          style={
            isLoading || rows.length === 0
              ? { height: typeof height === "number" ? `${height}px` : height, contain: "strict" }
              : { height: `${virtualTotalSize}px`, contain: adjustLayout ? "layout paint" : "strict" }
          }
        >
          {isLoading ? (
            table
              .getHeaderGroups()
              .slice(0, 1)
              .flatMap((headerGroup) =>
                Array.from({ length: 20 }).map((_, rowIdx) => (
                  <div
                    key={rowIdx}
                    role="row"
                    tabIndex={-1}
                    className="flex w-full border-b"
                    style={{
                      height: 34,
                      transform: `translateY(${rowIdx * 34}px)`,
                      position: "absolute",
                      width: "100%"
                    }}
                  >
                    {headerGroup.headers.map((header, colIdx) => {
                      const isLast = colIdx === headerGroup.headers.length - 1
                      const isCheckbox = header.column.id === "select"
                      return (
                        <div
                          key={header.id}
                          role="gridcell"
                          tabIndex={-1}
                          className={cn("flex shrink-0 items-center px-3", !isLast && "border-e")}
                          style={{
                            ...getColumnPinningStyle({ column: header.column, dir, background: "var(--background)" }),
                            width: `calc(var(--header-${header.id}-size) * 1px)`
                          }}
                        >
                          {isCheckbox ? (
                            <Skeleton className="h-3.5 w-3.5 rounded-sm" />
                          ) : (
                            <Skeleton
                              className="h-3.5 rounded"
                              style={{ width: `${55 + ((rowIdx * 13 + colIdx * 7) % 35)}%` }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))
              )
          ) : rows.length === 0 ? (
            <div
              role="row"
              tabIndex={-1}
              className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm"
            >
              {emptyState}
            </div>
          ) : (
            virtualItems.map((virtualItem) => {
              const row = rows[virtualItem.index]
              if (!row) return null

              const cellSelectionKeys = cellSelectionMap?.get(virtualItem.index) ?? EMPTY_CELL_SELECTION_SET

              const searchMatchColumns = searchMatchesByRow?.get(virtualItem.index) ?? null
              const isActiveSearchRow = activeSearchMatch?.rowIndex === virtualItem.index

              return (
                <DataGridRow
                  key={row.id}
                  row={row}
                  tableMeta={tableMeta}
                  rowMapRef={rowMapRef}
                  virtualItem={virtualItem}
                  measureElement={measureElement}
                  rowHeight={rowHeight}
                  columnVisibility={columnVisibility}
                  columnPinning={columnPinning}
                  focusedCell={focusedCell}
                  editingCell={editingCell}
                  cellSelectionKeys={cellSelectionKeys}
                  searchMatchColumns={searchMatchColumns}
                  activeSearchMatch={isActiveSearchRow ? activeSearchMatch : null}
                  dir={dir}
                  adjustLayout={adjustLayout}
                  stretchColumns={stretchColumns}
                  readOnly={readOnly}
                  className={cn(onRowClick && "cursor-pointer")}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
