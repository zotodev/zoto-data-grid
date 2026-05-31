"use client"

import type { Column, Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import * as React from "react"
import { DataTableFilterDate, DataTableFilterFaceted, DataTableFilterSlider } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { cn } from "@/lib/utils"

interface DataGridFilterToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>
}

export function DataGridFilterToolbar<TData>({ table, className, ...props }: DataGridFilterToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const columns = React.useMemo(() => table.getAllColumns().filter((column) => column.getCanFilter()), [table])

  const onReset = React.useCallback(() => {
    table.resetColumnFilters()
  }, [table])

  if (columns.length === 0) return null

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      {columns.map((column) => (
        <DataGridToolbarFilter key={column.id} column={column} />
      ))}
      {isFiltered && (
        <Button aria-label="Reset filters" variant="outline" size="sm" className="border-dashed" onClick={onReset}>
          <X />
          Reset
        </Button>
      )}
    </div>
  )
}

interface DataGridToolbarFilterProps<TData> {
  column: Column<TData>
}

function DataGridToolbarFilter<TData>({ column }: DataGridToolbarFilterProps<TData>) {
  const columnMeta = column.columnDef.meta
  const filterMeta = columnMeta?.filter

  if (!filterMeta) return null

  switch (filterMeta.variant) {
    case "text":
      return (
        <DebouncedTextFilter column={column} placeholder={filterMeta.placeholder ?? columnMeta?.label ?? column.id} />
      )

    case "number":
      return (
        <div className="relative">
          <Input
            type="number"
            inputMode="numeric"
            placeholder={filterMeta.placeholder ?? columnMeta?.label ?? column.id}
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className={cn("h-8 w-[120px]", filterMeta.unit && "pr-8")}
          />
          {filterMeta.unit && (
            <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
              {filterMeta.unit}
            </span>
          )}
        </div>
      )

    case "range":
      return <DataTableFilterSlider column={column} title={columnMeta?.label ?? column.id} />

    case "date":
    case "dateRange":
      return (
        <DataTableFilterDate
          column={column}
          title={columnMeta?.label ?? column.id}
          multiple={filterMeta.variant === "dateRange"}
        />
      )

    case "select":
    case "multiSelect":
      return (
        <DataTableFilterFaceted
          column={column}
          title={columnMeta?.label ?? column.id}
          options={filterMeta.options ?? []}
          multiple={filterMeta.variant === "multiSelect"}
        />
      )

    default:
      return null
  }
}

interface DebouncedTextFilterProps<TData> {
  column: Column<TData>
  placeholder: string
}

function DebouncedTextFilter<TData>({ column, placeholder }: DebouncedTextFilterProps<TData>) {
  const filterValue = (column.getFilterValue() as string) ?? ""
  const [value, setValue] = React.useState(filterValue)

  React.useEffect(() => {
    setValue(filterValue)
  }, [filterValue])

  const setDebouncedFilterValue = useDebouncedCallback((nextValue: string) => {
    column.setFilterValue(nextValue.trim() ? nextValue : undefined)
  }, 500)

  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(event) => {
        const nextValue = event.target.value
        setValue(nextValue)
        setDebouncedFilterValue(nextValue)
      }}
      className="h-8 w-40 lg:w-56"
    />
  )
}
