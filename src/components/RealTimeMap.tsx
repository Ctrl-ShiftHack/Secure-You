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
      if (!window.google) return;

      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: 23.8103, lng: 90.4125 }, // Dhaka center
        zoom: 13,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;
      infoWindowRef.current = new google.maps.InfoWindow();
      setLoading(false);
    };

    const checkGoogle = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkGoogle);
        initMap();
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

    // Clear existing markers
    facilityMarkersRef.current.forEach(marker => marker.setMap(null));
    facilityMarkersRef.current = [];

    EMERGENCY_FACILITIES.forEach((facility) => {
      let icon: google.maps.Icon;
      let color: string;

      switch (facility.type) {
        case 'hospital':
          color = '#EF4444'; // Red
          icon = {
            path: 'M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm-1 15H9v-2h2v2zm0-4H9V7h2v6z',
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 1.5,
            anchor: new google.maps.Point(12, 24),
          } as google.maps.Icon;
          break;
        case 'police':
          color = '#3B82F6'; // Blue
          icon = {
            path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 1.5,
            anchor: new google.maps.Point(12, 24),
          } as google.maps.Icon;
          break;
        case 'fire':
          color: '#F97316'; // Orange
          icon = {
            path: 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z',
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 1.3,
            anchor: new google.maps.Point(12, 24),
          } as google.maps.Icon;
          break;
      }

      const marker = new google.maps.Marker({
        position: facility.location,
        map: mapInstanceRef.current!,
        icon,
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
      <div className="flex items-center justify-center bg-muted" style={{ height }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
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
