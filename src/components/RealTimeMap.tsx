import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, Hospital, Shield, Flame, Navigation, Loader2, X } from 'lucide-react';
import { 
  EMERGENCY_FACILITIES, 
  SAFETY_ZONES, 
  checkSafetyLevel, 
  findNearestFacilities,
  type EmergencyFacility,
  type SafetyZone
} from '@/lib/emergencyFacilities';

interface RealTimeMapProps {
  height?: string;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  showFacilities?: boolean;
  showSafetyZones?: boolean;
}

export const RealTimeMap: React.FC<RealTimeMapProps> = ({
  height = '100vh',
  onLocationUpdate,
  showFacilities = true,
  showSafetyZones = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const currentMarkerRef = useRef<google.maps.Marker | null>(null);
  const facilityMarkersRef = useRef<google.maps.Marker[]>([]);
  const safetyCirclesRef = useRef<google.maps.Circle[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSafetyZone, setCurrentSafetyZone] = useState<SafetyZone | null>(null);
  const [nearestFacilities, setNearestFacilities] = useState<{
    hospital?: EmergencyFacility;
    police?: EmergencyFacility;
    fire?: EmergencyFacility;
  }>({});
  const [showSafetyAlert, setShowSafetyAlert] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      try {
        if (!window.google || !window.google.maps) {
          console.error('Google Maps not loaded');
          return;
        }

        console.log('Initializing Google Map...');

        const map = new google.maps.Map(mapRef.current!, {
          center: { lat: 23.8103, lng: 90.4125 }, // Dhaka center
          zoom: 13,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          disableDefaultUI: false,
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();
        
        console.log('Map initialized successfully');
        setLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setLoading(false);
      }
    };

    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max

    const checkGoogle = setInterval(() => {
      attempts++;
      
      if (window.google && window.google.maps) {
        console.log('Google Maps API ready');
        clearInterval(checkGoogle);
        initMap();
      } else if (attempts >= maxAttempts) {
        console.error('Google Maps failed to load after 5 seconds');
        clearInterval(checkGoogle);
        setLoading(false);
      }
    }, 100);

    return () => {
      clearInterval(checkGoogle);
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Start live tracking
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

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

        // Check safety zone
        const safetyZone = checkSafetyLevel(newLocation.lat, newLocation.lng);
        if (safetyZone && safetyZone.safetyLevel !== 'safe') {
          setCurrentSafetyZone(safetyZone);
          setShowSafetyAlert(true);
        } else {
          setCurrentSafetyZone(null);
        }

        // Find nearest facilities
        const hospital = findNearestFacilities(newLocation.lat, newLocation.lng, 'hospital', 1)[0];
        const police = findNearestFacilities(newLocation.lat, newLocation.lng, 'police', 1)[0];
        const fire = findNearestFacilities(newLocation.lat, newLocation.lng, 'fire', 1)[0];
        
        setNearestFacilities({ hospital, police, fire });

        // Update map center
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(newLocation);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLoading(false);
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
  }, [onLocationUpdate]);

  // Update current location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !currentLocation) return;

    if (currentMarkerRef.current) {
      currentMarkerRef.current.setPosition(currentLocation);
    } else {
      currentMarkerRef.current = new google.maps.Marker({
        position: currentLocation,
        map: mapInstanceRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 4,
        },
        title: 'Your Location',
        zIndex: 10000,
        animation: google.maps.Animation.DROP
      });

      // Pulse circle
      new google.maps.Circle({
        strokeColor: '#3B82F6',
        strokeOpacity: 0.4,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.15,
        map: mapInstanceRef.current,
        center: currentLocation,
        radius: 100,
      });
    }
  }, [currentLocation]);

  // Render emergency facilities
  useEffect(() => {
    if (!mapInstanceRef.current || !showFacilities) return;

    console.log('Rendering emergency facilities...');

    // Clear existing markers
    facilityMarkersRef.current.forEach(marker => marker.setMap(null));
    facilityMarkersRef.current = [];

    EMERGENCY_FACILITIES.forEach((facility) => {
      let color: string;
      let symbol: string;

      switch (facility.type) {
        case 'hospital':
          color = '#EF4444'; // Red
          symbol = 'H';
          break;
        case 'police':
          color = '#3B82F6'; // Blue
          symbol = 'P';
          break;
        case 'fire':
          color = '#F97316'; // Orange
          symbol = 'F';
          break;
      }

      // Use simple circle markers instead of complex paths
      const marker = new google.maps.Marker({
        position: facility.location,
        map: mapInstanceRef.current!,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
        label: {
          text: symbol,
          color: '#FFFFFF',
          fontWeight: 'bold',
          fontSize: '12px'
        },
        title: facility.name,
        optimized: true
      });

      marker.addListener('click', () => {
        const content = `
          <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
              ${facility.name}
            </h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">
              ${facility.address}
            </p>
            ${facility.phone ? `
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #3b82f6;">
                📞 ${facility.phone}
              </p>
            ` : ''}
            ${facility.distance ? `
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #059669; font-weight: 500;">
                📍 ${facility.distance.toFixed(2)} km away
              </p>
            ` : ''}
          </div>
        `;
        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.open(mapInstanceRef.current!, marker);
      });

      facilityMarkersRef.current.push(marker);
    });
  }, [showFacilities]);

  // Render safety zones
  useEffect(() => {
    if (!mapInstanceRef.current || !showSafetyZones) return;

    // Clear existing circles
    safetyCirclesRef.current.forEach(circle => circle.setMap(null));
    safetyCirclesRef.current = [];

    SAFETY_ZONES.forEach((zone) => {
      let fillColor: string;
      let strokeColor: string;

      switch (zone.safetyLevel) {
        case 'safe':
          fillColor = '#10B981';
          strokeColor = '#059669';
          break;
        case 'caution':
          fillColor = '#F59E0B';
          strokeColor: '#D97706';
          break;
        case 'unsafe':
          fillColor = '#EF4444';
          strokeColor = '#DC2626';
          break;
        case 'dangerous':
          fillColor = '#7C2D12';
          strokeColor = '#991B1B';
          break;
      }

      const circle = new google.maps.Circle({
        strokeColor,
        strokeOpacity: 0.6,
        strokeWeight: 2,
        fillColor,
        fillOpacity: 0.2,
        map: mapInstanceRef.current!,
        center: zone.location,
        radius: zone.radius,
        clickable: true
      });

      circle.addListener('click', () => {
        const content = `
          <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif; max-width: 300px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
              ${zone.name}
            </h3>
            <div style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 8px; background: ${fillColor}; color: white;">
              ${zone.safetyLevel.toUpperCase()}
            </div>
            <p style="margin: 8px 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
              ${zone.description}
            </p>
            <p style="margin: 4px 0; font-size: 13px; color: #ef4444;">
              Crime Rate: ${zone.crimeRate}%
            </p>
            ${zone.lastIncident ? `
              <p style="margin: 4px 0; font-size: 13px; color: #f97316;">
                Last Incident: ${zone.lastIncident}
              </p>
            ` : ''}
            ${zone.tips && zone.tips.length > 0 ? `
              <div style="margin-top: 12px; padding: 8px; background: #fef3c7; border-radius: 6px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #92400e;">
                  ⚠️ Safety Tips:
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #78350f;">
                  ${zone.tips.map(tip => `<li style="margin: 2px 0;">${tip}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.setPosition(zone.location);
        infoWindowRef.current?.open(mapInstanceRef.current!);
      });

      safetyCirclesRef.current.push(circle);
    });
  }, [showSafetyZones]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10" style={{ height }}>
        <div className="text-center p-6 bg-card rounded-2xl shadow-lg">
          <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-primary" />
          <p className="text-base font-semibold text-foreground mb-1">Loading Map</p>
          <p className="text-xs text-muted-foreground">Initializing Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Safety Alert */}
      {showSafetyAlert && currentSafetyZone && (
        <div className={`absolute top-4 left-4 right-4 p-4 rounded-lg shadow-lg z-10 ${
          currentSafetyZone.safetyLevel === 'dangerous' ? 'bg-red-500' :
          currentSafetyZone.safetyLevel === 'unsafe' ? 'bg-orange-500' :
          'bg-yellow-500'
        } text-white`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">{currentSafetyZone.name}</h4>
              <p className="text-sm opacity-90 mb-2">{currentSafetyZone.description}</p>
              {currentSafetyZone.tips && (
                <ul className="text-xs space-y-1">
                  {currentSafetyZone.tips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => setShowSafetyAlert(false)}
              className="p-1 hover:bg-white/20 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Nearest Facilities Bar */}
      {currentLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 z-10">
          <div className="grid grid-cols-3 gap-3">
            {nearestFacilities.hospital && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Hospital className="w-4 h-4 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">Hospital</p>
                  <p className="text-xs text-gray-500">{nearestFacilities.hospital.distance?.toFixed(1)} km</p>
                </div>
              </div>
            )}
            {nearestFacilities.police && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">Police</p>
                  <p className="text-xs text-gray-500">{nearestFacilities.police.distance?.toFixed(1)} km</p>
                </div>
              </div>
            )}
            {nearestFacilities.fire && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Flame className="w-4 h-4 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">Fire</p>
                  <p className="text-xs text-gray-500">{nearestFacilities.fire.distance?.toFixed(1)} km</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Tracking Indicator */}
      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 z-10">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        <span className="text-xs font-semibold">LIVE</span>
      </div>
    </div>
  );
};

export default RealTimeMap;
