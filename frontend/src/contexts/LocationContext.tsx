/**
 * Location Context
 * Manages global location state across the application
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationData {
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  country?: string;
  displayName?: string;
}

interface LocationContextType {
  currentLocation: LocationData | null;
  setCurrentLocation: (location: LocationData) => void;
  isDetecting: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useGlobalLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useGlobalLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocationState] = useState<LocationData | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Load location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('currentLocation');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setCurrentLocationState(parsed);
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    } else {
      // Auto-detect location on first load
      detectUserLocation();
    }
  }, []);

  const detectUserLocation = async () => {
    setIsDetecting(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocode to get city name
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              
              const city = data.address?.city || data.address?.town || data.address?.village || '';
              const state = data.address?.state || '';
              const country = data.address?.country || '';
              
              const locationData: LocationData = {
                lat: latitude,
                lon: longitude,
                city,
                state,
                country,
                displayName: `${city}${state ? ', ' + state : ''}${country ? ', ' + country : ''}`
              };
              
              setCurrentLocationState(locationData);
              localStorage.setItem('currentLocation', JSON.stringify(locationData));
            } catch (error) {
              console.error('Error reverse geocoding:', error);
              // Still save coordinates even if geocoding fails
              const locationData: LocationData = {
                lat: latitude,
                lon: longitude,
                displayName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              };
              setCurrentLocationState(locationData);
              localStorage.setItem('currentLocation', JSON.stringify(locationData));
            }
          },
          (error) => {
            console.log('Geolocation error:', error);
            setIsDetecting(false);
          }
        );
      }
    } catch (error) {
      console.error('Error detecting location:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const setCurrentLocation = (location: LocationData) => {
    setCurrentLocationState(location);
    localStorage.setItem('currentLocation', JSON.stringify(location));
  };

  return (
    <LocationContext.Provider value={{ currentLocation, setCurrentLocation, isDetecting }}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationProvider;
