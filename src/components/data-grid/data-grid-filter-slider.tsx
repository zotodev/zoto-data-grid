"use client"

import type { Column } from "@tanstack/react-table"
import { PlusCircle, XCircle } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

type RangeValue = [number, number]

function parseRange(value: unknown): RangeValue | undefined {
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => (typeof item === "string" || typeof item === "number") && !Number.isNaN(Number(item)))
  ) {
    return [Number(value[0]), Number(value[1])]
  }

  return undefined
}

interface DataGridFilterSliderProps<TData> {
  column: Column<TData, unknown>
  title?: string
}

export function DataGridFilterSlider<TData>({ column, title }: DataGridFilterSliderProps<TData>) {
  const id = React.useId()
  const columnFilterValue = parseRange(column.getFilterValue())
  const filter = column.columnDef.meta?.filter
  const configuredRange = filter?.variant === "range" ? filter.range : undefined
  const unit = filter?.variant === "range" ? filter.unit : undefined

  const { min, max, step } = React.useMemo(() => {
    const values = column.getFacetedMinMaxValues()
    const min = configuredRange?.[0] ?? (typeof values?.[0] === "number" ? values[0] : 0)
    const max = configuredRange?.[1] ?? (typeof values?.[1] === "number" ? values[1] : 100)
    const size = max - min
    const step = size <= 20 ? 1 : size <= 100 ? Math.ceil(size / 20) : Math.ceil(size / 50)

    return { min, max, step }
  }, [column, configuredRange])

  const range = columnFilterValue ?? [min, max]

  const setBoundary = React.useCallback(
    (index: 0 | 1, value: string) => {
      const next = Number(value)
      if (Number.isNaN(next)) return
      if (index === 0 && next >= min && next <= range[1]) column.setFilterValue([next, range[1]])
      if (index === 1 && next <= max && next >= range[0]) column.setFilterValue([range[0], next])
    },
    [column, max, min, range]
  )

  const onReset = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      column.setFilterValue(undefined)
    },
    [column]
  )

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" className="border-dashed font-normal" />}>
        {columnFilterValue ? (
          <button type="button" aria-label={`Clear ${title} filter`} onClick={onReset}>
            <XCircle />
          </button>
        ) : (
          <PlusCircle />
        )}
        <span>{title}</span>
        {columnFilterValue && (
          <>
            <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
            {columnFilterValue[0].toLocaleString()} - {columnFilterValue[1].toLocaleString()}
            {unit ? ` ${unit}` : ""}
          </>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-auto flex-col gap-4">
        <p className="font-medium leading-none">{title}</p>
        <div className="flex items-center gap-4">
          {(["from", "to"] as const).map((boundary, index) => (
            <div className="relative" key={boundary}>
              <Label htmlFor={`${id}-${boundary}`} className="sr-only">
                {boundary}
              </Label>
              <Input
                id={`${id}-${boundary}`}
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                value={range[index]}
                onChange={(event) => setBoundary(index as 0 | 1, event.target.value)}
                className={cn("h-8 w-24", unit && "pr-8")}
              />
              {unit && (
                <span className="absolute top-0 right-0 bottom-0 flex items-center bg-accent px-2 text-muted-foreground text-sm">
                  {unit}
                </span>
              )}
            </div>
          ))}
        </div>
        <Slider
          min={min}
          max={max}
          step={step}
          value={range}
          onValueChange={(value) => {
            if (Array.isArray(value) && value.length === 2) column.setFilterValue([value[0], value[1]])
          }}
        />
        <Button aria-label={`Clear ${title} filter`} variant="outline" size="sm" onClick={onReset}>
          Clear
        </Button>
      </PopoverContent>
    </Popover>
  )
}
