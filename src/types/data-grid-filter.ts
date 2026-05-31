import type { RowData } from "@tanstack/react-table"
import type { CellSelectOption } from "@/types/data-grid"

export type DataGridFilterVariant =
  | "text"
  | "number"
  | "range"
  | "date"
  | "dateRange"
  | "boolean"
  | "select"
  | "multiSelect"

export interface DataGridFilterOpts {
  variant: DataGridFilterVariant
  placeholder?: string
  options?: CellSelectOption[]
  range?: [number, number]
  unit?: string
}

declare module "@tanstack/react-table" {
  // biome-ignore lint/correctness/noUnusedVariables: TData and TValue are used in the ColumnMeta interface
  interface ColumnMeta<TData extends RowData, TValue> {
    filter?: DataGridFilterOpts
  }
}
