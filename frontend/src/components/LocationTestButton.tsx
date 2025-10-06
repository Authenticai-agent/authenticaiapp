/**
 * Dynamic Location Test Button Component
 * Tests the user's current location with real environmental data
 * Can be used in both development and production
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { airQualityAPI } from '../services/api';
import toast from 'react-hot-toast';

interface LocationTestButtonProps {
  className?: string;
  onDataUpdate?: (data: any) => void;
}

export const LocationTestButton: React.FC<LocationTestButtonProps> = ({ 
  className, 
  onDataUpdate 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const testCurrentLocation = async () => {
    setIsLoading(true);
    
    try {
      // Get user's current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      // Fetch air quality data for current location
      const airQualityResponse = await airQualityAPI.getComprehensive(lat, lon);
      
      // Use direct API call for coaching data
      const response = await fetch(`http://localhost:8000/api/v1/coaching/daily-briefing?lat=${lat}&lon=${lon}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const coachingResponse = { data: await response.json() };
      
      // Show results in toast
      const airData = airQualityResponse.data;
      const coachingData = coachingResponse.data;
      
      // Get location name via reverse geocoding
      const locationName = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
        .then(res => res.json())
        .then(data => `${data.city || data.locality || 'Unknown'}, ${data.countryName || 'Unknown'}`)
        .catch(() => 'Current Location');

      toast.success(
        `📍 Location Test Results:\n` +
        `Location: ${locationName}\n` +
        `AQI: ${airData.air_quality?.aqi || 'N/A'}\n` +
        `PM2.5: ${airData.air_quality?.pm25 || 'N/A'} μg/m³\n` +
        `Risk Score: ${coachingData.risk_score || 'N/A'}\n` +
        `Risk Level: ${coachingData.risk_level || 'N/A'}`,
        { duration: 8000 }
      );
      
      // Call callback if provided
      if (onDataUpdate) {
        onDataUpdate({
          location: { lat, lon, city: locationName },
          airQuality: airData,
          coaching: coachingData
        });
      }
      
    } catch (error) {
      console.error('Error testing current location:', error);
      if (error instanceof GeolocationPositionError || (error as any).code) {
        toast.error('Location access denied. Please enable location services and try again.');
      } else {
        toast.error('Failed to fetch location data. Check console for details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={testCurrentLocation}
      disabled={isLoading}
      className={clsx(
        "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm",
        "text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500",
        "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        className
      )}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Testing...
        </>
      ) : (
        <>
          📍 Test Current Location
        </>
      )}
    </button>
  );
};

export default LocationTestButton;
