/**
 * City Search Dropdown Component
 * Searchable dropdown for selecting cities worldwide
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

// Comprehensive list of major cities worldwide
const CITIES: City[] = [
  // US Cities
  { name: 'New York', country: 'United States', state: 'NY', lat: 40.7128, lon: -74.0060, displayName: 'New York, NY, USA' },
  { name: 'Los Angeles', country: 'United States', state: 'CA', lat: 34.0522, lon: -118.2437, displayName: 'Los Angeles, CA, USA' },
  { name: 'Chicago', country: 'United States', state: 'IL', lat: 41.8781, lon: -87.6298, displayName: 'Chicago, IL, USA' },
  { name: 'Houston', country: 'United States', state: 'TX', lat: 29.7604, lon: -95.3698, displayName: 'Houston, TX, USA' },
  { name: 'Phoenix', country: 'United States', state: 'AZ', lat: 33.4484, lon: -112.0740, displayName: 'Phoenix, AZ, USA' },
  { name: 'Philadelphia', country: 'United States', state: 'PA', lat: 39.9526, lon: -75.1652, displayName: 'Philadelphia, PA, USA' },
  { name: 'San Antonio', country: 'United States', state: 'TX', lat: 29.4241, lon: -98.4936, displayName: 'San Antonio, TX, USA' },
  { name: 'San Diego', country: 'United States', state: 'CA', lat: 32.7157, lon: -117.1611, displayName: 'San Diego, CA, USA' },
  { name: 'Dallas', country: 'United States', state: 'TX', lat: 32.7767, lon: -96.7970, displayName: 'Dallas, TX, USA' },
  { name: 'San Jose', country: 'United States', state: 'CA', lat: 37.3382, lon: -121.8863, displayName: 'San Jose, CA, USA' },
  { name: 'Austin', country: 'United States', state: 'TX', lat: 30.2672, lon: -97.7431, displayName: 'Austin, TX, USA' },
  { name: 'Jacksonville', country: 'United States', state: 'FL', lat: 30.3322, lon: -81.6557, displayName: 'Jacksonville, FL, USA' },
  { name: 'San Francisco', country: 'United States', state: 'CA', lat: 37.7749, lon: -122.4194, displayName: 'San Francisco, CA, USA' },
  { name: 'Columbus', country: 'United States', state: 'OH', lat: 39.9612, lon: -82.9988, displayName: 'Columbus, OH, USA' },
  { name: 'Indianapolis', country: 'United States', state: 'IN', lat: 39.7684, lon: -86.1581, displayName: 'Indianapolis, IN, USA' },
  { name: 'Fort Worth', country: 'United States', state: 'TX', lat: 32.7555, lon: -97.3308, displayName: 'Fort Worth, TX, USA' },
  { name: 'Charlotte', country: 'United States', state: 'NC', lat: 35.2271, lon: -80.8431, displayName: 'Charlotte, NC, USA' },
  { name: 'Seattle', country: 'United States', state: 'WA', lat: 47.6062, lon: -122.3321, displayName: 'Seattle, WA, USA' },
  { name: 'Denver', country: 'United States', state: 'CO', lat: 39.7392, lon: -104.9903, displayName: 'Denver, CO, USA' },
  { name: 'Washington', country: 'United States', state: 'DC', lat: 38.9072, lon: -77.0369, displayName: 'Washington, DC, USA' },
  { name: 'Boston', country: 'United States', state: 'MA', lat: 42.3601, lon: -71.0589, displayName: 'Boston, MA, USA' },
  { name: 'Nashville', country: 'United States', state: 'TN', lat: 36.1627, lon: -86.7816, displayName: 'Nashville, TN, USA' },
  { name: 'Detroit', country: 'United States', state: 'MI', lat: 42.3314, lon: -83.0458, displayName: 'Detroit, MI, USA' },
  { name: 'Portland', country: 'United States', state: 'OR', lat: 45.5152, lon: -122.6784, displayName: 'Portland, OR, USA' },
  { name: 'Las Vegas', country: 'United States', state: 'NV', lat: 36.1699, lon: -115.1398, displayName: 'Las Vegas, NV, USA' },
  { name: 'Memphis', country: 'United States', state: 'TN', lat: 35.1495, lon: -90.0490, displayName: 'Memphis, TN, USA' },
  { name: 'Louisville', country: 'United States', state: 'KY', lat: 38.2527, lon: -85.7585, displayName: 'Louisville, KY, USA' },
  { name: 'Baltimore', country: 'United States', state: 'MD', lat: 39.2904, lon: -76.6122, displayName: 'Baltimore, MD, USA' },
  { name: 'Milwaukee', country: 'United States', state: 'WI', lat: 43.0389, lon: -87.9065, displayName: 'Milwaukee, WI, USA' },
  { name: 'Albuquerque', country: 'United States', state: 'NM', lat: 35.0844, lon: -106.6504, displayName: 'Albuquerque, NM, USA' },
  { name: 'Tucson', country: 'United States', state: 'AZ', lat: 32.2226, lon: -110.9747, displayName: 'Tucson, AZ, USA' },
  { name: 'Fresno', country: 'United States', state: 'CA', lat: 36.7378, lon: -119.7871, displayName: 'Fresno, CA, USA' },
  { name: 'Sacramento', country: 'United States', state: 'CA', lat: 38.5816, lon: -121.4944, displayName: 'Sacramento, CA, USA' },
  { name: 'Mesa', country: 'United States', state: 'AZ', lat: 33.4152, lon: -111.8315, displayName: 'Mesa, AZ, USA' },
  { name: 'Atlanta', country: 'United States', state: 'GA', lat: 33.7490, lon: -84.3880, displayName: 'Atlanta, GA, USA' },
  { name: 'Kansas City', country: 'United States', state: 'MO', lat: 39.0997, lon: -94.5786, displayName: 'Kansas City, MO, USA' },
  { name: 'Colorado Springs', country: 'United States', state: 'CO', lat: 38.8339, lon: -104.8214, displayName: 'Colorado Springs, CO, USA' },
  { name: 'Miami', country: 'United States', state: 'FL', lat: 25.7617, lon: -80.1918, displayName: 'Miami, FL, USA' },
  { name: 'Raleigh', country: 'United States', state: 'NC', lat: 35.7796, lon: -78.6382, displayName: 'Raleigh, NC, USA' },
  { name: 'Omaha', country: 'United States', state: 'NE', lat: 41.2565, lon: -95.9345, displayName: 'Omaha, NE, USA' },
  { name: 'Long Beach', country: 'United States', state: 'CA', lat: 33.7701, lon: -118.1937, displayName: 'Long Beach, CA, USA' },
  { name: 'Virginia Beach', country: 'United States', state: 'VA', lat: 36.8529, lon: -75.9780, displayName: 'Virginia Beach, VA, USA' },
  { name: 'Oakland', country: 'United States', state: 'CA', lat: 37.8044, lon: -122.2712, displayName: 'Oakland, CA, USA' },
  { name: 'Minneapolis', country: 'United States', state: 'MN', lat: 44.9778, lon: -93.2650, displayName: 'Minneapolis, MN, USA' },
  { name: 'Tulsa', country: 'United States', state: 'OK', lat: 36.1540, lon: -95.9928, displayName: 'Tulsa, OK, USA' },
  { name: 'Tampa', country: 'United States', state: 'FL', lat: 27.9506, lon: -82.4572, displayName: 'Tampa, FL, USA' },
  { name: 'Arlington', country: 'United States', state: 'TX', lat: 32.7357, lon: -97.1081, displayName: 'Arlington, TX, USA' },
  { name: 'New Orleans', country: 'United States', state: 'LA', lat: 29.9511, lon: -90.0715, displayName: 'New Orleans, LA, USA' },
  { name: 'Cincinnati', country: 'United States', state: 'OH', lat: 39.1031, lon: -84.5120, displayName: 'Cincinnati, OH, USA' },
  
  // International Cities
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, displayName: 'London, UK' },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, displayName: 'Paris, France' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, displayName: 'Tokyo, Japan' },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, displayName: 'Berlin, Germany' },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038, displayName: 'Madrid, Spain' },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, displayName: 'Rome, Italy' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, displayName: 'Sydney, Australia' },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, displayName: 'Toronto, Canada' },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, displayName: 'Mumbai, India' },
  { name: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090, displayName: 'Delhi, India' },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, displayName: 'Shanghai, China' },
  { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074, displayName: 'Beijing, China' },
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, displayName: 'São Paulo, Brazil' },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, displayName: 'Mexico City, Mexico' },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, displayName: 'Cairo, Egypt' },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792, displayName: 'Lagos, Nigeria' },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816, displayName: 'Buenos Aires, Argentina' },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784, displayName: 'Istanbul, Turkey' },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173, displayName: 'Moscow, Russia' },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, displayName: 'Dubai, UAE' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, displayName: 'Singapore' },
  { name: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lon: 114.1694, displayName: 'Hong Kong' },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, displayName: 'Bangkok, Thailand' },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780, displayName: 'Seoul, South Korea' },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456, displayName: 'Jakarta, Indonesia' },
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842, displayName: 'Manila, Philippines' },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011, displayName: 'Karachi, Pakistan' },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125, displayName: 'Dhaka, Bangladesh' },
  { name: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639, displayName: 'Kolkata, India' },
  { name: 'Bangalore', country: 'India', lat: 12.9716, lon: 77.5946, displayName: 'Bangalore, India' },
  { name: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707, displayName: 'Chennai, India' },
  { name: 'Hyderabad', country: 'India', lat: 17.3850, lon: 78.4867, displayName: 'Hyderabad, India' },
  { name: 'Lahore', country: 'Pakistan', lat: 31.5204, lon: 74.3587, displayName: 'Lahore, Pakistan' },
  { name: 'Bogotá', country: 'Colombia', lat: 4.7110, lon: -74.0721, displayName: 'Bogotá, Colombia' },
  { name: 'Lima', country: 'Peru', lat: -12.0464, lon: -77.0428, displayName: 'Lima, Peru' },
  { name: 'Santiago', country: 'Chile', lat: -33.4489, lon: -70.6693, displayName: 'Santiago, Chile' },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, displayName: 'Riyadh, Saudi Arabia' },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lon: 2.1734, displayName: 'Barcelona, Spain' },
  { name: 'Munich', country: 'Germany', lat: 48.1351, lon: 11.5820, displayName: 'Munich, Germany' },
  { name: 'Milan', country: 'Italy', lat: 45.4642, lon: 9.1900, displayName: 'Milan, Italy' },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041, displayName: 'Amsterdam, Netherlands' },
  { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517, displayName: 'Brussels, Belgium' },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738, displayName: 'Vienna, Austria' },
  { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417, displayName: 'Zurich, Switzerland' },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686, displayName: 'Stockholm, Sweden' },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lon: 12.5683, displayName: 'Copenhagen, Denmark' },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522, displayName: 'Oslo, Norway' },
  { name: 'Helsinki', country: 'Finland', lat: 60.1699, lon: 24.9384, displayName: 'Helsinki, Finland' },
  { name: 'Dublin', country: 'Ireland', lat: 53.3498, lon: -6.2603, displayName: 'Dublin, Ireland' },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393, displayName: 'Lisbon, Portugal' },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lon: 23.7275, displayName: 'Athens, Greece' },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378, displayName: 'Prague, Czech Republic' },
  { name: 'Warsaw', country: 'Poland', lat: 52.2297, lon: 21.0122, displayName: 'Warsaw, Poland' },
  { name: 'Budapest', country: 'Hungary', lat: 47.4979, lon: 19.0402, displayName: 'Budapest, Hungary' },
  { name: 'Bucharest', country: 'Romania', lat: 44.4268, lon: 26.1025, displayName: 'Bucharest, Romania' },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631, displayName: 'Melbourne, Australia' },
  { name: 'Brisbane', country: 'Australia', lat: -27.4698, lon: 153.0251, displayName: 'Brisbane, Australia' },
  { name: 'Perth', country: 'Australia', lat: -31.9505, lon: 115.8605, displayName: 'Perth, Australia' },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8485, lon: 174.7633, displayName: 'Auckland, New Zealand' },
  { name: 'Wellington', country: 'New Zealand', lat: -41.2865, lon: 174.7762, displayName: 'Wellington, New Zealand' },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207, displayName: 'Vancouver, Canada' },
  { name: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673, displayName: 'Montreal, Canada' },
  { name: 'Calgary', country: 'Canada', lat: 51.0447, lon: -114.0719, displayName: 'Calgary, Canada' },
  { name: 'Ottawa', country: 'Canada', lat: 45.4215, lon: -75.6972, displayName: 'Ottawa, Canada' },
];

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
    if (searchTerm.trim() === '') {
      setFilteredCities(CITIES.slice(0, 10)); // Show top 10 cities by default
    } else {
      const filtered = CITIES.filter(city =>
        city.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 20); // Limit to 20 results
      setFilteredCities(filtered);
    }
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
