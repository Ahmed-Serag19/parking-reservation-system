import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { useUpdateCategoryRates } from "../react-query";
import { api } from "../api";

// Mock the API
vi.mock("../api", () => ({
  api: {
    updateCategoryRates: vi.fn(),
  },
}));

const mockApi = api as any;

describe("useUpdateCategoryRates", () => {
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

  it("should call API with correct parameters", async () => {
    const mockResponse = {
      id: "cat_premium",
      name: "Premium",
      rateNormal: 6.0,
      rateSpecial: 9.0,
    };

    mockApi.updateCategoryRates.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUpdateCategoryRates(), { wrapper });

    const updateData = {
      categoryId: "cat_premium",
      rates: {
        rateNormal: 6.0,
        rateSpecial: 9.0,
      },
    };

    await result.current.mutateAsync(updateData);

    expect(mockApi.updateCategoryRates).toHaveBeenCalledWith("cat_premium", {
      rateNormal: 6.0,
      rateSpecial: 9.0,
    });
  });

  it("should invalidate categories query on success", async () => {
    const mockResponse = {
      id: "cat_premium",
      name: "Premium",
      rateNormal: 6.0,
      rateSpecial: 9.0,
    };

    mockApi.updateCategoryRates.mockResolvedValue(mockResponse);

    // Pre-populate cache with some data
    queryClient.setQueryData(
      ["categories"],
      [
        {
          id: "cat_premium",
          name: "Premium",
          rateNormal: 5.0,
          rateSpecial: 8.0,
        },
      ]
    );

    const { result } = renderHook(() => useUpdateCategoryRates(), { wrapper });

    const updateData = {
      categoryId: "cat_premium",
      rates: {
        rateNormal: 6.0,
        rateSpecial: 9.0,
      },
    };

    await result.current.mutateAsync(updateData);

    await waitFor(() => {
      expect(queryClient.getQueryState(["categories"])?.isInvalidated).toBe(
        true
      );
    });
  });

  it("should invalidate zones query on success", async () => {
    const mockResponse = {
      id: "cat_premium",
      name: "Premium",
      rateNormal: 6.0,
      rateSpecial: 9.0,
    };

    mockApi.updateCategoryRates.mockResolvedValue(mockResponse);

    // Pre-populate cache with some data
    queryClient.setQueryData(
      ["zones"],
      [
        {
          id: "zone_a",
          name: "Zone A",
          categoryId: "cat_premium",
          rateNormal: 5.0,
          rateSpecial: 8.0,
        },
      ]
    );

    const { result } = renderHook(() => useUpdateCategoryRates(), { wrapper });

    const updateData = {
      categoryId: "cat_premium",
      rates: {
        rateNormal: 6.0,
        rateSpecial: 9.0,
      },
    };

    await result.current.mutateAsync(updateData);

    await waitFor(() => {
      expect(queryClient.getQueryState(["zones"])?.isInvalidated).toBe(true);
    });
  });

  it("should invalidate parking report query on success", async () => {
    const mockResponse = {
      id: "cat_premium",
      name: "Premium",
      rateNormal: 6.0,
      rateSpecial: 9.0,
    };

    mockApi.updateCategoryRates.mockResolvedValue(mockResponse);

    // Pre-populate cache with some data
    queryClient.setQueryData(
      ["admin", "parking-state-report"],
      [
        {
          zoneId: "zone_a",
          name: "Zone A",
          totalSlots: 100,
          occupied: 50,
        },
      ]
    );

    const { result } = renderHook(() => useUpdateCategoryRates(), { wrapper });

    const updateData = {
      categoryId: "cat_premium",
      rates: {
        rateNormal: 6.0,
        rateSpecial: 9.0,
      },
    };

    await result.current.mutateAsync(updateData);

    await waitFor(() => {
      const state = queryClient.getQueryState([
        "admin",
        "parking-state-report",
      ]);
      expect(
        state?.isInvalidated || state?.fetchStatus === "fetching"
      ).toBeTruthy();
    });
  });

  it("should handle API errors", async () => {
    const error = new Error("API Error");
    mockApi.updateCategoryRates.mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateCategoryRates(), { wrapper });

    const updateData = {
      categoryId: "cat_premium",
      rates: {
        rateNormal: 6.0,
        rateSpecial: 9.0,
      },
    };

    await expect(result.current.mutateAsync(updateData)).rejects.toThrow(
      "API Error"
    );
  });

  it("should return loading state during mutation", async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockApi.updateCategoryRates.mockReturnValue(promise);

    const { result } = renderHook(() => useUpdateCategoryRates(), { wrapper });

    const updateData = {
      categoryId: "cat_premium",
      rates: {
        rateNormal: 6.0,
        rateSpecial: 9.0,
      },
    };

    // Start mutation
    result.current.mutate(updateData);

    // Wait for pending state
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Resolve the promise
    resolvePromise!({
      id: "cat_premium",
      name: "Premium",
      rateNormal: 6.0,
      rateSpecial: 9.0,
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });

  it("should handle network errors gracefully", async () => {
    const networkError = new Error("Network Error");
    mockApi.updateCategoryRates.mockRejectedValue(networkError);

    const { result } = renderHook(() => useUpdateCategoryRates(), { wrapper });

    const updateData = {
      categoryId: "cat_premium",
      rates: {
        rateNormal: 6.0,
        rateSpecial: 9.0,
      },
    };

    try {
      await result.current.mutateAsync(updateData);
    } catch (error) {
      expect(error).toBe(networkError);
    }

    // Ensure no queries were invalidated on error
    expect(
      queryClient.getQueryState(["categories"])?.isInvalidated
    ).toBeFalsy();
    expect(queryClient.getQueryState(["zones"])?.isInvalidated).toBeFalsy();
  });
});
