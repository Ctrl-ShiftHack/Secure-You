import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

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
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter: Location = {
  lat: 23.8103, // Dhaka, Bangladesh
  lng: 90.4125
};

export const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  height = '400px',
  showCurrentLocation = true,
  markers = [],
  onLocationUpdate,
  enableLiveTracking = false,
  zoom = 15
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Get current location
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
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

        // Center map on current location
        if (map) {
          map.panTo(newLocation);
        }

        // Callback with location update
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
  }, [map, onLocationUpdate]);

  // Start live tracking
  useEffect(() => {
    if (enableLiveTracking && showCurrentLocation) {
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

          // Smoothly move map to new position
          if (map) {
            map.panTo(newLocation);
          }
        },
        (error) => {
          console.error('Live tracking error:', error);
          setError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      setWatchId(id);

      return () => {
        navigator.geolocation.clearWatch(id);
      };
    }
  }, [enableLiveTracking, showCurrentLocation, map, onLocationUpdate]);

  // Get initial location
  useEffect(() => {
    if (showCurrentLocation) {
      getCurrentPosition();
    } else {
      setLoading(false);
    }
  }, [showCurrentLocation, getCurrentPosition]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, [watchId]);

  // Center map on current location
  const handleCenterOnLocation = () => {
    if (currentLocation && map) {
      map.panTo(currentLocation);
      map.setZoom(zoom);
    }
  };

  if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-xl border-2 border-dashed border-border"
        style={{ height }}
      >
        <div className="text-center p-6 max-w-md">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-semibold text-foreground mb-2">Google Maps API Key Required</h3>
          <p className="text-sm text-muted-foreground mb-3">
            To enable live location tracking, please add your Google Maps API key to the .env file.
          </p>
          <code className="text-xs bg-muted-foreground/10 px-3 py-1 rounded">
            VITE_GOOGLE_MAPS_API_KEY=your-api-key
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={{ ...containerStyle, height }}
          center={currentLocation || defaultCenter}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {/* Current Location Marker */}
          {showCurrentLocation && currentLocation && (
            <>
              <Marker
                position={currentLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#3B82F6',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 3,
                }}
                title="Your Location"
              />
              
              {/* Accuracy Circle */}
              <Circle
                center={currentLocation}
                radius={50} // 50 meters accuracy circle
                options={{
                  fillColor: '#3B82F6',
                  fillOpacity: 0.1,
                  strokeColor: '#3B82F6',
                  strokeOpacity: 0.3,
                  strokeWeight: 1,
                }}
              />
            </>
          )}

          {/* Custom Markers */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              title={marker.label}
              onClick={() => setSelectedMarker(marker.id)}
            />
          ))}

          {/* Info Windows for Custom Markers */}
          {markers.map((marker) => (
            selectedMarker === marker.id && (
              <InfoWindow
                key={`info-${marker.id}`}
                position={marker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-2">
                  <p className="font-semibold text-sm">{marker.label}</p>
                </div>
              </InfoWindow>
            )
          ))}
        </GoogleMap>
      </LoadScript>

      {/* Loading Overlay */}
      {loading && showCurrentLocation && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Getting your location...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg text-sm shadow-lg">
          {error}
        </div>
      )}

      {/* Center on Location Button */}
      {showCurrentLocation && currentLocation && !loading && (
        <button
          onClick={handleCenterOnLocation}
          className="absolute bottom-4 right-4 bg-background shadow-lg rounded-full p-3 hover:bg-accent transition-colors"
          title="Center on my location"
        >
          <Navigation className="w-5 h-5 text-foreground" />
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

export default GoogleMapComponent;
