import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { LoginPage } from "./features/auth/components/login-page";
import { AdminPage } from "./features/admin/components/admin-page";
import { AdminParkingReportPage } from "./features/admin/components/admin-parking-report-page";
import { AdminCategoryRatesPage } from "./features/admin/components/admin-category-rates-page";
import { AdminZoneControlsPage } from "./features/admin/components/admin-zone-controls-page";
import { AdminUsersPage } from "./features/admin/components/admin-users-page";
import { AdminRushHoursPage } from "./features/admin/components/admin-rush-hours-page";
import { AdminVacationsPage } from "./features/admin/components/admin-vacations-page";
import { CheckpointPage } from "./features/checkpoint/components/checkpoint-page";
import { GatePage } from "./features/gate/components/gate-page";
import { NotFoundPage } from "./components/error/not-found-page";
import { UnauthorizedPage } from "./components/error/unauthorized-page";
import { ProtectedRoute } from "./components/auth/protected-route";
import { AppLayout } from "./components/layout/app-layout";
import "./App.css";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AppLayout>
                    <AdminPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/parking-report"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AppLayout>
                    <AdminParkingReportPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/category-rates"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AppLayout>
                    <AdminCategoryRatesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/zone-controls"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AppLayout>
                    <AdminZoneControlsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AppLayout>
                    <AdminUsersPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rush-hours"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AppLayout>
                    <AdminRushHoursPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vacations"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AppLayout>
                    <AdminVacationsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkpoint"
              element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <AppLayout>
                    <CheckpointPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/gate/:gateId"
              element={
                <ProtectedRoute allowedRoles={["admin", "employee"]}>
                  <AppLayout>
                    <GatePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#ffffff",
                color: "#1f2937",
                border: "1px solid #e5e7eb",
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              },
            }}
          />
        </div>
      </BrowserRouter>

      {/* React Query DevTools in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
