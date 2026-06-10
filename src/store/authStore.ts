import type { AuthState, TokenData } from "#/types";
import { decodeToken } from "#/utils/jwt";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const initialAuthState: AuthState = {
  accessToken: null,
  roles: [],
  permissions: [],
  user: null,
  setAuth: () => {},
  clearAuth: () => {},
};

const storage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      roles: [],
      permissions: [],

      setAuth: (data: TokenData) => {
        const decoded = decodeToken(data.accessToken);
        set({
          accessToken: data.accessToken,
          user: data.user,
          roles: decoded.roles ?? [],
          permissions: decoded.permissions ?? [],
        });
      },

      clearAuth: () =>
        set({
          accessToken: null,
          user: null,
          roles: [],
          permissions: [],
        }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => storage),
    },
  ),
);
