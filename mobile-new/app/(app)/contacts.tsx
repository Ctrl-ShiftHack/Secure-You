import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const governmentHelplines = [
  { name: "Police", phone: "+880 1320 019998", icon: "shield-account" },
  { name: "Fire Service", phone: "+880 1901 020762", icon: "fire" },
  { name: "Ambulance", phone: "+880 1759 808078", icon: "ambulance" },
];

interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  email?: string;
  relationship?: string;
  is_primary?: boolean;
  created_at?: string;
}

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Contact',
      `Remove ${name} from your emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('emergency_contacts')
                .delete()
                .eq('id', id);

              if (error) throw error;
              setContacts(prev => prev.filter(c => c.id !== id));
              Alert.alert('Success', `${name} has been removed`);
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert('Error', 'Could not delete contact');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Emergency Contact
          </Text>
        </View>

        {/* Add New Contact Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Add New Emergency Contact
          </Text>
          <TouchableOpacity
            style={styles.addContactCard}
            onPress={() => router.push('/contacts/new')}
          >
            <Text style={styles.addContactText}>+880 1345 6789</Text>
            <MaterialCommunityIcons name="plus" size={24} color="#667eea" />
          </TouchableOpacity>
        </View>

        {/* Remove Emergency Contacts Section */}
        {contacts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.removeHeader}>
              <MaterialCommunityIcons name="account-multiple" size={20} color="#667eea" />
              <Text variant="titleMedium" style={styles.sectionTitleIcon}>
                Remove Emergency Contacts
              </Text>
            </View>

            {contacts.map((contact) => (
              <View key={contact.id} style={styles.removeContactCard}>
                <View>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone_number}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(contact.id, contact.name)}>
                  <MaterialCommunityIcons name="delete" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Government Helpline Section */}
        <View style={styles.section}>
          <View style={styles.removeHeader}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#667eea" />
            <Text variant="titleMedium" style={styles.sectionTitleIcon}>
              Goverment Helpline
            </Text>
          </View>

          {governmentHelplines.map((helpline, index) => (
            <TouchableOpacity
              key={index}
              style={styles.helplineCard}
              onPress={() => handleCall(helpline.phone)}
            >
              <View style={styles.helplineInfo}>
                <Text style={styles.helplineName}>{helpline.name}</Text>
                <Text style={styles.helplinePhone}>{helpline.phone}</Text>
              </View>
              <MaterialCommunityIcons name="phone" size={20} color="#667eea" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm Button */}
        <TouchableOpacity activeOpacity={0.8}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Go back link */}
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.push('/(app)/home')}
        >
          <Text style={styles.backLinkText}>
            Go back to <Text style={styles.backLinkBold}>Home</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingTop: 20,
  },
  title: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sectionTitleIcon: {
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  removeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addContactCard: {
    backgroundColor: '#e8e4f3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addContactText: {
    color: '#6b7280',
    fontSize: 16,
  },
  removeContactCard: {
    backgroundColor: '#e8e4f3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactName: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  contactPhone: {
    color: '#6b7280',
  },
  helplineCard: {
    backgroundColor: '#e8e4f3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  helplineInfo: {
    flex: 1,
  },
  helplineName: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  helplinePhone: {
    color: '#6b7280',
  },
  confirmButton: {
    marginHorizontal: 24,
    borderRadius: 50,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backLinkText: {
    color: '#6b7280',
    fontSize: 14,
  },
  backLinkBold: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
});