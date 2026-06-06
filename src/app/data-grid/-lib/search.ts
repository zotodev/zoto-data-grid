import { z } from "zod"
import { DEFAULT_TASK_GRID_SORTING, normalizeTaskGridSorting } from "@/lib/task-grid-params"

const sortSchema = z.object({
  id: z.string(),
  desc: z.boolean()
})

const optionalTextSchema = z.string().trim().min(1).optional().catch(undefined)

const statusSchema = z
  .string()
  .transform((value) => {
    const validStatuses = new Set(["TODO", "IN_PROGRESS", "DONE"])
    return [...new Set(value.split(",").filter((status) => validStatuses.has(status)))].join(",")
  })
  .pipe(z.string().min(1))
  .optional()
  .catch(undefined)

export const dataGridSearchSchema = z.object({
  title: optionalTextSchema,
  status: statusSchema,
  priority: z.enum(["low", "medium", "high"]).optional().catch(undefined),
  dueDate: z.number().int().nonnegative().optional().catch(undefined),
  sort: z
    .array(sortSchema)
    .transform((value) => normalizeTaskGridSorting(value))
    .default(DEFAULT_TASK_GRID_SORTING)
    .catch(DEFAULT_TASK_GRID_SORTING)
})

export type DataGridSearch = z.infer<typeof dataGridSearchSchema>

export const defaultDataGridSearch = dataGridSearchSchema.parse({})
