import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Location {
  lat: number;
  lon: number;
  address?: string;
}

/**
 * Hook for managing user location with temporary override support
 * 
 * - GPS location is saved to database and localStorage (persistent)
 * - Users can set temporary location (e.g., for travel planning)
 * - Temporary location is cleared on logout
 * - GPS location is restored on next login
 */
export function useLocation() {
  const { user, updateUser } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isTemporary, setIsTemporary] = useState(false);

  useEffect(() => {
    // Priority: temp_location > user.location > gps_location > default (NYC)
    const tempLocation = localStorage.getItem('temp_location');
    const gpsLocation = localStorage.getItem('gps_location');
    
    if (tempLocation) {
      // User has set a temporary location
      try {
        const parsed = JSON.parse(tempLocation);
        setCurrentLocation(parsed);
        setIsTemporary(true);
      } catch (e) {
        localStorage.removeItem('temp_location');
        setCurrentLocation(user?.location || null);
        setIsTemporary(false);
      }
    } else if (user?.location) {
      // Use user's saved GPS location from profile
      setCurrentLocation(user.location);
      setIsTemporary(false);
    } else if (gpsLocation) {
      // Use cached GPS location from localStorage
      try {
        const parsed = JSON.parse(gpsLocation);
        setCurrentLocation(parsed);
        setIsTemporary(false);
      } catch (e) {
        localStorage.removeItem('gps_location');
        setCurrentLocation(null);
        setIsTemporary(false);
      }
    } else {
      // No location available - features will prompt user
      setCurrentLocation(null);
      setIsTemporary(false);
    }
  }, [user?.location]);

  /**
   * Set a temporary location (e.g., for checking air quality in another city)
   * This location will be cleared on logout
   */
  const setTemporaryLocation = (location: Location) => {
    localStorage.setItem('temp_location', JSON.stringify(location));
    setCurrentLocation(location);
    setIsTemporary(true);
  };

  /**
   * Clear temporary location and revert to GPS location
   */
  const clearTemporaryLocation = () => {
    localStorage.removeItem('temp_location');
    setCurrentLocation(user?.location || null);
    setIsTemporary(false);
  };

  /**
   * Update the permanent GPS location (saved to database)
   */
  const updateGPSLocation = async (location: Location) => {
    // Update local state immediately for instant UI feedback
    setCurrentLocation(location);
    setIsTemporary(false);
    localStorage.setItem('gps_location', JSON.stringify(location));
    localStorage.removeItem('temp_location'); // Clear temp when updating GPS
    
    try {
      // Try to save to database (may fail if auth error, but local state already updated)
      await updateUser({ location });
    } catch (error) {
      console.error('Failed to update GPS location in database:', error);
      // Don't throw - location is already set locally
      // The updateUser function handles auth errors gracefully
    }
  };

  /**
   * Request current GPS location from browser
   */
  const requestCurrentGPS = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  return {
    currentLocation,        // The location currently in use
    isTemporary,           // Whether current location is temporary
    gpsLocation: user?.location,  // The permanent GPS location
    setTemporaryLocation,  // Set a temporary location
    clearTemporaryLocation, // Clear temporary and use GPS
    updateGPSLocation,     // Update permanent GPS location
    requestCurrentGPS,     // Get current GPS from browser
  };
}
