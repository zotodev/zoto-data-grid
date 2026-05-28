"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export default function NotFoundComponent() {
  return (
    <div className="mx-2 flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background text-foreground">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center pb-2">
            <h1 className="font-medium text-2xl">404</h1>
            <div className="mx-4 h-8 w-px bg-border" />
            <p>This page could not be found.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button className="flex w-full items-center gap-2" onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
