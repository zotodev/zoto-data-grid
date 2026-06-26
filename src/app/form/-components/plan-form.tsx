import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { submitPlanFn } from "../-functions"
import { divide } from "../-lib/external"
import { PLANS, planFormSchema, type PlanFormData } from "../-lib/schema"
import { FormError } from "./form-error"

type Action = "submit" | "divide" | "defined"

export function PlanForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: standardSchemaResolver(planFormSchema),
    defaultValues: { plan: "" },
  })

  // One mutation, three error sources — all surfaced through the same <FormError />.
  const mutation = useMutation({
    mutationFn: async ({ action, data }: { action: Action; data?: PlanFormData }) => {
      switch (action) {
        // 1. Server source: the server function throws (plain Error from the backend).
        case "submit":
          return submitPlanFn({ data: data! })

        // 2. External source: third-party code throws a raw runtime error.
        case "divide": {
          const result = divide(10, 0)
          return { ok: true as const, plan: `result: ${result}` }
        }

        // 3. Defined source: an error we shape right here with a proper message.
        case "defined":
          throw new Error("Could not process your request. Please try again.")
      }
    },
    onSuccess: () => reset(),
  })

  const pendingAction = mutation.isPending ? mutation.variables?.action : undefined

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Activate a workspace plan</CardTitle>
          <CardDescription>POC: one generic error component, three different error sources.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <FormError error={mutation.error} onDismiss={() => mutation.reset()} />

          {mutation.isSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-muted px-3 py-2 text-sm">
              <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
              <span>
                <span className="font-medium capitalize">{mutation.data?.plan}</span> activated.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit((data) => mutation.mutate({ action: "submit", data }))} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="plan">Plan</Label>
              <Controller
                control={control}
                name="plan"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger id="plan" className="w-full" aria-invalid={!!errors.plan} onBlur={field.onBlur}>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANS.map((plan) => (
                        <SelectItem key={plan.value} value={plan.value}>
                          <span className="flex flex-col">
                            <span>{plan.label}</span>
                            <span className="text-muted-foreground text-xs">{plan.hint}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.plan && (
                <p className="flex items-center gap-1 text-destructive text-xs">
                  <AlertCircleIcon className="size-3" />
                  {errors.plan.message}
                </p>
              )}
            </div>

            {/* 1. Server error source */}
            <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
              {pendingAction === "submit" && <Spinner className="mr-1" />}
              {pendingAction === "submit" ? "Activating…" : "Activate plan (server error)"}
            </Button>

            {/* 2. External runtime error source */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({ action: "divide" })}
            >
              {pendingAction === "divide" && <Spinner className="mr-1" />}
              Divide by zero (external error)
            </Button>

            {/* 3. Error defined in the mutation */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({ action: "defined" })}
            >
              {pendingAction === "defined" && <Spinner className="mr-1" />}
              Throw defined error
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
