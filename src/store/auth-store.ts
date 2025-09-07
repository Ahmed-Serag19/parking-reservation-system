// Authentication Store using Zustand

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (user: User, token: string) => {
        // Store token in sessionStorage for API requests
        sessionStorage.setItem("auth_token", token);

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        // Remove token from sessionStorage
        sessionStorage.removeItem("auth_token");

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      // Only persist essential data, not loading states
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper functions for easy access
export const getAuthUser = () => useAuthStore.getState().user;
export const getAuthToken = () => useAuthStore.getState().token;
export const isAuthenticated = () => useAuthStore.getState().isAuthenticated;
