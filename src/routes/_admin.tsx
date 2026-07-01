import { ClientOnly, createFileRoute, Outlet, redirect, useMatches, useNavigate } from "@tanstack/react-router";
import { SidebarProvider } from "#/components/ui/sidebar";
import { SidebarInset } from "#/components/ui/sidebar";

import { AppSidebar } from "#/components/app-sidebar";
import { useAuthStore } from "@/store/authStore";
import { isTokenExpired } from "@/utils/jwt";
import { api } from "@/lib/axios";
import { useEffect } from "react";
import { registerNavigate } from "@/lib/navigate";
import { NotFoundPage } from "#/components/not-found";
import GlobalPending from "#/components/global-pending";
import { AppHeader } from "#/components/app-header";

export const Route = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: async () => {

    const { accessToken, setAuth, clearAuth } = useAuthStore.getState();

    if (accessToken && !isTokenExpired(accessToken)) {
      return;
    }

    try {
      const { data } = await api.post("/v1/auth/refresh");
      setAuth(data.data);
    } catch (e) {
      clearAuth();
      throw redirect({ to: "/login" });
    }
  },
  notFoundComponent: NotFoundPage,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <ClientOnly fallback={<GlobalPending />}>
      <AuthenticatedLayoutInner />
    </ClientOnly>
  );
}

function AuthenticatedLayoutInner() {
  const navigate = useNavigate();
  const matches = useMatches();
  const { accessToken, setAuth, clearAuth } = useAuthStore();
  const currentMatch = matches[matches.length - 1];
  const title = currentMatch?.staticData?.title ?? "";

  useEffect(() => {
    registerNavigate(({ to, replace }) => navigate({ to, replace }));
  }, []);

  useEffect(() => {
    if (!accessToken || isTokenExpired(accessToken)) {
      api.post("/v1/auth/refresh")
        .then(({ data }) => setAuth(data.data))
        .catch(() => {
          clearAuth();
          navigate({ to: "/login", replace: true });
        });
    }
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader title={title} />
        <div className="flex-1 w-full overflow-y-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}