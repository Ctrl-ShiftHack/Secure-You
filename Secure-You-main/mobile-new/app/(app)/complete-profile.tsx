import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    bloodGroup: '',
    emergencyContact: '',
    medicalConditions: '',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const validateForm = () => {
    if (!formData.address.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Address required',
        text2: 'Please enter your address',
      });
      return false;
    }

    if (!formData.bloodGroup) {
      Toast.show({
        type: 'error',
        text1: 'Blood group required',
        text2: 'Please select your blood group',
      });
      return false;
    }

    if (!formData.emergencyContact.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Emergency contact required',
        text2: 'Please enter an emergency contact number',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      
      if (!token || !user) {
        router.replace('/(auth)/login');
        return;
      }

      const userData = JSON.parse(user);

      const response = await fetch('https://secure-you.vercel.app/api/users/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Update user data with profileCompleted flag
        const updatedUser = { ...userData, ...formData, profileCompleted: true };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: 'success',
          text1: 'Profile completed!',
          text2: 'Welcome to Secure You',
        });

        setTimeout(() => {
          // After completing profile, go to contacts
          router.replace('/(app)/contacts');
        }, 500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to save profile',
          text2: data.message || 'Please try again',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Connection error',
        text2: 'Please check your internet connection',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/images/logo-light.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Help us serve you better in emergencies</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color="#667eea"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your full address"
                placeholderTextColor="#a8a4b8"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          {/* Blood Group */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Blood Group</Text>
            <View style={styles.bloodGroupContainer}>
              {bloodGroups.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.bloodGroupButton,
                    formData.bloodGroup === group && styles.bloodGroupButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, bloodGroup: group })}
                >
                  <Text
                    style={[
                      styles.bloodGroupText,
                      formData.bloodGroup === group && styles.bloodGroupTextActive,
                    ]}
                  >
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Emergency Contact */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Contact</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="phone"
                size={20}
                color="#667eea"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="+880 1234567890"
                placeholderTextColor="#a8a4b8"
                value={formData.emergencyContact}
                onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Medical Conditions */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medical Conditions (Optional)</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="medical-bag"
                size={20}
                color="#667eea"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Any allergies or medical conditions"
                placeholderTextColor="#a8a4b8"
                value={formData.medicalConditions}
                onChangeText={(text) => setFormData({ ...formData, medicalConditions: text })}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Complete Profile</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#e8e4f3',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 10,
    marginTop: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bloodGroupButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#e8e4f3',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bloodGroupButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  bloodGroupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  bloodGroupTextActive: {
    color: '#ffffff',
  },
  buttonWrapper: {
    borderRadius: 50,
    overflow: 'hidden',
    marginTop: 10,
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
