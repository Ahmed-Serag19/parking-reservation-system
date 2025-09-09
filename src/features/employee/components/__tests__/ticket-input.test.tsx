import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "./checkpoint-test-utils";
import { TicketInput } from "../ticket-input";

describe("TicketInput", () => {
  const defaultProps = {
    ticketId: "",
    onTicketIdChange: jest.fn(),
    onLookup: jest.fn(),
    onCheckout: jest.fn(),
    isFetchingTicket: false,
    isPendingCheckout: false,
    convertToVisitor: false,
    onConvertToVisitorChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render ticket input form", () => {
    render(<TicketInput {...defaultProps} />);

    expect(screen.getByText("Ticket Checkout")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. t_abcd1234")).toBeInTheDocument();
    expect(screen.getByText("Lookup")).toBeInTheDocument();
    expect(screen.getByText("Checkout")).toBeInTheDocument();
  });

  it("should handle ticket ID input", () => {
    const onTicketIdChange = jest.fn();
    render(
      <TicketInput {...defaultProps} onTicketIdChange={onTicketIdChange} />
    );

    const input = screen.getByPlaceholderText("e.g. t_abcd1234");
    fireEvent.change(input, { target: { value: "t_001" } });

    expect(onTicketIdChange).toHaveBeenCalledWith("t_001");
  });

  it("should call onLookup when lookup button is clicked", () => {
    const onLookup = jest.fn();
    render(
      <TicketInput {...defaultProps} ticketId="t_001" onLookup={onLookup} />
    );

    const lookupButton = screen.getByText("Lookup");
    fireEvent.click(lookupButton);

    expect(onLookup).toHaveBeenCalled();
  });

  it("should call onCheckout when checkout button is clicked", () => {
    const onCheckout = jest.fn();
    render(
      <TicketInput {...defaultProps} ticketId="t_001" onCheckout={onCheckout} />
    );

    const checkoutButton = screen.getByText("Checkout");
    fireEvent.click(checkoutButton);

    expect(onCheckout).toHaveBeenCalled();
  });

  it("should disable lookup button when ticket ID is empty", () => {
    render(<TicketInput {...defaultProps} ticketId="" />);

    const lookupButton = screen.getByText("Lookup");
    expect(lookupButton).toBeDisabled();
  });

  it("should disable checkout button when ticket ID is empty", () => {
    render(<TicketInput {...defaultProps} ticketId="" />);

    const checkoutButton = screen.getByText("Checkout");
    expect(checkoutButton).toBeDisabled();
  });

  it("should show loading state for lookup", () => {
    render(
      <TicketInput {...defaultProps} ticketId="t_001" isFetchingTicket={true} />
    );

    expect(screen.getByText("Looking up...")).toBeInTheDocument();
    expect(screen.getByText("Looking up...")).toBeDisabled();
  });

  it("should show loading state for checkout", () => {
    render(
      <TicketInput
        {...defaultProps}
        ticketId="t_001"
        isPendingCheckout={true}
      />
    );

    expect(screen.getByText("Processing...")).toBeInTheDocument();
    expect(screen.getByText("Processing...")).toBeDisabled();
  });

  it("should handle convert to visitor checkbox", () => {
    const onConvertToVisitorChange = jest.fn();
    render(
      <TicketInput
        {...defaultProps}
        convertToVisitor={false}
        onConvertToVisitorChange={onConvertToVisitorChange}
      />
    );

    const checkbox = screen.getByLabelText(/Convert to Visitor/);
    fireEvent.click(checkbox);

    expect(onConvertToVisitorChange).toHaveBeenCalledWith(true);
  });

  it("should show convert to visitor checkbox as checked when true", () => {
    render(<TicketInput {...defaultProps} convertToVisitor={true} />);

    const checkbox = screen.getByLabelText(/Convert to Visitor/);
    expect(checkbox).toBeChecked();
  });
});

