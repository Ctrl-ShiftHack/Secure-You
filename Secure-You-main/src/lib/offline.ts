/**
 * Offline Support Module
 * Ensures emergency features work without internet connection
 * - Caches emergency contacts locally
 * - Queues SOS alerts when offline
 * - Auto-syncs when connection restored
 */

import { supabase } from './supabase';
import type { EmergencyContact } from '@/types/database.types';

// Queued alert structure for offline storage
interface QueuedAlert {
  id: string;
  timestamp: number;
  userId: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null;
  contacts: EmergencyContact[];
  message?: string;
  status: 'pending' | 'sent' | 'failed';
}

// localStorage keys for offline data
const STORAGE_KEYS = {
  CACHED_CONTACTS: 'secureyou_cached_contacts',  // Stored contacts
  QUEUED_ALERTS: 'secureyou_queued_alerts',      // Pending alerts
  LAST_SYNC: 'secureyou_last_sync',              // Last sync timestamp
  OFFLINE_MODE: 'secureyou_offline_mode',        // Offline flag
};

/**
 * Check if device has internet connection
 * @returns true if online, false if offline
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Save emergency contacts to localStorage
 * Contacts remain available for 7 days without internet
 * @param userId - Current user's ID
 */
export const cacheEmergencyContacts = async (userId: string): Promise<void> => {
  try {
    if (!isOnline()) {
      console.log('Offline: Cannot sync contacts');
      return;
    }

    // Fetch contacts from database
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    if (data) {
      // Save to localStorage with metadata
      localStorage.setItem(STORAGE_KEYS.CACHED_CONTACTS, JSON.stringify({
        userId,
        contacts: data,
        cachedAt: Date.now(),
      }));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
      console.log(`✅ Cached ${data.length} emergency contacts`);
    }
  } catch (error) {
    console.error('Error caching contacts:', error);
  }
};

/**
 * Get emergency contacts (online or from cache)
 * - Tries to fetch from server if online
 * - Falls back to localStorage if offline
 * - Cache is valid for 7 days
 * @param userId - Current user's ID
 * @returns Array of emergency contacts
 */
export const getEmergencyContacts = async (userId: string): Promise<EmergencyContact[]> => {
  try {
    // Try online first
    if (isOnline()) {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId);

      if (!error && data) {
        await cacheEmergencyContacts(userId);  // Update cache
        return data;
      }
    }

    // Use cached data if offline or fetch failed
    const cached = localStorage.getItem(STORAGE_KEYS.CACHED_CONTACTS);
    if (cached) {
      const { contacts, userId: cachedUserId, cachedAt } = JSON.parse(cached);
      
      // Verify cache is valid (correct user, not expired)
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      const isValid = cachedUserId === userId && (Date.now() - cachedAt) < SEVEN_DAYS;
      
      if (isValid) {
        console.log('📦 Using cached emergency contacts');
        return contacts;
      }
    }

    return [];
  } catch (error) {
    console.error('Error getting contacts:', error);
    return [];
  }
};

/**
 * Queue SOS alert for sending when connection is restored
 */
export const queueSOSAlert = (alert: Omit<QueuedAlert, 'id' | 'status'>): string => {
  try {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedAlert: QueuedAlert = {
      id: alertId,
      ...alert,
      status: 'pending',
    };

    // Get existing queue
    const queueJson = localStorage.getItem(STORAGE_KEYS.QUEUED_ALERTS);
    const queue: QueuedAlert[] = queueJson ? JSON.parse(queueJson) : [];

    // Add to queue
    queue.push(queuedAlert);
    localStorage.setItem(STORAGE_KEYS.QUEUED_ALERTS, JSON.stringify(queue));

    console.log(`📮 Queued SOS alert: ${alertId}`);
    return alertId;
  } catch (error) {
    console.error('Error queuing alert:', error);
    throw error;
  }
};

/**
 * Get queued alerts
 */
export const getQueuedAlerts = (): QueuedAlert[] => {
  try {
    const queueJson = localStorage.getItem(STORAGE_KEYS.QUEUED_ALERTS);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error getting queued alerts:', error);
    return [];
  }
};

/**
 * Process queued alerts when connection is restored
 */
export const processQueuedAlerts = async (): Promise<number> => {
  if (!isOnline()) {
    console.log('Still offline, cannot process queue');
    return 0;
  }

  try {
    const queue = getQueuedAlerts();
    const pendingAlerts = queue.filter(alert => alert.status === 'pending');

    if (pendingAlerts.length === 0) {
      return 0;
    }

    console.log(`📤 Processing ${pendingAlerts.length} queued alerts...`);

    let processedCount = 0;
    const { sendSOSAlert } = await import('./emergency');

    for (const alert of pendingAlerts) {
      try {
        await sendSOSAlert({
          userId: alert.userId,
          location: alert.location,
          contacts: alert.contacts,
          message: alert.message,
        });

        // Mark as sent
        alert.status = 'sent';
        processedCount++;
      } catch (error) {
        console.error(`Failed to send queued alert ${alert.id}:`, error);
        alert.status = 'failed';
      }
    }

    // Update queue (remove sent, keep failed for retry)
    const updatedQueue = queue.filter(alert => alert.status !== 'sent');
    localStorage.setItem(STORAGE_KEYS.QUEUED_ALERTS, JSON.stringify(updatedQueue));

    console.log(`✅ Processed ${processedCount} queued alerts`);
    return processedCount;
  } catch (error) {
    console.error('Error processing queued alerts:', error);
    return 0;
  }
};

/**
 * Clear old queued alerts (older than 24 hours)
 */
export const cleanOldAlerts = (): void => {
  try {
    const queue = getQueuedAlerts();
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

    const filteredQueue = queue.filter(alert => alert.timestamp > cutoffTime);
    
    if (filteredQueue.length < queue.length) {
      localStorage.setItem(STORAGE_KEYS.QUEUED_ALERTS, JSON.stringify(filteredQueue));
      console.log(`🧹 Cleaned ${queue.length - filteredQueue.length} old alerts`);
    }
  } catch (error) {
    console.error('Error cleaning old alerts:', error);
  }
};

/**
 * Initialize offline support
 */
export const initializeOfflineSupport = (userId: string): void => {
  // Cache contacts on initialization
  cacheEmergencyContacts(userId);

  // Setup online/offline listeners
  window.addEventListener('online', async () => {
    console.log('🌐 Connection restored');
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, 'false');
    
    // Process any queued alerts
    const processed = await processQueuedAlerts();
    if (processed > 0) {
      // You can show a toast notification here
      console.log(`✅ Sent ${processed} queued emergency alerts`);
    }

    // Refresh cache
    await cacheEmergencyContacts(userId);
  });

  window.addEventListener('offline', () => {
    console.log('📴 Connection lost - offline mode active');
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, 'true');
  });

  // Clean old alerts on initialization
  cleanOldAlerts();

  // Periodic cleanup (every hour)
  setInterval(cleanOldAlerts, 60 * 60 * 1000);
};

/**
 * Get offline mode status
 */
export const isOfflineMode = (): boolean => {
  return !isOnline() || localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE) === 'true';
};

/**
 * Get last sync timestamp
 */
export const getLastSyncTime = (): number | null => {
  const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  return lastSync ? parseInt(lastSync, 10) : null;
};

/**
 * Get cache status
 */
export const getCacheStatus = (): {
  hasCachedContacts: boolean;
  contactCount: number;
  lastSync: number | null;
  queuedAlertsCount: number;
} => {
  const cached = localStorage.getItem(STORAGE_KEYS.CACHED_CONTACTS);
  const contacts = cached ? JSON.parse(cached).contacts : [];
  const queuedAlerts = getQueuedAlerts();

  return {
    hasCachedContacts: contacts.length > 0,
    contactCount: contacts.length,
    lastSync: getLastSyncTime(),
    queuedAlertsCount: queuedAlerts.filter(a => a.status === 'pending').length,
  };
};
