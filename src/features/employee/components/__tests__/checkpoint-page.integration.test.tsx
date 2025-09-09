import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "./checkpoint-test-utils";
import { CheckpointPage } from "../checkpoint-page";
import {
  mockApi,
  mockApiResponses,
  mockTicket,
  mockSubscriberTicket,
  mockSubscription,
  mockCheckoutResponse,
} from "./checkpoint-test-utils";

describe("CheckpointPage Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render complete checkpoint page", () => {
    render(<CheckpointPage />);

    expect(screen.getByText("Employee Checkpoint")).toBeInTheDocument();
    expect(screen.getByText("Welcome, testemployee!")).toBeInTheDocument();
    expect(screen.getByText("Ticket Checkout")).toBeInTheDocument();
  });

  it("should complete visitor ticket lookup and checkout flow", async () => {
    mockApiResponses.ticket(mockTicket);
    mockApiResponses.checkout(mockCheckoutResponse);

    render(<CheckpointPage />);

    // Enter ticket ID
    const input = screen.getByPlaceholderText("e.g. t_abcd1234");
    fireEvent.change(input, { target: { value: "t_001" } });

    // Click lookup
    const lookupButton = screen.getByText("Lookup");
    fireEvent.click(lookupButton);

    // Wait for ticket details to appear
    await waitFor(() => {
      expect(screen.getByText("Ticket Details")).toBeInTheDocument();
    });

    expect(screen.getByText("t_001")).toBeInTheDocument();
    expect(screen.getByText("visitor")).toBeInTheDocument();

    // Click checkout
    const checkoutButton = screen.getByText("Checkout");
    fireEvent.click(checkoutButton);

    // Wait for checkout result
    await waitFor(() => {
      expect(screen.getByText("Checkout Result")).toBeInTheDocument();
    });

    expect(screen.getByText("$10")).toBeInTheDocument();
    expect(screen.getByText("Breakdown")).toBeInTheDocument();
  });

  it("should complete subscriber ticket lookup with plate comparison", async () => {
    mockApiResponses.ticket(mockSubscriberTicket);
    mockApiResponses.subscription(mockSubscription);

    render(<CheckpointPage />);

    // Enter ticket ID
    const input = screen.getByPlaceholderText("e.g. t_abcd1234");
    fireEvent.change(input, { target: { value: "t_002" } });

    // Click lookup
    const lookupButton = screen.getByText("Lookup");
    fireEvent.click(lookupButton);

    // Wait for ticket and subscription details
    await waitFor(() => {
      expect(
        screen.getByText("Subscription Cars - Plate Verification")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("t_002")).toBeInTheDocument();
    expect(screen.getByText("subscriber")).toBeInTheDocument();
    expect(screen.getByText("ABC-123")).toBeInTheDocument();
    expect(screen.getByText("XYZ-789")).toBeInTheDocument();
  });

  it("should handle ticket lookup error", async () => {
    mockApiResponses.error("Ticket not found", 404);

    render(<CheckpointPage />);

    // Enter invalid ticket ID
    const input = screen.getByPlaceholderText("e.g. t_abcd1234");
    fireEvent.change(input, { target: { value: "invalid_ticket" } });

    // Click lookup
    const lookupButton = screen.getByText("Lookup");
    fireEvent.click(lookupButton);

    // Should not show ticket details
    await waitFor(() => {
      expect(screen.queryByText("Ticket Details")).not.toBeInTheDocument();
    });
  });

  it("should handle convert to visitor option", async () => {
    mockApiResponses.ticket(mockSubscriberTicket);
    mockApiResponses.subscription(mockSubscription);
    mockApiResponses.checkout(mockCheckoutResponse);

    render(<CheckpointPage />);

    // Enter ticket ID and lookup
    const input = screen.getByPlaceholderText("e.g. t_abcd1234");
    fireEvent.change(input, { target: { value: "t_002" } });

    const lookupButton = screen.getByText("Lookup");
    fireEvent.click(lookupButton);

    await waitFor(() => {
      expect(
        screen.getByText("Subscription Cars - Plate Verification")
      ).toBeInTheDocument();
    });

    // Check convert to visitor checkbox
    const checkbox = screen.getByLabelText(/Convert to Visitor/);
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Click checkout
    const checkoutButton = screen.getByText("Checkout");
    fireEvent.click(checkoutButton);

    // Verify checkout was called with forceConvertToVisitor: true
    await waitFor(() => {
      expect(mockApi.checkout).toHaveBeenCalledWith({
        ticketId: "t_002",
        forceConvertToVisitor: true,
      });
    });
  });

  it("should show WebSocket connection status", () => {
    render(<CheckpointPage />);

    expect(screen.getByText("WebSocket: Connected")).toBeInTheDocument();
  });

  it("should handle plate mismatch scenario", async () => {
    mockApiResponses.ticket(mockSubscriberTicket);
    mockApiResponses.subscription(mockSubscription);

    render(<CheckpointPage />);

    // Enter ticket ID and lookup
    const input = screen.getByPlaceholderText("e.g. t_abcd1234");
    fireEvent.change(input, { target: { value: "t_002" } });

    const lookupButton = screen.getByText("Lookup");
    fireEvent.click(lookupButton);

    await waitFor(() => {
      expect(
        screen.getByText("Subscription Cars - Plate Verification")
      ).toBeInTheDocument();
    });

    // Click "Plate doesn't match any subscription"
    const noMatchButton = screen.getByText(
      "Plate doesn't match any subscription"
    );
    fireEvent.click(noMatchButton);

    // Convert to visitor should be automatically checked
    const checkbox = screen.getByLabelText(/Convert to Visitor/);
    expect(checkbox).toBeChecked();
  });
});

