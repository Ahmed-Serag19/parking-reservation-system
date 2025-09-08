import { Link } from "react-router-dom";
import {
  BarChart3,
  Settings2,
  Users,
  Clock,
  Calendar,
  Car,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "../../../store/auth-store";
import { useParkingStateReport } from "../hooks/use-admin";
import { AdminAuditLog } from "./admin-audit-log";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const { data: zones = [], refetch, isFetching } = useParkingStateReport();

  // Calculate quick stats
  const totals = zones.reduce(
    (acc, zone) => ({
      totalSlots: acc.totalSlots + zone.totalSlots,
      occupied: acc.occupied + zone.occupied,
      openZones: acc.openZones + (zone.open ? 1 : 0),
      closedZones: acc.closedZones + (zone.open ? 0 : 1),
    }),
    { totalSlots: 0, occupied: 0, openZones: 0, closedZones: 0 }
  );

  const occupancyRate =
    totals.totalSlots > 0 ? (totals.occupied / totals.totalSlots) * 100 : 0;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <p className="text-muted-foreground mb-8">
          Welcome back, {user?.username}! (Role: {user?.role})
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Parking Slots
                  </p>
                  <p className="text-2xl font-bold">{totals.totalSlots}</p>
                  <p className="text-xs text-blue-600">across all zones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Car className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Occupied Slots
                  </p>
                  <p className="text-2xl font-bold">{totals.occupied}</p>
                  <p className="text-xs text-red-600">
                    {occupancyRate.toFixed(1)}% of total capacity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Zones</p>
                  <p className="text-2xl font-bold">{totals.openZones}</p>
                  <p className="text-xs text-green-600">accepting vehicles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Closed Zones</p>
                  <p className="text-2xl font-bold">{totals.closedZones}</p>
                  <p className="text-xs text-amber-600">maintenance/offline</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/parking-report">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Parking Reports</CardTitle>
                    <CardDescription>
                      Real-time parking state and occupancy
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View detailed zone occupancy, availability, and live updates
                  across all parking areas.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/zone-controls">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Settings2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Zone Controls</CardTitle>
                    <CardDescription>
                      Open/close zones and manage capacity
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Control zone status, capacity management, and operational
                  settings.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/category-rates">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Settings2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Category Rates</CardTitle>
                    <CardDescription>
                      Update pricing for parking categories
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage normal and special rates for Premium, Regular, and
                  other categories.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/rush-hours">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Rush Hours</CardTitle>
                    <CardDescription>Manage peak time periods</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure rush hour windows when special rates apply across
                  all zones.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/vacations">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Vacations</CardTitle>
                    <CardDescription>Manage vacation periods</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Set vacation dates when special holiday rates apply
                  system-wide.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Employee Management
                    </CardTitle>
                    <CardDescription>Manage employee accounts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create and manage employee accounts with role-based access
                  control.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 Click on any card above to access detailed management features
            for that area.
          </p>
        </div>
      </div>

      {/* Live Admin Audit Log */}
      <div className="mt-8">
        <AdminAuditLog />
      </div>
    </div>
  );
}
