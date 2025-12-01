/**
 * Modern Google Maps Services - Core functionality only
 * No Places API - use emergencyFacilities.ts for facility data
 */

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
  phoneNumber?: string;
  placeId?: string;
  types?: string[];
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Search for nearby places - DEPRECATED
 * Use pre-loaded facility data from emergencyFacilities.ts instead
 */
export async function searchNearbyPlaces(
  location: Location,
  type: string,
  radius: number = 5000
): Promise<Place[]> {
  console.warn('searchNearbyPlaces is deprecated - use emergencyFacilities.ts data instead');
  return Promise.resolve([]);
}

/**
 * Reverse geocode using Geocoding API
 */
export async function reverseGeocode(location: Location): Promise<string> {
  if (!window.google) {
    throw new Error('Google Maps not loaded');
  }

  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode(
      { location: { lat: location.lat, lng: location.lng } },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          // Fallback to OpenStreetMap if geocoding fails
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.display_name) {
                resolve(data.display_name);
              } else {
                reject(new Error('Geocoding failed'));
              }
            })
            .catch(() => {
              reject(new Error(`Geocoding failed: ${status}`));
            });
        }
      }
    );
  });
}

/**
 * Forward geocode an address
 */
export async function geocodeAddress(address: string): Promise<Location> {
  if (!window.google) {
    throw new Error('Google Maps not loaded');
  }

  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
}

/**
 * Get directions between two points
 */
export async function getDirections(
  origin: Location,
  destination: Location,
  travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
): Promise<google.maps.DirectionsResult> {
  if (!window.google) {
    throw new Error('Google Maps not loaded');
  }

  return new Promise((resolve, reject) => {
    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        travelMode,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          resolve(result);
        } else {
          reject(new Error(`Directions request failed: ${status}`));
        }
      }
    );
  });
}

/**
 * Wait for Google Maps to be ready
 */
export function waitForGoogleMaps(timeout: number = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkInterval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Google Maps failed to load'));
      }
    }, 100);
  });
}

/**
 * Get current location using browser's geolocation API
 */
export function getCurrentLocation(): Promise<Location> {
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
}

/**
 * Watch location changes
 */
export function watchLocation(
  callback: (location: Location) => void,
  errorCallback?: (error: GeolocationPositionError) => void
): number {
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
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

/**
 * Clear location watch
 */
export function clearLocationWatch(watchId: number): void {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}
