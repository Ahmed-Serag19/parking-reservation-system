import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Shield } from "lucide-react";

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page. Please contact your
            administrator if you believe this is an error.
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
