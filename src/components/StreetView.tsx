import { useState, useEffect, useRef } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Location {
  lat: number;
  lng: number;
}

interface StreetViewComponentProps {
  location: Location;
  onClose?: () => void;
  height?: string;
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

export const StreetViewComponent: React.FC<StreetViewComponentProps> = ({
  location,
  onClose,
  height = '400px'
}) => {
  const [streetViewAvailable, setStreetViewAvailable] = useState<boolean | null>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (window.google && !panoramaRef.current) {
      const streetViewService = new google.maps.StreetViewService();
      streetViewService.getPanorama(
        { location, radius: 50 },
        (data, status) => {
          const isAvailable = status === google.maps.StreetViewStatus.OK;
          setStreetViewAvailable(isAvailable);
          
          if (isAvailable) {
            // Initialize Street View Panorama
            const panoramaDiv = document.getElementById('street-view');
            if (panoramaDiv) {
              panoramaRef.current = new google.maps.StreetViewPanorama(
                panoramaDiv,
                {
                  position: location,
                  pov: { heading: 0, pitch: 0 },
                  zoom: 1,
                  addressControl: false,
                  fullscreenControl: true,
                }
              );
            }
          }
        }
      );
    }
  }, [location]);

  if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-xl border-2 border-dashed border-border"
        style={{ height }}
      >
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Google Maps API key required for Street View
          </p>
        </div>
      </div>
    );
  }

  if (streetViewAvailable === false) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-xl border border-border"
        style={{ height }}
      >
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground mb-1">Street View Not Available</p>
          <p className="text-xs text-muted-foreground">
            No street view imagery available for this location
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <LoadScript googleMapsApiKey={apiKey}>
        <div style={{ width: '100%', height: '100%' }}>
          <div id="street-view" style={{ width: '100%', height: '100%' }} />
        </div>
      </LoadScript>
      
      {onClose && (
        <Button
          onClick={onClose}
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 rounded-full shadow-lg"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default StreetViewComponent;
