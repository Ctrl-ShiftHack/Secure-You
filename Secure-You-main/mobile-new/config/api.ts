import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'http://localhost:5000/api',
  },
  staging: {
    apiUrl: 'https://secure-you-backend-staging.vercel.app/api',
  },
  prod: {
    apiUrl: 'https://secure-you.vercel.app/api',
  },
};

const getEnvVars = () => {
  // Use environment variable if set
  if (process.env.EXPO_PUBLIC_API_URL) {
    return { apiUrl: process.env.EXPO_PUBLIC_API_URL };
  }

  // Default to production
  if (Constants.expoConfig?.extra?.apiUrl) {
    return { apiUrl: Constants.expoConfig.extra.apiUrl };
  }

  // Fallback based on __DEV__
  if (__DEV__) {
    return ENV.dev;
  }

  return ENV.prod;
};

export default getEnvVars();
