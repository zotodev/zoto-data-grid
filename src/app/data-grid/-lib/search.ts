import { z } from "zod"

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
  sortBy: z.string().optional().catch(undefined),
  sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
  title: optionalTextSchema,
  status: statusSchema,
  priority: z.enum(["low", "medium", "high"]).optional().catch(undefined),
  dueDate: z.number().int().nonnegative().optional().catch(undefined)
})

export type DataGridSearch = z.infer<typeof dataGridSearchSchema>

export const defaultDataGridSearch = dataGridSearchSchema.parse({})
