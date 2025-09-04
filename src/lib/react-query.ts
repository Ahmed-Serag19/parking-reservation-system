// React Query Configuration and Hooks

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type {
  LoginRequest,
  CheckinRequest,
  CheckoutRequest,
  Zone,
} from "../types/api";

// Query Keys
export const queryKeys = {
  gates: ["gates"] as const,
  zones: (gateId?: string) => ["zones", gateId] as const,
  subscription: (id: string) => ["subscription", id] as const,
  ticket: (id: string) => ["ticket", id] as const,
  parkingReport: ["admin", "parking-report"] as const,
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

export const useUpdateZoneStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zoneId, open }: { zoneId: string; open: boolean }) =>
      api.updateZoneStatus(zoneId, open),
    onSuccess: () => {
      // Invalidate all zone-related queries
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.parkingReport });
    },
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
      // Invalidate zone and parking report queries
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.parkingReport });
    },
  });
};
