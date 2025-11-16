import { MapPin, RefreshCw, Share2, Navigation, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useProfile from "@/hooks/use-profile";
import { getCurrentLocation, getGoogleMapsLink, startLocationTracking, stopLocationTracking } from "@/lib/emergency";
import type { EmergencyContact } from "@/types/database.types";
import { supabase } from "@/lib/supabase";

function Map() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [address, setAddress] = useState<string>("Getting location...");

  useEffect(() => {
    // Get initial location
    getCurrentLocation()
      .then((loc) => {
        setLocation(loc);
        setLoading(false);
        reverseGeocode(loc.latitude, loc.longitude);
      })
      .catch((error) => {
        console.error('Location error:', error);
        toast({
          title: "Location Error",
          description: "Could not access your location. Please enable location services.",
          variant: "destructive",
        });
        setLoading(false);
        setAddress("Location unavailable");
      });
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
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

      const mapLink = getGoogleMapsLink(location);
      
      // In production, you would send SMS/email to contacts here
      console.log(`Sharing location with ${contacts.length} contacts:`, mapLink);

      toast({
        title: "Location Shared",
        description: `Your location has been shared with ${contacts.length} emergency contact(s)`,
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

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      reverseGeocode(loc.latitude, loc.longitude);
      toast({
        title: "Location Updated",
        description: "Your current location has been refreshed",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not refresh location",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = () => {
    if (location) {
      window.open(getGoogleMapsLink(location), '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">Live Location Tracking</h1>
        <p className="text-sm text-muted-foreground">Real-time location sharing</p>
      </header>

      {/* Map View */}
      <div className="relative h-[calc(100vh-180px)]">
        {/* Map placeholder or iframe */}
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          {loading ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Getting your location...</p>
            </div>
          ) : location ? (
            <>
              {/* Embedded Google Maps */}
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${location.latitude},${location.longitude}&zoom=15`}
                allowFullScreen
                title="Location Map"
                className="absolute inset-0"
              />
              {/* Fallback: Center marker */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <MapPin className="w-12 h-12 text-emergency drop-shadow-lg animate-bounce" />
              </div>
            </>
          ) : (
            <div className="text-center p-6">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-semibold mb-2">Location Unavailable</p>
              <p className="text-sm text-muted-foreground mb-4">
                Please enable location services to use this feature
              </p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Floating action buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-3">
          <Button
            size="icon"
            className="w-12 h-12 rounded-full bg-card shadow-medium hover:shadow-strong"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-5 h-5 text-foreground" />
          </Button>
          <Button
            size="icon"
            className="w-12 h-12 rounded-full bg-card shadow-medium hover:shadow-strong"
          >
            <Navigation className="w-5 h-5 text-foreground" />
          </Button>
        </div>

        {/* Share location button */}
        <div className="absolute bottom-6 left-6 right-6">
          <Button
            onClick={handleShareLocation}
            className="w-full h-12 rounded-full gradient-primary text-white font-semibold shadow-strong"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Live Location
          </Button>
        </div>
      </div>

      {/* Location info card */}
      <div className="px-6 py-4">
        <div className="bg-card p-4 rounded-2xl shadow-soft border border-border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">Location Active</h4>
              <p className="text-sm text-muted-foreground">
                {profile?.address || "Location not set"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: Just now
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default Map;
