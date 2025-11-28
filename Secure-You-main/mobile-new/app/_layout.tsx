import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../contexts/AuthContext';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { toastConfig } from '../components/ToastConfig';

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
        <Toast config={toastConfig} />
      </AuthProvider>
    </PaperProvider>
  );
}
