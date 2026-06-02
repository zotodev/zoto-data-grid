---
name: data-grid
description: Use when adding or configuring the zoto-data-grid component on a new page, creating column definitions, setting up infinite scroll, filtering, sorting, or any data-grid related work. Covers the DataGrid component, useDataGrid hook, cell variants, filter/sort/view toolbars, and the full integration pattern.
---

# Data Grid Skill

A comprehensive guide for integrating the data-grid into any page in this app. Based on the reference implementation at `src/app/data-grid/index.tsx`.

---

## Architecture Overview

The data-grid is built on **TanStack Table** + **TanStack Virtual** + **TanStack Query** with a custom `useDataGrid` hook that orchestrates cell navigation, selection, editing, copy/paste, search, and virtualization. It supports 10 cell variants, column pinning, sorting, filtering, infinite scrolling, and keyboard shortcuts.

### Key Files

| File | Purpose |
|------|---------|
| `src/hooks/use-data-grid.ts` | Core hook — manages all grid state, virtualization, cell navigation |
| `src/components/data-grid/data-grid.tsx` | Renders the grid (header, body, footer) |
| `src/components/data-grid/data-grid-cell-variants.tsx` | 10 cell renderers (short-text, long-text, select, etc.) |
| `src/components/data-grid/data-grid-cell.tsx` | Cell dispatcher — reads `columnDef.meta.cell.variant` |
| `src/components/data-grid/data-grid-cell-wrapper.tsx` | Wraps every cell with focus/edit/selection behavior |
| `src/components/data-grid/data-grid-row.tsx` | Virtualized row with heavily memoized rendering |
| `src/components/data-grid/data-grid-select-column.tsx` | Checkbox + row-number select column factory |
| `src/components/data-grid/data-grid-column-header.tsx` | Column header with sort/pin/hide/resize dropdown |
| `src/components/data-grid/data-grid-filter-toolbar.tsx` | Inline filter bar per column |
| `src/components/data-grid/data-grid-filter-menu.tsx` | Advanced filter dialog (Ctrl+Shift+F) |
| `src/components/data-grid/data-grid-sort-menu.tsx` | Sort dialog with drag-reorder (Ctrl+Shift+S) |
| `src/components/data-grid/data-grid-view-menu.tsx` | Column visibility toggle |
| `src/components/data-grid/data-grid-keyboard-shortcuts.tsx` | Keyboard shortcuts reference dialog |
| `src/components/data-grid/data-grid-search.tsx` | Floating search bar (Ctrl+F) |
| `src/components/data-grid/data-grid-context-menu.tsx` | Right-click context menu |
| `src/components/data-grid/data-grid-paste-dialog.tsx` | Paste dialog for multi-row paste |
| `src/components/data-grid/data-grid-skeleton.tsx` | Loading skeleton |
| `src/components/data-grid/data-grid-row-height-menu.tsx` | Row height selector |
| `src/types/data-grid.ts` | All type definitions (CellOpts, FilterValue, TableMeta, etc.) |
| `src/lib/data-grid.ts` | Utility functions (cell keys, TSV parse, date format, etc.) |
| `src/lib/data-grid-filters.ts` | Filter operators and getFilterFn |
| `src/hooks/use-infinite-scroll.ts` | Infinite scroll hook for virtualized grid |
| `src/hooks/use-window-size.ts` | Viewport size measurement |

---

## Step-by-Step: Adding Data Grid to a New Page

### 1. Define Your Data Type

Create a type for your data model. If using Drizzle, infer from your schema:

```tsx
// src/db/types.ts or inline
type MyItem = typeof myTable.$inferSelect
```

### 2. Define Column Definitions

Create a `getColumns()` function that returns `ColumnDef<TData>[]`.

**Required column**: Always start with `getDataGridSelectColumn<TData>()` for row selection.

**Column `meta`** is where the data-grid-specific config lives:

```tsx
import type { ColumnDef } from "@tanstack/react-table"
import { getDataGridSelectColumn } from "@/components/data-grid/data-grid-select-column"
import type { MyItem } from "@/db/types"

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

export function getColumns(): ColumnDef<MyItem>[] {
  return [
    getDataGridSelectColumn<MyItem>(),
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      size: 250,
      enableColumnFilter: true,
      meta: {
        label: "Name",
        filter: { variant: "text", placeholder: "Filter name..." },
        cell: { variant: "primary-name" },
        onPrimaryNameClick: ({ row }) => {
          // handle click on the name link
        },
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      size: 150,
      enableColumnFilter: true,
      meta: {
        label: "Status",
        filter: { variant: "select", options: statusOptions },
        cell: { variant: "select", options: statusOptions },
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Created",
      size: 150,
      enableColumnFilter: true,
      meta: {
        label: "Created",
        filter: { variant: "date" },
        cell: { variant: "date" },
      },
    },
  ]
}
```

#### Cell Variants (`meta.cell`)

| Variant | Config | Editing Mode | Notes |
|---------|--------|-------------|-------|
| `short-text` | `{ variant: "short-text" }` | contentEditable div | Default for simple text |
| `long-text` | `{ variant: "long-text" }` | Popover + Textarea | Debounced 300ms, drag-drop |
| `primary-name` | `{ variant: "primary-name" }` | Not editable | Click-through action, orange underline |
| `number` | `{ variant: "number", min?: number, max?: number, step?: number }` | `<input type="number">` | Supports min/max/step |
| `select` | `{ variant: "select", options: CellSelectOption[] }` | Radix Select | Renders as Badge when not editing |
| `multi-select` | `{ variant: "multi-select", options: CellSelectOption[] }` | Popover + Command | Badge overflow, search within options |
| `checkbox` | `{ variant: "checkbox" }` | Toggle on click/Enter/Space | Always in "editing" mode |
| `date` | `{ variant: "date" }` | Popover + Calendar | Local date parsing |
| `url` | `{ variant: "url" }` | contentEditable div | Validates URLs, renders as link |
| `file` | `{ variant: "file", maxFileSize?: number, maxFiles?: number, accept?: string, multiple?: boolean }` | Popover + Drag-drop | File validation, upload progress |

#### Filter Variants (`meta.filter`)

| Variant | Config | Operators |
|---------|--------|-----------|
| `text` | `{ variant: "text", placeholder?: string }` | contains, equals, startsWith, etc. |
| `number` | `{ variant: "number", unit?: string }` | equals, lessThan, greaterThan, isBetween, etc. |
| `range` | `{ variant: "range" }` | Slider input |
| `date` | `{ variant: "date" }` | Calendar picker |
| `dateRange` | `{ variant: "dateRange" }` | Dual calendar pickers |
| `select` | `{ variant: "select", options: CellSelectOption[] }` | is, isNot |
| `multiSelect` | `{ variant: "multiSelect", options: CellSelectOption[] }` | isAnyOf, isNoneOf |

Set `enableColumnFilter: true` on columns that should appear in the filter toolbar.

### 3. Set Up Data Fetching

Use `useInfiniteQuery` with cursor-based pagination for large datasets, or `useQuery` for smaller ones.

**With infinite scroll (recommended for large datasets):**

```tsx
const PAGE_SIZE = 50

const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
  queryKey: ["data-grid-myItems", sorting, columnFilters],
  queryFn: async ({ pageParam }) => {
    return getMyItemsGridFn({
      data: {
        pageParam: pageParam as string | undefined,
        pageSize: PAGE_SIZE,
        sorting,
        filters: columnFilters,
      },
    })
  },
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

const allData = React.useMemo(() => {
  return data?.pages.flatMap((page) => page.data) ?? []
}, [data])
```

The server function should:
- Accept `SortingState`, `ColumnFiltersState`, `pageParam`, `pageSize`
- Use keyset/cursor pagination (`nextCursor`)
- Apply WHERE clauses from filters
- Apply ORDER BY from sorting
- Fetch `pageSize + 1` rows to detect if there's a next page

**Without infinite scroll (small datasets):**

```tsx
const { data = [], isLoading } = useQuery({
  queryKey: ["data-grid-myItems", sorting, columnFilters],
  queryFn: () => getMyItemsGridFn({ data: { sorting, filters: columnFilters } }),
})
```

### 4. Create the Page Component

Here's the full integration pattern. Replace `MyItem` and the query key with your data type:

```tsx
import { useInfiniteQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { ColumnFiltersState, SortingState, Updater } from "@tanstack/react-table"
import * as React from "react"

import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridFilterToolbar } from "@/components/data-grid/data-grid-filter-toolbar"
import { DataGridKeyboardShortcuts } from "@/components/data-grid/data-grid-keyboard-shortcuts"
import {
  DataGridSkeleton,
  DataGridSkeletonGrid,
  DataGridSkeletonToolbar,
} from "@/components/data-grid/data-grid-skeleton"
import { DataGridSortMenu } from "@/components/data-grid/data-grid-sort-menu"
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu"
import { arrIncludesSome, dateFilter } from "@/components/data-table/client/filter-functions"
import type { MyItem } from "@/db/types"
import { getMyItemsGridFn } from "@/functions"
import { useDataGrid } from "@/hooks/use-data-grid"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { useWindowSize } from "@/hooks/use-window-size"

import { ActionsMenu } from "./-components/actions-menu"
import { getColumns } from "./-components/columns"

export const Route = createFileRoute("/my-items/")({
  component: RouteComponent,
})

const PAGE_SIZE = 50
const DEFAULT_SORTING: SortingState = [{ id: "createdAt", desc: true }]

function RouteComponent() {
  const [sorting, setSorting] = React.useState<SortingState>(DEFAULT_SORTING)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const windowSize = useWindowSize({ defaultHeight: 760 })
  const height = Math.max(400, windowSize.height - 150)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["data-grid-myItems", sorting, columnFilters],
    queryFn: async ({ pageParam }) => {
      return getMyItemsGridFn({
        data: {
          pageParam: pageParam as string | undefined,
          pageSize: PAGE_SIZE,
          sorting,
          filters: columnFilters,
        },
      })
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const allData = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? []
  }, [data])

  const columns = React.useMemo(() => getColumns(), [])

  const onSortingChange = React.useCallback((updater: Updater<SortingState>) => {
    setSorting(updater)
  }, [])

  const onColumnFiltersChange = React.useCallback((updater: Updater<ColumnFiltersState>) => {
    setColumnFilters(updater)
  }, [])

  const grid = useDataGrid<MyItem>({
    data: allData,
    columns,
    filterFns: {
      arrIncludesSome,
      dateFilter,
    },
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    onSortingChange,
    onColumnFiltersChange,
    enableSearch: true,
    enablePaste: true,
    initialState: {
      sorting: DEFAULT_SORTING,
      columnPinning: {
        left: ["select"],
      },
      columnVisibility: {
        createdAt: false,
        updatedAt: false,
      },
    },
  })

  const { rowVirtualizer, ...dataGrid } = grid
  const rows = dataGrid.table.getRowModel().rows
  const selectedCount = dataGrid.table.getSelectedRowModel().rows.length

  const onFetchNextPage = React.useCallback(() => {
    fetchNextPage()
  }, [fetchNextPage])

  useInfiniteScroll<HTMLDivElement>({
    scrollRef: dataGrid.dataGridRef,
    rowVirtualizer,
    rowCount: rows.length,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    fetchNextPage: onFetchNextPage,
    threshold: 5,
  })

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden p-6">
        <h1 className="mb-6 font-bold text-2xl">My Items</h1>
        <DataGridSkeleton>
          <DataGridSkeletonToolbar />
          <DataGridSkeletonGrid />
        </DataGridSkeleton>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6 pb-8">
      <div className="mb-3 flex shrink-0 items-center gap-2">
        <DataGridFilterToolbar table={grid.table} />
        <div className="ml-auto flex items-center gap-2">
          <ActionsMenu table={grid.table} />
          <DataGridSortMenu table={grid.table} />
          <DataGridViewMenu table={grid.table} />
          <DataGridKeyboardShortcuts enableSearch enablePaste />
        </div>
      </div>
      <DataGrid {...dataGrid} height={height} />
      <div className="mt-2 flex shrink-0 items-center gap-4 text-muted-foreground text-xs">
        <span>Rows: {rows.length}</span>
        <span>Selected: {selectedCount}</span>
      </div>
    </div>
  )
}
```

---

## `useDataGrid` Hook — Props Reference

```tsx
useDataGrid<TData>({
  // Required
  data,                              // TData[] — flat array of row data
  columns,                           // ColumnDef<TData>[]

  // Optional — Data mutations
  onDataChange,                       // (updates: CellUpdate | CellUpdate[]) => void
  onRowAdd,                           // (rowIndex?: number) => void
  onRowsAdd,                          // (count: number, rowIndex?: number) => void
  onRowsDelete,                       // (rowIndices: number[]) => void | Promise<void>

  // Optional — Clipboard
  onPaste,                            // (text: string) => boolean
  onFilesUpload,                      // (params: { files, rowIndex, columnId }) => Promise<FileCellData[]>
  onFilesDelete,                      // (params: { fileIds, rowIndex, columnId }) => void | Promise<void>

  // Optional — Display
  rowHeight,                          // RowHeightValue — default "short"
  onRowHeightChange,                   // (value: RowHeightValue) => void
  overscan,                            // number — default 6
  dir,                                 // "ltr" | "rtl" — default "ltr"
  autoFocus,                           // boolean — default true
  readOnly,                            // boolean — default false

  // Optional — Features
  enableSearch,                        // boolean — default false
  enablePaste,                         // boolean — default false
  enableSingleCellSelection,           // boolean
  enableColumnSelection,               // boolean

  // Optional — Server-side mode (recommended)
  manualSorting,                       // boolean
  manualFiltering,                      // boolean
  manualPagination,                     // boolean
  onSortingChange,                      // (updater: Updater<SortingState>) => void
  onColumnFiltersChange,               // (updater: Updater<ColumnFiltersState>) => void

  // Optional — Filter functions
  filterFns,                           // Record<string, FilterFn<TData>>

  // Optional — TanStack Table initialState
  initialState: {
    sorting,                            // SortingState
    columnPinning,                      // { left?: string[], right?: string[] }
    columnVisibility,                   // Record<string, boolean>
    rowSelection,                       // RowSelectionState
  },
})
```

### Return Value

The hook returns an object that should be spread into `<DataGrid>`. Key properties:

| Property | Type | Description |
|----------|------|-------------|
| `table` | `Table<TData>` | TanStack Table instance |
| `rowVirtualizer` | `Virtualizer` | **Extract before spreading** — needed by `useInfiniteScroll` |
| `dataGridRef` | `RefObject<HTMLDivElement>` | Grid container ref |
| `columns` | `ColumnDef[]` | Processed columns |
| `columnSizeVars` | `Record<string, string>` | CSS custom properties for col widths |
| `focusedCell` | `CellPosition \| null` | Currently focused cell |
| `editingCell` | `CellPosition \| null` | Currently editing cell |
| `rowHeight` | `RowHeightValue` | Current row height |
| `searchState` | `SearchState` | Search matches and navigation |
| `contextMenu` | `ContextMenuState` | Context menu position |
| `pasteDialog` | `PasteDialogState` | Paste dialog state |

Always destructure `rowVirtualizer` **before** spreading:

```tsx
const { rowVirtualizer, ...dataGrid } = grid
```

---

## `<DataGrid>` Component Props

```tsx
<DataGrid
  {...dataGrid}          // Spread all hook return values
  height={height}        // Required — pixel height of the grid
  dir="ltr"              // Optional — inherited from hook
  stretchColumns={false} // Optional — stretch columns to fill width
  onLoadMore={fn}        // Optional — callback for "load more" row click
  hasNextPage={true}      // Optional — shows "load more" row
  isLoadingMore={false}   // Optional — shows loading spinner in footer
/>
```

---

## `useInfiniteScroll` Hook

```tsx
useInfiniteScroll<HTMLDivElement>({
  scrollRef: dataGrid.dataGridRef,   // Ref to the scrollable grid container
  rowVirtualizer,                     // From useDataGrid return
  rowCount: rows.length,              // Current row count
  hasNextPage: Boolean(hasNextPage),  // Whether more data exists
  isFetchingNextPage,                 // Whether a fetch is in progress
  fetchNextPage: onFetchNextPage,     // Callback to fetch next page
  threshold: 5,                       // Rows from bottom to trigger fetch (default 20)
})
```

---

## `useWindowSize` Hook

```tsx
const windowSize = useWindowSize({ defaultHeight: 760 })
const height = Math.max(400, windowSize.height - 150) // Subtract header/toolbar/padding
```

---

## Toolbar Components

All toolbar components accept `table: Table<TData>` as a prop (use `grid.table`):

```tsx
<DataGridFilterToolbar table={grid.table} />
<DataGridSortMenu table={grid.table} />
<DataGridViewMenu table={grid.table} />
<DataGridKeyboardShortcuts
  enableSearch      // Show search shortcuts section
  enablePaste       // Show paste shortcuts section
  enableUndoRedo    // Show undo/redo section (optional)
  enableRowAdd       // Show row add section (optional)
  enableRowsDelete   // Show rows delete section (optional)
/>
```

---

## Loading Skeleton

```tsx
<DataGridSkeleton>
  <DataGridSkeletonToolbar />
  <DataGridSkeletonGrid />
</DataGridSkeleton>
```

---

## Filter Functions

Register custom filter functions in `useDataGrid` via `filterFns`. Two common ones are provided:

```tsx
import { arrIncludesSome, dateFilter } from "@/components/data-table/client/filter-functions"

filterFns: {
  arrIncludesSome,   // For multi-select: checks if row value is in the filter array
  dateFilter,        // For dates: compares date strings by converting to Date objects
}
```

You can also use TanStack's built-in filter functions or create custom ones matching the `FilterFn` signature.

---

## Server-Side Data Function Pattern

The grid sends `SortingState` and `ColumnFiltersState` directly to the server. Your server function should:

1. Accept `{ pageParam?, pageSize, sorting, filters }` as input
2. Convert `SortingState` to SQL `ORDER BY` (always append `id` as tiebreaker)
3. Convert `ColumnFiltersState` to SQL `WHERE` clauses
4. Use cursor-based (keyset) pagination for stable ordering
5. Fetch `pageSize + 1` rows to determine if there's a next page
6. Return `{ data: TData[], nextCursor?: string }`

Reference implementation: `src/queries/list-tasks-cursor.ts`

---

## Column Pinning

Pin columns to left or right to keep them visible during horizontal scroll:

```tsx
initialState: {
  columnPinning: {
    left: ["select"],    // Checkbox column pinned left
    // right: ["actions"]  // Optional: pin columns to right
  },
}
```

---

## Column Visibility

Hide columns by default (users can toggle via the View Menu):

```tsx
initialState: {
  columnVisibility: {
    createdAt: false,
    updatedAt: false,
  },
}
```

---

## Cell Editing & Data Mutations

To enable cell editing, provide mutation callbacks:

```tsx
const grid = useDataGrid<MyItem>({
  // ... other props
  onDataChange: (params) => {
    // params is CellUpdate | CellUpdate[]
    // Each update: { rowIndex, columnId, value }
    // Call your API/mutation here
  },
  onRowsDelete: async (rowIndices) => {
    // Delete rows from your data source
  },
  onPaste: (text) => {
    // Custom paste handler — return true if handled
    return false
  },
})
```

For file cells, provide upload/delete callbacks via `onFilesUpload` and `onFilesDelete`.

---

## ReadOnly Mode

Set `readOnly: true` to disable all cell editing while keeping navigation, selection, and search:

```tsx
const grid = useDataGrid<MyItem>({
  readOnly: true,
  // ...
})
```

---

## Checklist: Adding Data Grid to a New Page

- [ ] Define your data type (`TData`)
- [ ] Create `getColumns()` function with `getDataGridSelectColumn<TData>()` and column metas
- [ ] Create a server function for data fetching (cursor-based pagination recommended)
- [ ] Set up `useInfiniteQuery` (or `useQuery` for small datasets)
- [ ] Call `useDataGrid<TData>` with the data, columns, and options
- [ ] Destructure `rowVirtualizer` from the hook return
- [ ] Set up `useInfiniteScroll` if using infinite query
- [ ] Calculate grid height with `useWindowSize`
- [ ] Render toolbar (`DataGridFilterToolbar`, `DataGridSortMenu`, `DataGridViewMenu`, `DataGridKeyboardShortcuts`)
- [ ] Render `<DataGrid {...dataGrid} height={height} />`
- [ ] Render status bar (rows count, selected count)
- [ ] Add loading skeleton with `DataGridSkeleton`
- [ ] (Optional) Create an `ActionsMenu` component for row actions