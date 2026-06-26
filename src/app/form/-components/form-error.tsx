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

/** Serializes the raw error (stack / JSON / string) for dev-only debugging. */
export function getRawError(error: unknown): string {
  if (error instanceof Error) return error.stack ?? `${error.name}: ${error.message}`
  if (typeof error === "string") return error
  try {
    return JSON.stringify(error, null, 2)
  } catch {
    return String(error)
  }
}

interface FormErrorProps extends Omit<React.ComponentProps<"div">, "children" | "title"> {
  /** Raw error from any React Query hook (e.g. `mutation.error`), or any thrown value. */
  error: unknown
  /** Headline above the message. */
  title?: React.ReactNode
  /**
   * Override the rendered body. Pass this when you've already shaped a proper
   * message (in the hook / `mutationFn`); otherwise it's derived from `error`.
   */
  children?: React.ReactNode
  /** Whether to show the raw error for debugging. Defaults to dev only. */
  showRawError?: boolean
  /** When provided, shows a dismiss button. */
  onDismiss?: () => void
}

/**
 * Generic alert for surfacing submission errors on any form.
 *
 *   <FormError error={mutation.error} onDismiss={() => mutation.reset()} />
 */
export function FormError({
  error,
  title = "Something went wrong",
  children,
  showRawError = import.meta.env.DEV,
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

        {showRawError && (
          <details className="group/raw mt-1.5">
            <summary className="cursor-pointer select-none list-none text-destructive/70 text-xs hover:text-destructive">
              <span className="group-open/raw:hidden">Show raw error</span>
              <span className="hidden group-open/raw:inline">Hide raw error</span>
            </summary>
            <pre className="mt-1.5 max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-destructive/10 p-2 font-mono text-[11px] text-destructive/70">
              {getRawError(error)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
