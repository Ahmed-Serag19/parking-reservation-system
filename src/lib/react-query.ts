// React Query Configuration and Hooks

import { useMutation } from "@tanstack/react-query";
import { api } from "./api";
import type { LoginRequest } from "../types/api";

// Auth Hooks (shared across all roles)
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => api.login(credentials),
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};
