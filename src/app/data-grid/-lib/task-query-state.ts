import type { SortingState } from "@tanstack/react-table"
import type { Task } from "@/db/types"
import {
  createDataGridQueryParams,
  getDelimitedStringQueryValue,
  getNumberQueryValue,
  getStringQueryValue
} from "@/lib/data-grid-query-state"
import type { TaskGridParams } from "@/queries/list-tasks-cursor"

export const DEFAULT_SORTING: SortingState = [{ id: "createdAt", desc: true }]

export type TaskGridQueryParams = Omit<TaskGridParams, "cursor" | "perPage">

export const getTaskGridQueryParams = createDataGridQueryParams<Task, TaskGridQueryParams>({
  sorting: [
    {
      queryKey: "sortBy",
      getValue: (sort) => sort?.id
    },
    {
      queryKey: "sortOrder",
      getValue: (sort) => (sort ? (sort.desc ? "desc" : "asc") : undefined)
    }
  ],
  filters: {
    title: {
      queryKey: "q",
      getValue: getStringQueryValue
    },
    status: {
      queryKey: "status",
      getValue: getDelimitedStringQueryValue
    },
    priority: {
      queryKey: "priority",
      getValue: getStringQueryValue
    },
    dueDate: {
      queryKey: "dueDate",
      getValue: getNumberQueryValue
    }
  }
})
