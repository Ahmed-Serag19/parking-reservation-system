import { useEffect, useRef, useState } from "react";
import { websocket } from "../../../lib/websocket";
import type { Zone } from "../../../types/api";

interface UseGateWebSocketProps {
  gateId?: string;
  onZoneUpdate?: (zone: Zone) => void;
  onAdminUpdate?: (update: any) => void;
}

export function useGateWebSocket({
  gateId,
  onZoneUpdate,
  onAdminUpdate,
}: UseGateWebSocketProps) {
  const [isConnected, setIsConnected] = useState(websocket.isConnected);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const onZoneUpdateRef = useRef(onZoneUpdate);
  const onAdminUpdateRef = useRef(onAdminUpdate);

  // Keep the callback refs updated
  useEffect(() => {
    onZoneUpdateRef.current = onZoneUpdate;
  }, [onZoneUpdate]);

  useEffect(() => {
    onAdminUpdateRef.current = onAdminUpdate;
  }, [onAdminUpdate]);

  // Connect to WebSocket on mount with reconnection logic
  useEffect(() => {
    const connectWithRetry = async () => {
      try {
        await websocket.connect();
        setIsConnected(true);
        setReconnectAttempts(0);
      } catch (error) {
        setIsConnected(false);

        // Exponential backoff reconnection (bonus feature)
        if (reconnectAttempts < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connectWithRetry();
          }, delay);
        }
      }
    };

    connectWithRetry();

    // Set up connection status listener
    const handleConnectionChange = () => {
      setIsConnected(websocket.isConnected);
    };

    // Add event listeners if websocket supports them
    if (typeof websocket.addEventListener === "function") {
      websocket.addEventListener("connectionchange", handleConnectionChange);
    }

    return () => {
      if (typeof websocket.removeEventListener === "function") {
        websocket.removeEventListener(
          "connectionchange",
          handleConnectionChange
        );
      }
    };
  }, [reconnectAttempts]);

  // Subscribe to gate when gateId is available and connected
  useEffect(() => {
    if (gateId && isConnected) {
      websocket.subscribeToGate(gateId);

      return () => {
        websocket.unsubscribeFromGate(gateId);
      };
    }
  }, [gateId, isConnected]);

  // Set up zone update listener
  useEffect(() => {
    const handleZoneUpdate = (zone: Zone) => {
      onZoneUpdateRef.current?.(zone);
    };

    const handleAdminUpdate = (update: any) => {
      onAdminUpdateRef.current?.(update);
    };

    // Set up listeners
    websocket.onZoneUpdate(handleZoneUpdate);

    // Admin updates listener (if available)
    if (typeof websocket.onAdminUpdate === "function") {
      websocket.onAdminUpdate(handleAdminUpdate);
    }

    return () => {
      websocket.removeEventListener("zone-update", handleZoneUpdate);
      if (typeof websocket.removeEventListener === "function") {
        websocket.removeEventListener("admin-update", handleAdminUpdate);
      }
    };
  }, []);

  return {
    isConnected,
    connectionStatus: isConnected ? "Connected" : "Disconnected",
    reconnectAttempts,
  };
}
