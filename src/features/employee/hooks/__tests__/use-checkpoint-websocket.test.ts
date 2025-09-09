import { renderHook, waitFor } from "@testing-library/react";
import { useCheckpointWebSocket } from "../use-checkpoint-websocket";
import { vi } from "vitest";

// Mock WebSocket - hoisted
const mockWebSocket = vi.hoisted(() => ({
  isConnected: true,
  connect: vi.fn().mockResolvedValue(undefined),
  subscribeToGate: vi.fn(),
  unsubscribeFromGate: vi.fn(),
  onZoneUpdate: vi.fn(),
  removeEventListener: vi.fn(),
}));

vi.mock("../../../lib/websocket", () => ({
  websocket: mockWebSocket,
}));

describe("useCheckpointWebSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebSocket.isConnected = false; // Start disconnected like real implementation
    mockWebSocket.connect.mockResolvedValue(undefined);
  });

  it("should initialize with connection status", async () => {
    const { result } = renderHook(() =>
      useCheckpointWebSocket({
        gateId: "gate_1",
        onZoneUpdate: vi.fn(),
      })
    );

    // Initially disconnected, then connects
    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectionStatus).toBe("Disconnected");

    // Wait for connection to be established
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
    expect(result.current.connectionStatus).toBe("Connected");
  });

  it("should show disconnected status when WebSocket is not connected", () => {
    mockWebSocket.isConnected = false;

    const { result } = renderHook(() =>
      useCheckpointWebSocket({
        gateId: "gate_1",
        onZoneUpdate: vi.fn(),
      })
    );

    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectionStatus).toBe("Disconnected");
  });

  it("should subscribe to gate when gateId is provided", async () => {
    const { rerender } = renderHook(
      ({ gateId }) =>
        useCheckpointWebSocket({
          gateId,
          onZoneUpdate: vi.fn(),
        }),
      {
        initialProps: { gateId: "gate_1" },
      }
    );

    // Wait for connection and subscription
    await waitFor(() => {
      expect(mockWebSocket.subscribeToGate).toHaveBeenCalledWith("gate_1");
    });

    // Change gateId
    rerender({ gateId: "gate_2" });
    await waitFor(() => {
      expect(mockWebSocket.subscribeToGate).toHaveBeenCalledWith("gate_2");
    });
  });

  it("should not subscribe when gateId is undefined", () => {
    renderHook(() =>
      useCheckpointWebSocket({
        gateId: undefined,
        onZoneUpdate: vi.fn(),
      })
    );

    expect(mockWebSocket.subscribeToGate).not.toHaveBeenCalled();
  });

  it("should set up zone update listener", () => {
    const onZoneUpdate = vi.fn();

    renderHook(() =>
      useCheckpointWebSocket({
        gateId: "gate_1",
        onZoneUpdate,
      })
    );

    expect(mockWebSocket.onZoneUpdate).toHaveBeenCalled();
  });

  it("should cleanup subscriptions on unmount", async () => {
    const { unmount } = renderHook(() =>
      useCheckpointWebSocket({
        gateId: "gate_1",
        onZoneUpdate: vi.fn(),
      })
    );

    // Wait for subscription to be established first
    await waitFor(() => {
      expect(mockWebSocket.subscribeToGate).toHaveBeenCalledWith("gate_1");
    });

    unmount();

    expect(mockWebSocket.unsubscribeFromGate).toHaveBeenCalledWith("gate_1");
  });
});
