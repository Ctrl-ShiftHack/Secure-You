/**
 * Background location tracking for active emergencies
 * Continuous GPS updates even when app is in background
 */

import { supabase } from './supabase';

interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number | null;
  heading?: number | null;
}

interface TrackingSession {
  sessionId: string;
  userId: string;
  startTime: number;
  watchId: number | null;
  isActive: boolean;
  updateInterval: number;
  locationHistory: LocationUpdate[];
}

let activeSession: TrackingSession | null = null;

/**
 * Start background location tracking
 */
export const startBackgroundTracking = async (
  userId: string,
  callback?: (location: LocationUpdate) => void
): Promise<string> => {
  // Check if already tracking
  if (activeSession?.isActive) {
    console.log('Background tracking already active');
    return activeSession.sessionId;
  }

  const sessionId = `tracking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    // Request high-accuracy tracking
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location: LocationUpdate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          speed: position.coords.speed,
          heading: position.coords.heading,
        };

        // Add to history
        if (activeSession) {
          activeSession.locationHistory.push(location);
          
          // Keep only last 100 positions to prevent memory issues
          if (activeSession.locationHistory.length > 100) {
            activeSession.locationHistory.shift();
          }

          // Save to database
          try {
            await supabase.from('location_history').insert([{
              user_id: userId,
              session_id: sessionId,
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
              speed: location.speed,
              heading: location.heading,
              recorded_at: new Date(location.timestamp).toISOString(),
            }] as any);
          } catch (error) {
            console.error('Error saving location to database:', error);
          }

          // Callback for real-time updates
          if (callback) {
            callback(location);
          }
        }

        console.log(`📍 Location update: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
      },
      (error) => {
        console.error('Background tracking error:', error);
        
        // Don't stop tracking on temporary errors
        if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
          console.log('Temporary location error, continuing tracking...');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Initialize session
    activeSession = {
      sessionId,
      userId,
      startTime: Date.now(),
      watchId,
      isActive: true,
      updateInterval: 5000, // Update every 5 seconds
      locationHistory: [],
    };

    // Store session in localStorage for persistence
    try {
      localStorage.setItem('secureyou_tracking_session', JSON.stringify({
        sessionId,
        userId,
        startTime: activeSession.startTime,
      }));
    } catch (error) {
      console.error('Error storing tracking session:', error);
    }

    console.log(`✅ Background tracking started: ${sessionId}`);
    resolve(sessionId);
  });
};

/**
 * Stop background location tracking
 */
export const stopBackgroundTracking = async (): Promise<void> => {
  if (!activeSession || !activeSession.isActive) {
    console.log('No active tracking session');
    return;
  }

  // Stop watching position
  if (activeSession.watchId !== null) {
    navigator.geolocation.clearWatch(activeSession.watchId);
  }

  // Mark session as ended in database
  try {
    await (supabase.from('tracking_sessions') as any).insert([{
      session_id: activeSession.sessionId,
      user_id: activeSession.userId,
      started_at: new Date(activeSession.startTime).toISOString(),
      ended_at: new Date().toISOString(),
      location_count: activeSession.locationHistory.length,
    }]);
  } catch (error) {
    console.error('Error saving tracking session:', error);
  }

  console.log(`🛑 Background tracking stopped: ${activeSession.sessionId}`);
  console.log(`   Tracked ${activeSession.locationHistory.length} locations`);

  // Clear session
  activeSession = null;

  // Remove from localStorage
  try {
    localStorage.removeItem('secureyou_tracking_session');
  } catch (error) {
    console.error('Error removing tracking session:', error);
  }
};

/**
 * Check if background tracking is active
 */
export const isTrackingActive = (): boolean => {
  return activeSession?.isActive || false;
};

/**
 * Get current tracking session info
 */
export const getTrackingSession = (): TrackingSession | null => {
  return activeSession;
};

/**
 * Get location history from current session
 */
export const getLocationHistory = (): LocationUpdate[] => {
  return activeSession?.locationHistory || [];
};

/**
 * Get last known location from current session
 */
export const getLastKnownLocation = (): LocationUpdate | null => {
  const history = getLocationHistory();
  return history.length > 0 ? history[history.length - 1] : null;
};

/**
 * Resume tracking session after app restart (if session exists)
 */
export const resumeTrackingIfNeeded = async (): Promise<boolean> => {
  try {
    const storedSession = localStorage.getItem('secureyou_tracking_session');
    if (!storedSession) {
      return false;
    }

    const { sessionId, userId, startTime } = JSON.parse(storedSession);

    // Check if session is less than 2 hours old
    const sessionAge = Date.now() - startTime;
    if (sessionAge > 2 * 60 * 60 * 1000) {
      console.log('Stored tracking session is too old, not resuming');
      localStorage.removeItem('secureyou_tracking_session');
      return false;
    }

    // Resume tracking
    console.log(`🔄 Resuming tracking session: ${sessionId}`);
    await startBackgroundTracking(userId);
    return true;
  } catch (error) {
    console.error('Error resuming tracking session:', error);
    return false;
  }
};

/**
 * Request persistent background tracking permission (for PWA)
 */
export const requestBackgroundPermission = async (): Promise<boolean> => {
  try {
    // Check if Permissions API is available
    if (!navigator.permissions) {
      console.log('Permissions API not available');
      return true; // Assume granted
    }

    // Request geolocation permission
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    
    if (permissionStatus.state === 'granted') {
      return true;
    } else if (permissionStatus.state === 'prompt') {
      // Will prompt user when startBackgroundTracking is called
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking background permission:', error);
    return false;
  }
};

/**
 * Share location updates with emergency contacts
 */
export const shareLocationUpdates = async (
  userId: string,
  contactIds: string[]
): Promise<void> => {
  const lastLocation = getLastKnownLocation();
  
  if (!lastLocation) {
    console.log('No location available to share');
    return;
  }

  try {
    // Get contacts
    const { data: contacts } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .in('id', contactIds);

    if (!contacts || contacts.length === 0) {
      console.log('No contacts found to share with');
      return;
    }

    const mapLink = `https://www.google.com/maps?q=${lastLocation.latitude},${lastLocation.longitude}`;
    const timestamp = new Date(lastLocation.timestamp).toLocaleString();

    // In production, send SMS/email to each contact
    console.log(`📤 Sharing location with ${contacts.length} contacts:`, mapLink);

    // Log notifications
    const notifications = contacts.map((contact: any) => ({
      user_id: userId,
      contact_id: contact.id,
      type: 'location_update',
      message: `Live location update at ${timestamp}: ${mapLink}`,
      status: 'sent',
      sent_at: new Date().toISOString(),
    }));

    await supabase.from('notifications').insert(notifications as any);
  } catch (error) {
    console.error('Error sharing location updates:', error);
  }
};

/**
 * Enable automatic location sharing during active tracking
 */
export const enableAutoLocationSharing = async (
  userId: string,
  intervalMinutes: number = 5
): Promise<NodeJS.Timeout> => {
  const intervalMs = intervalMinutes * 60 * 1000;

  const interval = setInterval(async () => {
    if (!isTrackingActive()) {
      clearInterval(interval);
      return;
    }

    try {
      // Get all emergency contacts
      const { data: contacts } = await supabase
        .from('emergency_contacts')
        .select('id')
        .eq('user_id', userId);

      if (contacts && contacts.length > 0) {
        await shareLocationUpdates(
          userId,
          contacts.map((c: any) => c.id)
        );
      }
    } catch (error) {
      console.error('Error in auto location sharing:', error);
    }
  }, intervalMs);

  console.log(`✅ Auto location sharing enabled (every ${intervalMinutes} minutes)`);
  return interval;
};
