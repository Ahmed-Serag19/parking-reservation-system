import { z } from "zod";

export const visitorCheckinSchema = z.object({
  gateId: z.string().min(1, "Gate ID is required"),
  zoneId: z.string().min(1, "Zone selection is required"),
  type: z.literal("visitor"),
});

export type VisitorCheckinFormData = z.infer<typeof visitorCheckinSchema>;

export const subscriberCheckinSchema = z.object({
  gateId: z.string().min(1, "Gate ID is required"),
  zoneId: z.string().min(1, "Zone selection is required"),
  type: z.literal("subscriber"),
  subscriptionId: z.string().min(1, "Subscription ID is required"),
});

export type SubscriberCheckinFormData = z.infer<typeof subscriberCheckinSchema>;

export const subscriptionLookupSchema = z.object({
  subscriptionId: z
    .string()
    .min(1, "Subscription ID is required")
    .regex(/^sub_[a-f0-9]+$/, "Invalid subscription ID format"),
});

export type SubscriptionLookupFormData = z.infer<
  typeof subscriptionLookupSchema
>;
