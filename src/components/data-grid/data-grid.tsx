"use client";

import * as React from "react";
import { DataGridColumnHeader } from "@/components/data-grid/data-grid-column-header";
import { DataGridContextMenu } from "@/components/data-grid/data-grid-context-menu";
import { DataGridPasteDialog } from "@/components/data-grid/data-grid-paste-dialog";
import { DataGridRow } from "@/components/data-grid/data-grid-row";
import { DataGridSearch } from "@/components/data-grid/data-grid-search";
import type { useDataGrid } from "@/hooks/use-data-grid";
import {
  flexRender,
  getColumnBorderVisibility,
  getColumnPinningStyle,
} from "@/lib/data-grid";
import { cn } from "@/lib/utils";
import type { Direction } from "@/types/data-grid";

const EMPTY_CELL_SELECTION_SET = new Set<string>();

interface DataGridProps<TData>
  extends Omit<ReturnType<typeof useDataGrid<TData>>, "dir" | "rowVirtualizer">,
    Omit<React.ComponentProps<"div">, "contextMenu"> {
  dir?: Direction;
  height?: number;
  stretchColumns?: boolean;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
}

export function DataGrid<TData>({
  dataGridRef,
  headerRef,
  rowMapRef,
  footerRef,
  dir = "ltr",
  table,
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
  height = 600,
  stretchColumns = false,
  adjustLayout = false,
  onRowAdd: _onRowAdd,
  onLoadMore,
  hasNextPage = false,
  isLoadingMore = false,
  className,
  ...props
}: DataGridProps<TData>) {
  const rows = table.getRowModel().rows;
  const readOnly = tableMeta?.readOnly ?? false;
  const columnVisibility = table.getState().columnVisibility;
  const columnPinning = table.getState().columnPinning;

  const onDataGridContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    [],
  );

  const onLoadMoreClick = React.useCallback(() => {
    if (!hasNextPage || isLoadingMore) return;
    onLoadMore?.();
  }, [hasNextPage, isLoadingMore, onLoadMore]);

  const onLoadMoreKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onLoadMoreClick();
      }
    },
    [onLoadMoreClick],
  );

  return (
    <div
      data-slot="grid-wrapper"
      dir={dir}
      {...props}
      className={cn("relative flex w-full flex-col", className)}
    >
      {searchState && <DataGridSearch {...searchState} />}
      <DataGridContextMenu
        tableMeta={tableMeta}
        columns={columns}
        contextMenu={contextMenu}
      />
      <DataGridPasteDialog tableMeta={tableMeta} pasteDialog={pasteDialog} />
      <div
        role="grid"
        aria-label="Data grid"
        aria-rowcount={rows.length + (onLoadMore && hasNextPage ? 1 : 0)}
        aria-colcount={columns.length}
        data-slot="grid"
        tabIndex={0}
        ref={dataGridRef}
        className="relative grid select-none overflow-auto rounded-md border focus:outline-none"
        style={{
          ...columnSizeVars,
          maxHeight: `${height}px`,
        }}
        onContextMenu={onDataGridContextMenu}
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
                const sorting = table.getState().sorting;
                const currentSort = sorting.find(
                  (sort) => sort.id === header.column.id,
                );
                const isSortable = header.column.getCanSort();

                const nextHeader = headerGroup.headers[colIndex + 1];
                const isLastColumn =
                  colIndex === headerGroup.headers.length - 1;

                const { showEndBorder, showStartBorder } =
                  getColumnBorderVisibility({
                    column: header.column,
                    nextColumn: nextHeader?.column,
                    isLastColumn,
                  });

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
                      "border-e":
                        showEndBorder && header.column.id !== "select",
                      "border-s":
                        showStartBorder && header.column.id !== "select",
                    })}
                    style={{
                      ...getColumnPinningStyle({
                        column: header.column,
                        dir,
                        background: "var(--sidebar)",
                      }),
                      width: `calc(var(--header-${header.id}-size) * 1px)`,
                    }}
                  >
                    {header.isPlaceholder ? null : typeof header.column
                        .columnDef.header === "function" ? (
                      <div className="size-full px-3 py-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </div>
                    ) : (
                      <DataGridColumnHeader header={header} table={table} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div
          role="rowgroup"
          data-slot="grid-body"
          className="relative grid"
          style={{
            height: `${virtualTotalSize}px`,
            contain: adjustLayout ? "layout paint" : "strict",
          }}
        >
          {virtualItems.map((virtualItem) => {
            const row = rows[virtualItem.index];
            if (!row) return null;

            const cellSelectionKeys =
              cellSelectionMap?.get(virtualItem.index) ??
              EMPTY_CELL_SELECTION_SET;

            const searchMatchColumns =
              searchMatchesByRow?.get(virtualItem.index) ?? null;
            const isActiveSearchRow =
              activeSearchMatch?.rowIndex === virtualItem.index;

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
              />
            );
          })}
        </div>
        {onLoadMore && hasNextPage && (
          <div
            role="rowgroup"
            data-slot="grid-footer"
            ref={footerRef}
            className="sticky bottom-0 z-10 grid border-t bg-background"
          >
            <div
              role="row"
              aria-rowindex={rows.length + 2}
              data-slot="grid-load-more-row"
              tabIndex={-1}
              className="flex w-full"
            >
              <div
                role="gridcell"
                tabIndex={0}
                aria-disabled={isLoadingMore}
                className={cn(
                  "relative flex h-9 grow items-center justify-center bg-muted/30 transition-colors focus:outline-none",
                  isLoadingMore
                    ? "cursor-default"
                    : "cursor-pointer hover:bg-muted/50 focus:bg-muted/50",
                )}
                style={{
                  width: table.getTotalSize(),
                  minWidth: table.getTotalSize(),
                }}
                onClick={onLoadMoreClick}
                onKeyDown={onLoadMoreKeyDown}
              >
                <div className="sticky start-0 flex items-center gap-2 px-3 font-medium text-muted-foreground text-sm">
                  {isLoadingMore ? "Loading…" : "Load more"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
