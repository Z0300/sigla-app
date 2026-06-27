import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse, ChangePasswordRequest } from "@/types/auth";
import type { LoginRequest, RegisterRequest } from "@/types/auth";
import { getRedirectPath } from "@/utils/routeGuard";
import { decodeToken } from "@/utils/jwt";
import { Roles } from "@/constants/permissions";
import { toast } from "sonner";
import axios from "axios";

const ALLOWED_ROLES = [
  Roles.SUPER_ADMIN,
  Roles.ADMIN,
  Roles.ORGANIZER,
] as const;

export function useLoginMutation(redirectTo?: string) {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      let response: AuthResponse;
      try {
        response = await api
          .post<AuthResponse>("/v1/auth/login", credentials)
          .then((r) => r.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw new Error(
            err.response?.data?.message ??
              "Invalid email or password. Please try again.",
          );
        }
        throw err;
      }

      const decoded = decodeToken(response.data.accessToken);
      const roles: string[] = decoded.roles ?? [];

      if (!ALLOWED_ROLES.some((role) => roles.includes(role))) {
        throw new Error(
          "Access denied. This portal is restricted to administrators and organizers only.",
        );
      }

      return response;
    },

    onSuccess: (response) => {
      const decoded = decodeToken(response.data.accessToken);
      const roles: string[] = decoded.roles ?? [];
      const permissions: string[] = decoded.permissions ?? [];

      setAuth(response.data);
      navigate({ to: redirectTo ?? getRedirectPath(roles, permissions) });
    },
  });
}

export function useRegisterMutation() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      api.post<AuthResponse>("/v1/auth/register", data).then((r) => r.data),

    onSuccess: (response) => {
      setAuth(response.data);
      navigate({ to: "/dashboard" });
    },
  });
}

export function useLogoutMutation() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post("/v1/auth/logout").then((r) => r.data),
    onSettled: () => {
      queryClient.clear();
      clearAuth();
      navigate({ to: "/login" });
    },
  });
}

export function useRefreshMutation() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (refreshToken: string) =>
      api
        .post<AuthResponse>("/v1/auth/refresh", { refreshToken })
        .then((r) => r.data),

    onSuccess: (response) => {
      setAuth(response.data);
    },
  });
}

export function useChangePasswordMutation() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ChangePasswordRequest>({
    mutationFn: (data: ChangePasswordRequest) =>
      api.post<void>("/v1/auth/change-password", data).then((r) => r.data),
    onSuccess: () => {
      queryClient.clear();
      clearAuth();
      navigate({ to: "/login" });
    },
    onError: (error: Error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Failed to change password");
      } else {
        toast.error("Something went wrong");
      }
    },
  });
}
