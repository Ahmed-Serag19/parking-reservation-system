import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTicketLookup } from "../use-ticket-lookup";
import { mockTicket } from "../../components/__tests__/checkpoint-test-utils";
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
  },
  error: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe("useTicketLookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with no ticket selected", () => {
    const { result } = renderHook(() => useTicketLookup(), {
      wrapper: createWrapper(),
    });

    expect(result.current.ticket).toBeUndefined();
    expect(result.current.isFetchingTicket).toBe(false);
    expect(result.current.selectedTicketId).toBeNull();
  });

  it("should lookup ticket successfully", async () => {
    mockApi.getTicket.mockResolvedValue(mockTicket);

    const { result } = renderHook(() => useTicketLookup(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.lookupTicket("t_001");
    });

    await waitFor(
      () => {
        expect(result.current.ticket).toEqual(mockTicket);
      },
      { timeout: 3000 }
    );

    expect(result.current.isFetchingTicket).toBe(false);
    expect(mockApi.getTicket).toHaveBeenCalledWith("t_001");
  });

  it("should handle lookup error and show toast", async () => {
    const error = new Error("Ticket not found");
    (error as any).status = 404;
    mockApi.getTicket.mockRejectedValue(error);

    const { result } = renderHook(() => useTicketLookup(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.lookupTicket("invalid_ticket");
    });

    await waitFor(() => {
      expect(result.current.isFetchingTicket).toBe(false);
    });

    expect(result.current.ticket).toBeUndefined();
    expect(result.current.ticketError).toBeDefined();
  });

  it("should show error toast for empty ticket ID", () => {
    const { result } = renderHook(() => useTicketLookup(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.lookupTicket("");
    });

    expect(mockApi.getTicket).not.toHaveBeenCalled();
  });

  it("should clear ticket data", async () => {
    const { result } = renderHook(() => useTicketLookup(), {
      wrapper: createWrapper(),
    });

    // First lookup a ticket
    act(() => {
      result.current.lookupTicket("t_001");
    });

    await waitFor(() => {
      expect(result.current.selectedTicketId).toBe("t_001");
    });

    // Then clear it
    act(() => {
      result.current.clearTicket();
    });
    expect(result.current.selectedTicketId).toBeNull();
  });
});
