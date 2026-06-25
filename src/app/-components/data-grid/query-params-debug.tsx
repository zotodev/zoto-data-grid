import { Bug } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { TaskGridQueryParams } from "../../-lib/data-grid/task-query-state"

interface QueryParamsDebugProps {
  queryParams: TaskGridQueryParams
}

export function QueryParamsDebug({ queryParams }: QueryParamsDebugProps) {
  const [open, setOpen] = React.useState(false)

  if (!import.meta.env.DEV) return null

  return (
    <>
      <Button
        variant="outline"
        size="icon-sm"
        className="size-8 shrink-0"
        aria-label="Show query params"
        onClick={() => setOpen(true)}
      >
        <Bug className="size-3.5 text-muted-foreground" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Query params</DialogTitle>
          </DialogHeader>
          <pre className="max-h-80 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
            {JSON.stringify(queryParams, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  )
}
