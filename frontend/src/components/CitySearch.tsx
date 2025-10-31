import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

interface CityResult {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  display_name: string;
}

interface CitySearchProps {
  onSelectCity: (city: CityResult) => void;
  placeholder?: string;
}

const CitySearch: React.FC<CitySearchProps> = ({ onSelectCity, placeholder = 'Search for a city...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchCities(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const searchCities = async (searchQuery: string) => {
    setLoading(true);
    try {
      // Use Nominatim (OpenStreetMap) with more flexible filtering
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=20&` + // Increased limit for better results
        `countrycodes=us` // Limit to US for better results
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      
      const cities: CityResult[] = data
        .filter((item: any) => {
          // More flexible filtering - include any place with a city/town/village
          const hasCity = item.address?.city || item.address?.town || item.address?.village;
          const isPlace = item.class === 'place' || item.class === 'boundary';
          return hasCity || isPlace;
        })
        .map((item: any) => ({
          name: item.address?.city || 
                item.address?.town || 
                item.address?.village || 
                item.address?.suburb ||
                item.address?.hamlet ||
                item.name,
          state: item.address?.state,
          country: item.address?.country || 'USA',
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          display_name: item.display_name
        }))
        .filter((city: CityResult, index: number, self: CityResult[]) => 
          // Remove duplicates based on name and coordinates
          index === self.findIndex((c: CityResult) => 
            c.name === city.name && 
            Math.abs(c.lat - city.lat) < 0.01 && 
            Math.abs(c.lon - city.lon) < 0.01
          )
        )
        .slice(0, 10); // Limit to 10 results

      setResults(cities);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching cities:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCity = (city: CityResult) => {
    setQuery('');
    setShowResults(false);
    setResults([]);
    onSelectCity(city);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-auto">
          {results.map((city, index) => (
            <button
              key={index}
              onClick={() => handleSelectCity(city)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start border-b border-gray-100 last:border-b-0 transition"
            >
              <MapPinIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {city.name}
                  {city.state && `, ${city.state}`}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {city.display_name}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {city.lat.toFixed(4)}, {city.lon.toFixed(4)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && !loading && query.length >= 3 && results.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 p-4 text-center text-gray-500">
          No cities found. Try a different search term.
        </div>
      )}

      {/* Search Hint */}
      {query.length > 0 && query.length < 3 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 p-3 text-sm text-gray-500">
          Type at least 3 characters to search...
        </div>
      )}
    </div>
  );
};

export default CitySearch;
