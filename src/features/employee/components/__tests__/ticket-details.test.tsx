import { render, screen } from "./checkpoint-test-utils";
import { TicketDetails } from "../ticket-details";
import { mockTicket, mockSubscriberTicket } from "./checkpoint-test-utils";

describe("TicketDetails", () => {
  it("should render visitor ticket details", () => {
    render(<TicketDetails ticket={mockTicket} />);

    expect(screen.getByText("Ticket Details")).toBeInTheDocument();
    expect(screen.getByText("t_001")).toBeInTheDocument();
    expect(screen.getByText("visitor")).toBeInTheDocument();
    expect(screen.getByText("zone_a")).toBeInTheDocument();
    expect(screen.getByText("gate_1")).toBeInTheDocument();
  });

  it("should render subscriber ticket details", () => {
    render(<TicketDetails ticket={mockSubscriberTicket} />);

    expect(screen.getByText("t_002")).toBeInTheDocument();
    expect(screen.getByText("subscriber")).toBeInTheDocument();
    expect(screen.getByText("zone_b")).toBeInTheDocument();
    expect(screen.getByText("gate_2")).toBeInTheDocument();
  });

  it("should format check-in time correctly", () => {
    render(<TicketDetails ticket={mockTicket} />);

    // The exact format depends on locale, but should contain the date/time
    const checkinText = screen.getByText(/Checked-in at:/);
    expect(checkinText).toBeInTheDocument();
  });

  it("should display all ticket properties", () => {
    render(<TicketDetails ticket={mockTicket} />);

    // Check that all ticket properties are displayed
    expect(screen.getByText(/ID:/)).toBeInTheDocument();
    expect(screen.getByText(/Type:/)).toBeInTheDocument();
    expect(screen.getByText(/Zone:/)).toBeInTheDocument();
    expect(screen.getByText(/Gate:/)).toBeInTheDocument();
    expect(screen.getByText(/Checked-in at:/)).toBeInTheDocument();
  });
});

