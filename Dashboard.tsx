import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, MapPin, Users, BellOff, AlertCircle, Image } from "lucide-react";
import { SOSButton } from "@/components/SOSButton";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";
import useProfile from "@/hooks/use-profile";

const Dashboard = () => {
  const [isSOS, setIsSOS] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const { profile } = useProfile();

  const initials = (profile?.name || "").split(" ").map(s => s[0] || "").slice(0,2).join("").toUpperCase();
  const frontName = (profile?.name || "").split(" ")[0] || profile?.name || "";

  const handleSOSPress = () => {
    if (!isSOS) {
      setIsSOS(true);
      toast({
            title: t("dashboard.sosSent") || "SOS Alert Sent!",
            description: t("dashboard.sosSentDescription") || "Emergency contacts have been notified",
        variant: "default"
      });
      
      // Auto reset after 10 seconds for demo
      setTimeout(() => setIsSOS(false), 10000);
    } else {
      setIsSOS(false);
      toast({
        title: t("dashboard.alertCancelledTitle") || "Alert Cancelled",
        description: t("dashboard.alertCancelledMsg") || "Emergency status cleared"
      });
    }
  };

  const quickActions = [
    {
      icon: Users,
      label: t("dashboard.addEmergencyContact") || "Add Emergency Contact",
      onClick: () => navigate("/contacts"),
      color: "bg-primary/10 text-primary"
    },
    {
      icon: BellOff,
      label: t("dashboard.enableSilentMode") || "Enable Silent Mode",
      onClick: () => navigate("/silent"),
      color: "bg-warning/10 text-warning"
    },
    {
      icon: MapPin,
      label: t("dashboard.liveLocation") || "Live Location",
      onClick: () => navigate("/map"),
      color: "bg-info/10 text-info"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft px-6 py-8 pb-28 relative overflow-visible">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{initials}</span>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{frontName}</h2>
              <p className="text-xs text-muted-foreground">{profile?.address?.split(",")[0] ?? "Mirpur, Dhaka"}</p>
            </div>
          </div>
          
          <div className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${isSOS 
              ? 'bg-emergency/10 text-emergency' 
              : 'bg-success/10 text-success'
            }
          `}>
            {isSOS ? 'SOS SENT' : 'Safe'}
          </div>
        </div>
        {/* SOS Button positioned relative to header so it scrolls with the page */}
        <div className="absolute left-1/2 -translate-x-1/2 sm:-bottom-16 md:-bottom-20 lg:-bottom-24 z-20">
          <SOSButton onPress={handleSOSPress} isActive={isSOS} />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pt-8 pb-8">
        {/* spacer to account for SOS overlap */}
        <div className="h-20 md:h-24 lg:h-28" />
        {/* Greeting */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">{t("dashboard.greetingTitle")}</h1>
          <p className="text-muted-foreground">{t("dashboard.greetingSubtitle")}</p>
        </div>

        

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Quick Actions
          </h3>
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="w-full bg-card p-4 rounded-2xl shadow-soft border border-border hover:shadow-medium transition-all flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Map Preview Card */}
        <div className="mt-6 bg-card p-4 rounded-2xl shadow-soft border border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-foreground">{t("dashboard.currentLocation")}</h4>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/map")}
              className="text-primary"
            >
              View Map
            </Button>
          </div>
          <div className="h-32 bg-muted rounded-xl flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
            <p className="text-sm text-muted-foreground mt-2">{t("dashboard.mirpurDhaka")}</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
