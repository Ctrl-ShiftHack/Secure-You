import { useState, useEffect } from 'react';

/**
 * Hook to ensure Google Maps API is loaded before using it
 * Returns loading state and whether Maps API is ready
 */
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Wait for script to load
    const checkGoogleMaps = setInterval(() => {
      if (window.google?.maps) {
        setIsLoaded(true);
        clearInterval(checkGoogleMaps);
      }
    }, 100);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkGoogleMaps);
      if (!window.google?.maps) {
        setLoadError(new Error('Google Maps failed to load'));
      }
    }, 10000);

    return () => {
      clearInterval(checkGoogleMaps);
      clearTimeout(timeout);
    };
  }, []);

  return { isLoaded, loadError };
};
