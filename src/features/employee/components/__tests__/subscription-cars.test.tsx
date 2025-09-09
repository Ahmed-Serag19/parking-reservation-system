import {
  render,
  screen,
  fireEvent,
} from "./checkpoint-test-utils";
import { SubscriptionCars } from "../subscription-cars";
import { mockSubscription } from "./checkpoint-test-utils";

describe("SubscriptionCars", () => {
  const defaultProps = {
    subscription: mockSubscription,
    onPlateMatch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render subscription cars with plate verification", () => {
    render(<SubscriptionCars {...defaultProps} />);

    expect(
      screen.getByText("Subscription Cars - Plate Verification")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Compare the actual car plate with the subscription cars below:"
      )
    ).toBeInTheDocument();
  });

  it("should display all subscription cars", () => {
    render(<SubscriptionCars {...defaultProps} />);

    expect(screen.getByText("ABC-123")).toBeInTheDocument();
    expect(screen.getByText("XYZ-789")).toBeInTheDocument();
    expect(screen.getByText("Toyota Corolla (white)")).toBeInTheDocument();
    expect(screen.getByText("Honda Civic (blue)")).toBeInTheDocument();
  });

  it("should handle car selection", () => {
    const onPlateMatch = jest.fn();
    render(<SubscriptionCars {...defaultProps} onPlateMatch={onPlateMatch} />);

    const firstCar = screen.getByText("ABC-123");
    fireEvent.click(firstCar);

    expect(onPlateMatch).toHaveBeenCalledWith(true);
  });

  it("should show selected car with visual indicator", () => {
    render(<SubscriptionCars {...defaultProps} />);

    const firstCar = screen.getByText("ABC-123");
    fireEvent.click(firstCar);

    // Should show selection confirmation
    expect(screen.getByText(/Selected: ABC-123/)).toBeInTheDocument();
    expect(
      screen.getByText(/Ready for subscriber checkout/)
    ).toBeInTheDocument();
  });

  it("should handle no match button", () => {
    const onPlateMatch = jest.fn();
    render(<SubscriptionCars {...defaultProps} onPlateMatch={onPlateMatch} />);

    const noMatchButton = screen.getByText(
      "Plate doesn't match any subscription"
    );
    fireEvent.click(noMatchButton);

    expect(onPlateMatch).toHaveBeenCalledWith(false);
  });

  it("should handle subscription with no cars", () => {
    const subscriptionWithoutCars = {
      ...mockSubscription,
      cars: [],
    };

    render(
      <SubscriptionCars
        {...defaultProps}
        subscription={subscriptionWithoutCars}
      />
    );

    expect(screen.getByText("No cars on subscription.")).toBeInTheDocument();
  });

  it("should handle subscription with undefined cars", () => {
    const subscriptionWithUndefinedCars = {
      ...mockSubscription,
      cars: undefined,
    };

    render(
      <SubscriptionCars
        {...defaultProps}
        subscription={subscriptionWithUndefinedCars}
      />
    );

    expect(screen.getByText("No cars on subscription.")).toBeInTheDocument();
  });

  it("should work without onPlateMatch callback", () => {
    render(<SubscriptionCars subscription={mockSubscription} />);

    const firstCar = screen.getByText("ABC-123");
    fireEvent.click(firstCar);

    // Should not throw error
    expect(screen.getByText(/Selected: ABC-123/)).toBeInTheDocument();
  });
});

