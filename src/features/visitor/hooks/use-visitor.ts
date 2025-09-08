import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import type { CheckinRequest } from "../../../types/api";

// Query Keys
export const visitorQueryKeys = {
  gates: ["gates"] as const,
  zones: (gateId?: string) => ["zones", gateId] as const,
  categories: ["categories"] as const,
} as const;

// === Gates & Zones ===
export const useGates = () => {
  return useQuery({
    queryKey: visitorQueryKeys.gates,
    queryFn: () => api.getGates(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useZones = (gateId?: string) => {
  return useQuery({
    queryKey: visitorQueryKeys.zones(gateId),
    queryFn: () => api.getZones(gateId),
    enabled: !!gateId, // Only run when gateId is provided
    staleTime: 30 * 1000, // 30 seconds (real-time data)
  });
};

// === Categories ===
export const useCategories = () => {
  return useQuery({
    queryKey: visitorQueryKeys.categories,
    queryFn: () => api.getCategories(),
  });
};

// === Check-in Operations ===
export const useCheckin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkinData: CheckinRequest) => api.checkin(checkinData),
    onSuccess: (_, variables) => {
      // Invalidate zones for the specific gate to update availability
      queryClient.invalidateQueries({
        queryKey: visitorQueryKeys.zones(variables.gateId),
      });
      // Also invalidate general zones query
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
};
