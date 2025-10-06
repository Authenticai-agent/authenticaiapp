import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';

interface TomorrowOutlookProps {
  currentAQI: number;
  tomorrowAQI?: number;
  currentPM25: number;
  tomorrowPM25?: number;
  currentOzone: number;
  tomorrowOzone?: number;
}

const TomorrowOutlook: React.FC<TomorrowOutlookProps> = ({
  currentAQI,
  tomorrowAQI,
  currentPM25,
  tomorrowPM25,
  currentOzone,
  tomorrowOzone,
}) => {
  const getTrend = (current: number, tomorrow?: number) => {
    if (!tomorrow) return 'stable';
    const diff = tomorrow - current;
    if (diff > 5) return 'up';
    if (diff < -5) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-red-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-5 h-5 text-green-500" />;
      default:
        return <MinusIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-red-600 bg-red-50';
      case 'down':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const aqiTrend = getTrend(currentAQI, tomorrowAQI);
  const pm25Trend = getTrend(currentPM25, tomorrowPM25);
  const ozoneTrend = getTrend(currentOzone, tomorrowOzone);

  // Check if we have forecast data
  const hasForecastData = tomorrowAQI !== undefined || tomorrowPM25 !== undefined || tomorrowOzone !== undefined;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Tomorrow's Outlook</h3>
      
      {!hasForecastData ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 mb-2">Forecast data coming soon</p>
          <p className="text-xs text-gray-400">Check back later for tomorrow's air quality predictions</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {/* AQI Trend */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-700">Air Quality Index</p>
                <p className="text-xs text-gray-500">Today: {currentAQI}</p>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getTrendColor(aqiTrend)}`}>
                {getTrendIcon(aqiTrend)}
                <span className="text-sm font-semibold">
                  {tomorrowAQI ? tomorrowAQI : '—'}
                </span>
              </div>
            </div>

            {/* PM2.5 Trend */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-700">PM2.5 Particles</p>
                <p className="text-xs text-gray-500">Today: {currentPM25.toFixed(1)} μg/m³</p>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getTrendColor(pm25Trend)}`}>
                {getTrendIcon(pm25Trend)}
                <span className="text-sm font-semibold">
                  {tomorrowPM25 ? tomorrowPM25.toFixed(1) : '—'}
                </span>
              </div>
            </div>

            {/* Ozone Trend */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-700">Ozone Level</p>
                <p className="text-xs text-gray-500">Today: {currentOzone} ppb</p>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getTrendColor(ozoneTrend)}`}>
                {getTrendIcon(ozoneTrend)}
                <span className="text-sm font-semibold">
                  {tomorrowOzone ? tomorrowOzone : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {aqiTrend === 'down' && '✨ Good news! Air quality improving tomorrow.'}
              {aqiTrend === 'up' && '⚠️ Air quality may worsen tomorrow. Plan indoor activities.'}
              {aqiTrend === 'stable' && '📊 Air quality expected to remain similar tomorrow.'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default TomorrowOutlook;
