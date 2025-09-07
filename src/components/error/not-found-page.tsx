import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-6xl font-bold text-muted-foreground mb-2">
            404
          </div>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
          <Button onClick={() => navigate("/login")} className="w-full">
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
