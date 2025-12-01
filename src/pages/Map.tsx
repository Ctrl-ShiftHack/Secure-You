import { MapPin, Share2, Send, Loader2, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useProfile from "@/hooks/use-profile";
import { supabase } from "@/lib/supabase";
import RealTimeMap from "@/components/RealTimeMap";
import { reverseGeocode, waitForGoogleMaps } from "@/lib/googleMapsModern";
import type { EmergencyContact } from "@/types/database.types";

function Map() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sharing, setSharing] = useState(false);
  const [address, setAddress] = useState<string>("Getting location...");
  const [contactsCount, setContactsCount] = useState(0);

  // Get emergency contacts count
  useEffect(() => {
    const fetchContacts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: contacts } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id);
        
        setContactsCount(contacts?.length || 0);
      }
    };
    fetchContacts();
  }, []);

  // Reverse geocode location to address
  const reverseGeocodeLocation = async (lat: number, lng: number) => {
    try {
      await waitForGoogleMaps(5000);
      const address = await reverseGeocode({ lat, lng });
      setAddress(address);
    } catch (error) {
      console.error('Geocoding error:', error);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          {
            headers: {
              'User-Agent': 'SecureYou Safety App'
            }
          }
        );
        const data = await response.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      } catch (fallbackError) {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    }
  };

  // Handle location update from map
  const handleLocationUpdate = (newLocation: { lat: number; lng: number }) => {
    setLocation(newLocation);
    reverseGeocodeLocation(newLocation.lat, newLocation.lng);
  };

  const handleShareLocation = async () => {
    if (!location) {
      toast({
        title: "Location Error",
        description: "Cannot share location - location not available",
        variant: "destructive",
      });
      return;
    }

    setSharing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not Logged In",
          description: "Please log in to share your location",
          variant: "destructive",
        });
        return;
      }

      const { data: contacts } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id);

      if (!contacts || contacts.length === 0) {
        toast({
          title: "No Contacts",
          description: "Add emergency contacts to share your location",
          variant: "destructive",
        });
        navigate("/contacts");
        return;
      }

      const mapLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      await navigator.clipboard.writeText(mapLink);

      toast({
        title: "Location Link Copied!",
        description: `Share this link with ${contacts.length} emergency contact(s)`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error sharing location:', error);
      toast({
        title: "Share Failed",
        description: "Could not share location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Real-Time Map - Full Screen */}
      <RealTimeMap
        height="calc(100vh - 140px)"
        onLocationUpdate={handleLocationUpdate}
        showFacilities={true}
        showSafetyZones={true}
      />

      {/* Bottom Action Bar */}
      <div className="bg-card border-t border-border p-4 space-y-3">
        {/* Location Info */}
        {location && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">Current Location</p>
              <p className="text-xs text-muted-foreground truncate">{address}</p>
            </div>
            {contactsCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" />
                <span>{contactsCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Share Button */}
        <Button
          onClick={handleShareLocation}
          disabled={sharing || !location}
          className="w-full h-12 rounded-xl gradient-primary text-white font-semibold shadow-md"
        >
          {sharing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sharing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Share Location
            </>
          )}
        </Button>

        {contactsCount === 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
              <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Add emergency contacts to share your location.
                <button 
                  onClick={() => navigate("/contacts")}
                  className="font-semibold underline ml-1"
                >
                  Add Now
                </button>
              </span>
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default Map;
