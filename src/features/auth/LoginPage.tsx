import { useForm } from "@tanstack/react-form";
import { LoginSchema } from "@/schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLoginMutation } from "#/services/auth/authMutations";

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginPage({ redirectTo }: LoginFormProps) {
  const loginMutation = useLoginMutation(redirectTo);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: LoginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await loginMutation.mutateAsync(value);
      } catch (e) {
        if (!(e instanceof Error)) return;
        throw e;
      }
    },

  });

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your credentials below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <form.Field
                name="email"
                children={(field) => {
                  const errors = field.state.meta.errors;
                  return (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={field.name}>Email</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="email"
                      />
                      {errors.length > 0 && (
                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                          <AlertCircle size={12} className="shrink-0" />
                          {errors.map((e) => e?.message).join(", ")}
                        </p>
                      )}
                    </div>
                  );
                }}
              />

              <form.Field
                name="password"
                children={(field) => {
                  const errors = field.state.meta.errors;
                  return (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={field.name}>Password</Label>
                      <div className="relative">
                        <Input
                          id={field.name}
                          name={field.name}
                          type={showPassword ? "text" : "password"}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          autoComplete="current-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      {errors.length > 0 && (
                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                          <AlertCircle size={12} className="shrink-0" />
                          {errors.map((e) => e?.message).join(", ")}
                        </p>
                      )}
                    </div>
                  );
                }}
              />

              {loginMutation.isError && (
                <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-destructive">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <p className="text-sm leading-snug">
                    {(loginMutation.error as any)?.response?.data?.message ??
                      "Invalid email or password. Please try again."}
                  </p>
                </div>
              )}

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || loginMutation.isPending}
                    className="w-full"
                  >
                    {isSubmitting || loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                )}
              />

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
