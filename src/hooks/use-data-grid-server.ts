import { type UseDataGridProps, useDataGrid } from "@/hooks/use-data-grid"

interface UseDataGridServerProps<TData>
  extends Omit<UseDataGridProps<TData>, "getCoreRowModel" | "manualFiltering" | "manualPagination" | "manualSorting"> {}

export function useDataGridServer<TData>(props: UseDataGridServerProps<TData>) {
  return useDataGrid({
    ...props,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    enableMultiSort: false
  })
}
