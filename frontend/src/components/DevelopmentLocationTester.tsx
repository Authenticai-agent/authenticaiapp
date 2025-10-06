/**
 * Development Location Tester Component
 * Provides buttons to simulate location changes for testing
 * Only visible in development mode
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';

interface LocationData {
  name: string;
  lat: number;
  lon: number;
  city: string;
  country: string;
  timezone: string;
  climate_type: string;
  population_density: string;
}

interface DevelopmentLocationTesterProps {
  className?: string;
}

const TEST_LOCATIONS: LocationData[] = [
  {
    name: "New York City",
    lat: 40.7128,
    lon: -74.0060,
    city: "New York",
    country: "United States",
    timezone: "America/New_York",
    climate_type: "temperate_north",
    population_density: "urban"
  },
  {
    name: "Los Angeles",
    lat: 34.0522,
    lon: -118.2437,
    city: "Los Angeles",
    country: "United States", 
    timezone: "America/Los_Angeles",
    climate_type: "tropical",
    population_density: "urban"
  },
  {
    name: "London",
    lat: 51.5074,
    lon: -0.1278,
    city: "London",
    country: "United Kingdom",
    timezone: "Europe/London",
    climate_type: "temperate_north",
    population_density: "urban"
  },
  {
    name: "Tokyo",
    lat: 35.6762,
    lon: 139.6503,
    city: "Tokyo",
    country: "Japan",
    timezone: "Asia/Tokyo",
    climate_type: "temperate_north",
    population_density: "urban"
  },
  {
    name: "Sydney",
    lat: -33.8688,
    lon: 151.2093,
    city: "Sydney",
    country: "Australia",
    timezone: "Australia/Sydney",
    climate_type: "temperate_south",
    population_density: "urban"
  },
  {
    name: "Rural Montana",
    lat: 48.7959,
    lon: -104.7007,
    city: "Wolf Point",
    country: "United States",
    timezone: "America/Denver",
    climate_type: "temperate_north",
    population_density: "rural"
  },
  {
    name: "High Altitude Denver",
    lat: 39.7392,
    lon: -104.9903,
    city: "Denver",
    country: "United States",
    timezone: "America/Denver",
    climate_type: "temperate_north",
    population_density: "suburban"
  },
  {
    name: "Coastal Miami",
    lat: 25.7617,
    lon: -80.1918,
    city: "Miami",
    country: "United States",
    timezone: "America/New_York",
    climate_type: "tropical",
    population_density: "urban"
  },
  {
    name: "Delhi, India (High Pollution)",
    lat: 28.6139,
    lon: 77.2090,
    city: "Delhi",
    country: "India",
    timezone: "Asia/Kolkata",
    climate_type: "tropical",
    population_density: "urban"
  }
];

export const DevelopmentLocationTester: React.FC<DevelopmentLocationTesterProps> = ({ className }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData>(TEST_LOCATIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [locationHistory, setLocationHistory] = useState<Array<LocationData & { timestamp: Date }>>([]);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleLocationChange = async (location: LocationData) => {
    setIsLoading(true);
    
    // Update state immediately for better UX
    setCurrentLocation(location);
    setLocationHistory(prev => [
      { ...location, timestamp: new Date() },
      ...prev.slice(0, 4) // Keep last 5 location changes
    ]);
    
    try {
      // Dispatch location change event for other components to listen
      const locationChangeEvent = new CustomEvent('locationChanged', {
        detail: {
          lat: location.lat,
          lon: location.lon,
          city: location.city,
          country: location.country,
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(locationChangeEvent);

      // Optional: Call backend endpoint (non-blocking)
      fetch('http://localhost:8000/api/v1/location/trigger-environmental-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          user_id: 'dev_test_user'
        })
      }).catch(err => console.log('Backend update failed (non-critical):', err));

      console.log(`✅ Location changed to ${location.city}, ${location.country}`);
    } catch (error) {
      console.error('Error changing location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationButtonClass = (location: LocationData, isActive: boolean) =>
    clsx(
      "px-3 py-2 text-sm font-medium rounded-md transition-colors",
      "border border-gray-300 hover:border-purple-500",
      isActive
        ? "bg-purple-100 text-purple-800 border-purple-500"
        : "bg-white text-gray-700 hover:bg-gray-50",
      isLoading && "opacity-50 cursor-not-allowed"
    );

  return (
    <div className={clsx("bg-gray-50 border border-purple-200 rounded-lg p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🧪</span>
          <h3 className="text-lg font-semibold text-purple-800">Development Location Tester</h3>
        </div>
        <div className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
          Current: {currentLocation.city}, {currentLocation.country}
        </div>
      </div>

      {/* Current Location Info */}
      <div className="mb-4 p-3 bg-white rounded border">
        <h4 className="font-medium text-gray-900 mb-2">📍 Current Location</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">City:</span> 
            <span className="ml-1 font-medium">{currentLocation.city}</span>
          </div>
          <div>
            <span className="text-gray-500">Country:</span> 
            <span className="ml-1 font-medium">{currentLocation.country}</span>
          </div>
          <div>
            <span className="text-gray-500">Coordinates:</span> 
            <span className="ml-1 font-medium">{currentLocation.lat}, {currentLocation.lon}</span>
          </div>
          <div>
            <span className="text-gray-500">Climate:</span> 
            <span className="ml-1 font-medium">{currentLocation.climate_type}</span>
          </div>
        </div>
      </div>

      {/* Extreme Pollution Test Button */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">🔥 Extreme Pollution Test</h4>
        <button
          onClick={() => handleLocationChange(TEST_LOCATIONS.find(l => l.city === "Delhi")!)}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors border-2 border-red-600 hover:border-red-700 disabled:opacity-50"
        >
          🚨 Test Delhi, India (Risk Score: 100) 🚨
        </button>
        <p className="text-xs text-gray-600 mt-1">
          Delhi has AQI 200+ and PM2.5 of 56+ μg/m³ - perfect for testing extreme pollution scenarios
        </p>
      </div>

      {/* Location Selection Buttons */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">🚀 Other Test Locations</h4>
        <div className="grid grid-cols-2 gap-2">
          {TEST_LOCATIONS.filter(l => l.city !== "Delhi").map((location) => (
            <button
              key={location.name}
              onClick={() => handleLocationChange(location)}
              disabled={isLoading}
              className={getLocationButtonClass(location, location.name === currentLocation.name)}
            >
              {location.name}
            </button>
          ))}
        </div>
      </div>

      {/* Location History */}
      {locationHistory.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">📜 Location History</h4>
          <div className="space-y-1">
            {locationHistory.map((location, index) => (
              <div key={index} className="flex justify-between items-center text-sm bg-white px-2 py-1 rounded border">
                <span className="font-medium">{location.city}, {location.country}</span>
                <span className="text-gray-500 text-xs">
                  {location.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border">
        <strong>💡 Instructions:</strong> Click locations to simulate travel. Each change triggers:
        <ul className="mt-1 ml-4 list-disc">
          <li>Environmental data refresh</li>
          <li>Risk assessment recalculation</li>
          <li>User profile adaptation</li>
          <li>Travel analytics update</li>
        </ul>
      </div>
    </div>
  );
};

export default DevelopmentLocationTester;
