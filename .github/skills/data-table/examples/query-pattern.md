# Query Pattern Example (Drizzle ORM)

This is the pattern used in `src/queries/list-tasks.ts`. Your data source can be anything (REST API, tRPC, etc.) — this example shows Drizzle ORM which is what this app uses.

The key contract: your query function receives filters, `sortBy`/`sortOrder`, page/perPage and returns `{ data, hasNextPage }`.

---

## Drizzle Example

```typescript
import { db } from "@/db"
import { tasks } from "@/db/schema"
import { and, asc, desc, ilike, inArray } from "drizzle-orm"

interface TasksFilter {
  page?: number
  perPage?: number
  sortBy?: string          // column key
  sortOrder?: "asc" | "desc"
  // Add a field for each filterable column:
  status?: string[]        // multiSelect → string[]
  priority?: string[]      // multiSelect → string[]
  title?: string           // text → string
}

// Guard: only allow known columns to be sorted
const sortableColumns = {
  title: tasks.title,
  status: tasks.status,
  priority: tasks.priority,
  createdAt: tasks.createdAt,
} as const

export async function listTasks(filter: TasksFilter) {
  const {
    page = 1,
    perPage = 10,
    sortBy,
    sortOrder,
    status,
    priority,
    title,
  } = filter

  // Build WHERE clause — skip undefined filters
  const where = and(
    title ? ilike(tasks.title, `%${title}%`) : undefined,
    status?.length ? inArray(tasks.status, status) : undefined,
    priority?.length ? inArray(tasks.priority, priority) : undefined,
  )

  // Build ORDER BY — fall back to default sort
  const orderBy =
    sortBy && sortBy in sortableColumns
      ? [sortOrder === "asc"
          ? asc(sortableColumns[sortBy as keyof typeof sortableColumns])
          : desc(sortableColumns[sortBy as keyof typeof sortableColumns])]
      : [desc(tasks.createdAt)]

  // Fetch one extra row to detect next page
  const rows = await db
    .select()
    .from(tasks)
    .where(where)
    .orderBy(...orderBy)
    .limit(perPage + 1)
    .offset((page - 1) * perPage)

  return {
    data: rows.slice(0, perPage),
    hasNextPage: rows.length > perPage,
  }
}
```

---

## REST API / Fetch Alternative

If you're fetching from an API instead:

```typescript
interface MyFilter {
  page?: number
  perPage?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  status?: string[]
}

export async function listInvoices(filter: MyFilter) {
  const params = new URLSearchParams()
  if (filter.page) params.set("page", String(filter.page))
  if (filter.perPage) params.set("perPage", String(filter.perPage))
  if (filter.sortBy) params.set("sortBy", filter.sortBy)
  if (filter.sortOrder) params.set("sortOrder", filter.sortOrder)
  if (filter.status?.length) params.set("status", filter.status.join(","))

  const res = await fetch(`/api/invoices?${params}`)
  return res.json() // expects { data: Invoice[], hasNextPage: boolean }
}
```

---

## Wiring to the Server Page

```tsx
const { data: result, isPending } = useQuery({
  queryKey: ["invoices", search],
  queryFn: () => listInvoices({
    page: search.page,
    perPage: search.perPage,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
    status: search.status?.split(",").filter(Boolean),
  }),
})

const { table } = useDataTableServer({
  columns,
  data: result?.data ?? [],
  hasNextPage: result?.hasNextPage,
  search,
})

<DataTableServer table={table} isLoading={isPending}>
  <DataTableToolbar table={table} />
</DataTableServer>
```

Pass `hasNextPage` directly — no manual `pageCount` calculation needed.

> **Sorting:** URL params are `sortBy=createdAt&sortOrder=desc`. Your query receives `sortBy: string` and `sortOrder: "asc" | "desc"`. Always guard against unknown column names before using `sortBy` in a DB query.

## Wiring to the Client Page

```tsx
const { data: result, isLoading } = useQuery({
  queryKey: ["client-tasks"],
  queryFn: async () => await getTasksClientFn(),
})

const data = result?.data ?? []
const columns = React.useMemo(() => getColumns(), [])

const { table } = useDataTableClient({
  columns,
  data,
  initialState: {
    sorting: [{ id: "createdAt", desc: true }],
    columnPinning: { left: ["select"], right: ["actions"] },
  },
})

<DataTableClient table={table} isLoading={isLoading} />
```

Client tables don't need URL sync or `hasNextPage` — pagination is handled locally.