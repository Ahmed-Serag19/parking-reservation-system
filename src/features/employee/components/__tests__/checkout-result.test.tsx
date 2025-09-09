import { render, screen } from "./checkpoint-test-utils";
import { CheckoutResult } from "../checkout-result";
import { mockCheckoutResponse } from "./checkpoint-test-utils";

describe("CheckoutResult", () => {
  it("should render checkout result with basic information", () => {
    render(<CheckoutResult checkoutData={mockCheckoutResponse} />);

    expect(screen.getByText("Checkout Result")).toBeInTheDocument();
    expect(screen.getByText("t_001")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // durationHours
    expect(screen.getByText("$10")).toBeInTheDocument(); // amount
  });

  it("should render breakdown table", () => {
    render(<CheckoutResult checkoutData={mockCheckoutResponse} />);

    expect(screen.getByText("Breakdown")).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
    expect(screen.getByText("Mode")).toBeInTheDocument();
    expect(screen.getByText("Hours")).toBeInTheDocument();
    expect(screen.getByText("Rate")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();

    // Check breakdown data
    expect(screen.getByText("normal")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // hours
    expect(screen.getByText("$5")).toBeInTheDocument(); // rate
    expect(screen.getByText("$10")).toBeInTheDocument(); // amount
  });

  it("should handle checkout without breakdown", () => {
    const checkoutWithoutBreakdown = {
      ...mockCheckoutResponse,
      breakdown: [],
    };

    render(<CheckoutResult checkoutData={checkoutWithoutBreakdown} />);

    expect(screen.getByText("No breakdown returned.")).toBeInTheDocument();
  });

  it("should handle checkout with undefined breakdown", () => {
    const checkoutWithUndefinedBreakdown = {
      ...mockCheckoutResponse,
      breakdown: undefined,
    };

    render(<CheckoutResult checkoutData={checkoutWithUndefinedBreakdown} />);

    expect(screen.getByText("No breakdown returned.")).toBeInTheDocument();
  });

  it("should display multiple breakdown segments", () => {
    const checkoutWithMultipleSegments = {
      ...mockCheckoutResponse,
      breakdown: [
        {
          from: "2025-01-01T10:00:00Z",
          to: "2025-01-01T11:00:00Z",
          hours: 1.0,
          rateMode: "normal" as const,
          rate: 5.0,
          amount: 5.0,
        },
        {
          from: "2025-01-01T11:00:00Z",
          to: "2025-01-01T12:00:00Z",
          hours: 1.0,
          rateMode: "special" as const,
          rate: 8.0,
          amount: 8.0,
        },
      ],
      amount: 13.0,
    };

    render(<CheckoutResult checkoutData={checkoutWithMultipleSegments} />);

    expect(screen.getByText("normal")).toBeInTheDocument();
    expect(screen.getByText("special")).toBeInTheDocument();
    expect(screen.getByText("$13")).toBeInTheDocument(); // total amount
  });

  it("should format time correctly in breakdown", () => {
    render(<CheckoutResult checkoutData={mockCheckoutResponse} />);

    // The exact time format depends on locale, but should be present
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });
});

