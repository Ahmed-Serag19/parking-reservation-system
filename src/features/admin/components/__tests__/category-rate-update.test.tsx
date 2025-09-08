import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { toast } from "react-hot-toast";
import { CategoryRateUpdate } from "../category-rate-update";
import {
  useCategories,
  useUpdateCategoryRates,
} from "../../../../lib/react-query";

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock React Query hooks
vi.mock("../../../../lib/react-query", () => ({
  useCategories: vi.fn(),
  useUpdateCategoryRates: vi.fn(),
}));

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

const mockUseCategories = useCategories as any;
const mockUseUpdateCategoryRates = useUpdateCategoryRates as any;

describe("CategoryRateUpdate", () => {
  const mockMutateAsync = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseCategories.mockReturnValue({
      data: mockCategories,
      isLoading: false,
    });

    mockUseUpdateCategoryRates.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it("renders category selection dropdown", () => {
    render(<CategoryRateUpdate />);

    expect(screen.getByText("Update Category Rates")).toBeInTheDocument();
    expect(screen.getByText("Select a category")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Select a category")).toBeInTheDocument();
  });

  it("shows loading state when categories are loading", () => {
    mockUseCategories.mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(<CategoryRateUpdate />);

    expect(screen.getByText("Loading categories...")).toBeInTheDocument();
    // Check for loading skeleton elements instead of progressbar
    expect(screen.getByText("Loading categories...")).toBeInTheDocument();
    const loadingElements = screen.getAllByRole("generic");
    expect(
      loadingElements.some((el) => el.className.includes("animate-pulse"))
    ).toBe(true);
  });

  it("displays categories in dropdown with current rates", () => {
    render(<CategoryRateUpdate />);

    const dropdown = screen.getByDisplayValue("Select a category");
    fireEvent.click(dropdown);

    expect(screen.getByText("Premium - Current: $5/$8")).toBeInTheDocument();
    expect(screen.getByText("Regular - Current: $3/$5")).toBeInTheDocument();
  });

  it("shows form when category is selected", async () => {
    render(<CategoryRateUpdate />);

    const dropdown = screen.getByDisplayValue("Select a category");
    await user.selectOptions(dropdown, "cat_premium");

    expect(screen.getByText("Premium")).toBeInTheDocument();
    expect(
      screen.getByText("Close to entrance, large stalls")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    expect(screen.getByDisplayValue("8")).toBeInTheDocument();
  });

  it("populates form with selected category rates", async () => {
    render(<CategoryRateUpdate />);

    const dropdown = screen.getByDisplayValue("Select a category");
    await user.selectOptions(dropdown, "cat_regular");

    expect(screen.getByDisplayValue("3")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });

  it("prevents form submission with invalid data", async () => {
    render(<CategoryRateUpdate />);

    const dropdown = screen.getByDisplayValue("Select a category");
    await user.selectOptions(dropdown, "cat_premium");

    const normalRateInput = screen.getByDisplayValue("5");
    const specialRateInput = screen.getByDisplayValue("8");

    // Test negative values
    await user.clear(normalRateInput);
    await user.type(normalRateInput, "-1");

    await user.clear(specialRateInput);
    await user.type(specialRateInput, "-2");

    const submitButton = screen.getByRole("button", { name: /update rates/i });
    await user.click(submitButton);

    // Form should not submit with invalid data (no API call)
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("prevents form submission with values over 100", async () => {
    render(<CategoryRateUpdate />);

    const dropdown = screen.getByDisplayValue("Select a category");
    await user.selectOptions(dropdown, "cat_premium");

    const normalRateInput = screen.getByDisplayValue("5");
    const specialRateInput = screen.getByDisplayValue("8");

    // Test values over 100
    await user.clear(normalRateInput);
    await user.type(normalRateInput, "101");

    await user.clear(specialRateInput);
    await user.type(specialRateInput, "150");

    const submitButton = screen.getByRole("button", { name: /update rates/i });
    await user.click(submitButton);

    // Form should not submit with invalid data (no API call)
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    mockMutateAsync.mockResolvedValue({
      id: "cat_premium",
      name: "Premium",
      rateNormal: 6.0,
      rateSpecial: 9.0,
    });

    render(<CategoryRateUpdate />);

    const dropdown = screen.getByDisplayValue("Select a category");
    await user.selectOptions(dropdown, "cat_premium");

    const normalRateInput = screen.getByDisplayValue("5");
    const specialRateInput = screen.getByDisplayValue("8");

    await user.clear(normalRateInput);
    await user.type(normalRateInput, "6");

    await user.clear(specialRateInput);
    await user.type(specialRateInput, "9");

    const submitButton = screen.getByRole("button", { name: /update rates/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        categoryId: "cat_premium",
        rates: {
          rateNormal: 6,
          rateSpecial: 9,
        },
      });
    });
  });

  it("shows success toast and resets form on successful update", async () => {
    mockMutateAsync.mockResolvedValue({
      id: "cat_premium",
      name: "Premium",
      rateNormal: 6.0,
      rateSpecial: 9.0,
    });

    render(<CategoryRateUpdate />);

    const dropdown = screen.getByDisplayValue("Select a category");
    await user.selectOptions(dropdown, "cat_premium");

    const normalRateInput = screen.getByDisplayValue("5");
    const specialRateInput = screen.getByDisplayValue("8");

    await user.clear(normalRateInput);
    await user.type(normalRateInput, "6");

    await user.clear(specialRateInput);
    await user.type(specialRateInput, "9");

    const submitButton = screen.getByRole("button", { name: /update rates/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Category rates updated successfully",
        expect.objectContaining({
          style: expect.objectContaining({
            background: "#ffffff",
            color: "#1f2937",
          }),
        })
      );
    });

    // Check that form is reset
    await waitFor(() => {
      expect(screen.getByDisplayValue("Select a category")).toBeInTheDocument();
    });
  });

  it("shows error toast on failed update", async () => {
    const error = new Error("Update failed");
    mockMutateAsync.mockRejectedValue(error);

    render(<CategoryRateUpdate />);

    const dropdown = screen.getByDisplayValue("Select a category");
    await user.selectOptions(dropdown, "cat_premium");

    const submitButton = screen.getByRole("button", { name: /update rates/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to update category rates"
      );
    });
  });

  it("shows loading state during update", async () => {
    mockUseUpdateCategoryRates.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(<CategoryRateUpdate />);

    const dropdown = screen.getByDisplayValue("Select a category");
    await user.selectOptions(dropdown, "cat_premium");

    expect(screen.getByText("Updating Rates...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /updating rates/i })
    ).toBeDisabled();
  });

  it("disables form inputs during update", async () => {
    mockUseUpdateCategoryRates.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(<CategoryRateUpdate />);

    const dropdown = screen.getByDisplayValue("Select a category");
    await user.selectOptions(dropdown, "cat_premium");

    const normalRateInput = screen.getByDisplayValue("5");
    const specialRateInput = screen.getByDisplayValue("8");

    expect(normalRateInput).toBeDisabled();
    expect(specialRateInput).toBeDisabled();
  });

  it("prevents submission without category selection", async () => {
    render(<CategoryRateUpdate />);

    // Try to submit without selecting a category
    const submitButton = screen.queryByRole("button", {
      name: /update rates/i,
    });
    expect(submitButton).not.toBeInTheDocument();
  });
});
