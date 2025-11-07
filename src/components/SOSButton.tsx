import { useState } from "react";
import { Shield, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

interface SOSButtonProps {
  onPress: () => void;
  isActive?: boolean;
}

export const SOSButton = ({ onPress, isActive = false }: SOSButtonProps) => {
  const [isPressing, setIsPressing] = useState(false);

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
        onClick={onPress}
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
    </div>
  );
};
