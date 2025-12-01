/**
 * Emergency Facilities Database
 * Pre-loaded data for Bangladesh with real locations
 */

export interface EmergencyFacility {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'fire';
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  phone?: string;
  distance?: number;
}

// Dhaka Emergency Facilities
export const EMERGENCY_FACILITIES: EmergencyFacility[] = [
  // Hospitals in Dhaka
  {
    id: 'h1',
    name: 'Dhaka Medical College Hospital',
    type: 'hospital',
    location: { lat: 23.7262, lng: 90.3967 },
    address: 'Bakshi Bazar, Dhaka 1000',
    phone: '02-9668690'
  },
  {
    id: 'h2',
    name: 'Square Hospital',
    type: 'hospital',
    location: { lat: 23.7518, lng: 90.3832 },
    address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka',
    phone: '10678'
  },
  {
    id: 'h3',
    name: 'United Hospital',
    type: 'hospital',
    location: { lat: 23.8077, lng: 90.4156 },
    address: 'Plot 15, Road 71, Gulshan, Dhaka 1212',
    phone: '09666710678'
  },
  {
    id: 'h4',
    name: 'Apollo Hospitals Dhaka',
    type: 'hospital',
    location: { lat: 23.8084, lng: 90.4219 },
    address: 'Plot 81, Block E, Bashundhara R/A, Dhaka 1229',
    phone: '10606'
  },
  {
    id: 'h5',
    name: 'Bangabandhu Sheikh Mujib Medical University',
    type: 'hospital',
    location: { lat: 23.7389, lng: 90.3958 },
    address: 'Shahbag, Dhaka 1000',
    phone: '02-9668066'
  },
  {
    id: 'h6',
    name: 'Holy Family Red Crescent Medical College Hospital',
    type: 'hospital',
    location: { lat: 23.7515, lng: 90.3911 },
    address: 'Eskaton Garden Road, Dhaka 1000',
    phone: '02-8330340'
  },
  {
    id: 'h7',
    name: 'Ibn Sina Hospital',
    type: 'hospital',
    location: { lat: 23.7459, lng: 90.3843 },
    address: 'House 47-48, Road 15/A, Dhanmondi, Dhaka',
    phone: '10096'
  },
  {
    id: 'h8',
    name: 'Labaid Specialized Hospital',
    type: 'hospital',
    location: { lat: 23.7463, lng: 90.3805 },
    address: 'House 1, Road 4, Dhanmondi, Dhaka 1205',
    phone: '10606'
  },

  // Police Stations in Dhaka
  {
    id: 'p1',
    name: 'Gulshan Police Station',
    type: 'police',
    location: { lat: 23.7925, lng: 90.4078 },
    address: 'Gulshan-1, Dhaka 1212',
    phone: '02-9882233'
  },
  {
    id: 'p2',
    name: 'Dhanmondi Police Station',
    type: 'police',
    location: { lat: 23.7465, lng: 90.3751 },
    address: 'Dhanmondi, Dhaka 1209',
    phone: '02-9661066'
  },
  {
    id: 'p3',
    name: 'Ramna Police Station',
    type: 'police',
    location: { lat: 23.7454, lng: 90.4040 },
    address: 'Ramna, Dhaka 1000',
    phone: '02-9558312'
  },
  {
    id: 'p4',
    name: 'Tejgaon Police Station',
    type: 'police',
    location: { lat: 23.7645, lng: 90.3913 },
    address: 'Tejgaon Industrial Area, Dhaka 1208',
    phone: '02-8870704'
  },
  {
    id: 'p5',
    name: 'Banani Police Station',
    type: 'police',
    location: { lat: 23.7937, lng: 90.4066 },
    address: 'Banani, Dhaka 1213',
    phone: '02-9892219'
  },
  {
    id: 'p6',
    name: 'Mirpur Model Police Station',
    type: 'police',
    location: { lat: 23.8223, lng: 90.3654 },
    address: 'Mirpur-1, Dhaka 1216',
    phone: '02-9003804'
  },
  {
    id: 'p7',
    name: 'Uttara Police Station',
    type: 'police',
    location: { lat: 23.8759, lng: 90.3795 },
    address: 'Sector 7, Uttara, Dhaka 1230',
    phone: '02-8991566'
  },

  // Fire Stations in Dhaka
  {
    id: 'f1',
    name: 'Tejgaon Fire Station',
    type: 'fire',
    location: { lat: 23.7588, lng: 90.3977 },
    address: 'Tejgaon, Dhaka 1215',
    phone: '02-8870333'
  },
  {
    id: 'f2',
    name: 'Mirpur Fire Station',
    type: 'fire',
    location: { lat: 23.8065, lng: 90.3677 },
    address: 'Mirpur-10, Dhaka 1216',
    phone: '02-9006444'
  },
  {
    id: 'f3',
    name: 'Mohammadpur Fire Station',
    type: 'fire',
    location: { lat: 23.7654, lng: 90.3608 },
    address: 'Mohammadpur, Dhaka 1207',
    phone: '02-9116677'
  },
  {
    id: 'f4',
    name: 'Gulshan Fire Station',
    type: 'fire',
    location: { lat: 23.7809, lng: 90.4172 },
    address: 'Gulshan-2, Dhaka 1212',
    phone: '02-9887766'
  },
  {
    id: 'f5',
    name: 'Uttara Fire Station',
    type: 'fire',
    location: { lat: 23.8674, lng: 90.3952 },
    address: 'Sector 11, Uttara, Dhaka 1230',
    phone: '02-8990555'
  },
  {
    id: 'f6',
    name: 'Lalbagh Fire Station',
    type: 'fire',
    location: { lat: 23.7186, lng: 90.3854 },
    address: 'Lalbagh, Dhaka 1211',
    phone: '02-7319888'
  },
];

/**
 * Safety zones with crime data and safety ratings
 */
export interface SafetyZone {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  radius: number; // in meters
  safetyLevel: 'safe' | 'caution' | 'unsafe' | 'dangerous';
  crimeRate: number; // 0-100
  description: string;
  lastIncident?: string;
  tips?: string[];
}

export const SAFETY_ZONES: SafetyZone[] = [
  {
    id: 'sz1',
    name: 'Gulshan Diplomatic Zone',
    location: { lat: 23.7808, lng: 90.4172 },
    radius: 1000,
    safetyLevel: 'safe',
    crimeRate: 15,
    description: 'Well-patrolled diplomatic area with high security',
    tips: ['Safe for walking at night', 'Heavy police presence', 'CCTV monitored']
  },
  {
    id: 'sz2',
    name: 'Dhanmondi Residential',
    location: { lat: 23.7465, lng: 90.3751 },
    radius: 800,
    safetyLevel: 'safe',
    crimeRate: 25,
    description: 'Established residential area with regular patrols',
    tips: ['Generally safe', 'Avoid empty streets late at night']
  },
  {
    id: 'sz3',
    name: 'Karwan Bazar Market Area',
    location: { lat: 23.7507, lng: 90.3915 },
    radius: 600,
    safetyLevel: 'caution',
    crimeRate: 45,
    description: 'Busy market area - pickpocketing risk',
    lastIncident: '2 days ago',
    tips: ['Watch your belongings', 'Crowded area', 'Avoid carrying valuables']
  },
  {
    id: 'sz4',
    name: 'Kamrangirchar Industrial',
    location: { lat: 23.7237, lng: 90.3596 },
    radius: 1200,
    safetyLevel: 'unsafe',
    crimeRate: 65,
    description: 'High crime rate - avoid after dark',
    lastIncident: 'Yesterday',
    tips: ['Avoid at night', 'Travel in groups', 'Stay on main roads']
  },
  {
    id: 'sz5',
    name: 'Jatrabari Intersection',
    location: { lat: 23.7107, lng: 90.4315 },
    radius: 500,
    safetyLevel: 'caution',
    crimeRate: 50,
    description: 'Congested traffic area with moderate crime',
    tips: ['Vehicle theft risk', 'Keep valuables secure', 'Be alert in traffic']
  },
  {
    id: 'sz6',
    name: 'Uttara Residential Sector',
    location: { lat: 23.8759, lng: 90.3795 },
    radius: 1500,
    safetyLevel: 'safe',
    crimeRate: 20,
    description: 'Planned residential area with good security',
    tips: ['Safe neighborhood', 'Well-lit streets', 'Active community watch']
  },
  {
    id: 'sz7',
    name: 'Old Dhaka Market',
    location: { lat: 23.7104, lng: 90.4074 },
    radius: 800,
    safetyLevel: 'caution',
    crimeRate: 55,
    description: 'Historic area with narrow streets - stay vigilant',
    lastIncident: '3 days ago',
    tips: ['Very crowded', 'Pickpocket hotspot', 'Hire local guide if unfamiliar']
  },
  {
    id: 'sz8',
    name: 'Banani Commercial',
    location: { lat: 23.7937, lng: 90.4066 },
    radius: 700,
    safetyLevel: 'safe',
    crimeRate: 22,
    description: 'Business district with good security',
    tips: ['Safe during business hours', 'Well-patrolled']
  },
];

/**
 * Calculate distance between two points
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find nearest facilities
 */
export function findNearestFacilities(
  userLat: number,
  userLng: number,
  type: 'hospital' | 'police' | 'fire',
  limit: number = 5
): EmergencyFacility[] {
  return EMERGENCY_FACILITIES
    .filter(f => f.type === type)
    .map(facility => ({
      ...facility,
      distance: calculateDistance(userLat, userLng, facility.location.lat, facility.location.lng)
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    .slice(0, limit);
}

/**
 * Check if location is in unsafe zone
 */
export function checkSafetyLevel(lat: number, lng: number): SafetyZone | null {
  for (const zone of SAFETY_ZONES) {
    const distance = calculateDistance(lat, lng, zone.location.lat, zone.location.lng) * 1000; // Convert to meters
    if (distance <= zone.radius) {
      return zone;
    }
  }
  return null;
}

/**
 * Get all facilities within radius
 */
export function getFacilitiesInRadius(
  lat: number,
  lng: number,
  radiusKm: number
): EmergencyFacility[] {
  return EMERGENCY_FACILITIES
    .map(facility => ({
      ...facility,
      distance: calculateDistance(lat, lng, facility.location.lat, facility.location.lng)
    }))
    .filter(f => (f.distance || 0) <= radiusKm)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
}
