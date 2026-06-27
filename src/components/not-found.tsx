import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function NotFoundPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();

  const homeRoute = accessToken ? "/" : "/login";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-mono text-8xl font-medium tracking-tighter text-muted-foreground/30 select-none">
        404
      </p>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button asChild>
          <Link to={homeRoute}>
            <Home className="mr-2 h-4 w-4" />
            Go home
          </Link>
        </Button>
        <Button asChild>
          <Link to=".." onClick={(e) => {
            e.preventDefault()
            router.history.back();
          }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Link>
        </Button>
      </div>
    </div>
  );
}