import { createServerFn } from "@tanstack/react-start"
import { listTasksCursor, type TaskGridParams } from "./queries/list-tasks-cursor"

export const getTasksGridFn = createServerFn({ method: "GET" })
  .inputValidator((data: TaskGridParams) => data)
  .handler(async ({ data }) => {
    return listTasksCursor(data)
  })
