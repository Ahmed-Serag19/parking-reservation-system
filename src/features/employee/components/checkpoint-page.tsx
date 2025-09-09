import { useAuthStore } from "../../../store/auth-store";

export function CheckpointPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="p-3 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
          Employee Checkpoint
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
          Welcome, {user?.username}! (Role: {user?.role})
        </p>

        <div className="bg-card p-4 sm:p-6 rounded-lg border">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            Ticket Checkout
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            Scan or enter ticket ID to process checkout
          </p>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                Ticket ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm sm:text-base border rounded-md"
                placeholder="Enter ticket ID or scan QR code"
                disabled
              />
            </div>

            <button
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-primary text-primary-foreground rounded-md"
              disabled
            >
              Process Checkout
            </button>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
            🚧 Checkpoint features coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
