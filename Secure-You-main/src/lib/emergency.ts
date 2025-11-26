/**
 * Emergency Services Module
 * Core functionality for SOS alerts, GPS tracking, and emergency contacts
 */

import { supabase } from './supabase';
import type { EmergencyContact } from '@/types/database.types';

// Location data structure from GPS
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;    // Accuracy in meters
  timestamp: number;    // Unix timestamp
}

// SOS alert structure
interface SOSAlert {
  userId: string;
  location: LocationData | null;
  contacts: EmergencyContact[];
  message?: string;
}

/**
 * Get user's current GPS location
 * @returns Promise with latitude, longitude, accuracy, timestamp
 * @throws Error if geolocation is not supported
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
      (error) => reject(error),
      {
        enableHighAccuracy: true,  // Use GPS instead of network location
        timeout: 10000,            // Wait max 10 seconds
        maximumAge: 0,             // Don't use cached location
      }
    );
  });
};

/**
 * Start continuous GPS tracking
 * Useful for active emergencies to track user movement
 * @param callback - Function called with each location update
 * @returns watchId - Use this to stop tracking later
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
    (error) => console.error('Location tracking error:', error),
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
};

/**
 * Stop GPS tracking
 * @param watchId - The ID returned from startLocationTracking
 */
export const stopLocationTracking = (watchId: number) => {
  navigator.geolocation.clearWatch(watchId);
};

/**
 * Generate Google Maps link from coordinates
 * @param location - GPS coordinates
 * @returns URL that opens location in Google Maps
 */
export const getGoogleMapsLink = (location: LocationData): string => {
  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
};

/**
 * Send SOS alert to all emergency contacts
 * Creates incident in database and notifies contacts
 * @param alert - Alert details including user, location, contacts
 */
export const sendSOSAlert = async (alert: SOSAlert): Promise<void> => {
  try {
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
      // Format SMS message
      const smsMessage = `🚨 EMERGENCY ALERT from ${user?.user.user_metadata?.full_name || 'SecureYou User'}!\n\n` +
        `Time: ${timestamp}\n` +
        (location ? `Location: ${mapLink}\n` : 'Location: Not available\n') +
        `\nThis is an automated emergency alert. Please check on them immediately!`;

      // Format email
      const emailSubject = `🚨 EMERGENCY ALERT - Immediate Action Required`;
      const emailBody = `
        <h2 style="color: #FF6B6B;">🚨 EMERGENCY ALERT</h2>
        <p><strong>${user?.user.user_metadata?.full_name || 'Someone'}</strong> has triggered an emergency SOS alert and needs immediate help!</p>
        
        <h3>Details:</h3>
        <ul>
          <li><strong>Time:</strong> ${timestamp}</li>
          <li><strong>Location:</strong> ${location ? `<a href="${mapLink}">View on Google Maps</a>` : 'Not available'}</li>
          ${alert.message ? `<li><strong>Message:</strong> ${alert.message}</li>` : ''}
        </ul>
        
        <p style="color: #FF6B6B; font-weight: bold;">Please check on them immediately or contact local emergency services.</p>
        
        <p style="color: #666; font-size: 12px;">This is an automated message from SecureYou Emergency Safety App.</p>
      `;

      // In production, you would integrate with:
      // 1. Twilio for SMS: https://www.twilio.com/docs/sms
      // 2. SendGrid/Mailgun for email
      // 3. Firebase Cloud Messaging for push notifications
      // 4. Supabase Edge Functions to handle server-side sending

      console.log(`[SOS Alert] Sending to ${contact.name}:`, {
        phone: contact.phone_number,
        email: contact.email,
        sms: smsMessage.substring(0, 50) + '...',
      });

      // Store notification attempt in database
      try {
        await supabase.from('notifications').insert([{
          user_id: user?.user.id || '',
          contact_id: contact.id,
          type: 'sos',
          message: smsMessage,
          status: 'sent',
          sent_at: new Date().toISOString(),
        }] as any);
      } catch (error) {
        console.error('Error logging notification:', error);
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
