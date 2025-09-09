import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { type ReactElement } from "react";
import { vi } from "vitest";

// Mock WebSocket
const mockWebSocket = {
  isConnected: true,
  connect: vi.fn().mockResolvedValue(undefined),
  subscribeToGate: vi.fn(),
  unsubscribeFromGate: vi.fn(),
  onZoneUpdate: vi.fn(),
  removeEventListener: vi.fn(),
};

vi.mock("../../../lib/websocket", () => ({
  websocket: mockWebSocket,
}));

// Mock auth store
const mockAuthStore = {
  user: {
    id: "emp_1",
    username: "testemployee",
    role: "employee",
  },
  token: "token-emp_1",
  login: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
};

vi.mock("../../../../store/auth-store", () => ({
  useAuthStore: vi.fn((selector) => {
    if (typeof selector === "function") {
      return selector(mockAuthStore);
    }
    return mockAuthStore;
  }),
}));

// Mock API
const mockApi = {
  getTicket: vi.fn(),
  checkout: vi.fn(),
  getSubscription: vi.fn(),
};

vi.mock("../../../../lib/api", () => ({
  api: mockApi,
}));

// Test data
export const mockTicket = {
  id: "t_001",
  type: "visitor" as const,
  zoneId: "zone_a",
  gateId: "gate_1",
  checkinAt: "2025-01-01T10:00:00Z",
};

export const mockSubscriberTicket = {
  id: "t_002",
  type: "subscriber" as const,
  zoneId: "zone_b",
  gateId: "gate_2",
  checkinAt: "2025-01-01T10:00:00Z",
  subscriptionId: "sub_001",
};

export const mockSubscription = {
  id: "sub_001",
  userName: "John Doe",
  active: true,
  category: "cat_premium",
  cars: [
    {
      plate: "ABC-123",
      brand: "Toyota",
      model: "Corolla",
      color: "white",
    },
    {
      plate: "XYZ-789",
      brand: "Honda",
      model: "Civic",
      color: "blue",
    },
  ],
  startsAt: "2025-01-01T00:00:00Z",
  expiresAt: "2026-01-01T00:00:00Z",
  currentCheckins: [],
};

export const mockCheckoutResponse = {
  ticketId: "t_001",
  checkinAt: "2025-01-01T10:00:00Z",
  checkoutAt: "2025-01-01T12:00:00Z",
  durationHours: 2.0,
  breakdown: [
    {
      from: "2025-01-01T10:00:00Z",
      to: "2025-01-01T12:00:00Z",
      hours: 2.0,
      rateMode: "normal" as const,
      rate: 5.0,
      amount: 10.0,
    },
  ],
  amount: 10.0,
  zoneState: {
    id: "zone_a",
    name: "Zone A",
    categoryId: "cat_premium",
    gateIds: ["gate_1"],
    totalSlots: 100,
    occupied: 59,
    free: 41,
    reserved: 10,
    availableForVisitors: 31,
    availableForSubscribers: 41,
    rateNormal: 5.0,
    rateSpecial: 8.0,
    open: true,
  },
};

// Custom render function
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Helper functions
export const setupMockApi = () => {
  mockApi.getTicket.mockClear();
  mockApi.checkout.mockClear();
  mockApi.getSubscription.mockClear();
};

export const mockApiResponses = {
  ticket: (ticket = mockTicket) => {
    mockApi.getTicket.mockResolvedValue(ticket);
  },
  subscription: (subscription = mockSubscription) => {
    mockApi.getSubscription.mockResolvedValue(subscription);
  },
  checkout: (response = mockCheckoutResponse) => {
    mockApi.checkout.mockResolvedValue(response);
  },
  error: (message = "Test error", status = 400) => {
    const error = new Error(message);
    (error as any).status = status;
    mockApi.getTicket.mockRejectedValue(error);
    mockApi.checkout.mockRejectedValue(error);
    mockApi.getSubscription.mockRejectedValue(error);
  },
};

export { mockWebSocket, mockAuthStore, mockApi };
