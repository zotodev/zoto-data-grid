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
import { PLANS, planFormSchema, type PlanFormData } from "../-lib/schema"
import { FormError } from "./form-error"

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

  // Plain React Query mutation — nothing custom. `mutation.error` is fed straight to <FormError />.
  const mutation = useMutation({
    mutationFn: (data: PlanFormData) => submitPlanFn({ data }),
    onSuccess: () => reset(),
  })

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Activate a workspace plan</CardTitle>
          <CardDescription>POC showing a reusable, generic server-error component.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <FormError error={mutation.error} onDismiss={() => mutation.reset()} />

          {mutation.isSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-muted px-3 py-2 text-sm">
              <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
              <span>
                <span className="font-medium capitalize">{mutation.data?.plan}</span> plan activated.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4" noValidate>
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

            <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner className="mr-1" />}
              {mutation.isPending ? "Activating…" : "Activate plan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
