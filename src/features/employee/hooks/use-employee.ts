import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import type { CheckoutRequest } from "../../../types/api";

// Query Keys
export const employeeQueryKeys = {
  ticket: (id: string) => ["ticket", id] as const,
  subscription: (id: string) => ["subscription", id] as const,
} as const;

// === Ticket Operations ===
export const useTicket = (id: string) => {
  return useQuery({
    queryKey: employeeQueryKeys.ticket(id),
    queryFn: () => api.getTicket(id),
    enabled: !!id,
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkoutData: CheckoutRequest) => api.checkout(checkoutData),
    onSuccess: (_, variables) => {
      // Invalidate zones to update availability after checkout
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      // Invalidate specific ticket
      queryClient.invalidateQueries({
        queryKey: employeeQueryKeys.ticket(variables.ticketId),
      });
    },
  });
};

// === Subscription Operations ===
export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: employeeQueryKeys.subscription(id),
    queryFn: () => api.getSubscription(id),
    enabled: !!id,
  });
};
