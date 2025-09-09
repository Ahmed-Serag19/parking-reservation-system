import { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/auth-store";
import { useTicket, useCheckout, useSubscription } from "../hooks/use-employee";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import {
  Loader2,
  Ticket,
  Car,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { CheckoutResponse, BreakdownSegment } from "../../../types/api";

export function CheckpointPage() {
  const user = useAuthStore((state) => state.user);
  const [ticketId, setTicketId] = useState("");
  const [debouncedTicketId, setDebouncedTicketId] = useState("");
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(
    null
  );
  const [plateMatches, setPlateMatches] = useState<boolean | null>(null);

  // Debounce ticket ID input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTicketId(ticketId);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [ticketId]);

  // Hooks
  const {
    data: ticket,
    isLoading: ticketLoading,
    error: ticketError,
  } = useTicket(debouncedTicketId);
  const checkout = useCheckout();
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
  } = useSubscription(ticket?.subscriptionId || "");

  const handleTicketLookup = () => {
    if (!ticketId.trim()) {
      toast.error("Please enter a ticket ID");
      return;
    }
    // Reset states for new ticket lookup
    setCheckoutResult(null);
    setPlateMatches(null);
    // Force immediate lookup by setting debounced value
    setDebouncedTicketId(ticketId.trim());
  };

  const handleCheckout = async (forceConvertToVisitor = false) => {
    if (!debouncedTicketId.trim()) {
      toast.error("Please enter a ticket ID");
      return;
    }

    try {
      const result = await checkout.mutateAsync({
        ticketId: debouncedTicketId.trim(),
        forceConvertToVisitor,
      });

      setCheckoutResult(result);
      toast.success("Checkout completed successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Checkout failed";
      toast.error(errorMessage);
    }
  };

  const handlePlateMatch = (matches: boolean) => {
    setPlateMatches(matches);
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Employee Checkpoint
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome, {user?.username}! (Role: {user?.role})
          </p>
        </div>

        {/* Ticket Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Ticket Lookup & Checkout
            </CardTitle>
            <CardDescription>
              Enter ticket ID to lookup and process checkout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="ticketId">Ticket ID</Label>
                <Input
                  id="ticketId"
                  type="text"
                  placeholder="e.g., t_abcd1234"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTicketLookup()}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleTicketLookup}
                disabled={!ticketId.trim() || ticketLoading}
              >
                {ticketLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Lookup"
                )}
              </Button>
            </div>

            {/* Ticket Error */}
            {ticketError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {ticketError?.message || "Failed to lookup ticket"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Ticket Details */}
        {ticket && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Ticket ID</Label>
                  <p className="text-sm text-muted-foreground">{ticket.id}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Type</Label>
                  <div>
                    <Badge
                      variant={
                        ticket.type === "visitor" ? "default" : "secondary"
                      }
                    >
                      {ticket.type}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Check-in Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(ticket.checkinAt).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Zone</Label>
                  <p className="text-sm text-muted-foreground">
                    {ticket.zoneId}
                  </p>
                </div>
              </div>

              {/* Subscriber Car Comparison */}
              {ticket.type === "subscriber" && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Subscription Cars - Plate Verification
                  </h4>

                  {subscriptionLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading subscription details...
                    </div>
                  )}

                  {subscriptionError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to load subscription details:{" "}
                        {subscriptionError?.message || "Unknown error"}
                      </AlertDescription>
                    </Alert>
                  )}

                  {subscription &&
                    !subscriptionLoading &&
                    !subscriptionError && (
                      <>
                        <div className="mb-3 p-2 bg-white dark:bg-gray-800 rounded border">
                          <div className="text-sm">
                            <span className="font-medium">Subscriber:</span>{" "}
                            {subscription.userName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Category: {subscription.category} | Active:{" "}
                            {subscription.active ? "Yes" : "No"}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {subscription.cars.map((car, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                            >
                              <div>
                                <span className="font-medium">{car.plate}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  {car.brand} {car.model} ({car.color})
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={
                                    plateMatches === true
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => handlePlateMatch(true)}
                                  disabled={subscriptionLoading}
                                >
                                  Match
                                </Button>
                                <Button
                                  size="sm"
                                  variant={
                                    plateMatches === false
                                      ? "destructive"
                                      : "outline"
                                  }
                                  onClick={() => handlePlateMatch(false)}
                                  disabled={subscriptionLoading}
                                >
                                  No Match
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {plateMatches === false && (
                          <Alert className="mt-3">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Plate doesn't match. You can convert to visitor
                              pricing.
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    )}

                  {!subscription &&
                    !subscriptionLoading &&
                    !subscriptionError &&
                    ticket.subscriptionId && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No subscription found for ID: {ticket.subscriptionId}
                        </AlertDescription>
                      </Alert>
                    )}
                </div>
              )}

              {/* Checkout Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleCheckout(plateMatches === false)}
                  disabled={
                    checkout.isPending ||
                    (ticket.type === "subscriber" && subscriptionLoading)
                  }
                  className="flex-1"
                >
                  {checkout.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : ticket.type === "subscriber" && subscriptionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading subscription...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      {plateMatches === false
                        ? "Checkout (Visitor Rate)"
                        : "Checkout"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checkout Result */}
        {checkoutResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Checkout Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(checkoutResult.durationHours)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Amount</Label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(checkoutResult.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Checkout Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(checkoutResult.checkoutAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Breakdown</h4>
                <div className="space-y-2">
                  {checkoutResult.breakdown.map(
                    (segment: BreakdownSegment, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <div>
                          <span className="text-sm font-medium">
                            {new Date(segment.from).toLocaleTimeString()} -{" "}
                            {new Date(segment.to).toLocaleTimeString()}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {segment.hours.toFixed(1)}h @{" "}
                            {formatCurrency(segment.rate)}/{segment.rateMode}
                          </div>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(segment.amount)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    setTicketId("");
                    setDebouncedTicketId("");
                    setCheckoutResult(null);
                    setPlateMatches(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Process Another Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
