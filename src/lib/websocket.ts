// WebSocket Manager for Real-time Updates

import type {
  WSMessage,
  ZoneUpdateMessage,
  AdminUpdateMessage,
} from "../types/api";

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000; // Start with 1 second
  private subscriptions = new Set<string>();
  private listeners = new Map<string, ((data: any) => void)[]>();
  private isConnecting = false;

  constructor(private url: string = "ws://localhost:3000/api/v1/ws") {}

  connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectInterval = 1000;

          // Re-subscribe to gates after reconnection
          this.subscriptions.forEach((gateId) => {
            this.subscribeToGate(gateId);
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onclose = () => {
          console.log("WebSocket disconnected");
          this.isConnecting = false;
          this.ws = null;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay =
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  subscribeToGate(gateId: string) {
    this.subscriptions.add(gateId);
    this.send({
      type: "subscribe",
      payload: { gateId },
    });
  }

  unsubscribeFromGate(gateId: string) {
    this.subscriptions.delete(gateId);
    this.send({
      type: "unsubscribe",
      payload: { gateId },
    });
  }

  private send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  }

  private handleMessage(message: WSMessage) {
    const listeners = this.listeners.get(message.type) || [];
    listeners.forEach((listener) => {
      try {
        listener(message.payload);
      } catch (error) {
        console.error("Error in WebSocket listener:", error);
      }
    });
  }

  // Event listeners
  onZoneUpdate(callback: (zone: ZoneUpdateMessage["payload"]) => void) {
    this.addEventListener("zone-update", callback);
  }

  onAdminUpdate(callback: (update: AdminUpdateMessage["payload"]) => void) {
    this.addEventListener("admin-update", callback);
  }

  private addEventListener(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  removeEventListener(type: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  disconnect() {
    this.subscriptions.clear();
    this.listeners.clear();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const websocket = new WebSocketManager();
