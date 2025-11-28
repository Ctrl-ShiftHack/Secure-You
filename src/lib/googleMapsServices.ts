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
 * Search for nearby places using Google Places API
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
    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius,
      type: type,
    };

    service.nearbySearch(request, (results, status) => {
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
      } else {
        reject(new Error(`Places search failed: ${status}`));
      }
    });
  });
}

/**
 * Get detailed place information
 */
export async function getPlaceDetails(placeId: string): Promise<any> {
  if (!window.google) {
    throw new Error('Google Maps not loaded');
  }

  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    service.getDetails(
      {
        placeId,
        fields: [
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
}> {
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
}

/**
 * Get estimated travel time
 */
export function getEstimatedTime(
  directionsResult: google.maps.DirectionsResult
): string {
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
