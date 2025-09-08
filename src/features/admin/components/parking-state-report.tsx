import {
  BarChart3,
  Users,
  Car,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { useParkingStateReport } from "../../../lib/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export function ParkingStateReport() {
  const { data: zones = [], isLoading, error } = useParkingStateReport();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Parking State Report
          </CardTitle>
          <CardDescription>Loading parking data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-md"></div>
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
            <BarChart3 className="h-5 w-5" />
            Parking State Report
          </CardTitle>
          <CardDescription>Failed to load parking data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              Error loading parking state. Please try again.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totals = zones.reduce(
    (acc, zone) => ({
      totalSlots: acc.totalSlots + zone.totalSlots,
      occupied: acc.occupied + zone.occupied,
      free: acc.free + zone.free,
      reserved: acc.reserved + zone.reserved,
      availableForVisitors:
        acc.availableForVisitors + zone.availableForVisitors,
      availableForSubscribers:
        acc.availableForSubscribers + zone.availableForSubscribers,
    }),
    {
      totalSlots: 0,
      occupied: 0,
      free: 0,
      reserved: 0,
      availableForVisitors: 0,
      availableForSubscribers: 0,
    }
  );

  const occupancyRate =
    totals.totalSlots > 0 ? (totals.occupied / totals.totalSlots) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Parking State Report
        </CardTitle>
        <CardDescription>
          Real-time parking occupancy and availability across all zones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            key="total-capacity"
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Total Capacity
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {totals.totalSlots}
            </p>
          </div>

          <div
            key="occupied"
            className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                Occupied
              </span>
            </div>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">
              {totals.occupied}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              {occupancyRate.toFixed(1)}% full
            </p>
          </div>

          <div
            key="available"
            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Available
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {totals.free}
            </p>
          </div>

          <div
            key="reserved"
            className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Reserved
              </span>
            </div>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {totals.reserved}
            </p>
          </div>
        </div>

        {/* Zones Table */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Zone Details</h3>
          <div className="space-y-2">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        zone.open ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <h4 className="font-medium">{zone.name}</h4>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {zone.id}
                    </span>
                    {!zone.open && (
                      <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 px-2 py-1 rounded">
                        CLOSED
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {zone.occupied}/{zone.totalSlots} occupied
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Free</span>
                    <p className="font-medium text-green-600">{zone.free}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reserved</span>
                    <p className="font-medium text-amber-600">
                      {zone.reserved}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">For Visitors</span>
                    <p className="font-medium text-blue-600">
                      {zone.availableForVisitors}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      For Subscribers
                    </span>
                    <p className="font-medium text-purple-600">
                      {zone.availableForSubscribers}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Normal Rate</span>
                    <p className="font-medium">${zone.rateNormal}/hr</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Special Rate</span>
                    <p className="font-medium">${zone.rateSpecial}/hr</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        zone.occupied / zone.totalSlots > 0.8
                          ? "bg-red-500"
                          : zone.occupied / zone.totalSlots > 0.6
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${(zone.occupied / zone.totalSlots) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>
                      {((zone.occupied / zone.totalSlots) * 100).toFixed(1)}%
                      occupied
                    </span>
                    <span>{zone.totalSlots}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>Data updates every 30 seconds</span>
        </div>
      </CardContent>
    </Card>
  );
}
