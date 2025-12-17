/**
 * Emergency Services - Core functionality for SOS alerts
 */

import { supabase } from './supabase';
import type { EmergencyContact } from '@/types/database.types';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface SOSAlert {
  userId: string;
  location: LocationData | null;
  contacts: EmergencyContact[];
  message?: string;
}

/**
 * Get current user location
 */
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
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
 * Start continuous location tracking for active emergencies
 */
export const startLocationTracking = (callback: (location: LocationData) => void): number => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported');
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      console.error('Location tracking error:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
};

/**
 * Stop location tracking
 */
export const stopLocationTracking = (watchId: number) => {
  navigator.geolocation.clearWatch(watchId);
};

/**
 * Format location for Google Maps link
 */
export const getGoogleMapsLink = (location: LocationData): string => {
  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
};

/**
 * Send SOS alert to emergency contacts
 */
export const sendSOSAlert = async (alert: SOSAlert): Promise<void> => {
  try {
    // Get current location if not provided
    let location = alert.location;
    if (!location) {
      try {
        location = await getCurrentLocation();
      } catch (error) {
        console.warn('Could not get location:', error);
      }
    }

    const mapLink = location ? getGoogleMapsLink(location) : null;
    const timestamp = new Date().toLocaleString();

    // Create incident record
    const { data: user } = await supabase.auth.getUser();
    if (user?.user) {
      const { error } = await supabase.from('incidents').insert([{
        user_id: user.user.id,
        type: 'sos',
        status: 'active',
        description: alert.message || 'Emergency SOS alert triggered',
        location: location ? `${location.latitude}, ${location.longitude}` : null,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        updated_at: new Date().toISOString(),
      }] as any);
      
      if (error) console.error('Error creating incident:', error);
    }

    // Send notifications to each emergency contact
    const notificationPromises = alert.contacts.map(async (contact) => {
      try {
        // Call Supabase Edge Function to send SMS & Email
        const { data, error } = await supabase.functions.invoke('send-sos-alert', {
          body: {
            contactId: contact.id,
            contactName: contact.name,
            phoneNumber: contact.phone_number,
            email: contact.email,
            userName: user?.user.user_metadata?.full_name || 'SecureYou User',
            timestamp,
            location: location ? {
              latitude: location.latitude,
              longitude: location.longitude,
              mapLink: mapLink || '',
            } : null,
            message: alert.message,
          },
        });

        if (error) {
          console.error(`[SOS Alert] Error sending to ${contact.name}:`, error);
          // Log failed notification
          await supabase.from('notifications').insert([{
            user_id: user?.user.id || '',
            contact_id: contact.id,
            type: 'sos',
            message: `Failed to send: ${error.message}`,
            status: 'failed',
            sent_at: new Date().toISOString(),
          }] as any);
        } else {
          console.log(`[SOS Alert] Successfully sent to ${contact.name}:`, data);
          // Log successful notification
          await supabase.from('notifications').insert([{
            user_id: user?.user.id || '',
            contact_id: contact.id,
            type: 'sos',
            message: `SMS: ${data?.results?.sms?.sent ? 'Sent' : 'Failed'}, Email: ${data?.results?.email?.sent ? 'Sent' : 'Failed'}`,
            status: 'sent',
            sent_at: new Date().toISOString(),
          }] as any);
        }
      } catch (error) {
        console.error(`[SOS Alert] Exception sending to ${contact.name}:`, error);
        // Log exception
        await supabase.from('notifications').insert([{
          user_id: user?.user.id || '',
          contact_id: contact.id,
          type: 'sos',
          message: `Exception: ${error}`,
          status: 'failed',
          sent_at: new Date().toISOString(),
        }] as any);
      }
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error sending SOS alert:', error);
    throw error;
  }
};

/**
 * Call emergency services (999 for Bangladesh)
 */
export const callEmergencyServices = (number: string = '999') => {
  window.location.href = `tel:${number}`;
};

/**
 * Resolve/cancel active SOS alert
 */
export const cancelSOSAlert = async (userId: string): Promise<void> => {
  try {
    // Update all active incidents to cancelled
    const { error } = await (supabase
      .from('incidents') as any)
      .update({ 
        status: 'cancelled',
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('status', 'active');
    
    if (error) console.error('Error cancelling incidents:', error);

    // Send cancellation notification to contacts
    const { data: contacts } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId);

    if (contacts) {
      const { data: user } = await supabase.auth.getUser();
      const cancelMessage = `✅ ALERT CANCELLED: ${user?.user.user_metadata?.full_name || 'User'} has cancelled their emergency alert. They are safe.`;
      
      // Log cancellation notifications
      const notificationPromises = contacts.map((contact: any) =>
        supabase.from('notifications').insert([{
          user_id: userId,
          contact_id: contact.id,
          type: 'sos_cancelled',
          message: cancelMessage,
          status: 'sent',
          sent_at: new Date().toISOString(),
        }] as any)
      );

      await Promise.all(notificationPromises);
    }
  } catch (error) {
    console.error('Error cancelling SOS alert:', error);
    throw error;
  }
};

/**
 * Request location permissions
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    if (result.state === 'granted') {
      return true;
    } else if (result.state === 'prompt') {
      // Try to get location to trigger permission prompt
      await getCurrentLocation();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};
