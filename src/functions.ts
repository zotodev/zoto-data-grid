import { createServerFn } from "@tanstack/react-start"
import { listTasks } from "@/queries/list-tasks"
import { listAllTasks } from "./queries/list-all-tasks"

export const getTasksFn = createServerFn({ method: "GET" })
  .inputValidator(
    (data: {
      page?: number
      perPage?: number
      sortBy?: string
      sortOrder?: "asc" | "desc"
      status?: string
      priority?: string
      q?: string
    }) => data
  )
  .handler(async ({ data }) => {
    return listTasks({
      page: data.page,
      perPage: data.perPage,
      sortBy: data.sortBy,
      sortOrder: data.sortOrder,
      status: data.status?.split(",").filter(Boolean),
      priority: data.priority?.split(",").filter(Boolean),
      q: data.q
    })
  })

export const getTasksClientFn = createServerFn({ method: "GET" }).handler(async () => {
  return listAllTasks()
})
