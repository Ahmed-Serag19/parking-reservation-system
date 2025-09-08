import { useState } from "react";
import {
  Settings2,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAdminZones, useUpdateZoneStatus } from "../../../lib/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";

export function ZoneControls() {
  const { data: zones = [], isLoading, error } = useAdminZones();
  const updateZoneStatusMutation = useUpdateZoneStatus();
  const [updatingZones, setUpdatingZones] = useState<Set<string>>(new Set());

  const handleZoneToggle = async (zoneId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // Add to updating set
    setUpdatingZones((prev) => new Set(prev).add(zoneId));

    try {
      await updateZoneStatusMutation.mutateAsync({
        zoneId,
        open: newStatus,
      });

      toast.success(`Zone ${newStatus ? "opened" : "closed"} successfully`, {
        style: {
          background: "#ffffff",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
      });
    } catch (error) {
      toast.error(`Failed to ${newStatus ? "open" : "close"} zone`, {
        style: {
          background: "#ffffff",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
      });
      console.error("Zone status update error:", error);
    } finally {
      // Remove from updating set
      setUpdatingZones((prev) => {
        const newSet = new Set(prev);
        newSet.delete(zoneId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Zone Management
          </CardTitle>
          <CardDescription>Loading zone data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Zone Management
          </CardTitle>
          <CardDescription>Failed to load zone data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Error loading zones. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Zone Management
        </CardTitle>
        <CardDescription>
          Control zone operational status - open zones to accept vehicles or
          close for maintenance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {zones.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No zones found
            </h3>
            <p className="text-sm text-muted-foreground">
              No parking zones are configured in the system.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {zones.map((zone) => {
              const isUpdating = updatingZones.has(zone.zoneId);

              return (
                <div
                  key={zone.zoneId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          zone.open ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {zone.name}
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {zone.zoneId}
                          </span>
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          <span className="flex items-center gap-4">
                            <span>Capacity: {zone.totalSlots} slots</span>
                            <span>
                              Occupied: {zone.occupied}/{zone.totalSlots}
                            </span>
                            <span>Available: {zone.free}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className={`flex items-center gap-2 ${
                          zone.open ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {zone.open ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {zone.open ? "Open" : "Closed"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {zone.open ? "Accepting vehicles" : "Maintenance mode"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isUpdating && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      <Switch
                        checked={zone.open}
                        onCheckedChange={() =>
                          handleZoneToggle(zone.zoneId, zone.open)
                        }
                        disabled={isUpdating}
                        aria-label={`Toggle ${zone.name} status`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Zone Control Guidelines
              </p>
              <ul className="text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>
                  • <strong>Open zones</strong> accept new vehicle check-ins
                </li>
                <li>
                  • <strong>Closed zones</strong> stop accepting new vehicles
                  but existing cars can still checkout
                </li>
                <li>
                  • Changes take effect immediately and broadcast to all gate
                  terminals
                </li>
                <li>
                  • Use closure for maintenance, cleaning, or capacity
                  management
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
