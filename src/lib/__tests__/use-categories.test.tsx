import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { useCategories } from "../react-query";
import { api } from "../api";

// Mock the API
vi.mock("../api", () => ({
  api: {
    getCategories: vi.fn(),
  },
}));

const mockApi = api as any;

describe("useCategories", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should fetch categories successfully", async () => {
    const mockCategories = [
      {
        id: "cat_premium",
        name: "Premium",
        description: "Close to entrance, large stalls",
        rateNormal: 5.0,
        rateSpecial: 8.0,
      },
      {
        id: "cat_regular",
        name: "Regular",
        description: "Standard parking spaces",
        rateNormal: 3.0,
        rateSpecial: 5.0,
      },
    ];

    mockApi.getCategories.mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCategories);
    expect(mockApi.getCategories).toHaveBeenCalledTimes(1);
  });

  it("should handle loading state", () => {
    mockApi.getCategories.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useCategories(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should handle error state", async () => {
    const error = new Error("Failed to fetch categories");
    mockApi.getCategories.mockRejectedValue(error);

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.data).toBeUndefined();
  });

  it("should cache categories data", async () => {
    const mockCategories = [
      {
        id: "cat_premium",
        name: "Premium",
        description: "Close to entrance, large stalls",
        rateNormal: 5.0,
        rateSpecial: 8.0,
      },
    ];

    mockApi.getCategories.mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Render hook again - should use cached data
    const { result: result2 } = renderHook(() => useCategories(), { wrapper });

    expect(result2.current.data).toEqual(mockCategories);
    expect(mockApi.getCategories).toHaveBeenCalledTimes(1); // Only called once due to caching
  });

  it("should refetch when query is invalidated", async () => {
    const mockCategories = [
      {
        id: "cat_premium",
        name: "Premium",
        description: "Close to entrance, large stalls",
        rateNormal: 5.0,
        rateSpecial: 8.0,
      },
    ];

    mockApi.getCategories.mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Invalidate the query
    queryClient.invalidateQueries({ queryKey: ["categories"] });

    await waitFor(() => {
      expect(mockApi.getCategories).toHaveBeenCalledTimes(2);
    });
  });

  it("should handle empty categories response", async () => {
    mockApi.getCategories.mockResolvedValue([]);

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it("should handle network timeout", async () => {
    const timeoutError = new Error("Request timeout");
    mockApi.getCategories.mockRejectedValue(timeoutError);

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(timeoutError);
  });

  it("should use correct query key", async () => {
    const mockCategories = [
      {
        id: "cat_premium",
        name: "Premium",
        description: "Close to entrance, large stalls",
        rateNormal: 5.0,
        rateSpecial: 8.0,
      },
    ];

    mockApi.getCategories.mockResolvedValue(mockCategories);

    renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(mockApi.getCategories).toHaveBeenCalled();
    });

    // Check that the query is stored with correct key
    const queryState = queryClient.getQueryState(["categories"]);
    expect(queryState).toBeDefined();
    expect(queryState?.data).toEqual(mockCategories);
  });
});
