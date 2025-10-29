/**
 * City Search Dropdown Component
 * Uses OpenStreetMap Nominatim API for real-time city search
 * Supports ALL cities worldwide - no hardcoded lists
 */

import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface City {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  displayName: string;
}

interface CitySearchDropdownProps {
  onCitySelect: (city: City) => void;
  currentCity?: string;
  className?: string;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

// Geocoding API function using OpenStreetMap Nominatim
const searchCities = async (query: string): Promise<City[]> => {
  if (!query || query.trim().length < 2) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}&` +
      `format=json&` +
      `addressdetails=1&` +
      `limit=20&` +
      `featuretype=city`,
      {
        headers: {
          'User-Agent': 'AuthenticAI Air Quality App'
        }
      }
    );
    
    if (!response.ok) {
      console.error('Nominatim API error:', response.status);
      return [];
    }
    
    const results: NominatimResult[] = await response.json();
    
    // Transform Nominatim results to our City format
    return results
      .filter(result => {
        // Only include results that are cities, towns, or villages
        const address = result.address;
        return address.city || address.town || address.village || address.municipality;
      })
      .map(result => {
        const address = result.address;
        const cityName = address.city || address.town || address.village || address.municipality || '';
        const state = address.state || '';
        const country = address.country || '';
        
        // Build display name
        let displayName = cityName;
        if (state) displayName += `, ${state}`;
        if (country) displayName += `, ${country}`;
        
        return {
          name: cityName,
          country: country,
          state: state,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          displayName: displayName
        };
      });
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
};

export const CitySearchDropdown: React.FC<CitySearchDropdownProps> = ({
  onCitySelect,
  currentCity,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchDebounced = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        const results = await searchCities(searchTerm);
        setFilteredCities(results);
      } else {
        setFilteredCities([]);
      }
    }, 300); // Debounce API calls by 300ms
    
    return () => clearTimeout(searchDebounced);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city: City) => {
    onCitySelect(city);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={currentCity || "Search for a city..."}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {isOpen && filteredCities.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-96 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {filteredCities.map((city, index) => (
            <button
              key={`${city.name}-${city.country}-${index}`}
              onClick={() => handleCitySelect(city)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors flex items-center space-x-2"
            >
              <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-900">{city.displayName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitySearchDropdown;
