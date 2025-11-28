import { MapPin, RefreshCw, Share2, Navigation, Loader2, Users, Send, Hospital, Shield, Car } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useProfile from "@/hooks/use-profile";
import { getCurrentLocation, getGoogleMapsLink } from "@/lib/emergency";
import { supabase } from "@/lib/supabase";
import GoogleMapComponent from "@/components/GoogleMap";
import { reverseGeocode } from "@/lib/googleMapsServices";

function Map() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [address, setAddress] = useState<string>("Getting location...");
  const [liveTracking, setLiveTracking] = useState(false);
  const [contactsCount, setContactsCount] = useState(0);
  const [showTraffic, setShowTraffic] = useState(false);

  // Get emergency contacts count
  useEffect(() => {
    const fetchContacts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: contacts } = await supabase
          .from('emergency_contacts')
          .select('id')
          .eq('user_id', user.id);
        
        setContactsCount(contacts?.length || 0);
      }
    };
    fetchContacts();
  }, []);

  // Reverse geocode location to address using Google Geocoding API
  const reverseGeocodeLocation = async (lat: number, lng: number) => {
    try {
      const address = await reverseGeocode({ lat, lng });
      setAddress(address);
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to OpenStreetMap if Google fails
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
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

      // Get emergency contacts
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

      // Create Google Maps link
      const mapLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(mapLink);
      
      // In production, you would send SMS/email to contacts here
      console.log(`Sharing location with ${contacts.length} contacts:`, mapLink);

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

  const toggleLiveTracking = () => {
    setLiveTracking(!liveTracking);
    toast({
      title: liveTracking ? "Live Tracking Stopped" : "Live Tracking Started",
      description: liveTracking 
        ? "Your location will no longer update automatically" 
        : "Your location will update in real-time",
    });
  };

  const openInMaps = () => {
    if (location) {
      window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Live Location</h1>
            <p className="text-sm text-muted-foreground">Real-time tracking & sharing</p>
          </div>
          {contactsCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{contactsCount} contacts</span>
            </div>
          )}
        </div>
      </header>

      {/* Google Maps Component */}
      <div className="p-4">
        <GoogleMapComponent
          height="calc(100vh - 450px)"
          showCurrentLocation={true}
          onLocationUpdate={handleLocationUpdate}
          enableLiveTracking={liveTracking}
          showTraffic={showTraffic}
          zoom={16}
        />
      </div>

      {/* Location Info Card */}
      {location && (
        <div className="px-6 py-4 space-y-3">
          <div className="bg-card p-4 rounded-2xl shadow-soft border border-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1">Current Location</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {address}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Button
              onClick={toggleLiveTracking}
              variant={liveTracking ? "default" : "outline"}
              className="h-11 rounded-xl font-semibold text-xs"
            >
              {liveTracking ? (
                <>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1.5"></span>
                  Tracking
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-1.5" />
                  Track
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowTraffic(!showTraffic)}
              variant={showTraffic ? "default" : "outline"}
              className="h-11 rounded-xl font-semibold text-xs"
            >
              <Car className="w-4 h-4 mr-1.5" />
              {showTraffic ? 'Hide' : 'Show'} Traffic
            </Button>
            <Button
              onClick={openInMaps}
              variant="outline"
              className="h-11 rounded-xl font-semibold text-xs"
            >
              <MapPin className="w-4 h-4 mr-1.5" />
              Maps
            </Button>
          </div>

          {/* Quick Access Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button
              onClick={() => navigate("/emergency-facilities")}
              variant="outline"
              className="h-11 rounded-xl font-semibold justify-start"
            >
              <Hospital className="w-4 h-4 mr-2" />
              <span className="text-xs">Find Hospitals</span>
            </Button>
            <Button
              onClick={() => navigate("/emergency-facilities")}
              variant="outline"
              className="h-11 rounded-xl font-semibold justify-start"
            >
              <Shield className="w-4 h-4 mr-2" />
              <span className="text-xs">Find Police</span>
            </Button>
          </div>

          {/* Share Location Button */}
          <Button
            onClick={handleShareLocation}
            disabled={sharing || !location}
            className="w-full h-12 rounded-xl gradient-primary text-white font-semibold shadow-medium"
          >
            {sharing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Share Location with Contacts
              </>
            )}
          </Button>

          {contactsCount === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Add emergency contacts to share your location with them.
                  <button 
                    onClick={() => navigate("/contacts")}
                    className="font-semibold underline ml-1"
                  >
                    Add Contacts
                  </button>
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default Map;
