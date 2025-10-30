import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowDownTrayIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

interface TrendData {
  period: {
    start_date: string;
    end_date: string;
    days_analyzed: number;
  };
  averages: {
    aqi: number;
    pm25: number;
  };
  trend: {
    direction: 'improving' | 'worsening' | 'stable';
    percentage: number;
    message: string;
  };
  best_day: {
    date: string;
    aqi: number;
    pm25: number;
  };
  worst_day: {
    date: string;
    aqi: number;
    pm25: number;
  };
  day_distribution: {
    good: number;
    moderate: number;
    unhealthy: number;
    good_percentage: number;
  };
  location_name?: string;
}

interface HistoricalTrendsProps {
  locationName?: string;
  days?: number;
}

const HistoricalTrends: React.FC<HistoricalTrendsProps> = ({ 
  locationName, 
  days = 30 
}) => {
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(days);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchTrends();
  }, [locationName, selectedDays]);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        days: selectedDays.toString()
      });
      
      if (locationName) {
        params.append('location_name', locationName);
      }

      const response = await fetch(
        `${API_BASE_URL}/history/trends?${params}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch trends');

      const data = await response.json();
      
      if (data.trends === null) {
        setError(data.message || 'Not enough data for trend analysis');
      } else {
        setTrends(data);
      }
    } catch (err: any) {
      console.error('Error fetching trends:', err);
      setError(err.message || 'Failed to load trends');
      toast.error('Failed to load historical trends');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    setExporting(true);

    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        days: selectedDays.toString()
      });
      
      if (locationName) {
        params.append('location_name', locationName);
      }

      const response = await fetch(
        `${API_BASE_URL}/history/export?${params}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Failed to export data');

      const data = await response.json();
      
      if (!data.csv) {
        toast.error(data.message || 'No data available for export');
        return;
      }

      // Create and download CSV file
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename || 'air_quality_history.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Data exported successfully!');
    } catch (err: any) {
      console.error('Error exporting data:', err);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const getTrendIcon = () => {
    if (!trends) return null;
    
    if (trends.trend.direction === 'improving') {
      return <ArrowTrendingDownIcon className="w-8 h-8 text-green-500" />;
    } else if (trends.trend.direction === 'worsening') {
      return <ArrowTrendingUpIcon className="w-8 h-8 text-red-500" />;
    }
    return <div className="w-8 h-8 bg-gray-300 rounded-full" />;
  };

  const getTrendColor = () => {
    if (!trends) return 'text-gray-600';
    
    if (trends.trend.direction === 'improving') return 'text-green-600';
    if (trends.trend.direction === 'worsening') return 'text-red-600';
    return 'text-gray-600';
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

  if (error || !trends) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <ChartBarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-2">Historical trends unavailable</p>
          <p className="text-sm text-gray-500">{error || 'No data available'}</p>
          <p className="text-xs text-gray-400 mt-2">
            Data is collected daily. Check back after a few days.
          </p>
          <button
            onClick={fetchTrends}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
            <ChartBarIcon className="w-7 h-7 mr-2 text-blue-600" />
            Historical Trends
          </h3>
          <p className="text-sm text-gray-600">
            {locationName ? `${locationName} • ` : ''}
            {trends.period.days_analyzed} days analyzed
          </p>
        </div>

        <button
          onClick={exportData}
          disabled={exporting}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Time Period Selector */}
      <div className="mb-6 flex gap-2">
        {[7, 14, 30, 60, 90].map((dayOption) => (
          <button
            key={dayOption}
            onClick={() => setSelectedDays(dayOption)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedDays === dayOption
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {dayOption}d
          </button>
        ))}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Average AQI */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <p className="text-sm font-semibold text-blue-800 mb-2">Average AQI</p>
          <p className="text-5xl font-bold text-blue-900 mb-2">
            {trends.averages.aqi.toFixed(1)}
          </p>
          <p className="text-sm text-blue-700">
            PM2.5: {trends.averages.pm25.toFixed(1)} µg/m³
          </p>
        </div>

        {/* Trend */}
        <div className={`bg-gradient-to-br ${
          trends.trend.direction === 'improving' 
            ? 'from-green-50 to-green-100' 
            : trends.trend.direction === 'worsening'
            ? 'from-red-50 to-red-100'
            : 'from-gray-50 to-gray-100'
        } rounded-lg p-6`}>
          <p className="text-sm font-semibold mb-2" style={{ 
            color: trends.trend.direction === 'improving' ? '#166534' : 
                   trends.trend.direction === 'worsening' ? '#991b1b' : '#374151' 
          }}>
            Trend Direction
          </p>
          <div className="flex items-center mb-2">
            {getTrendIcon()}
            <span className={`ml-3 text-4xl font-bold ${getTrendColor()}`}>
              {trends.trend.percentage.toFixed(1)}%
            </span>
          </div>
          <p className={`text-sm ${getTrendColor()}`}>
            {trends.trend.message}
          </p>
        </div>
      </div>

      {/* Best & Worst Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Best Day */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <CalendarIcon className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-semibold text-green-800">Best Day</span>
          </div>
          <p className="text-lg font-bold text-green-900 mb-1">
            {new Date(trends.best_day.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-green-700">
              {trends.best_day.aqi}
            </span>
            <span className="text-sm text-green-600">
              PM2.5: {trends.best_day.pm25.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Worst Day */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <CalendarIcon className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm font-semibold text-red-800">Worst Day</span>
          </div>
          <p className="text-lg font-bold text-red-900 mb-1">
            {new Date(trends.worst_day.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-red-700">
              {trends.worst_day.aqi}
            </span>
            <span className="text-sm text-red-600">
              PM2.5: {trends.worst_day.pm25.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Day Distribution */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Air Quality Distribution</h4>
        
        {/* Visual Bar */}
        <div className="flex h-12 rounded-lg overflow-hidden mb-4">
          <div 
            className="bg-green-500 flex items-center justify-center text-white font-semibold text-sm"
            style={{ 
              width: `${(trends.day_distribution.good / trends.period.days_analyzed) * 100}%` 
            }}
          >
            {trends.day_distribution.good > 0 && trends.day_distribution.good}
          </div>
          <div 
            className="bg-yellow-500 flex items-center justify-center text-white font-semibold text-sm"
            style={{ 
              width: `${(trends.day_distribution.moderate / trends.period.days_analyzed) * 100}%` 
            }}
          >
            {trends.day_distribution.moderate > 0 && trends.day_distribution.moderate}
          </div>
          <div 
            className="bg-red-500 flex items-center justify-center text-white font-semibold text-sm"
            style={{ 
              width: `${(trends.day_distribution.unhealthy / trends.period.days_analyzed) * 100}%` 
            }}
          >
            {trends.day_distribution.unhealthy > 0 && trends.day_distribution.unhealthy}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm font-semibold text-gray-700">Good</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{trends.day_distribution.good}</p>
            <p className="text-xs text-gray-600">
              {((trends.day_distribution.good / trends.period.days_analyzed) * 100).toFixed(0)}%
            </p>
          </div>

          <div>
            <div className="flex items-center justify-center mb-1">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span className="text-sm font-semibold text-gray-700">Moderate</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{trends.day_distribution.moderate}</p>
            <p className="text-xs text-gray-600">
              {((trends.day_distribution.moderate / trends.period.days_analyzed) * 100).toFixed(0)}%
            </p>
          </div>

          <div>
            <div className="flex items-center justify-center mb-1">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm font-semibold text-gray-700">Unhealthy</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{trends.day_distribution.unhealthy}</p>
            <p className="text-xs text-gray-600">
              {((trends.day_distribution.unhealthy / trends.period.days_analyzed) * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Good Days Percentage */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            <span className="font-bold text-green-600">
              {trends.day_distribution.good_percentage.toFixed(1)}%
            </span>
            {' '}of days had good air quality
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Period: {new Date(trends.period.start_date).toLocaleDateString()} - {new Date(trends.period.end_date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default HistoricalTrends;
