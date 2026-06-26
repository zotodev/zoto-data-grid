import { createFileRoute } from "@tanstack/react-router"
import { PlanForm } from "./-components/plan-form"

export const Route = createFileRoute("/form/")({
  component: PlanForm,
})
