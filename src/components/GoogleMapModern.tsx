import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Loader2, Crosshair } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
}

interface MarkerData {
  id: string;
  position: Location;
  label: string;
  icon?: string;
}

interface GoogleMapModernProps {
  height?: string;
  showCurrentLocation?: boolean;
  markers?: MarkerData[];
  onLocationUpdate?: (location: Location) => void;
  enableLiveTracking?: boolean;
  zoom?: number;
  showTraffic?: boolean;
  destination?: Location;
}

export const GoogleMapModern: React.FC<GoogleMapModernProps> = ({
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
  const markersRef = useRef<google.maps.Marker[]>([]);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        // Wait for Google Maps to load
        if (!window.google) {
          throw new Error('Google Maps not loaded');
        }

        // Default center (Dhaka, Bangladesh)
        const defaultCenter = { lat: 23.8103, lng: 90.4125 };

        // Create map
        const map = new google.maps.Map(mapRef.current!, {
          center: defaultCenter,
          zoom,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });

        mapInstanceRef.current = map;
        setMapReady(true);
        setLoading(false);

      } catch (err: any) {
        console.error('Error initializing map:', err);
        setError(err.message || 'Failed to load map');
        setLoading(false);
      }
    };

    // Wait for Google Maps to be available
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkGoogleMaps);
        initMap();
      }
    }, 100);

    return () => {
      clearInterval(checkGoogleMaps);
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [zoom]);

  // Get current location
  useEffect(() => {
    if (!mapReady || !showCurrentLocation) return;

    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation not supported');
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

          // Center map on location
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo(newLocation);
          }

          // Callback
          if (onLocationUpdate) {
            onLocationUpdate(newLocation);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };

    getCurrentLocation();
  }, [mapReady, showCurrentLocation, onLocationUpdate]);

  // Update current location marker
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !currentLocation) return;

    // Remove old marker
    if (currentMarkerRef.current) {
      currentMarkerRef.current.setMap(null);
    }

    // Create new marker for current location
    const marker = new google.maps.Marker({
      position: currentLocation,
      map: mapInstanceRef.current,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 4,
      },
      title: 'Your Location',
      zIndex: 1000
    });

    // Add accuracy circle
    new google.maps.Circle({
      strokeColor: '#3B82F6',
      strokeOpacity: 0.3,
      strokeWeight: 1,
      fillColor: '#3B82F6',
      fillOpacity: 0.1,
      map: mapInstanceRef.current,
      center: currentLocation,
      radius: 50, // 50 meters accuracy
    });

    currentMarkerRef.current = marker;
  }, [mapReady, currentLocation]);

  // Live tracking
  useEffect(() => {
    if (!enableLiveTracking || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setCurrentLocation(newLocation);

        if (onLocationUpdate) {
          onLocationUpdate(newLocation);
        }

        // Update map position smoothly
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(newLocation);
        }
      },
      (error) => {
        console.error('Error watching location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enableLiveTracking, onLocationUpdate]);

  // Render custom markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: mapInstanceRef.current!,
        title: markerData.label,
        label: {
          text: markerData.label.charAt(0),
          color: '#FFFFFF',
          fontWeight: 'bold'
        },
        icon: markerData.icon ? {
          url: markerData.icon,
          scaledSize: new google.maps.Size(40, 40)
        } : undefined
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 8px; font-family: sans-serif;">
          <strong>${markerData.label}</strong>
        </div>`
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current!, marker);
      });

      markersRef.current.push(marker);
    });
  }, [mapReady, markers]);

  // Traffic layer
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

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
  }, [mapReady, showTraffic]);

  // Directions
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !destination || !currentLocation) return;

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 5,
        }
      });
    }

    directionsRendererRef.current.setMap(mapInstanceRef.current);

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: currentLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRendererRef.current!.setDirections(result);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );

    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [mapReady, destination, currentLocation]);

  // Center on location
  const handleCenterOnLocation = useCallback(() => {
    if (currentLocation && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(currentLocation);
      mapInstanceRef.current.setZoom(16);
    }
  }, [currentLocation]);

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-destructive/10 rounded-xl border border-destructive/20"
        style={{ height }}
      >
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-destructive" />
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg" style={{ height }}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Center on Location Button */}
      {showCurrentLocation && currentLocation && !loading && (
        <button
          onClick={handleCenterOnLocation}
          className="absolute bottom-4 right-4 bg-background shadow-lg rounded-full p-3 hover:bg-accent transition-colors border border-border"
          title="Center on my location"
        >
          <Crosshair className="w-5 h-5 text-foreground" />
        </button>
      )}

      {/* Live Tracking Indicator */}
      {enableLiveTracking && currentLocation && (
        <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Live Tracking
        </div>
      )}
    </div>
  );
};

export default GoogleMapModern;
