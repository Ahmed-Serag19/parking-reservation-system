import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCheckoutOperations } from "../use-checkout-operations";
import { mockCheckoutResponse } from "../../components/__tests__/checkpoint-test-utils";
import { vi } from "vitest";

// Mock API - hoisted
const mockApi = vi.hoisted(() => ({
  getTicket: vi.fn(),
  checkout: vi.fn(),
  getSubscription: vi.fn(),
}));

vi.mock("../../../../lib/api", () => ({
  api: mockApi,
}));

// Mock toast
vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
  error: vi.fn(),
  success: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCheckoutOperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useCheckoutOperations(), {
      wrapper: createWrapper(),
    });

    expect(result.current.convertToVisitor).toBe(false);
    expect(result.current.isPending).toBe(false);
    expect(result.current.checkoutData).toBeUndefined();
  });

  it("should perform successful checkout", async () => {
    mockApi.checkout.mockResolvedValue(mockCheckoutResponse);

    const { result } = renderHook(() => useCheckoutOperations(), {
      wrapper: createWrapper(),
    });

    const success = await result.current.performCheckout("t_001");

    expect(success).toBe(true);
    expect(mockApi.checkout).toHaveBeenCalledWith({
      ticketId: "t_001",
      forceConvertToVisitor: false,
    });

    // Wait for the mutation to complete and data to be available
    await waitFor(() => {
      expect(result.current.checkoutData).toEqual(mockCheckoutResponse);
    });
  });

  it("should perform checkout with forceConvertToVisitor", async () => {
    mockApi.checkout.mockResolvedValue(mockCheckoutResponse);

    const { result } = renderHook(() => useCheckoutOperations(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setConvertToVisitor(true);
    });

    await result.current.performCheckout("t_001");

    expect(mockApi.checkout).toHaveBeenCalledWith({
      ticketId: "t_001",
      forceConvertToVisitor: true,
    });
  });

  it("should handle checkout error", async () => {
    const error = new Error("Checkout failed");
    mockApi.checkout.mockRejectedValue(error);

    const { result } = renderHook(() => useCheckoutOperations(), {
      wrapper: createWrapper(),
    });

    const success = await result.current.performCheckout("t_001");

    expect(success).toBe(false);
    expect(result.current.checkoutData).toBeUndefined();
  });

  it("should show error for empty ticket ID", async () => {
    const { result } = renderHook(() => useCheckoutOperations(), {
      wrapper: createWrapper(),
    });

    const success = await result.current.performCheckout("");

    expect(success).toBeUndefined();
    expect(mockApi.checkout).not.toHaveBeenCalled();
  });

  it("should toggle convertToVisitor state", () => {
    const { result } = renderHook(() => useCheckoutOperations(), {
      wrapper: createWrapper(),
    });

    expect(result.current.convertToVisitor).toBe(false);

    act(() => {
      result.current.setConvertToVisitor(true);
    });
    expect(result.current.convertToVisitor).toBe(true);

    act(() => {
      result.current.setConvertToVisitor(false);
    });
    expect(result.current.convertToVisitor).toBe(false);
  });
});
