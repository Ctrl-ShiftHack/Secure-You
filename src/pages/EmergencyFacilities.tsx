import { useEffect, useState } from "react";
import { MapPin, Phone, Navigation, Hospital, Shield, Flame, Loader2, AlertTriangle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SimpleMap } from "@/components/SimpleMap";
import {
  findEmergencyFacilities,
  Place,
  formatDistance,
  getDirections,
  Location,
} from "@/lib/googleMapsServices";

function EmergencyFacilities() {
  const { toast } = useToast();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<{
    hospitals: Place[];
    policeStations: Place[];
    fireStations: Place[];
  }>({ hospitals: [], policeStations: [], fireStations: [] });
  const [selectedFacility, setSelectedFacility] = useState<Place | null>(null);
  const [activeTab, setActiveTab] = useState<'hospitals' | 'police' | 'fire'>('hospitals');
  const [mapDestination, setMapDestination] = useState<Location | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation);
          await loadFacilities(newLocation);
        },
        (error) => {
          console.error('Location error:', error);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive",
          });
          setLoading(false);
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const loadFacilities = async (loc: Location) => {
    try {
      const results = await findEmergencyFacilities(loc, 10000); // 10km radius
      setFacilities(results);
    } catch (error) {
      console.error('Error loading facilities:', error);
      toast({
        title: "Loading Failed",
        description: "Could not load emergency facilities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetDirections = (facility: Place) => {
    setSelectedFacility(facility);
    setMapDestination(facility.location);
    toast({
      title: "Directions Loaded",
      description: `Showing route to ${facility.name}`,
    });
  };

  const handleCall = (facility: Place) => {
    if (facility.phoneNumber) {
      window.location.href = `tel:${facility.phoneNumber}`;
    } else {
      toast({
        title: "No Phone Number",
        description: "Phone number not available for this location",
        variant: "destructive",
      });
    }
  };

  const openInMaps = (facility: Place) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${location?.lat},${location?.lng}&destination=${facility.location.lat},${facility.location.lng}`,
      '_blank'
    );
  };

  const getActiveFacilities = () => {
    switch (activeTab) {
      case 'hospitals':
        return facilities.hospitals;
      case 'police':
        return facilities.policeStations;
      case 'fire':
        return facilities.fireStations;
      default:
        return [];
    }
  };

  const getMarkers = () => {
    const activeFacilities = getActiveFacilities();
    return activeFacilities.map((facility) => ({
      id: facility.id,
      position: facility.location,
      label: facility.name,
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Emergency Facilities</h1>
            <p className="text-sm text-muted-foreground">Find help nearby</p>
          </div>
          <Button
            onClick={getCurrentLocation}
            variant="ghost"
            size="sm"
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Finding nearby facilities...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Map */}
          {location && (
            <div className="p-4">
              <SimpleMap
                height="300px"
                showCurrentLocation={true}
                markers={getMarkers()}
              />
            </div>
          )}

          {/* Category Tabs */}
          <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'hospitals'
                  ? 'bg-red-500 text-white'
                  : 'bg-card text-muted-foreground border border-border'
              }`}
            >
              <Hospital className="w-4 h-4" />
              Hospitals ({facilities.hospitals.length})
            </button>
            <button
              onClick={() => setActiveTab('police')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'police'
                  ? 'bg-blue-500 text-white'
                  : 'bg-card text-muted-foreground border border-border'
              }`}
            >
              <Shield className="w-4 h-4" />
              Police ({facilities.policeStations.length})
            </button>
            <button
              onClick={() => setActiveTab('fire')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'fire'
                  ? 'bg-orange-500 text-white'
                  : 'bg-card text-muted-foreground border border-border'
              }`}
            >
              <Flame className="w-4 h-4" />
              Fire Stations ({facilities.fireStations.length})
            </button>
          </div>

          {/* Facilities List */}
          <div className="px-4 pb-4 space-y-3">
            {getActiveFacilities().length === 0 ? (
              <div className="bg-card rounded-2xl p-8 text-center border border-border">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold text-foreground mb-2">No Facilities Found</h3>
                <p className="text-sm text-muted-foreground">
                  No {activeTab === 'hospitals' ? 'hospitals' : activeTab === 'police' ? 'police stations' : 'fire stations'} found within 10km
                </p>
              </div>
            ) : (
              getActiveFacilities().map((facility) => (
                <div
                  key={facility.id}
                  className={`bg-card rounded-2xl p-4 border transition-all ${
                    selectedFacility?.id === facility.id
                      ? 'border-primary shadow-lg'
                      : 'border-border shadow-soft'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activeTab === 'hospitals'
                          ? 'bg-red-500/10 text-red-500'
                          : activeTab === 'police'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-orange-500/10 text-orange-500'
                      }`}
                    >
                      {activeTab === 'hospitals' && <Hospital className="w-6 h-6" />}
                      {activeTab === 'police' && <Shield className="w-6 h-6" />}
                      {activeTab === 'fire' && <Flame className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{facility.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {facility.address}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {facility.distance ? formatDistance(facility.distance) : 'N/A'}
                        </span>
                        {facility.rating && (
                          <span className="flex items-center gap-1">
                            ⭐ {facility.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleGetDirections(facility)}
                      variant={selectedFacility?.id === facility.id ? "default" : "outline"}
                      size="sm"
                      className="h-9 text-xs font-semibold"
                    >
                      <Navigation className="w-3 h-3 mr-1.5" />
                      Directions
                    </Button>
                    <Button
                      onClick={() => openInMaps(facility)}
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs font-semibold"
                    >
                      <MapPin className="w-3 h-3 mr-1.5" />
                      Open in Maps
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}

export default EmergencyFacilities;
