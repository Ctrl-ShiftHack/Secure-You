import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { Text, Button, Avatar, List, Switch, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const [locationSharing, setLocationSharing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');

  const userName = profile?.full_name || 'User';
  const userEmail = user?.email || 'email@example.com';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Could not sign out');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change feature coming soon!');
  };

  const handleLanguageChange = () => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      [
        {
          text: 'English',
          onPress: () => setLanguage('English'),
        },
        {
          text: 'বাংলা (Bangla)',
          onPress: () => setLanguage('বাংলা'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleHelp = () => {
    Linking.openURL('mailto:support@secureyou.app?subject=Help Request');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy Policy', 'Your privacy is important to us.');
  };

  const handleTerms = () => {
    Alert.alert('Terms of Service', 'Please review our terms of service.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Profile & Settings
          </Text>
        </View>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <Avatar.Text
            size={80}
            label={userInitials}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <Text variant="headlineSmall" style={styles.userName}>
            {userName}
          </Text>
          <Text variant="bodyMedium" style={styles.userEmail}>
            {userEmail}
          </Text>
          <Button
            mode="outlined"
            onPress={handleEditProfile}
            style={styles.editButton}
            textColor="#667eea"
            buttonColor="transparent"
          >
            Edit Profile
          </Button>
        </View>

        <Divider style={styles.divider} />

        {/* Account Settings */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            ACCOUNT SETTINGS
          </Text>

          <List.Item
            title="Full Name"
            description={userName}
            left={(props) => (
              <List.Icon {...props} icon="account" color="#6b7280" />
            )}
            right={(props) => (
              <List.Icon {...props} icon="chevron-right" color="#9ca3af" />
            )}
            onPress={handleEditProfile}
            style={styles.listItem}
          />

          <List.Item
            title="Email Address"
            description={userEmail}
            left={(props) => <List.Icon {...props} icon="email" color="#6b7280" />}
            right={(props) => (
              <List.Icon {...props} icon="chevron-right" color="#9ca3af" />
            )}
            onPress={handleEditProfile}
            style={styles.listItem}
          />

          <List.Item
            title="Change Password"
            description="Update your password"
            left={(props) => <List.Icon {...props} icon="lock" color="#6b7280" />}
            right={(props) => (
              <List.Icon {...props} icon="chevron-right" color="#9ca3af" />
            )}
            onPress={handleChangePassword}
            style={styles.listItem}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Emergency Settings */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            EMERGENCY SETTINGS
          </Text>

          <List.Item
            title="Location Sharing"
            description={
              locationSharing
                ? 'Active - Share location in emergencies'
                : 'Inactive - Enable for emergency alerts'
            }
            left={(props) => (
              <List.Icon {...props} icon="map-marker" color="#6b7280" />
            )}
            right={() => (
              <Switch
                value={locationSharing}
                onValueChange={setLocationSharing}
                color="#667eea"
              />
            )}
            style={styles.listItem}
          />

          <List.Item
            title="Emergency Contacts"
            description="Manage your emergency contacts"
            left={(props) => (
              <List.Icon {...props} icon="account-multiple" color="#6b7280" />
            )}
            right={(props) => (
              <List.Icon {...props} icon="chevron-right" color="#9ca3af" />
            )}
            onPress={() => router.push('/(app)/contacts')}
            style={styles.listItem}
          />
        </View>

        <Divider style={styles.divider} />

        {/* App Settings */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            APP SETTINGS
          </Text>

          <List.Item
            title="Language"
            description={language}
            left={(props) => <List.Icon {...props} icon="web" color="#6b7280" />}
            right={(props) => (
              <List.Icon {...props} icon="chevron-right" color="#9ca3af" />
            )}
            onPress={handleLanguageChange}
            style={styles.listItem}
          />

          <List.Item
            title="Notifications"
            description={notifications ? 'Enabled' : 'Disabled'}
            left={(props) => <List.Icon {...props} icon="bell" color="#6b7280" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color="#667eea"
              />
            )}
            style={styles.listItem}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Support */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            SUPPORT & LEGAL
          </Text>

          <List.Item
            title="Help & Support"
            description="Get help or report issues"
            left={(props) => (
              <List.Icon {...props} icon="help-circle" color="#6b7280" />
            )}
            right={(props) => (
              <List.Icon {...props} icon="chevron-right" color="#9ca3af" />
            )}
            onPress={handleHelp}
            style={styles.listItem}
          />

          <List.Item
            title="Privacy Policy"
            description="Read our privacy policy"
            left={(props) => <List.Icon {...props} icon="shield" color="#6b7280" />}
            right={(props) => (
              <List.Icon {...props} icon="chevron-right" color="#9ca3af" />
            )}
            onPress={handlePrivacy}
            style={styles.listItem}
          />

          <List.Item
            title="Terms of Service"
            description="Read our terms of service"
            left={(props) => (
              <List.Icon {...props} icon="file-document" color="#6b7280" />
            )}
            right={(props) => (
              <List.Icon {...props} icon="chevron-right" color="#9ca3af" />
            )}
            onPress={handleTerms}
            style={styles.listItem}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Logout Button */}
        <View style={styles.section}>
          <Button
            mode="contained"
            buttonColor="#667eea"
            onPress={handleLogout}
            style={styles.logoutButton}
            icon="logout"
          >
            Logout
          </Button>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text variant="bodySmall" style={styles.versionText}>
            SecureYou v1.0.0
          </Text>
          <Text variant="bodySmall" style={styles.versionText}>
            © 2025 SecureYou. All rights reserved.
          </Text>
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
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    backgroundColor: '#e8e4f3',
    marginBottom: 16,
  },
  avatarLabel: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  userName: {
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  userEmail: {
    color: '#6b7280',
    marginTop: 4,
  },
  editButton: {
    marginTop: 16,
    borderColor: '#667eea',
    borderRadius: 20,
  },
  section: {
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  sectionTitle: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listItem: {
    paddingVertical: 4,
  },
  divider: {
    height: 8,
    backgroundColor: '#f8f9fa',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 24,
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
  },
  versionText: {
    color: '#9ca3af',
    marginVertical: 2,
  },
});