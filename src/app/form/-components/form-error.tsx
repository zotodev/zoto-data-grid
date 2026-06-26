import { AlertCircleIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Best-effort extraction of a readable message from any thrown value.
 * Works for plain `Error`s, strings, and `{ message }`-like objects.
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error
  if (error instanceof Error && error.message) return error.message
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message
  }
  return "Something went wrong. Please try again."
}

interface FormErrorProps extends Omit<React.ComponentProps<"div">, "children" | "title"> {
  /** Raw error from any React Query hook (e.g. `mutation.error`), or any thrown value. */
  error: unknown
  /** Headline above the message. */
  title?: React.ReactNode
  /**
   * Override the rendered body. Pass this when your server returns a well-defined
   * error and you've already shaped it (in the hook / `mutationFn`); otherwise the
   * message is derived from `error` automatically.
   */
  children?: React.ReactNode
  /** When provided, shows a dismiss button. */
  onDismiss?: () => void
}

/**
 * Generic alert for surfacing submission errors on any form.
 * Drop it anywhere and feed it the error from your query/mutation:
 *
 *   <FormError error={mutation.error} onDismiss={() => mutation.reset()} />
 */
export function FormError({
  error,
  title = "Something went wrong",
  children,
  onDismiss,
  className,
  ...props
}: FormErrorProps) {
  if (!error) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive",
        className
      )}
      {...props}
    >
      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          {title && <p className="font-medium text-sm">{title}</p>}
          {onDismiss && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="-mt-0.5 -mr-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <XIcon />
            </Button>
          )}
        </div>

        <div className="text-destructive/90 text-sm">{children ?? getErrorMessage(error)}</div>
      </div>
    </div>
  )
}
