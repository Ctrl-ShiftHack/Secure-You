export interface Profile {
  id: string;
  created_at: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  emergency_contacts?: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  phone_number: string;
  email?: string;
  relationship?: string;
  is_primary: boolean;
}

export interface Incident {
  id: string;
  created_at: string;
  user_id: string;
  type: 'sos' | 'medical' | 'fire' | 'police' | 'other';
  status: 'active' | 'resolved' | 'cancelled';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  description?: string;
  contacted_authorities: boolean;
  notified_contacts: string[]; // array of contact IDs that were notified
}