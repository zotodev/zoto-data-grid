"use client"

import type { Column } from "@tanstack/react-table"
import { CalendarIcon, XCircle } from "lucide-react"
import * as React from "react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/format"

type DateSelection = Date[] | DateRange

function isDateRange(value: DateSelection): value is DateRange {
  return value && typeof value === "object" && !Array.isArray(value)
}

function parseDate(value: number | string | undefined): Date | undefined {
  if (!value) return undefined

  const date = new Date(typeof value === "string" ? Number(value) : value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function parseFilterValue(value: unknown): Array<number | string | undefined> {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "number" || typeof item === "string" ? item : undefined))
  }

  return typeof value === "number" || typeof value === "string" ? [value] : []
}

interface DataGridFilterDateProps<TData> {
  column: Column<TData, unknown>
  title?: string
  multiple?: boolean
}

export function DataGridFilterDate<TData>({ column, title, multiple }: DataGridFilterDateProps<TData>) {
  const columnFilterValue = column.getFilterValue()

  const selectedDates = React.useMemo<DateSelection>(() => {
    const timestamps = parseFilterValue(columnFilterValue)

    if (multiple) {
      return {
        from: parseDate(timestamps[0]),
        to: parseDate(timestamps[1])
      }
    }

    const date = parseDate(timestamps[0])
    return date ? [date] : []
  }, [columnFilterValue, multiple])

  const onSelect = React.useCallback(
    (date: Date | DateRange | undefined) => {
      if (!date) {
        column.setFilterValue(undefined)
      } else if (multiple && !("getTime" in date)) {
        const from = date.from?.getTime()
        const to = date.to?.getTime()
        column.setFilterValue(from || to ? [from, to] : undefined)
      } else if (!multiple && "getTime" in date) {
        column.setFilterValue(date.getTime())
      }
    },
    [column, multiple]
  )

  const onReset = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      column.setFilterValue(undefined)
    },
    [column]
  )

  const hasValue = isDateRange(selectedDates)
    ? Boolean(selectedDates.from || selectedDates.to)
    : selectedDates.length > 0

  const dateText = React.useMemo(() => {
    if (isDateRange(selectedDates)) {
      if (selectedDates.from && selectedDates.to) {
        return `${formatDate(selectedDates.from)} - ${formatDate(selectedDates.to)}`
      }
      return selectedDates.from || selectedDates.to ? formatDate(selectedDates.from ?? selectedDates.to) : ""
    }

    return selectedDates[0] ? formatDate(selectedDates[0]) : ""
  }, [selectedDates])

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" className="border-dashed font-normal" />}>
        {hasValue ? (
          <button
            type="button"
            aria-label={`Clear ${title} filter`}
            onClick={onReset}
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <XCircle />
          </button>
        ) : (
          <CalendarIcon />
        )}
        <span>{title}</span>
        {dateText && (
          <>
            <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
            <span>{dateText}</span>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {multiple ? (
          <Calendar
            autoFocus
            captionLayout="dropdown"
            mode="range"
            selected={isDateRange(selectedDates) ? selectedDates : { from: undefined, to: undefined }}
            onSelect={onSelect}
          />
        ) : (
          <Calendar
            captionLayout="dropdown"
            mode="single"
            selected={!isDateRange(selectedDates) ? selectedDates[0] : undefined}
            onSelect={onSelect}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
