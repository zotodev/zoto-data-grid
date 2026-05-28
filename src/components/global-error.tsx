import {
  ErrorComponent,
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter
} from "@tanstack/react-router"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId
  })

  console.error(error)
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-card p-6 text-center shadow-lg">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="font-semibold text-2xl text-foreground">Something went wrong!</h2>
        <p className="text-muted-foreground">
          An unexpected error occurred. Please try again or contact support if the issue persists.
        </p>
        <ErrorComponent error={error} />
        <div className="flex justify-center gap-2">
          <Button
            className="w-fit"
            onClick={() => {
              router.invalidate()
            }}
          >
            Try again
          </Button>
          {isRoot ? (
            <Button render={<Link to="/" />} className="w-fit">
              Home
            </Button>
          ) : (
            <Button
              className="w-fit"
              onClick={() => {
                window.history.back()
              }}
            >
              Go Back
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
