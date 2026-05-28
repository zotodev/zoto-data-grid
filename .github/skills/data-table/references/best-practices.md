# Best Practices & Gotchas

## State management

### Server Table
- **Never manage pagination, sorting, or filter state yourself.** All state lives in URL search params via `useDataTableServer`. If you add a `useState` for these, it will conflict.
- **`search` must come from the route**, not be constructed manually. Use `validateSearch: dataTableSearchSchema.extend({...})` in the route definition.
- **Pass `hasNextPage` from your query result** — not `pageCount`. The hook derives the page count internally. Never compute `pageCount` yourself.

### Client Table
- **State is fully local** — `useDataTableClient` manages sorting, filtering, pagination, column visibility, and column pinning via `useState`.
- **No URL sync needed** — all state resets when the component unmounts. Use `initialState` to set defaults.
- **Use `filterFn` on columns** — for `multiSelect`/`select` columns, set `filterFn: "arrIncludesSome"`. For `date` columns, set `filterFn: "dateFilter"`. These are custom filter functions registered by the client hook.

## Column definitions

- **`enableColumnFilter: true` is required** for a column to show up in the toolbar filter list. Omitting it means no filter UI is rendered for that column.
- **`accessorKey` / `id` must exactly match** the field name you use in your sort/filter query. If they differ, URL state won't map to the right DB column (server table).
- **`enableSorting: false` and `enableHiding: false`** must be set on `select` and `actions` columns — these are non-data columns and should never be toggled or sorted.
- **`DataTableColumnHeader` is required for sortable columns** — it renders the sort icons and asc/desc toggle. Plain `th` text won't show sort controls.

## Filter meta

- **`options` values must match your DB/API values exactly** — the value field in each `Option` is sent directly to the server as a filter value (server table) or used for client-side filtering.
- **Omit `range` for auto-calculated range** — if you don't set `meta.range` on a `"range"` variant, the slider bounds are auto-derived from faceted min/max of the data. Set it explicitly to lock the bounds.
- **`icon` in column meta** renders a small icon next to the filter label in the toolbar, not in the cell. Cell icons must be added in the `cell` render function.

## Debounce behavior (Server Table only)

- **Only `text` and `number` filter variants are debounced** (default 500ms, configurable via `debounceMs`). This prevents excessive URL updates while typing.
- **All other filter variants (`select`, `multiSelect`, `date`, `dateRange`, `range`) update the URL immediately** — no debounce. This provides instant feedback for discrete selections.

## Component differences

| Feature | `DataTableServer` | `DataTableClient` |
|---------|-------------------|-------------------|
| State management | URL-synced via `useDataTableServer` | Local `useState` via `useDataTableClient` |
| Toolbar | Pass via `children` prop | Built-in (no `children` prop) |
| Batch actions | `batchActions` prop on `<DataTableToolbar>` | `batchActions` prop on `<DataTableClient>` |
| `onRowClick` | ✅ | ✅ |
| `isLoading` | ✅ (skeleton rows) | ✅ (skeleton rows) |
| Pagination | URL-synced | Client-side |

## Batch actions

- **`DataTableBatchActions`** renders only when rows are selected — no need to manually check `rows.length > 0`.
- Pass `DropdownMenuContent` as `children` — you have full control over items, submenus, separators, and destructive styling.
- Access selected rows via `table.getFilteredSelectedRowModel().rows` in your action handlers. Use `row.original` to access the entity data.
- After completing a batch action, call `table.toggleAllRowsSelected(false)` to deselect all rows.

## Routing (Server Table only)

- **Register `validateSearch` on every route** that uses the server data table. Without it, TanStack Router won't parse filter/sort params from the URL and the table state will be lost on navigation.
- **`dataTableSearchSchema.extend({})`** is the pattern — extend it with one key per filterable column (e.g. `status`, `title`). The base schema already includes `page`, `perPage`, `sortBy`, and `sortOrder`.
- **Sorting uses flat params** (`sortBy=createdAt&sortOrder=desc`), not a JSON array. Your query function receives `sortBy: string` and `sortOrder: "asc" | "desc"`. Always guard against unknown column names before using `sortBy` in a DB query.