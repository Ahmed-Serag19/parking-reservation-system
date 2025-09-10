import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QrCode, Printer, X, Car } from "lucide-react";
import type { Ticket, Zone } from "../../../types/api";
import { cn } from "../../../lib/utils";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  zone?: Zone;
  gateId: string;
  gateName?: string;
}

export function TicketModal({
  isOpen,
  onClose,
  ticket,
  zone,
  gateId,
  gateName,
}: TicketModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [showGateAnimation, setShowGateAnimation] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);

    // Trigger print
    setTimeout(() => {
      window.print();
      setIsPrinting(false);

      // Show gate animation after printing (bonus feature)
      setShowGateAnimation(true);
      setTimeout(() => {
        setShowGateAnimation(false);
        onClose();
      }, 3000);
    }, 500);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto print:shadow-none print:border-none">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Parking Ticket
            </DialogTitle>
          </DialogHeader>

          {/* Printable Ticket Content */}
          <div className="space-y-6 print:space-y-4">
            {/* Header */}
            <div className="text-center border-b pb-4 print:border-black">
              <h2 className="text-2xl font-bold print:text-xl">
                PARKING TICKET
              </h2>
              <p className="text-muted-foreground print:text-black">
                {gateName || `Gate ${gateId}`}
              </p>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex justify-center">
              <div className="w-32 h-32 border-2 border-dashed border-muted-foreground flex items-center justify-center print:border-black">
                <div className="text-center">
                  <QrCode className="w-8 h-8 mx-auto mb-2 print:text-black" />
                  <p className="text-xs text-muted-foreground print:text-black">
                    QR Code
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground print:text-black">
                    Ticket ID
                  </p>
                  <p className="font-mono font-bold text-lg">{ticket.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground print:text-black">Type</p>
                  <p className="font-semibold capitalize">{ticket.type}</p>
                </div>
              </div>

              <Separator className="print:border-black" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground print:text-black">Zone</p>
                  <p className="font-semibold">{zone?.name || ticket.zoneId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground print:text-black">Gate</p>
                  <p className="font-semibold">{gateId}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground print:text-black">
                  Check-in Time
                </p>
                <p className="font-semibold">
                  {formatDateTime(ticket.checkinAt)}
                </p>
              </div>

              {ticket.subscriptionId && (
                <div>
                  <p className="text-muted-foreground print:text-black">
                    Subscription
                  </p>
                  <p className="font-semibold font-mono">
                    {ticket.subscriptionId}
                  </p>
                </div>
              )}

              {zone && (
                <>
                  <Separator className="print:border-black" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground print:text-black">
                        Category
                      </p>
                      <p className="font-semibold">{zone.categoryId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground print:text-black">
                        Rate
                      </p>
                      <p className="font-semibold">
                        ${zone.rateNormal}/hr - ${zone.rateSpecial}/hr
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground print:text-black border-t pt-4 print:border-black">
              <p>Keep this ticket for parking validation</p>
              <p>Present QR code at checkpoint for exit</p>
              <p className="mt-2 font-mono">{new Date().toISOString()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 print:hidden">
            <Button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-2" />
              {isPrinting ? "Printing..." : "Print Ticket"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gate Open Animation (Bonus Feature) */}
      {showGateAnimation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="relative">
              {/* Animated Gate */}
              <div className="w-64 h-40 border-4 border-white relative overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 bg-white transition-transform duration-1000",
                    "w-1/2 transform -translate-x-full"
                  )}
                  style={{
                    animation: showGateAnimation
                      ? "gateOpen 2s ease-in-out"
                      : "",
                  }}
                />
                <div
                  className={cn(
                    "absolute inset-y-0 right-0 bg-white transition-transform duration-1000",
                    "w-1/2 transform translate-x-full"
                  )}
                  style={{
                    animation: showGateAnimation
                      ? "gateOpen 2s ease-in-out reverse"
                      : "",
                  }}
                />

                {/* Car Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car className="w-12 h-12 text-green-400" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-6 mb-2">Gate Opening</h2>
            <p className="text-green-400">
              Please proceed to your parking zone
            </p>
            <p className="text-sm opacity-75 mt-2">Zone: {zone?.name}</p>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }

          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
        }

        @keyframes gateOpen {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(var(--gate-open-distance, 150%));
          }
        }
      `}</style>
    </>
  );
}
