/**
 * SOS Button Component
 * Large emergency button that:
 * - Shows confirmation dialog before triggering SOS
 * - Displays active state with pulsing animation
 * - Prevents accidental activation
 */

import { useState } from "react";
import { Shield, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface SOSButtonProps {
  onPress: () => void;      // Function called when SOS is confirmed
  isActive?: boolean;        // Whether SOS is currently active
}

export const SOSButton = ({ onPress, isActive = false }: SOSButtonProps) => {
  const [isPressing, setIsPressing] = useState(false);           // Touch press state
  const [showConfirmation, setShowConfirmation] = useState(false);  // Show dialog

  // Handle button press - show confirmation or cancel
  const handlePress = () => {
    if (!isActive) {
      setShowConfirmation(true);  // First press: show confirmation
    } else {
      onPress();  // Already active: cancel SOS
    }
  };

  // Confirmed - trigger SOS
  const handleConfirm = () => {
    setShowConfirmation(false);
    onPress();
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing rings when SOS is active */}
      {isActive && (
        <>
          <div className="absolute w-64 h-64 rounded-full bg-emergency/20 animate-pulse-ring" />
          <div className="absolute w-56 h-56 rounded-full bg-emergency/30 animate-pulse-ring animation-delay-300" />
        </>
      )}
      
      {/* Main SOS Button */}
      <Button
        onClick={handlePress}
        onTouchStart={() => setIsPressing(true)}
        onTouchEnd={() => setIsPressing(false)}
        className={`
          relative w-48 h-48 rounded-full shadow-strong
          transition-all duration-300 transform
          ${isActive ? 'gradient-emergency scale-95' : 'gradient-primary'}
          ${isPressing ? 'scale-90' : 'hover:scale-105'}
        `}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          {isActive ? (
            <>
              <AlertCircle className="w-16 h-16 text-white animate-pulse" />
              <span className="text-2xl font-bold text-white">SOS SENT</span>
              <span className="text-xs text-white/90">Tap to cancel</span>
            </>
          ) : (
            <>
              <Shield className="w-16 h-16 text-white" />
              <span className="text-2xl font-bold text-white">SOS</span>
              <span className="text-xs text-white/90">Press for help</span>
            </>
          )}
        </div>
      </Button>

      {/* Confirmation Dialog - Prevents accidental activation */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-emergency">
              <AlertCircle className="w-6 h-6" />
              Send Emergency Alert?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will immediately:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Notify all your emergency contacts</li>
                <li>Share your current location</li>
                <li>Send SMS and email alerts</li>
              </ul>
              <p className="font-semibold text-foreground mt-3">
                Only use in real emergencies.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-emergency hover:bg-emergency/90 text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              Send SOS Alert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
