import { MapPin, RefreshCw, Share2, Navigation } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Map = () => {
  const { toast } = useToast();

  const handleShareLocation = () => {
    toast({
      title: "Location Shared",
      description: "Your live location has been shared with emergency contacts"
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Location Updated",
      description: "Your current location has been refreshed"
    });
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
        {/* Map placeholder */}
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-ring">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <p className="text-foreground font-semibold mb-1">Your Current Location</p>
            <p className="text-sm text-muted-foreground">Mirpur, Dhaka, Bangladesh</p>
          </div>
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
                Road: 1, Building: 2, Mirpur 2, Dhaka
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
};

export default Map;
