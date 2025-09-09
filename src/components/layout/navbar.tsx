import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Car,
  LogOut,
  User,
  Settings,
  BarChart3,
  Settings2,
  DollarSign,
  Menu,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";

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

  // Helper function to get navigation items based on user role
  const getNavigationItems = () => {
    const items = [];

    if (user.role === "admin") {
      items.push(
        { to: "/admin", icon: Settings, label: "Dashboard" },
        { to: "/admin/parking-report", icon: BarChart3, label: "Reports" },
        { to: "/admin/zone-controls", icon: Settings2, label: "Zones" },
        { to: "/admin/category-rates", icon: DollarSign, label: "Rates" }
      );
    }

    if (user.role === "employee") {
      items.push({ to: "/checkpoint", icon: Car, label: "Checkpoint" });
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/admin" className="cursor-pointer">
            <div className="flex items-center space-x-2">
              <Car className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                <span className="hidden sm:inline">Parking System</span>
                <span className="sm:hidden">Parking</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Navigation Buttons */}
            <nav
              className="flex items-center space-x-1"
              role="navigation"
              aria-label="Main navigation"
            >
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      isActive
                        ? "bg-gray-100 dark:bg-gray-800 text-blue-600"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop User Info & Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4" />
                <span className="font-medium">{user.username}</span>
              </div>
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

          {/* Mobile Navigation - Username + Burger Menu */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Username */}
            <div className="flex items-center space-x-1 text-sm text-gray-700 dark:text-gray-300">
              <User className="h-4 w-4" />
              <span className="font-medium">{user.username}</span>
            </div>

            {/* Mobile Burger Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  aria-label="Open navigation menu"
                  aria-expanded="false"
                  aria-haspopup="menu"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" role="menu">
                {/* Navigation Items */}
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <DropdownMenuItem key={item.to} asChild>
                      <Link
                        to={item.to}
                        className={cn(
                          "flex items-center space-x-2 w-full",
                          isActive && "text-blue-600 bg-blue-50"
                        )}
                        role="menuitem"
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
