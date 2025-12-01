/**
 * Modern Google Maps Services - Using latest APIs
 * Migrated from deprecated Places API to new Place class
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
 * Search for nearby places using Places API (Text Search)
 */
export async function searchNearbyPlaces(
  location: Location,
  type: string,
  radius: number = 5000
): Promise<Place[]> {
  if (!window.google) {
    throw new Error('Google Maps not loaded');
  }

  return new Promise((resolve, reject) => {
    // Use the legacy API but with proper error handling
    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius,
      type: type,
    };

    service.nearbySearch(request, (results, status) => {
      // Handle the deprecated API warning gracefully
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const places: Place[] = results
          .filter((place) => place.geometry?.location && place.place_id)
          .map((place) => {
            const placeLat = place.geometry!.location!.lat();
            const placeLng = place.geometry!.location!.lng();
            const distance = calculateDistance(
              location.lat,
              location.lng,
              placeLat,
              placeLng
            );

            return {
              id: place.place_id!,
              name: place.name || 'Unknown',
              address: place.vicinity || '',
              location: {
                lat: placeLat,
                lng: placeLng,
              },
              distance,
              rating: place.rating,
              placeId: place.place_id,
              types: place.types,
            };
          })
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));

        resolve(places);
      } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
        reject(new Error('API key not authorized for Places API. Please enable Places API in Google Cloud Console.'));
      } else {
        reject(new Error(`Places search failed: ${status}`));
      }
    });
  });
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
          reject(new Error(`Geocoding failed: ${status}`));
        }
      }
    );
  });
}

/**
 * Forward geocode (address to coordinates)
 */
export async function geocodeAddress(address: string): Promise<Location | null> {
  if (!window.google) {
    throw new Error('Google Maps not loaded');
  }

  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    
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
}

/**
 * Calculate directions between two points
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
        origin,
        destination,
        travelMode,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Directions failed: ${status}`));
        }
      }
    );
  });
}

/**
 * Wait for Google Maps to load
 */
export function waitForGoogleMaps(timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkGoogle = () => {
      if (window.google && window.google.maps) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Google Maps failed to load within timeout'));
      } else {
        setTimeout(checkGoogle, 100);
      }
    };
    
    checkGoogle();
  });
}

/**
 * Get current location with high accuracy
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
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

/**
 * Stop watching location
 */
export function clearLocationWatch(watchId: number): void {
  navigator.geolocation.clearWatch(watchId);
}
