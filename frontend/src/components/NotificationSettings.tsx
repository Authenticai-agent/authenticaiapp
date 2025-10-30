import React, { useState, useEffect } from 'react';
import { 
  BellIcon,
  BellSlashIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

interface NotificationSettingsData {
  id?: string;
  user_id?: string;
  aqi_threshold: number;
  enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  max_daily_notifications: number;
  created_at?: string;
  updated_at?: string;
}

interface NotificationLog {
  id: string;
  aqi: number;
  lat: number;
  lon: number;
  sent_at: string;
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettingsData>({
    aqi_threshold: 100,
    enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    max_daily_notifications: 2
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<NotificationLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchHistory();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const fetchSettings = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      // Use default settings if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/notifications/history?days=30`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch history');

      const data = await response.json();
      setHistory(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notification history:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);

    try {
      const token = getAuthToken();
      const method = settings.id ? 'PUT' : 'POST';
      const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to save settings');

      const data = await response.json();
      setSettings(data);
      toast.success('Notification settings saved!');
    } catch (error: any) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getAQICategory = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return 'text-green-600';
    if (aqi <= 100) return 'text-yellow-600';
    if (aqi <= 150) return 'text-orange-600';
    if (aqi <= 200) return 'text-red-600';
    if (aqi <= 300) return 'text-purple-600';
    return 'text-red-900';
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
          {settings.enabled ? (
            <BellIcon className="w-7 h-7 mr-2 text-blue-600" />
          ) : (
            <BellSlashIcon className="w-7 h-7 mr-2 text-gray-400" />
          )}
          Notification Settings
        </h3>
        <p className="text-sm text-gray-600">
          Get alerts when air quality exceeds your threshold
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">Enable Notifications</p>
            <p className="text-sm text-gray-600">
              Receive alerts for poor air quality
            </p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              settings.enabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                settings.enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* AQI Threshold */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Alert me when AQI exceeds:
        </label>
        
        <div className="mb-4">
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            value={settings.aqi_threshold}
            onChange={(e) => setSettings({ 
              ...settings, 
              aqi_threshold: parseInt(e.target.value) 
            })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            disabled={!settings.enabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className={`text-4xl font-bold ${getAQIColor(settings.aqi_threshold)}`}>
              {settings.aqi_threshold}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {getAQICategory(settings.aqi_threshold)}
            </p>
          </div>
        </div>

        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 You'll receive notifications when air quality exceeds AQI {settings.aqi_threshold}
          </p>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <ClockIcon className="w-5 h-5 mr-2" />
          Quiet Hours
        </label>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-2">Start Time</label>
            <input
              type="time"
              value={settings.quiet_hours_start}
              onChange={(e) => setSettings({ 
                ...settings, 
                quiet_hours_start: e.target.value 
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!settings.enabled}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-2">End Time</label>
            <input
              type="time"
              value={settings.quiet_hours_end}
              onChange={(e) => setSettings({ 
                ...settings, 
                quiet_hours_end: e.target.value 
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!settings.enabled}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          No notifications will be sent during quiet hours
        </p>
      </div>

      {/* Max Daily Notifications */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Maximum Notifications Per Day
        </label>
        
        <div className="flex gap-2">
          {[1, 2, 3, 5].map((num) => (
            <button
              key={num}
              onClick={() => setSettings({ 
                ...settings, 
                max_daily_notifications: num 
              })}
              disabled={!settings.enabled}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                settings.max_daily_notifications === num
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {num}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Prevents notification spam while keeping you informed
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={saving}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {saving ? (
          <>
            <LoadingSpinner />
            <span className="ml-2">Saving...</span>
          </>
        ) : (
          <>
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Save Settings
          </>
        )}
      </button>

      {/* Notification History */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="font-semibold text-gray-800">
            Notification History ({history.length})
          </span>
          <span className="text-gray-500">
            {showHistory ? '▼' : '▶'}
          </span>
        </button>

        {showHistory && (
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No notifications sent in the last 30 days
              </p>
            ) : (
              history.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      AQI: {log.aqi}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(log.sent_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    log.aqi <= 100 ? 'bg-yellow-100 text-yellow-800' :
                    log.aqi <= 150 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getAQICategory(log.aqi)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-semibold mb-2">
          How Smart Notifications Work:
        </p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>✓ Alerts sent only when AQI exceeds your threshold</li>
          <li>✓ Respects quiet hours (no late-night alerts)</li>
          <li>✓ Maximum {settings.max_daily_notifications} notifications per day</li>
          <li>✓ 12-hour cooldown between alerts</li>
          <li>✓ No spam, just important updates</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationSettings;
