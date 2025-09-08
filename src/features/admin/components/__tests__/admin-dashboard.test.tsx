import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminDashboard } from "../admin-dashboard";

vi.mock("../../../../lib/react-query", () => {
  return {
    useParkingStateReport: vi.fn(),
  };
});

vi.mock("../../../../store/auth-store", () => {
  return {
    useAuthStore: (selector: any) =>
      selector({ user: { username: "admin", role: "admin" } }),
  };
});

describe("AdminDashboard refresh", () => {
  const mockUseParkingStateReport = require("../../../../lib/react-query")
    .useParkingStateReport as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls refetch when Refresh button is clicked", () => {
    const refetch = vi.fn();
    mockUseParkingStateReport.mockReturnValue({
      data: [
        {
          zoneId: "zone_a",
          name: "Zone A",
          totalSlots: 100,
          occupied: 50,
          free: 50,
          reserved: 10,
          availableForVisitors: 40,
          availableForSubscribers: 50,
          subscriberCount: 3,
          open: true,
        },
      ],
      isFetching: false,
      refetch,
    });

    render(<AdminDashboard />);

    const button = screen.getByRole("button", { name: /refresh/i });
    fireEvent.click(button);
    expect(refetch).toHaveBeenCalled();
  });
});
