import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      
      if (token && user) {
        // User is logged in, check if profile is completed
        const userData = JSON.parse(user);
        if (userData.profileCompleted) {
          // Profile completed, go to contacts
          router.replace('/(app)/contacts');
        } else {
          // Profile not completed, go to complete profile
          router.replace('/(app)/complete-profile');
        }
      } else {
        // User is not logged in, go to splash then login
        router.replace('/splash');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, go to splash then login
      router.replace('/splash');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#667eea' }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}
