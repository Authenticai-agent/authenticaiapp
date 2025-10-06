import React, { useState, useEffect } from 'react';
import { 
  CloudIcon, 
  ExclamationTriangleIcon, 
  SunIcon,
  FireIcon,
  CloudArrowDownIcon,
  BeakerIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
// Removed chart imports as we're now using a comprehensive dashboard layout
import { useAuth } from '../contexts/AuthContext';
import { useGlobalLocation } from '../contexts/LocationContext';
import { airQualityAPI } from '../services/api';
import { resolveEffectiveLocation } from '../utils/location';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { CitySearchDropdown } from '../components/CitySearchDropdown';

interface ComprehensiveEnvironmentalData {
  location: { lat: number; lon: number };
  timestamp: string;
  air_quality: {
    aqi: number;
    pm25: number;
    pm10: number;
    pm1: number | null;
    ozone: number;
    no2: number;
    so2: number;
    co: number;
    nh3: number;
    category: string;
  };
  weather: {
    temperature: number;
    humidity: number;
    pressure: number;
    visibility: number;
    wind_speed: number;
    wind_direction: number;
    description: string;
  };
  uv_index: number;
  pollen: {
    source: string;
    zipcode: string | null;
    tree: number;
    grass: number;
    weed: number;
    mold: number;
    overall_risk: string;
    forecast_date: string;
    raw_data: any;
  };
  purpleair: {
    sensors_found: number;
    sensors_processed: number;
    avg_pm25: number | null;
    avg_pm10: number | null;
    avg_voc: number | null;
    avg_temperature: number | null;
    avg_humidity: number | null;
    closest_sensors: any[];
    data_quality: string;
  };
  solar_magnetic: {
    magnetic_field: number | null;
    solar_wind_speed: number | null;
    kp_index: number | null;
    storm_level: string;
    solar_activity: string;
  };
  forest_fires: {
    fires_within_100km: number;
    max_confidence: number;
    fire_risk_level: string;
    nearby_fires: any[];
  };
  precipitation: {
    total_rain_24h_mm: number;
    total_snow_24h_mm: number;
    precipitation_intensity: string;
    forecast_24h: any[];
  };
  environmental_factors: {
    season: string;
    air_quality_category: string;
    pollen_season_active: boolean;
    weather_impact: string;
    fire_impact: string;
    solar_impact: string;
  };
}

const AirQuality: React.FC = () => {
  const { user } = useAuth();
  const { currentLocation, setCurrentLocation } = useGlobalLocation();
  const [loading, setLoading] = useState(true);
  const [environmentalData, setEnvironmentalData] = useState<ComprehensiveEnvironmentalData | null>(null);
  
  useEffect(() => {
    if (currentLocation) {
      loadEnvironmentalData();
    }
  }, [currentLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEnvironmentalData = async (overrideLocation?: { lat: number; lon: number }) => {
    let effectiveLocation = overrideLocation || (currentLocation ? { lat: currentLocation.lat, lon: currentLocation.lon } : null);
    
    if (!effectiveLocation) {
      const resolvedLocation = await resolveEffectiveLocation(user?.location);
      if (resolvedLocation) {
        effectiveLocation = resolvedLocation;
      }
    }
    
    if (!effectiveLocation) return;

    setLoading(true);
    try {
      const response = await airQualityAPI.getComprehensive(effectiveLocation.lat, effectiveLocation.lon);
      const payload = Array.isArray(response?.data) ? response.data[0] : response?.data;
      
      console.log('Environmental data response:', payload);
      console.log('Solar data:', payload?.solar_magnetic);
      console.log('Fire data:', payload?.forest_fires);
      
      if (!payload || !payload.air_quality) {
        setEnvironmentalData(null);
      } else {
        setEnvironmentalData(payload);
      }
    } catch (error) {
      console.error('Error loading environmental data:', error);
      toast.error('Failed to load environmental data');
    } finally {
      setLoading(false);
    }
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-success-600 bg-success-50';
    if (aqi <= 100) return 'text-warning-600 bg-warning-50';
    if (aqi <= 150) return 'text-danger-600 bg-danger-50';
    return 'text-red-600 bg-red-50';
  };

  const getAQIDescription = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getHealthRecommendation = (aqi: number) => {
    if (aqi <= 50) return 'Great day for outdoor activities!';
    if (aqi <= 100) return 'Sensitive individuals should consider reducing prolonged outdoor exertion.';
    if (aqi <= 150) return 'People with respiratory conditions should limit outdoor activities.';
    if (aqi <= 200) return 'Everyone should avoid outdoor activities. Stay indoors with air purifiers.';
    return 'Health alert: everyone may experience serious health effects. Stay indoors.';
  };

  const getPollenLevelColor = (level: number) => {
    if (level <= 1) return 'text-green-600 bg-green-50';
    if (level <= 2) return 'text-yellow-600 bg-yellow-50';
    if (level <= 3) return 'text-orange-600 bg-orange-50';
    if (level <= 4) return 'text-red-600 bg-red-50';
    return 'text-purple-600 bg-purple-50';
  };

  const getPollenLevelText = (level: number) => {
    if (level <= 1) return 'Low';
    if (level <= 2) return 'Moderate';
    if (level <= 3) return 'High';
    if (level <= 4) return 'Very High';
    return 'Extreme';
  };

  const getRiskLevelColor = (risk: string | undefined) => {
    if (!risk) return 'text-gray-600 bg-gray-50';
    switch (risk.toLowerCase()) {
      case 'minimal': case 'low': case 'quiet': case 'none': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'severe': case 'very_high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!user?.location) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-warning-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">Location Required</h2>
            <p className="mt-1 text-sm text-gray-500">
              Please set your location in your profile to view environmental data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!environmentalData || !environmentalData.air_quality) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-warning-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">No Data Available</h2>
            <p className="mt-1 text-sm text-gray-500">
              Unable to load environmental data. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { air_quality, weather, pollen, purpleair, solar_magnetic, forest_fires, precipitation } = environmentalData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Environmental Monitor</h1>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive real-time environmental data for your location
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {new Date(environmentalData.timestamp).toLocaleString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })} (your local time)
          </p>
        </div>

        {/* City Search and Current Location */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">📍 Current Location</h3>
            <p className="text-sm text-blue-600 mb-3">
              {currentLocation?.displayName || currentLocation?.city || 'Showing data for your current location'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search for a city to view its air quality
            </label>
            <CitySearchDropdown
              currentCity={currentLocation?.displayName || ''}
              onCitySelect={(city) => {
                // Update global location context
                setCurrentLocation({
                  lat: city.lat,
                  lon: city.lon,
                  city: city.name,
                  state: city.state,
                  country: city.country,
                  displayName: city.displayName
                });
                toast.success(`Viewing air quality for ${city.displayName}`);
              }}
              className="w-full"
            />
          </div>
          
          <p className="text-xs text-gray-600 mt-3">
            💡 Type a city name (e.g., "Los Angeles", "London", "Tokyo") to see its environmental data
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Air Quality Card */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <CloudIcon className="h-8 w-8 text-gray-400 mr-3" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Air Quality</h2>
                    <p className="text-sm text-gray-500">Current conditions</p>
                  </div>
                </div>
                <span className={clsx(
                  'px-3 py-1 text-sm font-medium rounded-full',
                  getAQIColor(air_quality.aqi)
                )}>
                  {getAQIDescription(air_quality.aqi)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{air_quality.aqi}</div>
                  <div className="text-xs text-gray-500">AQI</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900 mb-1">{air_quality.pm25?.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">PM2.5 μg/m³</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900 mb-1">{air_quality.pm10?.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">PM10 μg/m³</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900 mb-1">{air_quality.ozone?.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Ozone μg/m³</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-900">{air_quality.no2?.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">NO₂ μg/m³</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-900">{air_quality.so2?.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">SO₂ μg/m³</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-900">{air_quality.co?.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">CO μg/m³</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-900">{air_quality.nh3?.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">NH₃ μg/m³</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  {getHealthRecommendation(air_quality.aqi)}
                </p>
              </div>
            </div>
          </div>

          {/* Weather Card */}
          <div>
            <div className="card">
              <div className="flex items-center mb-4">
                <SunIcon className="h-6 w-6 text-yellow-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Weather</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Temperature</span>
                  <span className="font-medium">
                    {weather.temperature?.toFixed(1)}°C / {((weather.temperature * 9/5) + 32).toFixed(1)}°F
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Humidity</span>
                  <span className="font-medium">{weather.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pressure</span>
                  <span className="font-medium">{weather.pressure} hPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Visibility</span>
                  <span className="font-medium">{weather.visibility} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Wind</span>
                  <span className="font-medium">
                    {weather.wind_speed} m/s / {(weather.wind_speed * 2.237).toFixed(1)} mph
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">UV Index</span>
                  <span className="font-medium">{environmentalData.uv_index?.toFixed(1)}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Pollen Card */}
          <div className="card">
            <div className="flex items-center mb-4">
              <BeakerIcon className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Pollen</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tree</span>
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getPollenLevelColor(pollen.tree)
                )}>
                  {getPollenLevelText(pollen.tree)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Grass</span>
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getPollenLevelColor(pollen.grass)
                )}>
                  {getPollenLevelText(pollen.grass)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weed</span>
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getPollenLevelColor(pollen.weed)
                )}>
                  {getPollenLevelText(pollen.weed)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mold</span>
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getPollenLevelColor(pollen.mold)
                )}>
                  {getPollenLevelText(pollen.mold)}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Overall Risk</span>
                  <span className={clsx(
                    'px-2 py-1 text-xs font-medium rounded-full capitalize',
                    getRiskLevelColor(pollen.overall_risk)
                  )}>
                    {pollen.overall_risk.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Source: {pollen.source}</p>
              </div>
            </div>
          </div>

          {/* PurpleAir VOC Card */}
          <div className="card">
            <div className="flex items-center mb-4">
              <BeakerIcon className="h-6 w-6 text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">VOCs & Sensors</h3>
            </div>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{purpleair.sensors_found || 0}</div>
                <div className="text-xs text-gray-500">Sensors Found</div>
              </div>
              {purpleair.avg_voc && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">VOCs</span>
                  <span className="font-medium">{purpleair.avg_voc} ppb</span>
                </div>
              )}
              {purpleair.avg_pm25 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Community PM2.5</span>
                  <span className="font-medium">{purpleair.avg_pm25} μg/m³</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Data Quality</span>
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full capitalize',
                  getRiskLevelColor(purpleair.data_quality || 'no_data')
                )}>
                  {(purpleair.data_quality || 'no_data').replace('_', ' ')}
                </span>
              </div>
              {purpleair.closest_sensors && purpleair.closest_sensors.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    Closest: {purpleair.closest_sensors[0]?.distance_km}km away
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fire Risk Card */}
          <div className="card">
            <div className="flex items-center mb-4">
              <FireIcon className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Fire Risk</h3>
            </div>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{forest_fires?.fires_within_100km ?? 0}</div>
                <div className="text-xs text-gray-500">Fires within 100km</div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Risk Level</span>
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full capitalize',
                  getRiskLevelColor(forest_fires?.fire_risk_level)
                )}>
                  {forest_fires?.fire_risk_level || 'Unknown'}
                </span>
              </div>
              {forest_fires?.max_confidence && forest_fires.max_confidence > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Max Confidence</span>
                  <span className="font-medium">{forest_fires.max_confidence}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Precipitation Card */}
          <div className="card">
            <div className="flex items-center mb-4">
              <CloudArrowDownIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Precipitation</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">24h Rain</span>
                <span className="font-medium">{precipitation.total_rain_24h_mm} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">24h Snow</span>
                <span className="font-medium">{precipitation.total_snow_24h_mm} mm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Intensity</span>
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full capitalize',
                  getRiskLevelColor(precipitation.precipitation_intensity)
                )}>
                  {precipitation.precipitation_intensity}
                </span>
              </div>
            </div>
          </div>

          {/* Solar Activity Card */}
          <div className="card">
            <div className="flex items-center mb-4">
              <EyeIcon className="h-6 w-6 text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Solar Activity</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Storm Level</span>
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full capitalize',
                  getRiskLevelColor(solar_magnetic?.storm_level)
                )}>
                  {solar_magnetic?.storm_level || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Activity</span>
                <span className="font-medium capitalize">{solar_magnetic?.solar_activity || 'Unknown'}</span>
              </div>
              {solar_magnetic?.kp_index !== null && solar_magnetic?.kp_index !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Kp Index</span>
                  <span className="font-medium">{solar_magnetic.kp_index}</span>
                </div>
              )}
              {solar_magnetic?.solar_wind_speed && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Solar Wind</span>
                  <span className="font-medium">{solar_magnetic.solar_wind_speed} km/s</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={() => loadEnvironmentalData()}
            className="btn btn-primary"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirQuality;
