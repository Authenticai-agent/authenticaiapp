import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  SunIcon, 
  MoonIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

interface HourlyData {
  timestamp: string;
  hour: number;
  aqi: number;
  pm25: number;
  pm10?: number;
  ozone?: number;
  no2?: number;
  so2?: number;
  co?: number;
}

interface BestWorstTime {
  hour: number;
  time: string;
  aqi: number;
  timestamp: string;
}

interface ForecastData {
  location: { lat: number; lon: number };
  forecast_date: string;
  hourly_forecast: HourlyData[];
  best_time: BestWorstTime;
  worst_time: BestWorstTime;
  source: string;
  total_hours: number;
}

interface HourlyForecastChartProps {
  lat: number;
  lon: number;
  hours?: number;
}

const HourlyForecastChart: React.FC<HourlyForecastChartProps> = ({ 
  lat, 
  lon, 
  hours = 24 
}) => {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<HourlyData | null>(null);

  useEffect(() => {
    fetchForecast();
  }, [lat, lon, hours]);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/forecast/hourly?lat=${lat}&lon=${lon}&hours=${hours}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch forecast');

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setForecast(data);
      }
    } catch (err: any) {
      console.error('Error fetching forecast:', err);
      setError(err.message || 'Failed to load forecast');
      toast.error('Failed to load hourly forecast');
    } finally {
      setLoading(false);
    }
  };

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#10b981'; // green
    if (aqi <= 100) return '#fbbf24'; // yellow
    if (aqi <= 150) return '#f97316'; // orange
    if (aqi <= 200) return '#ef4444'; // red
    if (aqi <= 300) return '#a855f7'; // purple
    return '#7f1d1d'; // dark red
  };

  const getAQICategory = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const formatTime = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const isNightTime = (hour: number): boolean => {
    return hour < 6 || hour >= 20;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !forecast) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-2">Hourly forecast unavailable</p>
          <p className="text-sm text-gray-500">{error || 'No data available'}</p>
          <button
            onClick={fetchForecast}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxAQI = Math.max(...forecast.hourly_forecast.map(h => h.aqi));
  const minAQI = Math.min(...forecast.hourly_forecast.map(h => h.aqi));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
          <ClockIcon className="w-7 h-7 mr-2 text-blue-600" />
          {hours}-Hour Forecast
        </h3>
        <p className="text-sm text-gray-600">
          Hour-by-hour air quality predictions
        </p>
      </div>

      {/* Best/Worst Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Best Time */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <SunIcon className="w-6 h-6 text-green-600 mr-2" />
              <span className="text-sm font-semibold text-green-800">Best Time</span>
            </div>
            <ArrowTrendingDownIcon className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-700 mb-1">
            {forecast.best_time.time}
          </p>
          <p className="text-sm text-green-600">
            AQI: {forecast.best_time.aqi} - {getAQICategory(forecast.best_time.aqi)}
          </p>
          <p className="text-xs text-green-600 mt-2">
            ✓ Great time for outdoor activities
          </p>
        </div>

        {/* Worst Time */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <MoonIcon className="w-6 h-6 text-red-600 mr-2" />
              <span className="text-sm font-semibold text-red-800">Worst Time</span>
            </div>
            <ArrowTrendingUpIcon className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-700 mb-1">
            {forecast.worst_time.time}
          </p>
          <p className="text-sm text-red-600">
            AQI: {forecast.worst_time.aqi} - {getAQICategory(forecast.worst_time.aqi)}
          </p>
          <p className="text-xs text-red-600 mt-2">
            ⚠ Avoid outdoor activities
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <div className="relative" style={{ height: '200px' }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
            <span>{maxAQI}</span>
            <span>{Math.round((maxAQI + minAQI) / 2)}</span>
            <span>{minAQI}</span>
          </div>

          {/* Chart area */}
          <div className="absolute left-12 right-0 top-0 bottom-0">
            <svg className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="0" x2="100%" y2="0" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#e5e7eb" strokeWidth="1" />

              {/* AQI line */}
              <polyline
                points={forecast.hourly_forecast.map((hour, index) => {
                  const x = (index / (forecast.hourly_forecast.length - 1)) * 100;
                  const y = 100 - ((hour.aqi - minAQI) / (maxAQI - minAQI)) * 100;
                  return `${x}%,${y}%`;
                }).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {forecast.hourly_forecast.map((hour, index) => {
                const x = (index / (forecast.hourly_forecast.length - 1)) * 100;
                const y = 100 - ((hour.aqi - minAQI) / (maxAQI - minAQI)) * 100;
                return (
                  <circle
                    key={index}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="4"
                    fill={getAQIColor(hour.aqi)}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer hover:r-6 transition-all"
                    onClick={() => setSelectedHour(hour)}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 ml-12 text-xs text-gray-500">
          {forecast.hourly_forecast
            .filter((_, index) => index % Math.ceil(forecast.hourly_forecast.length / 6) === 0)
            .map((hour, index) => (
              <span key={index}>{formatTime(hour.hour)}</span>
            ))}
        </div>
      </div>

      {/* Selected Hour Details */}
      {selectedHour && (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-lg font-bold text-blue-900">
                {formatTime(selectedHour.hour)}
              </p>
              <p className="text-sm text-blue-700">
                {new Date(selectedHour.timestamp).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setSelectedHour(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-blue-600 mb-1">AQI</p>
              <p className="text-2xl font-bold text-blue-900">{selectedHour.aqi}</p>
              <p className="text-xs text-blue-700">{getAQICategory(selectedHour.aqi)}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 mb-1">PM2.5</p>
              <p className="text-2xl font-bold text-blue-900">{selectedHour.pm25.toFixed(1)}</p>
              <p className="text-xs text-blue-700">µg/m³</p>
            </div>
            {selectedHour.ozone !== undefined && (
              <div>
                <p className="text-xs text-blue-600 mb-1">Ozone</p>
                <p className="text-2xl font-bold text-blue-900">{selectedHour.ozone.toFixed(1)}</p>
                <p className="text-xs text-blue-700">µg/m³</p>
              </div>
            )}
            {selectedHour.pm10 !== undefined && (
              <div>
                <p className="text-xs text-blue-600 mb-1">PM10</p>
                <p className="text-2xl font-bold text-blue-900">{selectedHour.pm10.toFixed(1)}</p>
                <p className="text-xs text-blue-700">µg/m³</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hourly List */}
      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-2">
          {forecast.hourly_forecast.map((hour, index) => (
            <div
              key={index}
              onClick={() => setSelectedHour(hour)}
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition"
            >
              <div className="flex items-center">
                {isNightTime(hour.hour) ? (
                  <MoonIcon className="w-5 h-5 text-gray-600 mr-3" />
                ) : (
                  <SunIcon className="w-5 h-5 text-yellow-500 mr-3" />
                )}
                <div>
                  <p className="font-semibold text-gray-800">{formatTime(hour.hour)}</p>
                  <p className="text-xs text-gray-500">
                    PM2.5: {hour.pm25.toFixed(1)} µg/m³
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-right mr-3">
                  <p className="text-2xl font-bold text-gray-800">{hour.aqi}</p>
                  <p className="text-xs text-gray-600">{getAQICategory(hour.aqi)}</p>
                </div>
                <div
                  className="w-3 h-12 rounded"
                  style={{ backgroundColor: getAQIColor(hour.aqi) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Data from {forecast.source} • Updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default HourlyForecastChart;
