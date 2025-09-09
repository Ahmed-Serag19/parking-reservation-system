import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Users, CreditCard, Car } from "lucide-react";
import { cn } from "../../../lib/utils";
import { GateHeader } from "./gate-header";
import { ZoneCard } from "./zone-card";
import { TicketModal } from "./ticket-modal";
import {
  useZones,
  useCheckin,
  useSubscription,
  visitorQueryKeys,
} from "../hooks/use-visitor";
import { useGateWebSocket } from "../hooks/use-gate-websocket";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Zone, Ticket } from "../../../types/api";

export function GatePage() {
  const { gateId } = useParams<{ gateId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"visitor" | "subscriber">(
    "visitor"
  );
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);
  const [cachedZones, setCachedZones] = useState<Zone[]>([]);

  // Hooks
  const {
    data: zones = [],
    isLoading: zonesLoading,
    error: zonesError,
  } = useZones(gateId || "");
  const checkin = useCheckin();
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
  } = useSubscription(subscriptionId);

  // WebSocket with real-time updates and offline caching (bonus features)
  const { isConnected, connectionStatus, reconnectAttempts } = useGateWebSocket(
    {
      gateId,
      onZoneUpdate: (updatedZone) => {
        console.log("Zone update received:", updatedZone);

        // Update React Query cache first
        queryClient.setQueryData(
          visitorQueryKeys.zones(gateId!),
          (oldZones: Zone[] | undefined) => {
            if (!oldZones) return [updatedZone];
            return oldZones.map((zone) =>
              zone.id === updatedZone.id ? updatedZone : zone
            );
          }
        );

        // Update cached zones for offline mode
        setCachedZones((prev) =>
          prev.map((zone) => (zone.id === updatedZone.id ? updatedZone : zone))
        );

        // Zone updates happen silently for better UX
      },
      onAdminUpdate: (update) => {
        // Show admin updates as toast notifications
        if (update.action) {
          toast(`Admin Update: ${update.action}`, {
            icon: "ℹ️",
            duration: 3000,
          });
        }
      },
    }
  );

  // Cache zones for offline mode (bonus feature)
  useEffect(() => {
    if (zones.length > 0) {
      setCachedZones(zones);
      // Store in localStorage for persistence
      localStorage.setItem(`zones_${gateId}`, JSON.stringify(zones));
    }
  }, [zones, gateId]);

  // Load cached zones on mount if offline
  useEffect(() => {
    if (!isConnected && cachedZones.length === 0) {
      const cached = localStorage.getItem(`zones_${gateId}`);
      if (cached) {
        try {
          setCachedZones(JSON.parse(cached));
        } catch (error) {
          console.warn("Failed to load cached zones:", error);
        }
      }
    }
  }, [isConnected, gateId, cachedZones.length]);

  // Use cached zones when offline
  const displayZones = isConnected ? zones : cachedZones;
  const selectedZone = displayZones.find((zone) => zone.id === selectedZoneId);

  // Reset selection when switching tabs
  useEffect(() => {
    setSelectedZoneId(null);
    setSubscriptionId("");
  }, [activeTab]);

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZoneId(selectedZoneId === zoneId ? null : zoneId);
  };

  const handleVisitorCheckin = async () => {
    if (!selectedZoneId || !gateId) return;

    try {
      const response = await checkin.mutateAsync({
        gateId,
        zoneId: selectedZoneId,
        type: "visitor",
      });

      setGeneratedTicket(response.ticket);
      setIsTicketModalOpen(true);
      setSelectedZoneId(null);
      toast.success("Check-in successful! Please print your ticket.");
    } catch (error: any) {
      const message = error?.message || "Check-in failed";
      toast.error(message);
    }
  };

  const handleSubscriberCheckin = async () => {
    if (!selectedZoneId || !gateId || !subscriptionId) return;

    // Verify subscription is valid for this zone
    if (subscription && selectedZone) {
      const isValidCategory = subscription.category === selectedZone.categoryId;
      if (!isValidCategory) {
        toast.error("Your subscription is not valid for this zone category");
        return;
      }
    }

    try {
      const response = await checkin.mutateAsync({
        gateId,
        zoneId: selectedZoneId,
        type: "subscriber",
        subscriptionId: subscriptionId.trim(),
      });

      setGeneratedTicket(response.ticket);
      setIsTicketModalOpen(true);
      setSelectedZoneId(null);
      setSubscriptionId("");
      toast.success("Check-in successful! Please print your ticket.");
    } catch (error: any) {
      const message = error?.message || "Check-in failed";
      toast.error(message);
    }
  };

  const canProceedVisitor =
    selectedZoneId &&
    selectedZone?.open &&
    selectedZone?.availableForVisitors > 0;
  const canProceedSubscriber =
    selectedZoneId && subscriptionId && subscription && !subscriptionError;

  if (!gateId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid gate ID. Please use a valid gate URL.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GateHeader
        gateId={gateId}
        gateName={`Gate ${gateId.toUpperCase()}`}
        isConnected={isConnected}
        reconnectAttempts={reconnectAttempts}
      />

      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "visitor" | "subscriber")
          }
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 h-12 sm:h-auto">
            <TabsTrigger
              value="visitor"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-base px-2 sm:px-4"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Visitor Parking</span>
              <span className="xs:hidden">Visitor</span>
            </TabsTrigger>
            <TabsTrigger
              value="subscriber"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-base px-2 sm:px-4"
            >
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Subscriber Parking</span>
              <span className="xs:hidden">Subscriber</span>
            </TabsTrigger>
          </TabsList>

          {/* Visitor Tab */}
          <TabsContent value="visitor" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Visitor Parking</h2>
              <p className="text-muted-foreground">
                Select an available parking zone to get started
              </p>
            </div>

            {zonesLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary/20"></div>
                </div>
                <p className="mt-4 text-lg font-medium">
                  Loading parking zones...
                </p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we fetch available spaces
                </p>
              </div>
            )}

            {zonesError && (
              <Alert className="max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load zones.{" "}
                  {!isConnected && "Using cached data from previous visit."}
                  {isConnected &&
                    " Please refresh the page or contact support."}
                </AlertDescription>
              </Alert>
            )}

            {!zonesLoading && !zonesError && displayZones.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <Car className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold mb-2">
                  No parking zones available
                </p>
                <p className="text-muted-foreground text-center">
                  There are no parking zones configured for this gate.
                  <br />
                  Please contact facility management.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {displayZones.map((zone) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  isSelected={selectedZoneId === zone.id}
                  isVisitorTab={true}
                  onSelect={handleZoneSelect}
                  disabled={!isConnected && !zone.open}
                />
              ))}
            </div>

            {selectedZone && (
              <div className="fixed bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-xl p-3 sm:p-6 shadow-2xl max-w-md w-full mx-3 sm:mx-4 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="font-bold text-base sm:text-lg">
                        {selectedZone.name}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground">Rate</p>
                        <p className="font-semibold text-green-600">
                          $
                          {selectedZone.specialActive
                            ? selectedZone.rateSpecial
                            : selectedZone.rateNormal}
                          /hr
                          {selectedZone.specialActive && (
                            <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1 rounded">
                              SPECIAL
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Available</p>
                        <p className="font-semibold text-green-600">
                          {selectedZone.availableForVisitors} spaces
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleVisitorCheckin}
                    disabled={!canProceedVisitor || checkin.isPending}
                    size="sm"
                    className="sm:ml-4 min-w-full sm:min-w-[120px] h-12 sm:h-auto"
                  >
                    {checkin.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Car className="w-4 h-4 mr-2" />
                        Check In
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Subscriber Tab */}
          <TabsContent value="subscriber" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Subscriber Parking</h2>
              <p className="text-muted-foreground">
                Enter your subscription ID and select your zone
              </p>
            </div>

            {/* Subscription Input */}
            <div className="max-w-md mx-auto">
              <Label htmlFor="subscription-id">Subscription ID</Label>
              <Input
                id="subscription-id"
                value={subscriptionId}
                onChange={(e) => setSubscriptionId(e.target.value)}
                placeholder="Enter your subscription ID"
                className="mt-1"
              />

              {subscriptionLoading && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center">
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Verifying subscription...
                </p>
              )}

              {subscriptionError && (
                <Alert className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Subscription not found or invalid
                  </AlertDescription>
                </Alert>
              )}

              {subscription && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    ✓ Valid subscription for {subscription.userName}
                  </p>
                  <p className="text-sm text-green-600">
                    Category: {subscription.category}
                  </p>
                </div>
              )}
            </div>

            {zonesLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading zones...</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {displayZones.map((zone) => {
                const isSubscriptionValid =
                  subscription?.category === zone.categoryId;

                // Debug logging for subscriber zone matching
                console.log(`Zone ${zone.name} matching:`, {
                  subscriptionCategory: subscription?.category,
                  zoneCategoryId: zone.categoryId,
                  isSubscriptionValid,
                  hasSubscription: !!subscription,
                  isConnected,
                  zoneOpen: zone.open,
                  availableForSubscribers: zone.availableForSubscribers,
                  finalDisabled:
                    !subscription ||
                    !isSubscriptionValid ||
                    (!isConnected && !zone.open),
                });

                return (
                  <ZoneCard
                    key={zone.id}
                    zone={zone}
                    isSelected={selectedZoneId === zone.id}
                    isVisitorTab={false}
                    onSelect={handleZoneSelect}
                    disabled={
                      !subscription ||
                      !isSubscriptionValid ||
                      (!isConnected && !zone.open)
                    }
                  />
                );
              })}
            </div>

            {selectedZone && subscription && (
              <div className="fixed bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-xl p-3 sm:p-6 shadow-2xl max-w-md w-full mx-3 sm:mx-4 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                      <p className="font-bold text-base sm:text-lg">
                        {selectedZone.name}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground">Subscriber</p>
                        <p className="font-semibold text-blue-600 truncate">
                          {subscription.userName}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rate</p>
                        <p className="font-semibold text-green-600">FREE</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleSubscriberCheckin}
                    disabled={!canProceedSubscriber || checkin.isPending}
                    size="sm"
                    className="sm:ml-4 min-w-full sm:min-w-[120px] h-12 sm:h-auto bg-blue-600 hover:bg-blue-700"
                  >
                    {checkin.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Check In
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Ticket Modal */}
      {generatedTicket && (
        <TicketModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          ticket={generatedTicket}
          zone={selectedZone}
          gateId={gateId}
          gateName={`Gate ${gateId.toUpperCase()}`}
        />
      )}

      {/* Quick Gate Navigation - Fixed Bottom */}
      <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 z-40">
        <div className="flex flex-col gap-1 sm:gap-2">
          {["gate_1", "gate_2", "gate_3"].map((gate) => (
            <Button
              key={gate}
              variant={gate === gateId ? "default" : "outline"}
              size="sm"
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold transition-all duration-200 text-xs sm:text-sm",
                gate === gateId
                  ? "shadow-lg ring-2 ring-primary/20"
                  : "hover:scale-110"
              )}
              onClick={() => navigate(`/gate/${gate}`)}
            >
              {gate.split("_")[1]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
