export interface Coordinates {
  lat: number;
  lon: number;
}

function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function hasValidCoordinates(location: any | null | undefined): location is Coordinates {
  return (
    !!location &&
    isValidNumber(location.lat) &&
    isValidNumber(location.lon)
  );
}

export async function getBrowserGeolocation(timeoutMs: number = 10000): Promise<Coordinates | null> {
  if (!('geolocation' in navigator)) {
    console.log('Geolocation not supported by browser');
    return null;
  }

  return new Promise((resolve) => {
    const onSuccess = (pos: GeolocationPosition) => {
      const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      console.log('✅ Browser geolocation detected:', coords);
      resolve(coords);
    };
    const onError = (error: GeolocationPositionError) => {
      console.log('❌ Browser geolocation error:', error.message);
      resolve(null);
    };
    const options: PositionOptions = { 
      enableHighAccuracy: true, 
      timeout: timeoutMs, 
      maximumAge: 60000 // Accept cached position up to 1 minute old
    };
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  });
}

export async function resolveEffectiveLocation(userLocation: any | null | undefined): Promise<Coordinates | null> {
  // 1) Use user's saved profile location if valid
  if (hasValidCoordinates(userLocation)) {
    console.log('Using saved profile location:', userLocation);
    return { lat: userLocation.lat, lon: userLocation.lon };
  }

  // 2) PRIORITY: Ask browser for geolocation FIRST for new users
  // This ensures Chicago user gets Chicago, not NYC
  console.log('New user detected - requesting browser geolocation...');
  const geo = await getBrowserGeolocation();
  if (geo) {
    try { 
      localStorage.setItem('effective_location', JSON.stringify(geo)); 
      console.log('✅ Saved browser location to cache');
    } catch {}
    return geo;
  }

  // 3) Use cached geolocation if browser request failed
  try {
    const cached = localStorage.getItem('effective_location');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (hasValidCoordinates(parsed)) {
        console.log('Using cached location:', parsed);
        return parsed;
      }
    }
  } catch {}

  // 4) LAST RESORT: Fallback to default location only if browser denied permission
  // This prevents blocking new signups but should rarely be used
  const defaultLocation = { lat: 40.7128, lon: -74.0060 }; // NYC
  console.warn('⚠️ Browser geolocation unavailable - using default location (NYC)');
  console.warn('User should enable location permissions for accurate data');
  return defaultLocation;
}


