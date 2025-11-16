import { BellOff, Smartphone, BookOpen, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const Silent = () => {
  const [isSilentMode, setIsSilentMode] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(() => {
    try {
      return localStorage.getItem("secureyou_shake_enabled") === "true";
    } catch {
      return false;
    }
  });
  const [disguiseMode, setDisguiseMode] = useState(() => {
    try {
      return localStorage.getItem("secureyou_disguise_mode") === "true";
    } catch {
      return false;
    }
  });
  const [isTesting, setIsTesting] = useState(false);
  const [shakeDetected, setShakeDetected] = useState(false);
  const lastShakeTime = useRef<number>(0);
  const shakeThreshold = 25; // Sensitivity threshold
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleToggleSilent = () => {
    setIsSilentMode(!isSilentMode);
    toast({
      title: isSilentMode ? "Silent Mode Deactivated" : "Silent Mode Active",
      description: isSilentMode 
        ? "Emergency mode returned to normal" 
        : "You can now trigger SOS discreetly"
    });
  };

  const handleShakeDetected = () => {
    if (shakeEnabled && !isTesting) {
      toast({
        title: "🚨 SOS Triggered!",
        description: "Emergency alert is being sent to your contacts",
        variant: "destructive",
      });
      // In a real app, this would trigger the SOS action
      console.log("SOS triggered via shake");
    }
  };

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const { x, y, z } = acceleration;
    const accelerationMagnitude = Math.sqrt(
      (x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2
    );

    const currentTime = Date.now();
    if (accelerationMagnitude > shakeThreshold && currentTime - lastShakeTime.current > 1000) {
      lastShakeTime.current = currentTime;
      
      if (isTesting) {
        setShakeDetected(true);
        setTimeout(() => setShakeDetected(false), 3000);
      } else {
        handleShakeDetected();
      }
    }
  };

  const toggleShakeEnabled = (enabled: boolean) => {
    setShakeEnabled(enabled);
    try {
      localStorage.setItem("secureyou_shake_enabled", enabled.toString());
    } catch {}
    
    toast({
      title: enabled ? "Shake to Alert Enabled" : "Shake to Alert Disabled",
      description: enabled 
        ? "Shake your phone to trigger emergency SOS" 
        : "Shake detection has been turned off",
    });
  };

  const toggleDisguiseMode = (enabled: boolean) => {
    setDisguiseMode(enabled);
    try {
      localStorage.setItem("secureyou_disguise_mode", enabled.toString());
    } catch {}
    
    toast({
      title: enabled ? "Disguise Mode Enabled" : "Disguise Mode Disabled",
      description: enabled 
        ? "App will appear as a notes app to others" 
        : "App appearance returned to normal",
    });
  };

  const testShakeTrigger = async () => {
    setIsTesting(true);
    setShakeDetected(false);
    
    toast({
      title: "Test Mode Active",
      description: "Shake your device now to test the trigger",
    });

    // Auto-stop test after 10 seconds
    setTimeout(() => {
      setIsTesting(false);
      if (!shakeDetected) {
        toast({
          title: "Test Completed",
          description: "No shake detected. Try shaking more vigorously.",
          variant: "destructive",
        });
      }
    }, 10000);
  };

  // Request permission and setup shake detection
  useEffect(() => {
    if (!shakeEnabled && !isTesting) return;

    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === "granted") {
            window.addEventListener("devicemotion", handleDeviceMotion);
          } else {
            toast({
              title: "Permission Denied",
              description: "Please enable motion sensors in your browser settings",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error requesting device motion permission:", error);
        }
      } else {
        // For Android and other devices that don't require permission
        window.addEventListener("devicemotion", handleDeviceMotion);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener("devicemotion", handleDeviceMotion);
    };
  }, [shakeEnabled, isTesting]);

  useEffect(() => {
    if (shakeDetected) {
      toast({
        title: "✅ Shake Detected!",
        description: "Your shake trigger is working correctly",
      });
    }
  }, [shakeDetected]);

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
        >
          ←
        </Button>
        <h1 className="text-xl font-bold text-foreground">Silent Mode</h1>
        <div className="w-10" />
      </div>

      {/* Status Card */}
      <div className={`
        p-6 rounded-3xl mb-8 text-center shadow-medium transition-all
        ${isSilentMode 
          ? 'bg-warning/10 border-2 border-warning' 
          : 'bg-card border-2 border-border'
        }
      `}>
        <div className={`
          w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center
          ${isSilentMode ? 'bg-warning/20' : 'bg-muted'}
        `}>
          <BellOff className={`w-10 h-10 ${isSilentMode ? 'text-warning' : 'text-muted-foreground'}`} />
        </div>
        
        <h2 className={`text-2xl font-bold mb-2 ${isSilentMode ? 'text-warning' : 'text-foreground'}`}>
          {isSilentMode ? 'Silent Mode Active' : 'Silent Mode Inactive'}
        </h2>
        
        <p className="text-muted-foreground mb-6">
          {isSilentMode 
            ? 'Your emergency alerts will be sent discreetly' 
            : 'Activate to send alerts without obvious notifications'
          }
        </p>

        <div className="flex items-center justify-center gap-3">
          <span className="text-sm font-medium text-foreground">Enable Silent Mode</span>
          <Switch checked={isSilentMode} onCheckedChange={handleToggleSilent} />
        </div>
      </div>

      {/* How it works */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">How it works</h3>
        
        <div className={`bg-card p-4 rounded-2xl shadow-soft border-2 transition-all ${
          shakeEnabled ? 'border-primary' : 'border-border'
        }`}>
          <div className="flex gap-4 items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">Shake to Alert</h4>
              <p className="text-sm text-muted-foreground">
                Shake your phone to trigger SOS without touching the screen
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm font-medium text-foreground">
              {shakeEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <Switch checked={shakeEnabled} onCheckedChange={toggleShakeEnabled} />
          </div>
        </div>

        <div className={`bg-card p-4 rounded-2xl shadow-soft border-2 transition-all ${
          disguiseMode ? 'border-primary' : 'border-border'
        }`}>
          <div className="flex gap-4 items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">Disguise Mode</h4>
              <p className="text-sm text-muted-foreground">
                App appears as a notes app when others look at your screen
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm font-medium text-foreground">
              {disguiseMode ? 'Enabled' : 'Disabled'}
            </span>
            <Switch checked={disguiseMode} onCheckedChange={toggleDisguiseMode} />
          </div>
        </div>
      </div>

      {/* Test trigger */}
      <div className={`p-6 rounded-2xl text-center transition-all ${
        isTesting 
          ? 'bg-primary/10 border-2 border-primary' 
          : shakeDetected
          ? 'bg-success/10 border-2 border-success'
          : 'bg-accent border border-border'
      }`}>
        {shakeDetected ? (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <p className="font-semibold text-success text-lg">
              Shake Detected Successfully!
            </p>
            <p className="text-sm text-muted-foreground">
              Your shake trigger is working correctly
            </p>
          </div>
        ) : isTesting ? (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <p className="font-semibold text-primary text-lg">
              Testing... Shake Your Device Now!
            </p>
            <p className="text-sm text-muted-foreground">
              Shake vigorously for best results
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test the shake trigger to ensure it works when you need it
            </p>
            <Button
              variant="outline"
              className="rounded-full border-2 hover:bg-primary hover:text-white transition-all"
              onClick={testShakeTrigger}
              disabled={!shakeEnabled}
            >
              Test Shake Trigger
            </Button>
            {!shakeEnabled && (
              <p className="text-xs text-destructive">
                Enable "Shake to Alert" first to test
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Silent;
