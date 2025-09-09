import { useParkingStateReport } from "../hooks/use-admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  RefreshCw,
  Car,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import type { ParkingStateZone } from "../../../types/api";

interface ZoneCardProps {
  zone: ParkingStateZone;
}

function ZoneStatusCard({ zone }: ZoneCardProps) {
  const occupancyPercentage =
    zone.totalSlots > 0 ? (zone.occupied / zone.totalSlots) * 100 : 0;

  const getStatusColor = () => {
    if (!zone.open) return "text-gray-500";
    if (occupancyPercentage >= 90) return "text-red-600";
    if (occupancyPercentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusIcon = () => {
    if (!zone.open) return <XCircle className="w-5 h-5 text-gray-500" />;
    if (occupancyPercentage >= 90)
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        !zone.open && "opacity-60",
        occupancyPercentage >= 90 && zone.open && "border-red-200 bg-red-50",
        occupancyPercentage >= 70 &&
          occupancyPercentage < 90 &&
          zone.open &&
          "border-yellow-200 bg-yellow-50"
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{zone.name}</CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={zone.open ? "default" : "secondary"}>
              {zone.open ? "Open" : "Closed"}
            </Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Zone ID: {zone.zoneId}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Occupancy Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <Car className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Occupied
              </p>
              <p className="text-xl font-bold text-red-600">{zone.occupied}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100">
              <Car className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Free</p>
              <p className="text-xl font-bold text-green-600">{zone.free}</p>
            </div>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Capacity</span>
            <span className={getStatusColor()}>
              {zone.occupied}/{zone.totalSlots} (
              {occupancyPercentage.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={cn(
                "h-3 rounded-full transition-all duration-500",
                occupancyPercentage >= 90
                  ? "bg-red-500"
                  : occupancyPercentage >= 70
                  ? "bg-yellow-500"
                  : "bg-green-500"
              )}
              style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Availability Details */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Visitors</p>
            <p className="text-lg font-semibold text-blue-600">
              {zone.availableForVisitors}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Subscribers</p>
            <p className="text-lg font-semibold text-purple-600">
              {zone.availableForSubscribers}
            </p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Reserved: {zone.reserved}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Subscribers: {zone.subscriberCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ParkingStateReport() {
  const {
    data: zones = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useParkingStateReport();

  const totalStats = zones.reduce(
    (acc, zone) => ({
      totalSlots: acc.totalSlots + zone.totalSlots,
      occupied: acc.occupied + zone.occupied,
      free: acc.free + zone.free,
      availableForVisitors:
        acc.availableForVisitors + zone.availableForVisitors,
      availableForSubscribers:
        acc.availableForSubscribers + zone.availableForSubscribers,
    }),
    {
      totalSlots: 0,
      occupied: 0,
      free: 0,
      availableForVisitors: 0,
      availableForSubscribers: 0,
    }
  );

  const overallOccupancy =
    totalStats.totalSlots > 0
      ? (totalStats.occupied / totalStats.totalSlots) * 100
      : 0;

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Failed to load parking state
          </h3>
          <p className="text-muted-foreground mb-4">
            Please try refreshing the page
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parking State Report</h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of all parking zones
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          disabled={isRefetching}
          className="gap-2"
        >
          <RefreshCw
            className={cn("w-4 h-4", isRefetching && "animate-spin")}
          />
          {isRefetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Overall Parking Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {totalStats.totalSlots}
              </p>
              <p className="text-sm text-muted-foreground">Total Slots</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {totalStats.occupied}
              </p>
              <p className="text-sm text-muted-foreground">Occupied</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {totalStats.free}
              </p>
              <p className="text-sm text-muted-foreground">Free</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {totalStats.availableForVisitors}
              </p>
              <p className="text-sm text-muted-foreground">
                Available (Visitors)
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {totalStats.availableForSubscribers}
              </p>
              <p className="text-sm text-muted-foreground">
                Available (Subscribers)
              </p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Occupancy</span>
              <span
                className={cn(
                  "font-semibold",
                  overallOccupancy >= 90
                    ? "text-red-600"
                    : overallOccupancy >= 70
                    ? "text-yellow-600"
                    : "text-green-600"
                )}
              >
                {overallOccupancy.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={cn(
                  "h-4 rounded-full transition-all duration-500",
                  overallOccupancy >= 90
                    ? "bg-red-500"
                    : overallOccupancy >= 70
                    ? "bg-yellow-500"
                    : "bg-green-500"
                )}
                style={{ width: `${Math.min(overallOccupancy, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => (
            <ZoneStatusCard key={zone.zoneId} zone={zone} />
          ))}
        </div>
      )}

      {!isLoading && zones.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No parking zones found
            </h3>
            <p className="text-muted-foreground">
              No parking zones are configured in the system
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
