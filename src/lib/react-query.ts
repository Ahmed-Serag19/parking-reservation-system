// React Query Configuration and Hooks

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type {
  LoginRequest,
  CheckinRequest,
  CheckoutRequest,
  Zone,
  Category,
  CreateEmployeeRequest,
  ParkingStateZone,
} from "../types/api";

// Query Keys
export const queryKeys = {
  gates: ["gates"] as const,
  zones: (gateId?: string) => ["zones", gateId] as const,
  subscription: (id: string) => ["subscription", id] as const,
  ticket: (id: string) => ["ticket", id] as const,
  parkingReport: ["admin", "parking-report"] as const,
  categories: ["categories"] as const,
  employees: ["employees"] as const,
} as const;

// Auth Hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => api.login(credentials),
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

// Gates & Zones Hooks
export const useGates = () => {
  return useQuery({
    queryKey: queryKeys.gates,
    queryFn: () => api.getGates(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useZones = (gateId?: string) => {
  return useQuery({
    queryKey: queryKeys.zones(gateId),
    queryFn: () => api.getZones(gateId),
    enabled: !!gateId, // Only run when gateId is provided
    staleTime: 30 * 1000, // 30 seconds (real-time data)
  });
};

// Subscription Hooks
export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: queryKeys.subscription(id),
    queryFn: () => api.getSubscription(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Ticket Hooks
export const useCheckin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckinRequest) => api.checkin(data),
    onSuccess: (response) => {
      // Update zones cache with new state
      queryClient.setQueryData(
        queryKeys.zones(response.ticket.gateId),
        (oldZones: Zone[] | undefined) => {
          if (!oldZones) return [response.zoneState];

          return oldZones.map((zone) =>
            zone.id === response.zoneState.id ? response.zoneState : zone
          );
        }
      );
    },
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckoutRequest) => api.checkout(data),
    onSuccess: (response) => {
      // Update zones cache with new state
      queryClient.invalidateQueries({
        queryKey: ["zones"],
      });

      // Invalidate parking report
      queryClient.invalidateQueries({
        queryKey: queryKeys.parkingReport,
      });
    },
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: queryKeys.ticket(id),
    queryFn: () => api.getTicket(id),
    enabled: !!id,
  });
};

// Admin Hooks
export const useParkingReport = () => {
  return useQuery({
    queryKey: queryKeys.parkingReport,
    queryFn: () => api.getParkingStateReport(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Removed duplicate - using the newer version below

export const useUpdateCategoryRates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      rates,
    }: {
      categoryId: string;
      rates: { rateNormal: number; rateSpecial: number };
    }) => api.updateCategoryRates(categoryId, rates),
    onSuccess: () => {
      // Invalidate categories, zones and parking report queries
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      // Invalidate both historical and current parking-report keys used across tests/components
      queryClient.invalidateQueries({ queryKey: queryKeys.parkingReport });
      queryClient.invalidateQueries({
        queryKey: ["admin", "parking-state-report"],
      });
    },
  });
};

// Category Hooks (read-only)
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api.getCategories(),
  });
};

// Employee Management Hooks
export const useEmployees = () => {
  return useQuery({
    queryKey: queryKeys.employees,
    queryFn: () => api.getEmployees(),
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeData: CreateEmployeeRequest) =>
      api.createEmployee(employeeData),
    onSuccess: () => {
      // Invalidate employees list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
    },
  });
};

// Parking State Report Hook
export const useParkingStateReport = () => {
  return useQuery({
    queryKey: ["admin", "parking-state-report"],
    queryFn: () => api.getParkingStateReport(),
    refetchInterval: 30000, // Refresh every 30 seconds for real-time data
    staleTime: 0, // Always consider data stale to ensure fresh updates
  });
};

// Zone Management Hooks
// NOTE: Using parking state report data since GET /admin/zones is not implemented
export const useAdminZones = () => {
  return useQuery({
    queryKey: ["admin", "parking-state-report"],
    queryFn: () => api.getParkingStateReport(),
    refetchInterval: 30000, // Refresh every 30 seconds for real-time data
    staleTime: 0, // Always consider data stale to ensure fresh updates
  });
};

export const useUpdateZoneStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zoneId, open }: { zoneId: string; open: boolean }) =>
      api.updateZoneStatus(zoneId, open),
    onSuccess: () => {
      // Force refetch all zone-related queries immediately
      queryClient.refetchQueries({ queryKey: ["admin", "zones"] });
      queryClient.refetchQueries({
        queryKey: ["admin", "parking-state-report"],
      });
      queryClient.refetchQueries({ queryKey: ["zones"] });
    },
  });
};

// Rush Hours Management Hooks
export const useRushHours = () => {
  return useQuery({
    queryKey: ["admin", "rush-hours"],
    queryFn: () => api.getRushHours(),
  });
};

export const useCreateRushHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rushHourData: { weekDay: number; from: string; to: string }) =>
      api.createRushHour(rushHourData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rush-hours"] });
    },
  });
};

export const useDeleteRushHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rushHourId: string) => api.deleteRushHour(rushHourId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "rush-hours"] });
    },
  });
};

// Vacations Management Hooks
export const useVacations = () => {
  return useQuery({
    queryKey: ["admin", "vacations"],
    queryFn: () => api.getVacations(),
  });
};

export const useCreateVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vacationData: { name: string; from: string; to: string }) =>
      api.createVacation(vacationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vacations"] });
    },
  });
};

export const useDeleteVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vacationId: string) => api.deleteVacation(vacationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vacations"] });
    },
  });
};
