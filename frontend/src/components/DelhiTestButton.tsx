/**
 * Delhi Test Button Component
 * Provides a quick way to test Delhi, India's extreme pollution data
 * Can be used in both development and production
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { airQualityAPI } from '../services/api';
import toast from 'react-hot-toast';

interface DelhiTestButtonProps {
  className?: string;
  onDataUpdate?: (data: any) => void;
}

export const DelhiTestButton: React.FC<DelhiTestButtonProps> = ({ 
  className, 
  onDataUpdate 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const testDelhiPollution = async () => {
    setIsLoading(true);
    
    try {
      // Delhi coordinates
      const lat = 28.6139;
      const lon = 77.2090;
      
      // Fetch air quality data for Delhi
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
      
      toast.success(
        `🚨 Delhi Test Results:\n` +
        `AQI: ${airData.air_quality?.aqi || 'N/A'}\n` +
        `PM2.5: ${airData.air_quality?.pm25 || 'N/A'} μg/m³\n` +
        `Risk Score: ${coachingData.risk_score || 'N/A'}\n` +
        `Risk Level: ${coachingData.risk_level || 'N/A'}`,
        { duration: 8000 }
      );
      
      // Call callback if provided
      if (onDataUpdate) {
        onDataUpdate({
          location: { lat, lon, city: 'Delhi', country: 'India' },
          airQuality: airData,
          coaching: coachingData
        });
      }
      
    } catch (error) {
      console.error('Error testing Delhi pollution:', error);
      toast.error('Failed to fetch Delhi pollution data. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={testDelhiPollution}
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
          🚨 Test Delhi Pollution
        </>
      )}
    </button>
  );
};

export default DelhiTestButton;
