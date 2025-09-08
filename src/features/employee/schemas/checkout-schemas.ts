import { z } from "zod";

export const checkoutSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  forceConvertToVisitor: z.boolean().optional().default(false),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const ticketLookupSchema = z.object({
  ticketId: z
    .string()
    .min(1, "Ticket ID is required")
    .regex(/^t_[a-f0-9]+$/, "Invalid ticket ID format"),
});

export type TicketLookupFormData = z.infer<typeof ticketLookupSchema>;
