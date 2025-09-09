import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wifi, WifiOff, Clock, ChevronDown, MapPin } from "lucide-react";
import { cn } from "../../../lib/utils";

interface GateHeaderProps {
  gateId: string;
  gateName?: string;
  isConnected: boolean;
  reconnectAttempts?: number;
}

// Available gates configuration
const AVAILABLE_GATES = [
  {
    id: "gate_1",
    name: "Gate 1 - Premium",
    description: "VIP & Executive zones",
  },
  {
    id: "gate_2",
    name: "Gate 2 - Standard",
    description: "Regular parking zones",
  },
  {
    id: "gate_3",
    name: "Gate 3 - Economy",
    description: "Budget-friendly zones",
  },
];

export function GateHeader({
  gateId,
  gateName,
  isConnected,
  reconnectAttempts = 0,
}: GateHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleGateChange = (newGateId: string) => {
    navigate(`/gate/${newGateId}`);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-card border-b border-border p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Gate Info with Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-foreground">
                {gateName || `Gate ${gateId}`}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Parking Check-in Terminal
              </p>
            </div>

            {/* Gate Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-1 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm"
                  aria-label="Switch to different gate"
                  aria-haspopup="menu"
                  aria-expanded="false"
                >
                  <MapPin
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    aria-hidden="true"
                  />
                  <span className="hidden xs:inline">Switch Gate</span>
                  <span className="xs:hidden">Switch</span>
                  <ChevronDown
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    aria-hidden="true"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56" role="menu">
                {AVAILABLE_GATES.map((gate) => (
                  <DropdownMenuItem
                    key={gate.id}
                    onClick={() => handleGateChange(gate.id)}
                    className={cn(
                      "flex flex-col items-start gap-1 p-3",
                      gate.id === gateId && "bg-accent"
                    )}
                    role="menuitem"
                    aria-current={gate.id === gateId ? "true" : "false"}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                      <span className="font-medium">{gate.name}</span>
                      {gate.id === gateId && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {gate.description}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status and Time */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-300 text-xs sm:text-sm"
                  >
                    Connected
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  <Badge
                    variant="outline"
                    className="text-red-600 border-red-300 text-xs sm:text-sm"
                  >
                    {reconnectAttempts > 0
                      ? `Reconnecting... (${reconnectAttempts})`
                      : "Disconnected"}
                  </Badge>
                </>
              )}
            </div>

            {/* Current Time */}
            <div className="flex items-center gap-2 text-left sm:text-right">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <div>
                <p className="text-lg sm:text-2xl font-bold text-foreground">
                  {formatTime(currentTime)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {formatDate(currentTime)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Offline Notice */}
        {!isConnected && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Connection Lost:</strong> Operating in offline mode. Zone
              availability may not be current.
              {reconnectAttempts > 0 && " Attempting to reconnect..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
