/**
 * Major US Cities for Location Selection
 * Organized by population and region
 */

export interface CityData {
  name: string;
  state: string;
  lat: number;
  lon: number;
  displayName: string;
}

export const US_CITIES: CityData[] = [
  // Top 50 US Cities by Population
  { name: "New York", state: "NY", lat: 40.7128, lon: -74.0060, displayName: "New York, NY" },
  { name: "Los Angeles", state: "CA", lat: 34.0522, lon: -118.2437, displayName: "Los Angeles, CA" },
  { name: "Chicago", state: "IL", lat: 41.8781, lon: -87.6298, displayName: "Chicago, IL" },
  { name: "Houston", state: "TX", lat: 29.7604, lon: -95.3698, displayName: "Houston, TX" },
  { name: "Phoenix", state: "AZ", lat: 33.4484, lon: -112.0740, displayName: "Phoenix, AZ" },
  { name: "Philadelphia", state: "PA", lat: 39.9526, lon: -75.1652, displayName: "Philadelphia, PA" },
  { name: "San Antonio", state: "TX", lat: 29.4241, lon: -98.4936, displayName: "San Antonio, TX" },
  { name: "San Diego", state: "CA", lat: 32.7157, lon: -117.1611, displayName: "San Diego, CA" },
  { name: "Dallas", state: "TX", lat: 32.7767, lon: -96.7970, displayName: "Dallas, TX" },
  { name: "San Jose", state: "CA", lat: 37.3382, lon: -121.8863, displayName: "San Jose, CA" },
  
  // Major Cities 11-30
  { name: "Austin", state: "TX", lat: 30.2672, lon: -97.7431, displayName: "Austin, TX" },
  { name: "Jacksonville", state: "FL", lat: 30.3322, lon: -81.6557, displayName: "Jacksonville, FL" },
  { name: "Fort Worth", state: "TX", lat: 32.7555, lon: -97.3308, displayName: "Fort Worth, TX" },
  { name: "Columbus", state: "OH", lat: 39.9612, lon: -82.9988, displayName: "Columbus, OH" },
  { name: "Charlotte", state: "NC", lat: 35.2271, lon: -80.8431, displayName: "Charlotte, NC" },
  { name: "San Francisco", state: "CA", lat: 37.7749, lon: -122.4194, displayName: "San Francisco, CA" },
  { name: "Indianapolis", state: "IN", lat: 39.7684, lon: -86.1581, displayName: "Indianapolis, IN" },
  { name: "Seattle", state: "WA", lat: 47.6062, lon: -122.3321, displayName: "Seattle, WA" },
  { name: "Denver", state: "CO", lat: 39.7392, lon: -104.9903, displayName: "Denver, CO" },
  { name: "Washington", state: "DC", lat: 38.9072, lon: -77.0369, displayName: "Washington, DC" },
  
  { name: "Boston", state: "MA", lat: 42.3601, lon: -71.0589, displayName: "Boston, MA" },
  { name: "El Paso", state: "TX", lat: 31.7619, lon: -106.4850, displayName: "El Paso, TX" },
  { name: "Nashville", state: "TN", lat: 36.1627, lon: -86.7816, displayName: "Nashville, TN" },
  { name: "Detroit", state: "MI", lat: 42.3314, lon: -83.0458, displayName: "Detroit, MI" },
  { name: "Oklahoma City", state: "OK", lat: 35.4676, lon: -97.5164, displayName: "Oklahoma City, OK" },
  { name: "Portland", state: "OR", lat: 45.5152, lon: -122.6784, displayName: "Portland, OR" },
  { name: "Las Vegas", state: "NV", lat: 36.1699, lon: -115.1398, displayName: "Las Vegas, NV" },
  { name: "Memphis", state: "TN", lat: 35.1495, lon: -90.0490, displayName: "Memphis, TN" },
  { name: "Louisville", state: "KY", lat: 38.2527, lon: -85.7585, displayName: "Louisville, KY" },
  { name: "Baltimore", state: "MD", lat: 39.2904, lon: -76.6122, displayName: "Baltimore, MD" },
  
  // Major Cities 31-50
  { name: "Milwaukee", state: "WI", lat: 43.0389, lon: -87.9065, displayName: "Milwaukee, WI" },
  { name: "Albuquerque", state: "NM", lat: 35.0844, lon: -106.6504, displayName: "Albuquerque, NM" },
  { name: "Tucson", state: "AZ", lat: 32.2226, lon: -110.9747, displayName: "Tucson, AZ" },
  { name: "Fresno", state: "CA", lat: 36.7378, lon: -119.7871, displayName: "Fresno, CA" },
  { name: "Mesa", state: "AZ", lat: 33.4152, lon: -111.8315, displayName: "Mesa, AZ" },
  { name: "Sacramento", state: "CA", lat: 38.5816, lon: -121.4944, displayName: "Sacramento, CA" },
  { name: "Atlanta", state: "GA", lat: 33.7490, lon: -84.3880, displayName: "Atlanta, GA" },
  { name: "Kansas City", state: "MO", lat: 39.0997, lon: -94.5786, displayName: "Kansas City, MO" },
  { name: "Colorado Springs", state: "CO", lat: 38.8339, lon: -104.8214, displayName: "Colorado Springs, CO" },
  { name: "Omaha", state: "NE", lat: 41.2565, lon: -95.9345, displayName: "Omaha, NE" },
  
  { name: "Raleigh", state: "NC", lat: 35.7796, lon: -78.6382, displayName: "Raleigh, NC" },
  { name: "Miami", state: "FL", lat: 25.7617, lon: -80.1918, displayName: "Miami, FL" },
  { name: "Long Beach", state: "CA", lat: 33.7701, lon: -118.1937, displayName: "Long Beach, CA" },
  { name: "Virginia Beach", state: "VA", lat: 36.8529, lon: -75.9780, displayName: "Virginia Beach, VA" },
  { name: "Oakland", state: "CA", lat: 37.8044, lon: -122.2712, displayName: "Oakland, CA" },
  { name: "Minneapolis", state: "MN", lat: 44.9778, lon: -93.2650, displayName: "Minneapolis, MN" },
  { name: "Tulsa", state: "OK", lat: 36.1540, lon: -95.9928, displayName: "Tulsa, OK" },
  { name: "Tampa", state: "FL", lat: 27.9506, lon: -82.4572, displayName: "Tampa, FL" },
  { name: "Arlington", state: "TX", lat: 32.7357, lon: -97.1081, displayName: "Arlington, TX" },
  { name: "New Orleans", state: "LA", lat: 29.9511, lon: -90.0715, displayName: "New Orleans, LA" },
  
  // Additional Major Cities (51-100)
  { name: "Wichita", state: "KS", lat: 37.6872, lon: -97.3301, displayName: "Wichita, KS" },
  { name: "Cleveland", state: "OH", lat: 41.4993, lon: -81.6944, displayName: "Cleveland, OH" },
  { name: "Bakersfield", state: "CA", lat: 35.3733, lon: -119.0187, displayName: "Bakersfield, CA" },
  { name: "Aurora", state: "CO", lat: 39.7294, lon: -104.8319, displayName: "Aurora, CO" },
  { name: "Anaheim", state: "CA", lat: 33.8366, lon: -117.9143, displayName: "Anaheim, CA" },
  { name: "Honolulu", state: "HI", lat: 21.3099, lon: -157.8581, displayName: "Honolulu, HI" },
  { name: "Santa Ana", state: "CA", lat: 33.7455, lon: -117.8677, displayName: "Santa Ana, CA" },
  { name: "Riverside", state: "CA", lat: 33.9533, lon: -117.3962, displayName: "Riverside, CA" },
  { name: "Corpus Christi", state: "TX", lat: 27.8006, lon: -97.3964, displayName: "Corpus Christi, TX" },
  { name: "Lexington", state: "KY", lat: 38.0406, lon: -84.5037, displayName: "Lexington, KY" },
  
  { name: "Stockton", state: "CA", lat: 37.9577, lon: -121.2908, displayName: "Stockton, CA" },
  { name: "Henderson", state: "NV", lat: 36.0395, lon: -114.9817, displayName: "Henderson, NV" },
  { name: "Saint Paul", state: "MN", lat: 44.9537, lon: -93.0900, displayName: "Saint Paul, MN" },
  { name: "Cincinnati", state: "OH", lat: 39.1031, lon: -84.5120, displayName: "Cincinnati, OH" },
  { name: "Pittsburgh", state: "PA", lat: 40.4406, lon: -79.9959, displayName: "Pittsburgh, PA" },
  { name: "Greensboro", state: "NC", lat: 36.0726, lon: -79.7920, displayName: "Greensboro, NC" },
  { name: "Anchorage", state: "AK", lat: 61.2181, lon: -149.9003, displayName: "Anchorage, AK" },
  { name: "Plano", state: "TX", lat: 33.0198, lon: -96.6989, displayName: "Plano, TX" },
  { name: "Lincoln", state: "NE", lat: 40.8136, lon: -96.7026, displayName: "Lincoln, NE" },
  { name: "Orlando", state: "FL", lat: 28.5383, lon: -81.3792, displayName: "Orlando, FL" },
  
  { name: "Irvine", state: "CA", lat: 33.6846, lon: -117.8265, displayName: "Irvine, CA" },
  { name: "Newark", state: "NJ", lat: 40.7357, lon: -74.1724, displayName: "Newark, NJ" },
  { name: "Durham", state: "NC", lat: 35.9940, lon: -78.8986, displayName: "Durham, NC" },
  { name: "Chula Vista", state: "CA", lat: 32.6401, lon: -117.0842, displayName: "Chula Vista, CA" },
  { name: "Toledo", state: "OH", lat: 41.6528, lon: -83.5379, displayName: "Toledo, OH" },
  { name: "Fort Wayne", state: "IN", lat: 41.0793, lon: -85.1394, displayName: "Fort Wayne, IN" },
  { name: "St. Petersburg", state: "FL", lat: 27.7676, lon: -82.6403, displayName: "St. Petersburg, FL" },
  { name: "Laredo", state: "TX", lat: 27.5306, lon: -99.4803, displayName: "Laredo, TX" },
  { name: "Jersey City", state: "NJ", lat: 40.7178, lon: -74.0431, displayName: "Jersey City, NJ" },
  { name: "Chandler", state: "AZ", lat: 33.3062, lon: -111.8413, displayName: "Chandler, AZ" },
  
  { name: "Madison", state: "WI", lat: 43.0731, lon: -89.4012, displayName: "Madison, WI" },
  { name: "Lubbock", state: "TX", lat: 33.5779, lon: -101.8552, displayName: "Lubbock, TX" },
  { name: "Scottsdale", state: "AZ", lat: 33.4942, lon: -111.9261, displayName: "Scottsdale, AZ" },
  { name: "Reno", state: "NV", lat: 39.5296, lon: -119.8138, displayName: "Reno, NV" },
  { name: "Buffalo", state: "NY", lat: 42.8864, lon: -78.8784, displayName: "Buffalo, NY" },
  { name: "Gilbert", state: "AZ", lat: 33.3528, lon: -111.7890, displayName: "Gilbert, AZ" },
  { name: "Glendale", state: "AZ", lat: 33.5387, lon: -112.1860, displayName: "Glendale, AZ" },
  { name: "North Las Vegas", state: "NV", lat: 36.1989, lon: -115.1175, displayName: "North Las Vegas, NV" },
  { name: "Winston-Salem", state: "NC", lat: 36.0999, lon: -80.2442, displayName: "Winston-Salem, NC" },
  { name: "Chesapeake", state: "VA", lat: 36.7682, lon: -76.2875, displayName: "Chesapeake, VA" },
  
  // Ohio Cities (including Fairfield)
  { name: "Fairfield", state: "OH", lat: 39.3456, lon: -84.5603, displayName: "Fairfield, OH" },
  { name: "Dayton", state: "OH", lat: 39.7589, lon: -84.1916, displayName: "Dayton, OH" },
  { name: "Akron", state: "OH", lat: 41.0814, lon: -81.5190, displayName: "Akron, OH" },
  { name: "Canton", state: "OH", lat: 40.7989, lon: -81.3789, displayName: "Canton, OH" },
  { name: "Youngstown", state: "OH", lat: 41.0998, lon: -80.6495, displayName: "Youngstown, OH" },
];

/**
 * Search cities by name (case-insensitive)
 */
export function searchCities(query: string): CityData[] {
  const lowerQuery = query.toLowerCase();
  return US_CITIES.filter(city => 
    city.name.toLowerCase().includes(lowerQuery) ||
    city.state.toLowerCase().includes(lowerQuery) ||
    city.displayName.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get city by exact name and state
 */
export function getCityByNameState(name: string, state: string): CityData | undefined {
  return US_CITIES.find(
    city => city.name.toLowerCase() === name.toLowerCase() && 
            city.state.toLowerCase() === state.toLowerCase()
  );
}
