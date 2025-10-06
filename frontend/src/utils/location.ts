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

export async function getBrowserGeolocation(timeoutMs: number = 8000): Promise<Coordinates | null> {
  if (!('geolocation' in navigator)) return null;

  return new Promise((resolve) => {
    const onSuccess = (pos: GeolocationPosition) => {
      resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    };
    const onError = () => resolve(null);
    const options: PositionOptions = { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 300000 };
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  });
}

export async function resolveEffectiveLocation(userLocation: any | null | undefined): Promise<Coordinates | null> {
  // 1) Use user's saved profile location if valid
  if (hasValidCoordinates(userLocation)) {
    return { lat: userLocation.lat, lon: userLocation.lon };
  }

  // 2) Use cached geolocation if available
  try {
    const cached = localStorage.getItem('effective_location');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (hasValidCoordinates(parsed)) return parsed;
    }
  } catch {}

  // 3) Ask browser for geolocation
  const geo = await getBrowserGeolocation();
  if (geo) {
    try { localStorage.setItem('effective_location', JSON.stringify(geo)); } catch {}
    return geo;
  }

  // 4) No location available
  return null;
}


