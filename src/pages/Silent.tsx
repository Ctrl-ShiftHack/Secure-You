import { BellOff, Smartphone, BookOpen } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const Silent = () => {
  const [isSilentMode, setIsSilentMode] = useState(false);
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
        
        <div className="bg-card p-4 rounded-2xl shadow-soft border border-border flex gap-4">
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

        <div className="bg-card p-4 rounded-2xl shadow-soft border border-border flex gap-4">
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
      </div>

      {/* Test trigger */}
      <div className="bg-accent p-6 rounded-2xl text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Test the shake trigger to ensure it works when you need it
        </p>
        <Button
          variant="outline"
          className="rounded-full border-2"
        >
          Test Shake Trigger
        </Button>
      </div>
    </div>
  );
};

export default Silent;
