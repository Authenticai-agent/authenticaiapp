/**
 * Reverse Geocoding Utility
 * Converts coordinates to human-readable location names
 */

interface LocationName {
  city: string;
  state: string;
  country: string;
  displayName: string;
}

/**
 * Convert coordinates to location name using OpenStreetMap Nominatim API
 * Free, no API key required
 */
export async function reverseGeocode(lat: number, lon: number): Promise<LocationName | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Authenticai/1.0'
        }
      }
    );

    if (!response.ok) {
      console.warn('Reverse geocoding failed:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data || !data.address) {
      return null;
    }

    const address = data.address;
    
    // Extract location components
    const city = address.city || address.town || address.village || address.county || '';
    const state = address.state || '';
    const country = address.country || '';

    // Build display name
    let displayName = '';
    if (city && state) {
      displayName = `${city}, ${state}`;
    } else if (city) {
      displayName = city;
    } else if (state) {
      displayName = state;
    } else {
      displayName = country || 'Unknown Location';
    }

    return {
      city,
      state,
      country,
      displayName
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Get location name with caching to avoid repeated API calls
 */
const locationCache = new Map<string, LocationName>();

export async function getLocationName(lat: number, lon: number): Promise<string> {
  // Round coordinates to 2 decimal places for caching
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  
  // Check cache first
  if (locationCache.has(cacheKey)) {
    return locationCache.get(cacheKey)!.displayName;
  }

  // Fetch from API
  const location = await reverseGeocode(lat, lon);
  
  if (location) {
    locationCache.set(cacheKey, location);
    return location.displayName;
  }

  // Fallback to coordinates
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}
