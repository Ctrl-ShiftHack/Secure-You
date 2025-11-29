import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.secureyou.app',
  appName: 'SecureYou',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FF6B6B',
      showSpinner: true,
      spinnerColor: '#FFFFFF'
    },
    Geolocation: {
      iosAllowsBackgroundLocationUpdates: true,
      androidEnableBackgroundLocationUpdates: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
