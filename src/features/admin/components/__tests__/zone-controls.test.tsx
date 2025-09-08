import { vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ZoneControls } from "../zone-controls";

// Mock react-query hooks used by ZoneControls
vi.mock("../../../../lib/react-query", () => {
  return {
    useAdminZones: vi.fn(),
    useUpdateZoneStatus: vi.fn(),
  };
});

// Provide simple wrappers if needed (our components already self-contain UI)

describe("ZoneControls", () => {
  const mockUseAdminZones = require("../../../../lib/react-query")
    .useAdminZones as unknown as ReturnType<typeof vi.fn>;
  const mockUseUpdateZoneStatus = require("../../../../lib/react-query")
    .useUpdateZoneStatus as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("toggles zone using zone.zoneId and calls update mutation with correct payload", async () => {
    // Arrange zones coming from parking-state-report (zoneId field)
    const zones = [
      {
        zoneId: "zone_a",
        name: "Zone A",
        totalSlots: 100,
        occupied: 40,
        free: 60,
        reserved: 10,
        availableForVisitors: 50,
        availableForSubscribers: 60,
        subscriberCount: 3,
        open: true,
      },
    ];

    mockUseAdminZones.mockReturnValue({
      data: zones,
      isLoading: false,
      isError: false,
    });

    const mutateAsync = vi
      .fn()
      .mockResolvedValue({ zoneId: "zone_a", open: false });
    mockUseUpdateZoneStatus.mockReturnValue({ mutateAsync, isPending: false });

    render(<ZoneControls />);

    // Find the switch by its accessible label
    const toggle = screen.getByLabelText(/toggle zone a status/i);

    // Act: toggle the switch (open -> close)
    fireEvent.click(toggle);

    // Assert: mutation called with correct zoneId and open flag flipped
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        zoneId: "zone_a",
        open: false,
      });
    });
  });
});
