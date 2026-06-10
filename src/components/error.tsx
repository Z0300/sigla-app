import { Link } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-mono text-8xl font-medium tracking-tighter text-muted-foreground/30 select-none">
        !
      </p>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
      </div>

      {error?.message && (
        <Alert variant="destructive" className="max-w-md text-left">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Error details</AlertTitle>
          <AlertDescription className="font-mono text-xs break-all">
            An unexpected error occurred. You can try again or go back home.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={reset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link to="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  );
}
