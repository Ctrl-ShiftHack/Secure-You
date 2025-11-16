import { useState } from "react";
import { Shield, AlertCircle, Phone } from "lucide-react";
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
  onPress: () => void;
  isActive?: boolean;
}

export const SOSButton = ({ onPress, isActive = false }: SOSButtonProps) => {
  const [isPressing, setIsPressing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handlePress = () => {
    if (!isActive) {
      setShowConfirmation(true);
    } else {
      onPress();
    }
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    onPress();
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse ring */}
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

      {/* Confirmation Dialog */}
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
