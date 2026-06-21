import { ClientOnly, createFileRoute, Outlet, redirect, useMatches, useNavigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "#/components/ui/sidebar";
import { SidebarInset } from "#/components/ui/sidebar";
import { Separator } from "#/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#/components/ui/breadcrumb";
import { AppSidebar } from "#/components/app-sidebar";
import { useAuthStore } from "@/store/authStore";
import { isTokenExpired } from "@/utils/jwt";
import { api } from "@/lib/axios";
import { useEffect } from "react";
import { registerNavigate } from "@/lib/navigate";
import { NotFoundPage } from "#/components/not-found";
import GlobalPending from "#/components/global-pending";

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
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">SIGLA</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}