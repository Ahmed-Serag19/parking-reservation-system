import type { LoginRequest, LoginResponse } from "../../types/api";
import { vi } from "vitest";

// Mock successful login response
export const mockLoginSuccess: LoginResponse = {
  user: {
    id: "admin_1",
    username: "admin",
    role: "admin",
  },
  token: "mock-jwt-token",
};

// Mock employee login response
export const mockEmployeeLogin: LoginResponse = {
  user: {
    id: "emp_1",
    username: "emp1",
    role: "employee",
  },
  token: "mock-employee-token",
};

// Mock API service for tests
export const mockApiService = {
  login: vi.fn(),
};

// Mock login function that can be controlled in tests
export const createMockLogin = (
  shouldSucceed = true,
  response = mockLoginSuccess
) => {
  return vi.fn().mockImplementation((_credentials: LoginRequest) => {
    if (shouldSucceed) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(new Error("Invalid credentials"));
    }
  });
};
