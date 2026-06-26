import { z } from "zod"

export const PLANS = [
  { value: "starter", label: "Starter", hint: "Activates instantly" },
  { value: "pro", label: "Pro", hint: "Activates instantly" },
  { value: "team", label: "Team", hint: "Triggers a field-level server error" },
  { value: "enterprise", label: "Enterprise", hint: "Triggers a multi-reason server error" },
  { value: "legacy", label: "Legacy", hint: "Triggers a single-message server error" },
] as const

export const planFormSchema = z.object({
  plan: z.string().min(1, "Please select a plan to continue"),
})

export type PlanFormData = z.infer<typeof planFormSchema>
