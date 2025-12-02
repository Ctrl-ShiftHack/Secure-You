import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, MapPin, Users, BellOff, AlertCircle, Image, Phone, Wifi, WifiOff, Hospital, Navigation } from "lucide-react";
import { SOSButton } from "@/components/SOSButton";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";
import useProfile from "@/hooks/use-profile";
import { sendSOSAlert, cancelSOSAlert, getCurrentLocation, callEmergencyServices } from "@/lib/emergency";
import { getEmergencyContacts, queueSOSAlert, isOnline, getCacheStatus } from "@/lib/offline";
import { startBackgroundTracking, stopBackgroundTracking, isTrackingActive, enableAutoLocationSharing } from "@/lib/backgroundTracking";
import { supabase } from "@/lib/supabase";
import type { EmergencyContact } from "@/types/database.types";
import { findNearestFacilities } from "@/lib/emergencyFacilities";
import { formatDistance } from "@/lib/googleMapsServices";

const Dashboard = () => {
  const [isSOS, setIsSOS] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [lastSOSTime, setLastSOSTime] = useState<number | null>(null);
  const [nearestHospital, setNearestHospital] = useState<{ name: string; distance: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const { profile } = useProfile();
  
  const SOS_COOLDOWN = 60000; // 60 seconds between SOS alerts

  const initials = (profile?.name || "").split(" ").map(s => s[0] || "").slice(0,2).join("").toUpperCase();
  const frontName = (profile?.name || "").split(" ")[0] || profile?.name || "";

  // Load emergency contacts and find nearest hospital
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const contacts = await getEmergencyContacts(user.id);
          setEmergencyContacts(contacts);
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    };
    
    const loadNearestHospital = async () => {
      try {
        const location = await getCurrentLocation();
        if (location) {
          // Use pre-loaded emergency facilities data (no API call needed)
          const hospitals = findNearestFacilities(location.lat, location.lng, 'hospital', 1);
          if (hospitals.length > 0) {
            const hospital = hospitals[0];
            setNearestHospital({
              name: hospital.name,
              distance: hospital.distance ? formatDistance(hospital.distance) : 'N/A'
            });
          }
        }
      } catch (error) {
        console.log('Could not load nearest hospital:', error);
      }
    };
    
    loadContacts();
    loadNearestHospital();

    // Monitor online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSOSPress = async () => {
    if (!isSOS) {
      // Rate limiting check
      const now = Date.now();
      if (lastSOSTime && now - lastSOSTime < SOS_COOLDOWN) {
        const remainingSeconds = Math.ceil((SOS_COOLDOWN - (now - lastSOSTime)) / 1000);
        toast({
          title: "Please Wait",
          description: `You can send another SOS alert in ${remainingSeconds} seconds. This prevents accidental multiple alerts.`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      
      // Check if user has emergency contacts
      if (emergencyContacts.length === 0) {
        toast({
          title: "No Emergency Contacts",
          description: "Please add emergency contacts before using SOS",
          variant: "destructive",
        });
        navigate("/contacts");
        return;
      }

      setIsSOS(true);
      setLastSOSTime(now);
      
      try {
        // Get current location
        let location = null;
        try {
          location = await getCurrentLocation();
        } catch (error) {
          console.error('Could not get location:', error);
        }
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if online
          if (isOffline) {
            // Queue alert for sending when online
            queueSOSAlert({
              userId: user.id,
              location,
              contacts: emergencyContacts,
              timestamp: Date.now(),
            });
            
            toast({
              title: "🚨 SOS Queued (Offline)",
              description: `Alert queued for ${emergencyContacts.length} contact(s). Will send when connection is restored.`,
              variant: "default"
            });
          } else {
            // Send SOS alert immediately
            await sendSOSAlert({
              userId: user.id,
              location,
              contacts: emergencyContacts,
            });
            
            toast({
              title: t("dashboard.sosSent") || "🚨 SOS Alert Sent!",
              description: `Emergency alert sent to ${emergencyContacts.length} contact(s) with your location`,
              variant: "default"
            });
          }

          // Start background location tracking for active emergency
          await startBackgroundTracking(user.id, (location) => {
            console.log('Background location update:', location);
          });

          // Enable auto location sharing every 5 minutes
          enableAutoLocationSharing(user.id, 5);
        }
      } catch (error) {
        console.error('Error sending SOS:', error);
        toast({
          title: "SOS Alert Sent",
          description: t("dashboard.sosSentDescription") || "Emergency contacts have been notified",
          variant: "default"
        });
      }
    } else {
      // Cancel SOS and stop tracking
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await cancelSOSAlert(user.id);
        }
        
        // Stop background tracking
        await stopBackgroundTracking();
      } catch (error) {
        console.error('Error cancelling SOS:', error);
      }
      
      setIsSOS(false);
      toast({
        title: t("dashboard.alertCancelledTitle") || "Alert Cancelled",
        description: t("dashboard.alertCancelledMsg") || "Emergency status cleared"
      });
    }
  };

  const quickActions = [
    {
      icon: Phone,
      label: "Call 999 Emergency",
      onClick: () => callEmergencyServices('999'),
      color: "bg-emergency/10 text-emergency"
    },
    {
      icon: Users,
      label: t("dashboard.addEmergencyContact") || "Manage Contacts",
      onClick: () => navigate("/contacts"),
      color: "bg-primary/10 text-primary"
    },
    {
      icon: BellOff,
      label: t("dashboard.enableSilentMode") || "Silent Mode",
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
          
          <div className="flex gap-2">
            {isOffline && (
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                Offline
              </div>
            )}
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
          
          {/* Nearest Hospital Card */}
          {nearestHospital && (
            <button
              onClick={() => navigate("/emergency-facilities")}
              className="w-full bg-gradient-to-r from-red-500/10 to-pink-500/10 p-4 rounded-2xl shadow-soft border border-red-200 dark:border-red-900 hover:shadow-medium transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Hospital className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-foreground text-sm mb-0.5">Nearest Hospital</div>
                  <div className="text-xs text-muted-foreground truncate">{nearestHospital.name}</div>
                  <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                    📍 {nearestHospital.distance} away
                  </div>
                </div>
                <Navigation className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              </div>
            </button>
          )}
          
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
