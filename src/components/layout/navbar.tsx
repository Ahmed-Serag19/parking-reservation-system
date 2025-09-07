import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import { Button } from "../ui/button";
import { Car, LogOut, User, Settings } from "lucide-react";
import { toast } from "react-hot-toast";

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Parking System
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              {user.role === "admin" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation("/admin")}
                  className="flex items-center space-x-1"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              )}

              {user.role === "employee" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation("/checkpoint")}
                  className="flex items-center space-x-1"
                >
                  <Car className="h-4 w-4" />
                  <span>Checkpoint</span>
                </Button>
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
