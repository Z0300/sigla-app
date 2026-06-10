import { LoginPage } from "#/features/auth/LoginPage";
import { useAuthStore } from "#/store/authStore";
import { isTokenExpired } from "#/utils/jwt";
import { getRedirectPath } from "#/utils/routeGuard";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const { accessToken, roles, permissions } = useAuthStore.getState();

    if (!accessToken || isTokenExpired(accessToken)) return;

    throw redirect({ to: getRedirectPath(roles, permissions) });
  },
  component: LoginPage,
});

