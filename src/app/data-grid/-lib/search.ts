import { z } from "zod"
import { dataTableSearchSchema } from "@/components/data-table"

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

export const dataGridSearchSchema = dataTableSearchSchema.pick({ sortBy: true, sortOrder: true }).extend({
  title: optionalTextSchema,
  status: statusSchema,
  priority: z.enum(["low", "medium", "high"]).optional().catch(undefined),
  dueDate: z.number().int().nonnegative().optional().catch(undefined)
})

export type DataGridSearch = z.infer<typeof dataGridSearchSchema>

export const defaultDataGridSearch = dataGridSearchSchema.parse({})
