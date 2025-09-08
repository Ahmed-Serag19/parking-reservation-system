import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import type { CreateEmployeeRequest } from "../../../types/api";

// Query Keys
export const adminQueryKeys = {
  parkingReport: ["admin", "parking-state-report"] as const,
  zones: ["admin", "zones"] as const,
  categories: ["categories"] as const,
  employees: ["employees"] as const,
  rushHours: ["rush-hours"] as const,
  vacations: ["vacations"] as const,
} as const;

// === Parking State Report ===
export const useParkingStateReport = () => {
  return useQuery({
    queryKey: adminQueryKeys.parkingReport,
    queryFn: () => api.getParkingStateReport(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 0, // Always consider data stale for real-time updates
  });
};

// === Zone Management ===
export const useAdminZones = () => {
  return useQuery({
    queryKey: adminQueryKeys.zones,
    queryFn: () => api.getZones(),
    refetchInterval: 30000,
    staleTime: 0,
  });
};

export const useUpdateZoneStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zoneId, open }: { zoneId: string; open: boolean }) =>
      api.updateZoneStatus(zoneId, open),
    onSuccess: () => {
      // Aggressive invalidation for real-time updates
      queryClient.refetchQueries({ queryKey: adminQueryKeys.parkingReport });
      queryClient.refetchQueries({ queryKey: adminQueryKeys.zones });
      queryClient.refetchQueries({ queryKey: ["zones"] });
    },
  });
};

// === Category Management ===
export const useCategories = () => {
  return useQuery({
    queryKey: adminQueryKeys.categories,
    queryFn: () => api.getCategories(),
  });
};

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
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.zones });
      // Invalidate both historical and current parking-report keys used across tests/components
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.parkingReport });
      queryClient.invalidateQueries({
        queryKey: ["admin", "parking-state-report"],
      });
    },
  });
};

// === Employee Management ===
export const useEmployees = () => {
  return useQuery({
    queryKey: adminQueryKeys.employees,
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
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.employees });
    },
  });
};

// === Rush Hours Management ===
export const useRushHours = () => {
  return useQuery({
    queryKey: adminQueryKeys.rushHours,
    queryFn: () => api.getRushHours(),
  });
};

export const useCreateRushHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rushHourData: { weekDay: number; from: string; to: string }) =>
      api.createRushHour(rushHourData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.rushHours });
    },
  });
};

export const useDeleteRushHour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rushHourId: string) => api.deleteRushHour(rushHourId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.rushHours });
    },
  });
};

// === Vacations Management ===
export const useVacations = () => {
  return useQuery({
    queryKey: adminQueryKeys.vacations,
    queryFn: () => api.getVacations(),
  });
};

export const useCreateVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vacationData: { name: string; from: string; to: string }) =>
      api.createVacation(vacationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.vacations });
    },
  });
};

export const useDeleteVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vacationId: string) => api.deleteVacation(vacationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.vacations });
    },
  });
};
