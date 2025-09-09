import { render, screen } from "./checkpoint-test-utils";
import { WebSocketStatus } from "../websocket-status";

describe("WebSocketStatus", () => {
  it("should show connected status", () => {
    render(<WebSocketStatus isConnected={true} connectionStatus="Connected" />);

    expect(screen.getByText("WebSocket: Connected")).toBeInTheDocument();

    // Check for green indicator
    const indicator = screen
      .getByRole("generic")
      .querySelector(".bg-green-500");
    expect(indicator).toBeInTheDocument();
  });

  it("should show disconnected status", () => {
    render(
      <WebSocketStatus isConnected={false} connectionStatus="Disconnected" />
    );

    expect(screen.getByText("WebSocket: Disconnected")).toBeInTheDocument();

    // Check for red indicator
    const indicator = screen.getByRole("generic").querySelector(".bg-red-500");
    expect(indicator).toBeInTheDocument();
  });

  it("should display custom connection status", () => {
    render(
      <WebSocketStatus isConnected={true} connectionStatus="Connecting..." />
    );

    expect(screen.getByText("WebSocket: Connecting...")).toBeInTheDocument();
  });
});

