import type { Table } from "@tanstack/react-table"

const controllers = new WeakMap<object, unknown>()

export function registerDataGridTableController<TData, TController>(table: Table<TData>, controller: TController) {
  controllers.set(table, controller)
}

export function getDataGridTableController<TData, TController>(table: Table<TData>): TController {
  const controller = controllers.get(table)

  if (!controller) {
    throw new Error("DataGridTable requires a table created by useDataGridTable.")
  }

  return controller as TController
}
