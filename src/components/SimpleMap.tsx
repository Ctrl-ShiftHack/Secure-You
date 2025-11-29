import { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface Location {
  lat: number;
  lng: number;
}

interface SimpleMapProps {
  height?: string;
  showCurrentLocation?: boolean;
  markers?: Array<{
    id: string;
    position: Location;
    label: string;
    icon?: string;
  }>;
  onLocationUpdate?: (location: Location) => void;
  enableLiveTracking?: boolean;
  zoom?: number;
  showTraffic?: boolean;
  destination?: Location;
}

export const SimpleMap: React.FC<SimpleMapProps> = ({
  height = '400px',
  showCurrentLocation = true,
  markers = [],
  onLocationUpdate,
  enableLiveTracking = false,
}) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const mapFrameRef = useRef<HTMLIFrameElement>(null);

  // Get current location
  useEffect(() => {
    if (!showCurrentLocation) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(newLocation);
        setLoading(false);
        setError(null);

        if (onLocationUpdate) {
          onLocationUpdate(newLocation);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setError(error.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [showCurrentLocation, onLocationUpdate]);

  // Live tracking
  useEffect(() => {
    if (!enableLiveTracking || !navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(newLocation);
        
        if (onLocationUpdate) {
          onLocationUpdate(newLocation);
        }
      },
      (error) => {
        console.error('Error watching location:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
      }
    );

    setWatchId(id);

    return () => {
      if (id) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, [enableLiveTracking, onLocationUpdate]);

  const openInGoogleMaps = () => {
    if (currentLocation) {
      const url = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
      window.open(url, '_blank');
    }
  };

  const openInOSM = () => {
    if (currentLocation) {
      const url = `https://www.openstreetmap.org/?mlat=${currentLocation.lat}&mlon=${currentLocation.lng}#map=15/${currentLocation.lat}/${currentLocation.lng}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-xl"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Getting your location...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-xl border-2 border-dashed border-border"
        style={{ height }}
      >
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
          <h3 className="font-semibold text-foreground mb-2">Location Error</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-border" style={{ height }}>
      {currentLocation && (
        <>
          {/* OpenStreetMap iframe as fallback */}
          <iframe
            ref={mapFrameRef}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.lng - 0.01},${currentLocation.lat - 0.01},${currentLocation.lng + 0.01},${currentLocation.lat + 0.01}&layer=mapnik&marker=${currentLocation.lat},${currentLocation.lng}`}
            style={{ width: '100%', height: '100%', border: 0 }}
            title="Map"
          />
          
          {/* Overlay with controls */}
          <div className="absolute top-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Your Location</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
                {enableLiveTracking && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-muted-foreground">Live tracking active</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openInGoogleMaps}
                  title="Open in Google Maps"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openInOSM}
                  title="View full map"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {markers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Contacts on Map:</p>
                <div className="flex flex-wrap gap-2">
                  {markers.slice(0, 3).map(marker => (
                    <span key={marker.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {marker.label}
                    </span>
                  ))}
                  {markers.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{markers.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom info banner */}
          <div className="absolute bottom-4 left-4 right-4 bg-yellow-500/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <p className="text-xs text-yellow-900 font-medium">
              ⚠️ Google Maps API not configured. Using OpenStreetMap fallback.
            </p>
            <p className="text-xs text-yellow-900 mt-1">
              To enable full features, configure Google Maps API key in Google Cloud Console.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
