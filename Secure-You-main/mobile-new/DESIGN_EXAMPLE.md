# Mobile App Design - Exact Match to Web Version

## Overview
This document shows exactly how the mobile app screens should match the web version.

---

## 1. CONTACTS SCREEN (`app/(app)/contacts.tsx`)

### Web Design Features:
- **Header**: "Emergency Contacts" title with subtitle
- **Two Sections**:
  1. Personal Emergency Contacts (user-added, with edit/delete/call buttons)
  2. Government Helplines (fixed list: 999, 109, 1098)
- **Styling**: Cards with rounded corners, shadow, brand red buttons
- **Functionality**: 
  - Add new contact button (red gradient)
  - Call button for each contact
  - Edit/Delete options
  - Government helplines always visible at bottom

### Current Mobile Issues:
- ❌ Empty generic list
- ❌ No government helplines
- ❌ No Supabase integration
- ❌ Missing call functionality

### Required Changes:
```tsx
// Add these helplines at the top of the file:
const governmentHelplines = [
  { name: "Police (National Emergency)", phone: "999", relation: "Emergency" },
  { name: "Fire Service", phone: "999", relation: "Emergency" },
  { name: "Ambulance Service", phone: "999", relation: "Emergency" },
  { name: "Women & Children Helpline", phone: "109", relation: "Support" },
  { name: "Child Helpline", phone: "1098", relation: "Support" },
];

// Load contacts from Supabase
// Display personal contacts in cards
// Display government helplines below
// Add call functionality using Linking.openURL(`tel:${phone}`)
```

---

## 2. INCIDENTS SCREEN (`app/(app)/incidents.tsx`)

### Web Design Features:
- **Social Feed**: Posts from all users (like Twitter/Instagram)
- **Create Post Section**:
  - Text input
  - Image upload button
  - Location selector (manual or GPS)
- **Post Display**:
  - User avatar and name
  - Post text content
  - Image (if attached)
  - Location (if added)
  - Timestamp (e.g., "2 hours ago")
  - Reactions (like, support, share)
- **Real-time Updates**: New posts appear automatically
- **Styling**: Cards with images, rounded corners, interaction buttons

### Current Mobile Issues:
- ❌ Empty incident list
- ❌ No post creation
- ❌ No image upload
- ❌ No location features
- ❌ No reactions

### Required Changes:
```tsx
// Create post form at the top:
// - TextInput for post content
// - Image picker button (expo-image-picker)
// - Location button (manual input or GPS)
// - Submit button (red gradient)

// Load posts from Supabase 'posts_with_counts' view
// Display posts in FlatList with:
// - User profile info
// - Post content
// - Image (if exists)
// - Location (if exists)
// - Time ago (e.g., "2h ago")
// - Reaction buttons (heart, hand, share icons)
```

---

## 3. PROFILE/SETTINGS SCREEN (`app/(app)/profile.tsx`)

### Web Design Features:
- **User Profile Section**:
  - Avatar with initials
  - Full name
  - Email address
  - Edit profile button
- **Settings Options**:
  - Account Settings (name, email, password)
  - Location Sharing Toggle
  - Language Selection (English, বাংলা)
  - Notifications Toggle
  - Help & Support
  - Privacy Policy
  - Terms of Service
- **Emergency System Status**:
  - Offline cache status
  - Queued alerts count
  - Location tracking status
- **Logout Button**: Red button at bottom
- **Styling**: Grouped sections with icons, toggle switches

### Current Mobile Issues:
- ❌ Static hardcoded data
- ❌ No real settings
- ❌ No location toggle
- ❌ No language selection
- ❌ Missing emergency status

### Required Changes:
```tsx
// Load user profile from AuthContext
// Display actual user name and email
// Add settings sections:
// 1. Account (edit profile, change password)
// 2. Location Sharing (toggle switch)
// 3. Language (English/বাংলা dropdown)
// 4. Notifications (toggle)
// 5. Emergency Status (cache info, queued alerts)
// 6. Help & Support
// 7. Logout (signOut from AuthContext)
```

---

## 4. HOME SCREEN (`app/(app)/home.tsx`)

### Web Design Features (Dashboard):
- **Welcome Header**: "Welcome, [FirstName]!" with subtitle
- **Large SOS Button**: 
  - Red circle (200x200)
  - Shield icon
  - "Hold for 3 seconds" text
  - Animation on press
- **Info Cards**:
  - Emergency Contacts count (with icon)
  - Location Sharing status (Active/Inactive)
- **Quick Actions**:
  - Call 999 button
  - Share Location button
- **Functionality**:
  - Hold SOS for 3 seconds → sends alert to all contacts
  - Shows contact count from Supabase
  - Location sharing toggle

### Current Mobile Status:
- ✅ Welcome header working
- ✅ SOS button with animation
- ✅ Contact count loading
- ⚠️ Missing Quick Actions section
- ⚠️ Missing Location status card

### Required Changes:
```tsx
// Add Quick Actions section below info cards:
<View style={styles.quickActions}>
  <Text style={styles.sectionTitle}>Quick Actions</Text>
  <View style={styles.actionButtons}>
    <Chip 
      icon="phone" 
      onPress={() => Linking.openURL('tel:999')}
      style={styles.actionChip}
    >
      Call 999
    </Chip>
    <Chip 
      icon="map-marker" 
      onPress={handleShareLocation}
      style={styles.actionChip}
    >
      Share Location
    </Chip>
  </View>
</View>
```

---

## Color Scheme (Exact Match)

### Primary Colors:
- **Brand Red**: `#dc2626` (buttons, active tabs, SOS button)
- **Background**: `#f8f9fa` (light gray)
- **Card Background**: `#ffffff` (white)
- **Border**: `#e5e7eb` (light gray border)

### Text Colors:
- **Primary Text**: `#111827` (almost black)
- **Secondary Text**: `#6b7280` (medium gray)
- **Muted Text**: `#9ca3af` (light gray)

### Status Colors:
- **Success**: `#10b981` (green)
- **Warning**: `#f59e0b` (orange)
- **Error**: `#ef4444` (red)
- **Info**: `#3b82f6` (blue)

---

## Typography:

### Font Sizes:
- **Headline**: 24px (headlineMedium)
- **Title**: 20px (titleLarge)
- **Body**: 16px (bodyLarge)
- **Caption**: 14px (bodyMedium)
- **Small**: 12px (bodySmall)

### Font Weights:
- **Bold**: 700 (headlines, buttons)
- **Semibold**: 600 (titles)
- **Regular**: 400 (body text)

---

## Spacing:

- **Screen Padding**: 16px (horizontal), 20px (vertical)
- **Card Padding**: 16px (all sides)
- **Element Spacing**: 12px (between elements)
- **Section Spacing**: 24px (between sections)

---

## Border Radius:

- **Buttons**: 24px (fully rounded)
- **Cards**: 16px (rounded-2xl)
- **Inputs**: 12px (rounded-xl)
- **Chips**: 20px (pill shape)

---

## Icons:

### Material Community Icons Used:
- `shield-check` - SOS button, security
- `account` - User profile
- `phone` - Call button
- `email` - Email
- `map-marker` - Location
- `heart` - Like reaction
- `hand-heart` - Support reaction
- `share` - Share button
- `image` - Image upload
- `cog` - Settings
- `bell` - Notifications
- `logout` - Sign out

---

## Required Packages:

```json
{
  "expo-image-picker": "~16.0.3",  // For image uploads
  "expo-linking": "~7.0.3",         // For tel: and mailto: links
  "expo-location": "~18.0.4",       // For GPS location
  "@react-native-async-storage/async-storage": "~2.1.0"  // For cache
}
```

---

## Example: Complete Contacts Screen

```tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Text, Button, Card, IconButton, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const governmentHelplines = [
  { name: "Police (National Emergency)", phone: "999", relation: "Emergency" },
  { name: "Fire Service", phone: "999", relation: "Emergency" },
  { name: "Ambulance Service", phone: "999", relation: "Emergency" },
  { name: "Women & Children Helpline", phone: "109", relation: "Support" },
  { name: "Child Helpline", phone: "1098", relation: "Support" },
];

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    try {
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
            } catch (error) {
              console.error('Error deleting contact:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Emergency Contacts
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            People who will be notified during emergencies
          </Text>
        </View>

        {/* Personal Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Your Contacts {contacts.length > 0 && `(${contacts.length})`}
            </Text>
          </View>

          {loading ? (
            <Text>Loading...</Text>
          ) : contacts.length > 0 ? (
            contacts.map((contact) => (
              <Card key={contact.id} style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.contactInfo}>
                    <View style={styles.avatar}>
                      <MaterialCommunityIcons name="account" size={24} color="#dc2626" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text variant="titleMedium" style={styles.contactName}>
                        {contact.name}
                      </Text>
                      <Text variant="bodyMedium" style={styles.contactPhone}>
                        {contact.phone_number}
                      </Text>
                      <Text variant="bodySmall" style={styles.contactRelation}>
                        {contact.relationship}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <IconButton
                      icon="phone"
                      size={20}
                      iconColor="#fff"
                      containerColor="#dc2626"
                      onPress={() => handleCall(contact.phone_number)}
                    />
                    <IconButton
                      icon="pencil"
                      size={20}
                      iconColor="#6b7280"
                      onPress={() => router.push(`/contacts/edit/${contact.id}`)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor="#ef4444"
                      onPress={() => handleDelete(contact.id, contact.name)}
                    />
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No emergency contacts added yet</Text>
                <Button
                  mode="contained"
                  buttonColor="#dc2626"
                  style={styles.addButton}
                  onPress={() => router.push('/contacts/new')}
                >
                  Add Your First Contact
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Government Helplines */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Government Helplines (Bangladesh)
          </Text>

          {governmentHelplines.map((helpline, index) => (
            <Card key={index} style={styles.card}>
              <Card.Content style={styles.helplineContent}>
                <View style={styles.helplineInfo}>
                  <MaterialCommunityIcons name="shield-check" size={24} color="#dc2626" />
                  <View style={styles.helplineDetails}>
                    <Text variant="titleSmall" style={styles.helplineName}>
                      {helpline.name}
                    </Text>
                    <Text variant="bodyMedium" style={styles.helplinePhone}>
                      {helpline.phone}
                    </Text>
                  </View>
                </View>
                <Button
                  mode="contained"
                  buttonColor="#dc2626"
                  onPress={() => handleCall(helpline.phone)}
                >
                  Call
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        customSize={56}
        backgroundColor="#dc2626"
        onPress={() => router.push('/contacts/new')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontWeight: '600',
    color: '#111827',
  },
  contactPhone: {
    color: '#6b7280',
    marginTop: 2,
  },
  contactRelation: {
    color: '#9ca3af',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 16,
  },
  addButton: {
    borderRadius: 24,
  },
  helplineContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helplineInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  helplineDetails: {
    marginLeft: 12,
    flex: 1,
  },
  helplineName: {
    fontWeight: '600',
    color: '#111827',
  },
  helplinePhone: {
    color: '#6b7280',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
```

---

## Next Steps:

1. ✅ **Review this example** - Understand the exact design
2. 🔄 **Update Contacts screen** - Implement government helplines
3. 🔄 **Update Incidents screen** - Add post creation and feed
4. 🔄 **Update Profile screen** - Add settings and toggles
5. 🔄 **Enhance Home screen** - Add quick actions section
6. ✅ **Test on device** - Verify all features work

Would you like me to implement these changes now?
