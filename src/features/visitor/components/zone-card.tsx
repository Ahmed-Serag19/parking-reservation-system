import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Car, Lock, Unlock } from "lucide-react";
import type { Zone } from "../../../types/api";
import { cn } from "../../../lib/utils";

interface ZoneCardProps {
  zone: Zone;
  isSelected: boolean;
  isVisitorTab: boolean;
  onSelect: (zoneId: string) => void;
  disabled?: boolean;
}

export function ZoneCard({
  zone,
  isSelected,
  isVisitorTab,
  onSelect,
  disabled = false,
}: ZoneCardProps) {
  const isAvailable = isVisitorTab
    ? zone.open && zone.availableForVisitors > 0
    : zone.open && zone.availableForSubscribers > 0;

  const availableCount = isVisitorTab
    ? zone.availableForVisitors
    : zone.availableForSubscribers;

  // Debug logging for subscriber zones
  if (!isVisitorTab) {
    console.log(`Subscriber Zone ${zone.name}:`, {
      open: zone.open,
      availableForSubscribers: zone.availableForSubscribers,
      subscriberCount: zone.subscriberCount,
      totalSlots: zone.totalSlots,
      occupied: zone.occupied,
      isAvailable,
      disabled,
    });
  }

  // Check if special rate is active (bonus feature)
  const isSpecialRate = zone.specialActive || false;
  const currentRate = isSpecialRate ? zone.rateSpecial : zone.rateNormal;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-primary",
        !isAvailable && "opacity-60 cursor-not-allowed",
        disabled && "opacity-40 cursor-not-allowed",
        // Bonus: visual highlight for special rates
        isSpecialRate && "border-orange-300 bg-orange-50"
      )}
      onClick={() => {
        if (isAvailable && !disabled) {
          onSelect(zone.id);
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{zone.name}</CardTitle>
          <div className="flex items-center gap-2">
            {zone.open ? (
              <Badge
                variant="outline"
                className="text-green-600 border-green-300"
              >
                <Unlock className="w-3 h-3 mr-1" />
                Open
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-300">
                <Lock className="w-3 h-3 mr-1" />
                Closed
              </Badge>
            )}

            {/* Bonus: Special rate indicator */}
            {isSpecialRate && (
              <Badge
                variant="secondary"
                className="text-orange-600 bg-orange-100"
              >
                Special Rate
              </Badge>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Category: <span className="font-medium">{zone.categoryId}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Availability Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-red-100">
              <Users className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Occupied
              </p>
              <p className="text-xl font-bold text-red-600">{zone.occupied}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-2 rounded-full",
                availableCount > 0 ? "bg-green-100" : "bg-red-100"
              )}
            >
              <Car
                className={cn(
                  "w-4 h-4",
                  availableCount > 0 ? "text-green-600" : "text-red-600"
                )}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Available
              </p>
              <p
                className={cn(
                  "text-xl font-bold",
                  availableCount > 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {availableCount}
              </p>
            </div>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Capacity</span>
            <span>
              {zone.occupied}/{zone.totalSlots}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                zone.occupied / zone.totalSlots > 0.9
                  ? "bg-red-500"
                  : zone.occupied / zone.totalSlots > 0.7
                  ? "bg-yellow-500"
                  : "bg-green-500"
              )}
              style={{
                width: `${Math.min(
                  (zone.occupied / zone.totalSlots) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div>
            <span className="block">Free</span>
            <span className="font-medium text-foreground">{zone.free}</span>
          </div>
          <div>
            <span className="block">Reserved</span>
            <span className="font-medium text-foreground">{zone.reserved}</span>
          </div>
          <div>
            <span className="block">Total</span>
            <span className="font-medium text-foreground">
              {zone.totalSlots}
            </span>
          </div>
        </div>

        {/* Rates */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Current Rate</p>
              <p
                className={cn(
                  "text-xl font-bold",
                  isSpecialRate ? "text-orange-600" : "text-green-600"
                )}
              >
                ${currentRate}/hr
              </p>
            </div>

            <div className="text-right text-xs text-muted-foreground">
              <p>Normal: ${zone.rateNormal}/hr</p>
              <p>Special: ${zone.rateSpecial}/hr</p>
            </div>
          </div>
        </div>

        {/* Selection Button */}
        <Button
          className="w-full"
          variant={isSelected ? "default" : "outline"}
          disabled={!isAvailable || disabled}
        >
          {!zone.open
            ? "Closed"
            : availableCount <= 0
            ? "Full"
            : isSelected
            ? "Selected"
            : "Select Zone"}
        </Button>
      </CardContent>
    </Card>
  );
}
