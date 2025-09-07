import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { useLogin } from "../use-login";
import {
  mockLoginSuccess,
  mockEmployeeLogin,
} from "../../../../test/mocks/api";

// Create wrapper for hook testing
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock dependencies
const mockNavigate = vi.fn();
const mockAuthLogin = vi.fn();
const mockSetLoading = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../../store/auth-store", () => ({
  useAuthStore: (selector: any) => {
    if (selector.toString().includes("login")) return mockAuthLogin;
    if (selector.toString().includes("setLoading")) return mockSetLoading;
    if (selector.toString().includes("isLoading")) return false;
    return vi.fn();
  },
}));

// Mock the React Query hook
const mockMutateAsync = vi.fn();
vi.mock("../../../../lib/react-query", () => ({
  useLogin: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue(mockLoginSuccess);
  });

  it("should return handleLogin function and loading state", () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toHaveProperty("handleLogin");
    expect(result.current).toHaveProperty("isLoading");
    expect(typeof result.current.handleLogin).toBe("function");
    expect(typeof result.current.isLoading).toBe("boolean");
  });

  it("should navigate to /admin when admin user logs in successfully", async () => {
    mockMutateAsync.mockResolvedValue(mockLoginSuccess);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await result.current.handleLogin({
      username: "admin",
      password: "adminpass",
    });

    await waitFor(() => {
      expect(mockAuthLogin).toHaveBeenCalledWith(
        mockLoginSuccess.user,
        mockLoginSuccess.token
      );
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });

  it("should navigate to /checkpoint when employee user logs in successfully", async () => {
    mockMutateAsync.mockResolvedValue(mockEmployeeLogin);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await result.current.handleLogin({
      username: "emp1",
      password: "pass1",
    });

    await waitFor(() => {
      expect(mockAuthLogin).toHaveBeenCalledWith(
        mockEmployeeLogin.user,
        mockEmployeeLogin.token
      );
      expect(mockNavigate).toHaveBeenCalledWith("/checkpoint");
    });
  });

  it("should handle login errors gracefully", async () => {
    mockMutateAsync.mockRejectedValue(new Error("Invalid credentials"));

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await result.current.handleLogin({
      username: "wrong",
      password: "credentials",
    });

    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("should set loading state during login process", async () => {
    mockMutateAsync.mockResolvedValue(mockLoginSuccess);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    const loginPromise = result.current.handleLogin({
      username: "admin",
      password: "adminpass",
    });

    // Should set loading to true at start
    expect(mockSetLoading).toHaveBeenCalledWith(true);

    await loginPromise;

    // Should set loading to false at end
    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });
});
