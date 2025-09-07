import { useParams } from "react-router-dom";
import { useAuthStore } from "../../../store/auth-store";

export function GatePage() {
  const { gateId } = useParams<{ gateId: string }>();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Gate Screen</h1>
        <p className="text-muted-foreground mb-6">
          Welcome, {user?.username}! (Role: {user?.role})
        </p>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Gate ID: {gateId}</h2>
          <p className="text-sm text-muted-foreground">
            🚧 Gate screen features coming soon in Day 2!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This will include zone cards, visitor/subscriber check-in flows, and
            real-time updates.
          </p>
        </div>
      </div>
    </div>
  );
}
