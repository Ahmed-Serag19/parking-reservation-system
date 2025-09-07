import { useAuthStore } from "../../../store/auth-store";

export function AdminPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          Welcome back, {user?.username}! (Role: {user?.role})
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">Parking Reports</h2>
            <p className="text-sm text-muted-foreground">
              View real-time parking state and occupancy
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">Zone Controls</h2>
            <p className="text-sm text-muted-foreground">
              Open/close zones and manage capacity
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">Rate Management</h2>
            <p className="text-sm text-muted-foreground">
              Update parking rates and rush hours
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            🚧 Admin dashboard features coming soon in Day 4!
          </p>
        </div>
      </div>
    </div>
  );
}
