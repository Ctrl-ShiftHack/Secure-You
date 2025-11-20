import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Pressable, Animated } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const [sosActive, setSosActive] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [contactsCount, setContactsCount] = useState(0);
  const { profile, user } = useAuth();
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    loadContactsCount();
  }, [user]);

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

  const handleSOSPress = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSosActive(true);
      Alert.alert(
        '🚨 SOS Alert Sent',
        `Emergency alert sent to ${contactsCount} contact(s)!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSosActive(false);
              Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
              }).start();
            },
          },
        ]
      );
    }, 3000);
    setLongPressTimer(timer);
  };

  const handleSOSRelease = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome, {firstName}!
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Your safety is our priority
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sosContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onPressIn={handleSOSPress}
              onPressOut={handleSOSRelease}
              style={[
                styles.sosButton,
                sosActive && styles.sosButtonActive,
              ]}
            >
              <MaterialCommunityIcons
                name={sosActive ? 'shield-alert' : 'shield-check'}
                size={80}
                color="white"
              />
              <Text variant="headlineSmall" style={styles.sosText}>
                {sosActive ? 'SENDING...' : 'SOS'}
              </Text>
            </Pressable>
          </Animated.View>
          <Text variant="bodyMedium" style={styles.sosHint}>
            {sosActive
              ? 'Alert sent to your contacts'
              : 'Hold for 3 seconds to send emergency alert'}
          </Text>
        </View>

        <View style={styles.infoCards}>
          <Card style={styles.infoCard}>
            <Card.Content style={styles.cardContent}>
              <MaterialCommunityIcons name="account-group" size={32} color="#dc2626" />
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
              <MaterialCommunityIcons name="map-marker-check" size={32} color="#16a34a" />
              <Text variant="titleLarge" style={styles.cardNumber}>
                {profile?.location_sharing_enabled ? 'ON' : 'OFF'}
              </Text>
              <Text variant="bodySmall" style={styles.cardLabel}>
                Location Sharing
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
                onPress={() => {}}
                style={styles.chip}
                textStyle={styles.chipText}
              >
                Call 999
              </Chip>
              <Chip
                icon="map-marker"
                onPress={() => {}}
                style={styles.chip}
                textStyle={styles.chipText}
              >
                Share Location
              </Chip>
            </View>
          </Card.Content>
        </Card>
      </View>
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
  greeting: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
  },
  subtitle: {
    color: '#6b7280',
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
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sosButtonActive: {
    backgroundColor: '#991b1b',
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
    backgroundColor: '#fef2f2',
  },
  chipText: {
    color: '#dc2626',
  },
});
