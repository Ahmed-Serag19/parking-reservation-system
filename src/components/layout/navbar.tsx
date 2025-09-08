import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import { Button } from "../ui/button";
import {
  Car,
  LogOut,
  User,
  Settings,
  BarChart3,
  Settings2,
  DollarSign,
} from "lucide-react";
import { toast } from "react-hot-toast";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/admin" className="cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Parking System
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-1">
              {user.role === "admin" && (
                <>
                  <Link
                    to="/admin"
                    className={`cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-1 ${
                      location.pathname === "/admin"
                        ? "bg-gray-100 dark:bg-gray-800 text-blue-600"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/admin/parking-report"
                    className={`cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-1 ${
                      location.pathname === "/admin/parking-report"
                        ? "bg-gray-100 dark:bg-gray-800 text-blue-600"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Reports</span>
                  </Link>

                  <Link
                    to="/admin/zone-controls"
                    className={`cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-1 ${
                      location.pathname === "/admin/zone-controls"
                        ? "bg-gray-100 dark:bg-gray-800 text-blue-600"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Settings2 className="h-4 w-4" />
                    <span>Zones</span>
                  </Link>

                  <Link
                    to="/admin/category-rates"
                    className={`cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-1 ${
                      location.pathname === "/admin/category-rates"
                        ? "bg-gray-100 dark:bg-gray-800 text-blue-600"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Rates</span>
                  </Link>
                </>
              )}

              {user.role === "employee" && (
                <Link
                  to="/checkpoint"
                  className={`cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-1 ${
                    location.pathname === "/checkpoint"
                      ? "bg-gray-100 dark:bg-gray-800 text-blue-600"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <Car className="h-4 w-4" />
                  <span>Checkpoint</span>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* User Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <User className="h-4 w-4" />
              <span className="font-medium">{user.username}</span>
            </div>
            {/* Logout Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
