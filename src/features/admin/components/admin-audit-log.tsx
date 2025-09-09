import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { websocket } from "../../../lib/websocket";
import { useGates } from "../hooks/use-admin";
import type { AdminUpdateMessage } from "../../../types/api";
import { ScrollArea } from "../../../components/ui/scroll-area";

type AuditEntry = AdminUpdateMessage["payload"];

export function AdminAuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const connectedRef = useRef(false);
  const { data: gates = [] } = useGates();

  useEffect(() => {
    if (!connectedRef.current && !websocket.isConnected) {
      websocket.connect().catch((err) => {
        console.error("WebSocket connection failed:", err);
      });
      connectedRef.current = true;
    }

    // IMPORTANT: server only broadcasts to subscribed gates
    // subscribe to all known gates so admin-update messages are received
    console.log("Subscribing to gates:", gates);
    gates.forEach((g) => {
      if (g?.id) {
        console.log("Subscribing to gate:", g.id);
        websocket.subscribeToGate(g.id);
      }
    });

    const handler = (update: AuditEntry) => {
      console.log("Received admin update:", update);
      setEntries((prev) => {
        const next = [update, ...prev];
        if (next.length > 50) next.pop();
        return next;
      });
    };

    websocket.onAdminUpdate(handler);
    return () => {
      websocket.removeEventListener("admin-update", handler as any);
    };
  }, [gates]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Admin Audit Log</CardTitle>
        <CardDescription>
          Recent admin updates received via WebSocket
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-2 bg-muted rounded text-xs">
          <div>
            WebSocket Status:{" "}
            {websocket.isConnected ? "✅ Connected" : "❌ Disconnected"}
          </div>
          <div>Gates: {gates.length} loaded</div>
          <div>Subscriptions: {websocket.subscriptionCount}</div>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No admin updates yet. Perform an action (e.g., close a zone, add
            rush hour/vacation) to see it here.
          </p>
        ) : (
          <ScrollArea className="h-64">
            <ul className="space-y-2">
              {entries.map((e, idx) => (
                <li
                  key={e.timestamp + ":" + idx}
                  className="p-3 border rounded"
                >
                  <div className="text-xs text-muted-foreground">
                    {new Date(e.timestamp).toLocaleString()}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{e.action}</span> on{" "}
                    {e.targetType}{" "}
                    <span className="font-mono">{e.targetId}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    admin: {e.adminId}
                  </div>
                  {e.details && (
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(e.details, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
