// Google Maps utility functions for SecureYou app
// Comprehensive implementation of all Google Maps Platform features

export interface Location {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  location: Location;
  distance?: number;
  rating?: number;
  phone?: string;
  openNow?: boolean;
  types?: string[];
  website?: string;
  photos?: string[];
}

export interface DirectionsResult {
  routes: google.maps.DirectionsRoute[];
  distance: string;
  duration: string;
}

/**
 * Wait for Google Maps API to load
 */
export const waitForGoogleMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 50; // 10 seconds

    const checkInterval = setInterval(() => {
      attempts++;
      
      if (window.google?.maps) {
        clearInterval(checkInterval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        reject(new Error('Google Maps failed to load'));
      }
    }, 200);
  });
};

/**
 * Initialize Google Maps with all libraries
 */
export const initializeGoogleMaps = async (): Promise<boolean> => {
  try {
    await waitForGoogleMaps();
    console.log('✅ Google Maps API loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Google Maps API failed to load:', error);
    return false;
  }
};

/**
 * Search for nearby places by type
 * @param location - Center point for search
 * @param type - Place type (hospital, police, fire_station, etc.)
 * @param radius - Search radius in meters (max 50000)
 */
export const searchNearbyPlaces = async (
  location: Location,
  type: string,
  radius: number = 5000
): Promise<Place[]> => {
  try {
    await waitForGoogleMaps();

    const map = new google.maps.Map(document.createElement('div'));
    const service = new google.maps.places.PlacesService(map);

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        type,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: Place[] = results.map((place) => {
            const placeLocation = place.geometry?.location;
            return {
              id: place.place_id || '',
              name: place.name || '',
              address: place.vicinity || '',
              location: {
                lat: placeLocation?.lat() || 0,
                lng: placeLocation?.lng() || 0,
              },
              rating: place.rating,
              openNow: place.opening_hours?.isOpen?.(),
              types: place.types,
            };
          });

          // Calculate distances and sort by nearest
          const placesWithDistance = places.map((place) => ({
            ...place,
            distance: calculateDistance(
              location.lat,
              location.lng,
              place.location.lat,
              place.location.lng
            ),
          }));

          placesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          resolve(placesWithDistance);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

/**
 * Get detailed information about a place
 */
export const getPlaceDetails = async (placeId: string): Promise<Place | null> => {
  try {
    await waitForGoogleMaps();

    const map = new google.maps.Map(document.createElement('div'));
    const service = new google.maps.places.PlacesService(map);

    return new Promise((resolve) => {
      service.getDetails(
        {
          placeId,
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'rating',
            'formatted_phone_number',
            'opening_hours',
            'website',
            'photos',
            'types',
          ],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const location = place.geometry?.location;
            const photos = place.photos?.map((photo) =>
              photo.getUrl({ maxWidth: 400 })
            );

            resolve({
              id: placeId,
              name: place.name || '',
              address: place.formatted_address || '',
              location: {
                lat: location?.lat() || 0,
                lng: location?.lng() || 0,
              },
              rating: place.rating,
              phone: place.formatted_phone_number,
              openNow: place.opening_hours?.isOpen?.(),
              types: place.types,
              website: place.website,
              photos,
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};

/**
 * Reverse geocode: Convert coordinates to address
 */
export const reverseGeocode = async (location: Location): Promise<string> => {
  try {
    await waitForGoogleMaps();

    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode(
        { location: new google.maps.LatLng(location.lat, location.lng) },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
  }
};

/**
 * Geocode: Convert address to coordinates
 */
export const geocodeAddress = async (address: string): Promise<Location | null> => {
  try {
    await waitForGoogleMaps();

    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

/**
 * Get directions between two points
 */
export const getDirections = async (
  origin: Location,
  destination: Location,
  travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
): Promise<DirectionsResult | null> => {
  try {
    await waitForGoogleMaps();

    const directionsService = new google.maps.DirectionsService();

    return new Promise((resolve) => {
      directionsService.route(
        {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          travelMode,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            const route = result.routes[0];
            const leg = route.legs[0];

            resolve({
              routes: result.routes,
              distance: leg.distance?.text || '',
              duration: leg.duration?.text || '',
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error getting directions:', error);
    return null;
  }
};

/**
 * Calculate distance between two points using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

/**
 * Find emergency facilities (hospitals, police, fire stations)
 */
export const findEmergencyFacilities = async (
  location: Location,
  radius: number = 5000
): Promise<{
  hospitals: Place[];
  policeStations: Place[];
  fireStations: Place[];
}> => {
  try {
    const [hospitals, policeStations, fireStations] = await Promise.all([
      searchNearbyPlaces(location, 'hospital', radius),
      searchNearbyPlaces(location, 'police', radius),
      searchNearbyPlaces(location, 'fire_station', radius),
    ]);

    return {
      hospitals: hospitals.slice(0, 5),
      policeStations: policeStations.slice(0, 5),
      fireStations: fireStations.slice(0, 5),
    };
  } catch (error) {
    console.error('Error finding emergency facilities:', error);
    return {
      hospitals: [],
      policeStations: [],
      fireStations: [],
    };
  }
};

/**
 * Get estimated travel time
 */
export const getEstimatedTime = (directionsResult: DirectionsResult): string => {
  return directionsResult.duration;
};

/**
 * Get total distance
 */
export const getTotalDistance = (directionsResult: DirectionsResult): string => {
  return directionsResult.distance;
};

/**
 * Create Google Maps share link
 */
export const createShareLink = (location: Location, label?: string): string => {
  const baseUrl = 'https://www.google.com/maps/search/?api=1';
  const query = label || `${location.lat},${location.lng}`;
  return `${baseUrl}&query=${encodeURIComponent(query)}`;
};

/**
 * Get navigation link
 */
export const getNavigationLink = (
  origin: Location,
  destination: Location
): string => {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
};

/**
 * Check if Google Maps API is available
 */
export const isGoogleMapsAvailable = (): boolean => {
  return !!(window.google?.maps);
};

/**
 * Get current location using Geolocation API
 */
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Watch location changes
 */
export const watchLocation = (
  callback: (location: Location) => void,
  errorCallback?: (error: GeolocationPositionError) => void
): number => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation not supported');
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    errorCallback,
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000,
    }
  );
};

/**
 * Stop watching location
 */
export const clearLocationWatch = (watchId: number): void => {
  navigator.geolocation.clearWatch(watchId);
};

// Export all Google Maps related types
export type {
  DirectionsResult as GoogleDirectionsResult,
  Place as GooglePlace,
  Location as GoogleLocation,
};
