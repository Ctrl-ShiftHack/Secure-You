/**
 * Google Maps Services
 * Utility functions for Google Maps API features
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
 * Search for nearby places - DEPRECATED
 * Use emergencyFacilities.ts data instead
 */
export async function searchNearbyPlaces(
  location: Location,
  type: string,
  radius: number = 5000
): Promise<Place[]> {
  console.warn('searchNearbyPlaces is deprecated - use emergencyFacilities.ts');
  return Promise.resolve([]);
}

/**
 * Get detailed place information - DEPRECATED
 */
export async function getPlaceDetails(placeId: string): Promise<any> {
  console.warn('getPlaceDetails is deprecated');
  return Promise.resolve(null);
}

/**
 * Reverse geocode using Geocoding API
          'name',
          'formatted_address',
          'formatted_phone_number',
          'geometry',
          'rating',
          'opening_hours',
          'website',
          'photos',
        ],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          reject(new Error(`Place details failed: ${status}`));
        }
      }
    );
  });
}

/**
 * Reverse geocode using Google Geocoding API
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
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return Math.round(distance * 1000) / 1000; // Round to 3 decimals
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

/**
 * Search for emergency facilities
 */
export async function findEmergencyFacilities(
  location: Location,
  radius: number = 5000
): Promise<{
  hospitals: Place[];
  policeStations: Place[];
  fireStations: Place[];
/**
 * Find emergency facilities - Using pre-loaded data
 */
export async function findEmergencyFacilities(
  location: Location,
  radius: number = 5000
): Promise<{
  hospitals: Place[];
  policeStations: Place[];
  fireStations: Place[];
}> {
  try {
    // Import emergency facilities data
    const { findNearestFacilities } = await import('./emergencyFacilities');
    
    const hospitals = findNearestFacilities(location.lat, location.lng, 'hospital', 5);
    const police = findNearestFacilities(location.lat, location.lng, 'police', 5);
    const fire = findNearestFacilities(location.lat, location.lng, 'fire', 5);

    return {
      hospitals: hospitals.map(f => ({
        id: f.id,
        name: f.name,
        address: f.address || '',
        location: f.location,
        distance: f.distance,
        phoneNumber: f.phone
      })),
      policeStations: police.map(f => ({
        id: f.id,
        name: f.name,
        address: f.address || '',
        location: f.location,
        distance: f.distance,
        phoneNumber: f.phone
      })),
      fireStations: fire.map(f => ({
        id: f.id,
        name: f.name,
        address: f.address || '',
        location: f.location,
        distance: f.distance,
        phoneNumber: f.phone
      }))
    };
  } catch (error) {
    console.error('Error finding emergency facilities:', error);
    return {
      hospitals: [],
      policeStations: [],
      fireStations: [],
    };
  }
}: string {
  if (!directionsResult.routes[0]) return '';
  
  const leg = directionsResult.routes[0].legs[0];
  return leg.duration?.text || '';
}

/**
 * Get total distance
 */
export function getTotalDistance(
  directionsResult: google.maps.DirectionsResult
): string {
  if (!directionsResult.routes[0]) return '';
  
  const leg = directionsResult.routes[0].legs[0];
  return leg.distance?.text || '';
}
