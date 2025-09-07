import { useAuthStore } from "../../../store/auth-store";

export function CheckpointPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Employee Checkpoint</h1>
        <p className="text-muted-foreground mb-6">
          Welcome, {user?.username}! (Role: {user?.role})
        </p>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Ticket Checkout</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Scan or enter ticket ID to process checkout
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Ticket ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter ticket ID or scan QR code"
                disabled
              />
            </div>

            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              disabled
            >
              Process Checkout
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            🚧 Checkpoint features coming soon in Day 3!
          </p>
        </div>
      </div>
    </div>
  );
}
