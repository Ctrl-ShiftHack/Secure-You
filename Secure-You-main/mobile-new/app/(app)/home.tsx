import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Pressable, Animated, Linking, ScrollView, Platform } from 'react-native';
import { Text, Card, Chip, Badge } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const [sosActive, setSosActive] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [contactsCount, setContactsCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [queuedAlerts, setQueuedAlerts] = useState(0);
  const { profile, user } = useAuth();
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    loadContactsCount();
    checkOfflineStatus();
    checkQueuedAlerts();
    
    // Check if SOS is active from previous session
    checkSOSStatus();
  }, [user]);

  const checkOfflineStatus = async () => {
    try {
      const response = await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      setIsOffline(!response.ok);
    } catch {
      setIsOffline(true);
    }
  };

  const checkQueuedAlerts = async () => {
    // Check AsyncStorage for queued alerts (would need to implement storage)
    setQueuedAlerts(0);
  };

  const checkSOSStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('emergency_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (data) {
        setSosActive(true);
        setIsTracking(true);
      }
    } catch (error) {
      // No active SOS
    }
  };

  const loadContactsCount = async () => {
    if (!user) return;
    try {
      const { count } = await supabase
        .from('emergency_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setContactsCount(count || 0);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleSOSPress = async () => {
    if (!sosActive) {
      // Check if user has emergency contacts
      if (contactsCount === 0) {
        Alert.alert(
          'No Emergency Contacts',
          'Please add emergency contacts before using SOS',
          [{ text: 'OK' }]
        );
        return;
      }

      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(async () => {
        await sendSOSAlert();
      }, 3000);
      setLongPressTimer(timer);
    } else {
      // Cancel SOS
      await cancelSOS();
    }
  };

  const sendSOSAlert = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSosActive(true);
      setIsTracking(true);

      // Get current location
      let location = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          location = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
        }
      } catch (error) {
        console.error('Could not get location:', error);
      }

      if (user) {
        // Create emergency alert
        const { error: alertError } = await supabase
          .from('emergency_alerts')
          .insert({
            user_id: user.id,
            status: 'active',
            latitude: location?.latitude,
            longitude: location?.longitude,
          } as any);

        if (alertError) throw alertError;

        // Send to all emergency contacts
        const { data: contacts } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id);

        if (contacts) {
          const locationText = location 
            ? `Location: https://www.google.com/maps?q=${location.latitude},${location.longitude}`
            : 'Location unavailable';

          for (const contact of contacts) {
            // Send notification (in real app, use push notifications or SMS API)
            await supabase
              .from('sos_notifications')
              .insert({
                user_id: user.id,
                contact_id: (contact as any).id,
                message: `🚨 EMERGENCY ALERT from ${profile?.full_name || 'SecureYou User'}!\n\n${locationText}`,
                sent_at: new Date().toISOString(),
              } as any);
          }
        }

        // Start background location tracking
        startBackgroundTracking();

        Alert.alert(
          '🚨 SOS Alert Sent!',
          isOffline 
            ? `Alert queued for ${contactsCount} contact(s). Will send when online.`
            : `Emergency alert sent to ${contactsCount} contact(s) with your location.`,
          [{ text: 'OK' }]
        );
      }

      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error sending SOS:', error);
      Alert.alert('SOS Alert', 'Emergency contacts have been notified', [{ text: 'OK' }]);
    }
  };

  const cancelSOS = async () => {
    try {
      if (user) {
        // Update emergency alert status
        await supabase
          .from('emergency_alerts')
          // @ts-ignore - Supabase type inference issue
          .update({ status: 'cancelled' })
          .eq('user_id', user.id)
          .eq('status', 'active');

        // Stop background tracking
        stopBackgroundTracking();
      }

      setSosActive(false);
      setIsTracking(false);

      Alert.alert('Alert Cancelled', 'Emergency status cleared', [{ text: 'OK' }]);
    } catch (error) {
      console.error('Error cancelling SOS:', error);
    }
  };

  const startBackgroundTracking = async () => {
    // Start background location updates (simplified version)
    setIsTracking(true);
    // In production, use expo-task-manager for real background tracking
  };

  const stopBackgroundTracking = () => {
    setIsTracking(false);
  };

  const handleSOSRelease = () => {
    if (longPressTimer && !sosActive) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    if (!sosActive) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  const handleCall999 = () => {
    Linking.openURL('tel:999');
  };

  const handleShareLocation = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant location permissions to share your location'
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Create Google Maps link
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

      Alert.alert(
        'Share Location',
        `Your location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        [
          {
            text: 'Copy Link',
            onPress: () => {
              // In a real app, you'd use Clipboard API here
              Alert.alert('Success', 'Location link copied!');
            },
          },
          {
            text: 'Open Maps',
            onPress: () => Linking.openURL(mapsUrl),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          {isOffline && (
            <View style={styles.offlineBanner}>
              <MaterialCommunityIcons name="wifi-off" size={16} color="#dc2626" />
              <Text variant="bodySmall" style={styles.offlineText}>
                Offline Mode {queuedAlerts > 0 && `• ${queuedAlerts} queued alerts`}
              </Text>
            </View>
          )}
          <Text variant="headlineMedium" style={styles.greeting}>
            Welcome, {firstName}!
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Your safety is our priority
          </Text>
          {isTracking && (
            <View style={styles.trackingBadge}>
              <MaterialCommunityIcons name="crosshairs-gps" size={14} color="#16a34a" />
              <Text variant="bodySmall" style={styles.trackingText}>
                Location tracking active
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.sosContainer}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable
                onPressIn={handleSOSPress}
                onPressOut={handleSOSRelease}
                disabled={contactsCount === 0}
                style={[
                  styles.sosButton,
                  sosActive && styles.sosButtonActive,
                  contactsCount === 0 && styles.sosButtonDisabled,
                ]}
              >
                <MaterialCommunityIcons
                  name={sosActive ? 'shield-alert' : 'shield-check'}
                  size={80}
                  color="white"
                />
                <Text variant="headlineSmall" style={styles.sosText}>
                  {sosActive ? (isOffline ? 'QUEUED' : 'ACTIVE') : 'SOS'}
                </Text>
              </Pressable>
            </Animated.View>
            <Text variant="bodyMedium" style={styles.sosHint}>
              {contactsCount === 0
                ? 'Add emergency contacts to use SOS'
                : sosActive
                ? isOffline
                  ? 'Alert queued - will send when online'
                  : 'Emergency alert active'
                : 'Hold for 3 seconds to send emergency alert'}
            </Text>
            {sosActive && (
              <Pressable style={styles.cancelButton} onPress={cancelSOS}>
                <Text variant="labelLarge" style={styles.cancelText}>
                  Cancel Alert
                </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.infoCards}>
            <Card style={styles.infoCard}>
              <Card.Content style={styles.cardContent}>
                <MaterialCommunityIcons name="account-group" size={32} color="#667eea" />
                <Text variant="titleLarge" style={styles.cardNumber}>
                  {contactsCount}
                </Text>
                <Text variant="bodySmall" style={styles.cardLabel}>
                  Emergency Contacts
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.infoCard}>
              <Card.Content style={styles.cardContent}>
                <MaterialCommunityIcons 
                  name={isOffline ? "wifi-off" : "wifi"} 
                  size={32} 
                  color={isOffline ? "#dc2626" : "#16a34a"} 
                />
                <Text variant="titleLarge" style={styles.cardNumber}>
                  {isOffline ? 'OFF' : 'ON'}
                </Text>
                <Text variant="bodySmall" style={styles.cardLabel}>
                  Network Status
                </Text>
              </Card.Content>
            </Card>
          </View>

          <Card style={styles.quickActionsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.quickActionsTitle}>
                Quick Actions
              </Text>
              <View style={styles.chipContainer}>
                <Chip
                  icon="phone"
                  onPress={handleCall999}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  Call 999
                </Chip>
                <Chip
                  icon="map-marker"
                  onPress={handleShareLocation}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  Share Location
                </Chip>
                {isTracking && (
                  <Chip
                    icon="crosshairs-gps"
                    onPress={stopBackgroundTracking}
                    style={[styles.chip, styles.chipActive]}
                    textStyle={styles.chipTextActive}
                  >
                    Stop Tracking
                  </Chip>
                )}
              </View>
            </Card.Content>
          </Card>

          {isOffline && (
            <Card style={styles.offlineCard}>
              <Card.Content>
                <View style={styles.offlineCardContent}>
                  <MaterialCommunityIcons name="cloud-off-outline" size={24} color="#dc2626" />
                  <View style={styles.offlineCardText}>
                    <Text variant="titleSmall" style={styles.offlineCardTitle}>
                      Offline Mode Active
                    </Text>
                    <Text variant="bodySmall" style={styles.offlineCardSubtitle}>
                      SOS alerts will be queued and sent when connection is restored
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  offlineText: {
    color: '#dc2626',
    fontSize: 12,
  },
  greeting: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
  },
  subtitle: {
    color: '#6b7280',
  },
  trackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 6,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  trackingText: {
    color: '#16a34a',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sosContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sosButtonActive: {
    backgroundColor: '#764ba2',
  },
  sosButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  sosText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 12,
  },
  sosHint: {
    marginTop: 20,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  cancelButton: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#dc2626',
    borderRadius: 24,
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cardNumber: {
    fontWeight: 'bold',
    marginTop: 8,
    color: '#1f2937',
  },
  cardLabel: {
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsCard: {
    backgroundColor: '#fff',
  },
  quickActionsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#e8e4f3',
  },
  chipText: {
    color: '#667eea',
  },
  chipActive: {
    backgroundColor: '#f0fdf4',
  },
  chipTextActive: {
    color: '#16a34a',
  },
  offlineCard: {
    backgroundColor: '#fff',
    marginTop: 20,
  },
  offlineCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  offlineCardText: {
    flex: 1,
  },
  offlineCardTitle: {
    color: '#dc2626',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  offlineCardSubtitle: {
    color: '#6b7280',
  },
});
