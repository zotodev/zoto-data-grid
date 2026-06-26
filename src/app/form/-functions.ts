import { createServerFn } from "@tanstack/react-start"
import type { PlanFormData } from "./-lib/schema"

/**
 * Demo submission endpoint. It just throws plain `Error`s for certain plans —
 * mirroring a real backend that doesn't return a structured error contract.
 * The client renders whatever message comes back via `<FormError />`.
 */
export const submitPlanFn = createServerFn({ method: "POST" })
  .inputValidator((data: PlanFormData) => data)
  .handler(async ({ data }) => {
    await new Promise((resolve) => setTimeout(resolve, 900))

    switch (data.plan) {
      case "enterprise":
        throw new Error("The Enterprise plan can't be self-served. Contact sales@zoto.dev to continue.")
      case "legacy":
        throw new Error("The Legacy plan was discontinued. Please choose Starter or Pro instead.")
      case "team":
        throw new Error("The Team plan is sold out in your region right now.")
      default:
        return { ok: true as const, plan: data.plan, activatedAt: new Date().toISOString() }
    }
  })
