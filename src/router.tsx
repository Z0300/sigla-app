import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { NotFoundPage } from "./components/not-found";
import { initialAuthState, useAuthStore } from "./store/authStore";
import GlobalPending from "./components/global-pending";

export function getRouter() {
  const context = getContext();

  const router = createTanStackRouter({
    routeTree,
    context: {
      ...context,
      auth: typeof window !== 'undefined'
        ? useAuthStore.getState()
        : initialAuthState,
    },
    scrollRestoration: true,
    defaultPendingMs: 1000,
    defaultPendingMinMs: 500,
    defaultPreload: false,
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFoundPage,
    defaultPendingComponent: GlobalPending
  });

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

  return router;
}


export const router = typeof window !== 'undefined' ? getRouter() : (null as any);

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }

  interface StaticDataRouteOption {
    title?: string;
  }
}