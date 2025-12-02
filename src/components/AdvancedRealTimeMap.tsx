import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, Hospital, Shield, Flame, Navigation, Loader2, X, MapPin, Phone, Clock, TrendingUp, Users, Zap } from 'lucide-react';
import { 
  EMERGENCY_FACILITIES, 
  SAFETY_ZONES, 
  checkSafetyLevel, 
  findNearestFacilities,
  type EmergencyFacility,
  type SafetyZone
} from '@/lib/emergencyFacilities';
import { Button } from '@/components/ui/button';

interface AdvancedRealTimeMapProps {
  height?: string;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  showFacilities?: boolean;
  showSafetyZones?: boolean;
  showTraffic?: boolean;
}

export const AdvancedRealTimeMap: React.FC<AdvancedRealTimeMapProps> = ({
  height = '100vh',
  onLocationUpdate,
  showFacilities = true,
  showSafetyZones = true,
  showTraffic = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const currentMarkerRef = useRef<google.maps.Marker | null>(null);
  const accuracyCircleRef = useRef<google.maps.Circle | null>(null);
  const facilityMarkersRef = useRef<google.maps.Marker[]>([]);
  const safetyCirclesRef = useRef<google.maps.Circle[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [currentSafetyZone, setCurrentSafetyZone] = useState<SafetyZone | null>(null);
  const [nearestFacilities, setNearestFacilities] = useState<{
    hospital?: EmergencyFacility;
    police?: EmergencyFacility;
    fire?: EmergencyFacility;
  }>({});
  const [showSafetyAlert, setShowSafetyAlert] = useState(false);
  const [trafficEnabled, setTrafficEnabled] = useState(showTraffic);
  const [selectedFacility, setSelectedFacility] = useState<EmergencyFacility | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);

  // Wait for Google Maps to load
  const waitForGoogleMaps = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 100; // 10 seconds
      
      const checkInterval = setInterval(() => {
        attempts++;
        
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          reject(new Error('Google Maps failed to load'));
        }
      }, 100);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        await waitForGoogleMaps();
        
        console.log('✅ Google Maps API loaded successfully');

        const mapOptions: google.maps.MapOptions = {
          center: { lat: 23.8103, lng: 90.4125 }, // Dhaka center
          zoom: 15,
          zoomControl: true,
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
          },
          scaleControl: true,
          streetViewControl: true,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          },
          rotateControl: true,
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
          },
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'simplified' }]
            }
          ],
          gestureHandling: 'greedy',
          clickableIcons: true
        };

        const map = new google.maps.Map(mapRef.current!, mapOptions);
        mapInstanceRef.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();

        // Initialize traffic layer
        trafficLayerRef.current = new google.maps.TrafficLayer();
        if (trafficEnabled) {
          trafficLayerRef.current.setMap(map);
        }

        console.log('✅ Map initialized successfully');
        setLoading(false);
        setMapError(null);
      } catch (error) {
        console.error('❌ Error initializing map:', error);
        setMapError(error instanceof Error ? error.message : 'Failed to initialize map');
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [waitForGoogleMaps, trafficEnabled]);

  // Start live tracking with high accuracy
  useEffect(() => {
    if (!mapInstanceRef.current || !navigator.geolocation) return;

    console.log('🎯 Starting live location tracking...');

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setCurrentLocation(newLocation);
        setAccuracy(position.coords.accuracy);
        setSpeed(position.coords.speed || 0);
        setHeading(position.coords.heading || 0);
        
        if (onLocationUpdate) {
          onLocationUpdate(newLocation);
        }

        // Update current marker
        if (currentMarkerRef.current) {
          currentMarkerRef.current.setPosition(newLocation);
        } else {
          // Create pulsing marker
          currentMarkerRef.current = new google.maps.Marker({
            position: newLocation,
            map: mapInstanceRef.current!,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 4,
            },
            zIndex: 1000,
            title: 'Your Location'
          });
        }

        // Update accuracy circle
        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setCenter(newLocation);
          accuracyCircleRef.current.setRadius(position.coords.accuracy);
        } else {
          accuracyCircleRef.current = new google.maps.Circle({
            center: newLocation,
            radius: position.coords.accuracy,
            map: mapInstanceRef.current!,
            fillColor: '#4285F4',
            fillOpacity: 0.1,
            strokeColor: '#4285F4',
            strokeOpacity: 0.3,
            strokeWeight: 1,
            zIndex: 999
          });
        }

        // Center map on first location
        if (!watchIdRef.current) {
          mapInstanceRef.current?.panTo(newLocation);
        }

        // Check safety zone
        const safetyZone = checkSafetyLevel(newLocation.lat, newLocation.lng);
        if (safetyZone && safetyZone.safetyLevel !== 'safe') {
          setCurrentSafetyZone(safetyZone);
          if (!showSafetyAlert) {
            setShowSafetyAlert(true);
          }
        } else {
          setCurrentSafetyZone(null);
          setShowSafetyAlert(false);
        }

        // Find nearest facilities
        const hospital = findNearestFacilities(newLocation.lat, newLocation.lng, 'hospital', 1)[0];
        const police = findNearestFacilities(newLocation.lat, newLocation.lng, 'police', 1)[0];
        const fire = findNearestFacilities(newLocation.lat, newLocation.lng, 'fire', 1)[0];
        
        setNearestFacilities({ hospital, police, fire });

        console.log('📍 Location updated:', newLocation);
      },
      (error) => {
        console.error('❌ Location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [onLocationUpdate, showSafetyAlert]);

  // Render emergency facilities
  useEffect(() => {
    if (!mapInstanceRef.current || !showFacilities) return;

    console.log('🏥 Rendering emergency facilities...');

    // Clear existing markers
    facilityMarkersRef.current.forEach(marker => marker.setMap(null));
    facilityMarkersRef.current = [];

    EMERGENCY_FACILITIES.forEach((facility) => {
      let color: string;
      let symbol: string;

      switch (facility.type) {
        case 'hospital':
          color = '#EF4444';
          symbol = 'H';
          break;
        case 'police':
          color = '#3B82F6';
          symbol = 'P';
          break;
        case 'fire':
          color = '#F97316';
          symbol = 'F';
          break;
      }

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
        setSelectedFacility(facility);
        
        const content = `
          <div style="padding: 12px; max-width: 250px;">
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: ${color};">
              ${facility.name}
            </h3>
            <p style="margin: 4px 0; font-size: 13px;">
              <strong>Type:</strong> ${facility.type.charAt(0).toUpperCase() + facility.type.slice(1)}
            </p>
            ${facility.address ? `<p style="margin: 4px 0; font-size: 13px;"><strong>📍</strong> ${facility.address}</p>` : ''}
            ${facility.phone ? `<p style="margin: 4px 0; font-size: 13px;"><strong>📞</strong> <a href="tel:${facility.phone}">${facility.phone}</a></p>` : ''}
            ${facility.distance ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Distance:</strong> ${facility.distance.toFixed(2)} km</p>` : ''}
            <button 
              onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${facility.location.lat},${facility.location.lng}', '_blank')"
              style="margin-top: 8px; padding: 6px 12px; background: ${color}; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; width: 100%;"
            >
              Get Directions
            </button>
          </div>
        `;

        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.open(mapInstanceRef.current!, marker);
      });

      facilityMarkersRef.current.push(marker);
    });

    console.log(`✅ Rendered ${EMERGENCY_FACILITIES.length} facilities`);
  }, [showFacilities]);

  // Render safety zones
  useEffect(() => {
    if (!mapInstanceRef.current || !showSafetyZones) return;

    console.log('⚠️ Rendering safety zones...');

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
          strokeColor = '#D97706';
          break;
        case 'unsafe':
          fillColor = '#EF4444';
          strokeColor = '#DC2626';
          break;
        case 'dangerous':
          fillColor = '#7F1D1D';
          strokeColor = '#991B1B';
          break;
      }

      const circle = new google.maps.Circle({
        center: zone.location,
        radius: zone.radius,
        map: mapInstanceRef.current!,
        fillColor,
        fillOpacity: 0.15,
        strokeColor,
        strokeOpacity: 0.6,
        strokeWeight: 2,
        zIndex: 100,
        clickable: true
      });

      circle.addListener('click', () => {
        const content = `
          <div style="padding: 12px; max-width: 280px;">
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: ${strokeColor};">
              ${zone.name}
            </h3>
            <p style="margin: 4px 0; font-size: 13px;">
              <strong>Safety Level:</strong> <span style="color: ${strokeColor};">${zone.safetyLevel.toUpperCase()}</span>
            </p>
            <p style="margin: 4px 0; font-size: 13px;">
              <strong>Crime Rate:</strong> ${zone.crimeRate}%
            </p>
            <p style="margin: 8px 0 4px 0; font-size: 13px;">
              ${zone.description}
            </p>
            ${zone.lastIncident ? `<p style="margin: 4px 0; font-size: 12px; color: #666;"><strong>Last Incident:</strong> ${zone.lastIncident}</p>` : ''}
            ${zone.tips ? `<div style="margin-top: 8px; padding: 8px; background: #FEF3C7; border-radius: 4px; font-size: 12px;"><strong>💡 Safety Tips:</strong><br/>${zone.tips.join('<br/>• ')}</div>` : ''}
          </div>
        `;

        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.setPosition(zone.location);
        infoWindowRef.current?.open(mapInstanceRef.current!);
      });

      safetyCirclesRef.current.push(circle);
    });

    console.log(`✅ Rendered ${SAFETY_ZONES.length} safety zones`);
  }, [showSafetyZones]);

  // Toggle traffic layer
  const toggleTraffic = useCallback(() => {
    if (trafficLayerRef.current && mapInstanceRef.current) {
      if (trafficEnabled) {
        trafficLayerRef.current.setMap(null);
      } else {
        trafficLayerRef.current.setMap(mapInstanceRef.current);
      }
      setTrafficEnabled(!trafficEnabled);
    }
  }, [trafficEnabled]);

  // Recenter map on user location
  const recenterMap = useCallback(() => {
    if (currentLocation && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(currentLocation);
      mapInstanceRef.current.setZoom(16);
    }
  }, [currentLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800" style={{ height }}>
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            <MapPin className="absolute inset-0 m-auto w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Initializing Map</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading Google Maps API...</p>
          <div className="mt-4 flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="flex items-center justify-center bg-red-50 dark:bg-red-900/20" style={{ height }}>
        <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-md">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Map Loading Failed</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{mapError}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Reload Page
          </Button>
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
        <div className={`absolute top-4 left-4 right-4 p-4 rounded-lg shadow-2xl z-[1000] animate-in slide-in-from-top ${
          currentSafetyZone.safetyLevel === 'dangerous' ? 'bg-red-600' :
          currentSafetyZone.safetyLevel === 'unsafe' ? 'bg-orange-600' :
          'bg-yellow-500'
        } text-white`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">{currentSafetyZone.name}</h4>
              <p className="text-sm opacity-90 mb-2">{currentSafetyZone.description}</p>
              {currentSafetyZone.tips && (
                <div className="text-xs bg-white/20 rounded p-2 space-y-1">
                  {currentSafetyZone.tips.slice(0, 2).map((tip, i) => (
                    <p key={i}>• {tip}</p>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowSafetyAlert(false)}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[999]">
        <Button
          onClick={toggleTraffic}
          size="sm"
          variant={trafficEnabled ? "default" : "secondary"}
          className="shadow-lg"
        >
          {trafficEnabled ? '🚦 Traffic ON' : '🚦 Traffic'}
        </Button>
        <Button
          onClick={recenterMap}
          size="sm"
          variant="secondary"
          className="shadow-lg"
        >
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {/* Live Stats Bar */}
      {currentLocation && (
        <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 z-[999] min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">LIVE TRACKING</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3" />
              <span>Accuracy: {accuracy.toFixed(0)}m</span>
            </div>
            {speed > 0 && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                <span>Speed: {(speed * 3.6).toFixed(1)} km/h</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Info Bar */}
      {currentLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 z-[999]">
          <div className="grid grid-cols-3 gap-4">
            {nearestFacilities.hospital && (
              <div className="flex items-center gap-2 min-w-0">
                <Hospital className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {nearestFacilities.hospital.name.split(' ')[0]}
                  </p>
                  <p className="text-xs text-slate-500">{nearestFacilities.hospital.distance?.toFixed(1)} km</p>
                </div>
              </div>
            )}
            {nearestFacilities.police && (
              <div className="flex items-center gap-2 min-w-0">
                <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {nearestFacilities.police.name.split(' ')[0]}
                  </p>
                  <p className="text-xs text-slate-500">{nearestFacilities.police.distance?.toFixed(1)} km</p>
                </div>
              </div>
            )}
            {nearestFacilities.fire && (
              <div className="flex items-center gap-2 min-w-0">
                <Flame className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {nearestFacilities.fire.name.split(' ')[0]}
                  </p>
                  <p className="text-xs text-slate-500">{nearestFacilities.fire.distance?.toFixed(1)} km</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedRealTimeMap;
