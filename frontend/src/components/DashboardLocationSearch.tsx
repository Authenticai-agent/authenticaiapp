import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { CitySearchDropdown } from './CitySearchDropdown';
import { useGlobalLocation } from '../contexts/LocationContext';

const DashboardLocationSearch: React.FC = () => {
  const { currentLocation, setCurrentLocation } = useGlobalLocation();

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">📍 Current Location</h3>
        <p className="text-sm text-blue-600 mb-3">
          {currentLocation?.displayName || currentLocation?.city || 'Set your location to view air quality'}
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <MapPinIcon className="w-4 h-4 mr-1" />
          Search for a city to view its air quality
        </label>
        <CitySearchDropdown
          currentCity={currentLocation?.displayName || ''}
          onCitySelect={async (city) => {
            // Update global location context
            setCurrentLocation({
              lat: city.lat,
              lon: city.lon,
              city: city.name,
              displayName: city.displayName
            });
          }}
        />
      </div>
      
      <p className="text-xs text-gray-600 mt-3">
        💡 Type a city name (e.g., "Los Angeles", "London", "Tokyo") to view air quality
      </p>
    </div>
  );
};

export default DashboardLocationSearch;
