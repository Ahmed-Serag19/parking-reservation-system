import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("admin" | "employee")[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/unauthorized",
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // No role restrictions - allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user role is allowed
  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // User doesn't have required role
  return <Navigate to={redirectTo} replace />;
}
