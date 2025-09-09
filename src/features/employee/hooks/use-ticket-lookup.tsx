import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTicket } from "./use-employee";

export function useTicketLookup() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const {
    data: ticket,
    isFetching: isFetchingTicket,
    error: ticketError,
  } = useTicket(selectedTicketId || "");

  // Handle ticket lookup errors
  useEffect(() => {
    if (ticketError && selectedTicketId) {
      const errorMessage =
        (ticketError as Error)?.message || "Failed to lookup ticket";
      toast.error(errorMessage);
    }
  }, [ticketError, selectedTicketId]);

  const lookupTicket = (ticketId: string) => {
    if (!ticketId.trim()) {
      toast.error("Please enter a ticket ID");
      return;
    }
    setSelectedTicketId(ticketId.trim());
  };

  const clearTicket = () => {
    setSelectedTicketId(null);
  };

  return {
    ticket,
    isFetchingTicket,
    ticketError,
    lookupTicket,
    clearTicket,
    selectedTicketId,
  };
}
