import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface APIStats {
  total_calls: number;
  total_errors: number;
  error_rate: number;
  avg_response_time_ms: number;
  rate_limit: number;
  usage_percent: number;
  status: string;
}

interface MonitoringSummary {
  overall_status: string;
  total_api_calls: number;
  total_errors: number;
  overall_error_rate: number;
  monitoring_period: {
    start: string;
    duration_hours: number;
  };
  apis: Record<string, APIStats>;
  warnings: string[];
}

const APIMonitoring: React.FC = () => {
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [health, setHealth] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchMonitoringData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const [summaryRes, healthRes] = await Promise.all([
        api.get('/monitoring/summary'),
        api.get('/monitoring/health')
      ]);
      
      setSummary(summaryRes.data.summary);
      setHealth(healthRes.data.apis);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch monitoring data:', error);
      toast.error('Failed to load monitoring data');
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'degraded':
      case 'warning_rate_limit':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case 'unhealthy':
      case 'critical_rate_limit':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
      case 'warning_rate_limit':
        return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
      case 'critical_rate_limit':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'degraded':
        return 'Degraded';
      case 'warning_rate_limit':
        return 'Warning: Rate Limit';
      case 'critical_rate_limit':
        return 'Critical: Rate Limit';
      case 'unhealthy':
        return 'Unhealthy';
      default:
        return 'Unknown';
    }
  };

  const apiNames: Record<string, string> = {
    openweather: 'OpenWeather',
    airnow: 'AirNow',
    purpleair: 'PurpleAir',
    stripe: 'Stripe',
    supabase: 'Supabase'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Monitoring</h1>
              <p className="mt-2 text-gray-600">
                Real-time monitoring of external API health and usage
              </p>
            </div>
            <button
              onClick={fetchMonitoringData}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        {/* Overall Status */}
        {summary && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex items-center mt-2">
                  {getStatusIcon(summary.overall_status)}
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(summary.overall_status)}`}>
                    {getStatusText(summary.overall_status)}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total API Calls</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{summary.total_api_calls.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{summary.total_errors.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{summary.overall_error_rate.toFixed(2)}%</p>
              </div>
            </div>

            {/* Warnings */}
            {summary.warnings && summary.warnings.length > 0 && (
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Active Warnings</h3>
                    <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                      {summary.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Individual API Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summary && Object.entries(summary.apis).map(([apiKey, stats]) => (
            <div key={apiKey} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{apiNames[apiKey]}</h3>
                {getStatusIcon(stats.status)}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(stats.status)}`}>
                    {getStatusText(stats.status)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Calls:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.total_calls.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Errors:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.total_errors}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Error Rate:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.error_rate.toFixed(2)}%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Response:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.avg_response_time_ms.toFixed(0)}ms</span>
                </div>

                {stats.rate_limit > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rate Limit:</span>
                      <span className="text-sm font-medium text-gray-900">{stats.rate_limit.toLocaleString()}/day</span>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Usage:</span>
                        <span className="text-sm font-medium text-gray-900">{stats.usage_percent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            stats.usage_percent >= 95 ? 'bg-red-500' :
                            stats.usage_percent >= 80 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(stats.usage_percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Health Check Status */}
                {health[apiKey] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Health Check:</span>
                      <span className={`text-sm font-medium ${
                        health[apiKey].status === 'healthy' ? 'text-green-600' :
                        health[apiKey].status === 'error' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {health[apiKey].status}
                      </span>
                    </div>
                    {health[apiKey].response_time_ms && (
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-600">Health Response:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {health[apiKey].response_time_ms.toFixed(0)}ms
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Monitoring Period Info */}
        {summary && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoring Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Period Start:</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {new Date(summary.monitoring_period.start).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration:</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {summary.monitoring_period.duration_hours.toFixed(2)} hours
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              * Counters reset daily at midnight UTC
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIMonitoring;
