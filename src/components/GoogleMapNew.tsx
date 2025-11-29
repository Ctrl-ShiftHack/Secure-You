import { useEffect, useState, useCallback, useRef } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';

interface Location {
  lat: number;
  lng: number;
}

interface GoogleMapComponentProps {
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

const defaultCenter: Location = {
  lat: 23.8103,
  lng: 90.4125
};

export const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  height = '400px',
  showCurrentLocation = true,
  markers = [],
  onLocationUpdate,
  enableLiveTracking = false,
  zoom = 15,
  showTraffic = false,
  destination
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const currentMarkerRef = useRef<google.maps.Marker | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      const map = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;
      setLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
      setLoading(false);
    }
  }, [isLoaded, zoom]);

  // Get current location
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(newLocation);
        setError(null);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(newLocation);
        }

        if (onLocationUpdate) {
          onLocationUpdate(newLocation);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [onLocationUpdate]);

  // Initialize current location
  useEffect(() => {
    if (showCurrentLocation && isLoaded) {
      getCurrentPosition();
    }
  }, [showCurrentLocation, isLoaded, getCurrentPosition]);

  // Update current location marker
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !currentLocation) return;

    if (currentMarkerRef.current) {
      currentMarkerRef.current.setPosition(currentLocation);
    } else {
      currentMarkerRef.current = new google.maps.Marker({
        position: currentLocation,
        map: mapInstanceRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
        title: 'Your Location',
      });
    }
  }, [isLoaded, currentLocation]);

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

  // Update markers
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: mapInstanceRef.current,
        title: markerData.label,
        label: markerData.label,
      });
      markersRef.current.push(marker);
    });
  }, [isLoaded, markers]);

  // Traffic layer
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    if (showTraffic) {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new google.maps.TrafficLayer();
      }
      trafficLayerRef.current.setMap(mapInstanceRef.current);
    } else {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    }
  }, [isLoaded, showTraffic]);

  // Directions
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !currentLocation || !destination) {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      return;
    }

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 5,
        },
      });
    }

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: currentLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current?.setDirections(result);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  }, [isLoaded, currentLocation, destination]);

  // Center on location
  const handleCenterOnLocation = () => {
    if (currentLocation && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(currentLocation);
      mapInstanceRef.current.setZoom(zoom);
    }
  };

  if (loadError) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-xl border-2 border-dashed border-border"
        style={{ height }}
      >
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-destructive" />
          <h3 className="font-semibold text-foreground mb-2">Map Loading Error</h3>
          <p className="text-sm text-muted-foreground">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded || loading) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-xl"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} className="rounded-xl overflow-hidden" />
      
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg text-sm shadow-lg z-10">
          {error}
        </div>
      )}
      
      {showCurrentLocation && currentLocation && (
        <button
          onClick={handleCenterOnLocation}
          className="absolute bottom-4 right-4 bg-background border-2 border-border p-3 rounded-full shadow-lg hover:bg-accent transition-colors z-10"
          title="Center on my location"
        >
          <Navigation className="w-5 h-5 text-foreground" />
        </button>
      )}
    </div>
  );
};
