import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import type { CheckinRequest } from "../../../types/api";

// Query Keys
export const visitorQueryKeys = {
  zones: (gateId: string) => ["zones", gateId] as const,
  subscription: (id: string) => ["subscription", id] as const,
} as const;

// === Zone Operations ===
export const useZones = (gateId: string) => {
  return useQuery({
    queryKey: visitorQueryKeys.zones(gateId),
    queryFn: () => api.getZones(gateId),
    enabled: !!gateId,
    staleTime: 30000, // 30 seconds
  });
};

// === Checkin Operations ===
export const useCheckin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkinData: CheckinRequest) => api.checkin(checkinData),
    onSuccess: (_, variables) => {
      // Invalidate zones to update availability after checkin
      queryClient.invalidateQueries({
        queryKey: visitorQueryKeys.zones(variables.gateId),
      });
    },
  });
};

// === Subscription Operations ===
export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: visitorQueryKeys.subscription(id),
    queryFn: () => api.getSubscription(id),
    enabled: !!id && id.length > 0,
    staleTime: 60000, // 1 minute
    retry: false, // Don't retry on failed subscription lookup
  });
};
