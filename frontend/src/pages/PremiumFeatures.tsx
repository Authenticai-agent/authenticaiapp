import React, { useState } from 'react';
import { useGlobalLocation } from '../contexts/LocationContext';
import MultipleLocations from '../components/MultipleLocations';
import HourlyForecastChart from '../components/HourlyForecastChart';
import HistoricalTrends from '../components/HistoricalTrends';
import NotificationSettings from '../components/NotificationSettings';
import { 
  MapPinIcon, 
  ClockIcon, 
  ChartBarIcon, 
  BellIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const PremiumFeatures: React.FC = () => {
  const { currentLocation } = useGlobalLocation();
  const [activeTab, setActiveTab] = useState<'locations' | 'forecast' | 'trends' | 'notifications'>('locations');

  const tabs = [
    { id: 'locations' as const, name: 'Multiple Locations', icon: MapPinIcon },
    { id: 'forecast' as const, name: 'Hourly Forecast', icon: ClockIcon },
    { id: 'trends' as const, name: 'Historical Trends', icon: ChartBarIcon },
    { id: 'notifications' as const, name: 'Notifications', icon: BellIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <SparklesIcon className="w-10 h-10 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Premium Features
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Advanced air quality monitoring and insights
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <MapPinIcon className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Multi-Location</h3>
            <p className="text-sm text-gray-600">
              Monitor up to 5 locations simultaneously
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <ClockIcon className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">24-Hour Forecast</h3>
            <p className="text-sm text-gray-600">
              Hour-by-hour predictions with best times
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <ChartBarIcon className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Trend Analysis</h3>
            <p className="text-sm text-gray-600">
              90-day history with insights & CSV export
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <BellIcon className="w-8 h-8 text-orange-600 mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Smart Alerts</h3>
            <p className="text-sm text-gray-600">
              Customizable thresholds & quiet hours
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'locations' && (
            <div>
              <MultipleLocations />
            </div>
          )}

          {activeTab === 'forecast' && currentLocation && (
            <div>
              <HourlyForecastChart 
                lat={currentLocation.lat} 
                lon={currentLocation.lon} 
                hours={24}
              />
            </div>
          )}

          {activeTab === 'trends' && (
            <div>
              <HistoricalTrends days={30} />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <NotificationSettings />
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Unlock All Premium Features
            </h2>
            <p className="text-lg mb-6 text-blue-100">
              Get comprehensive air quality insights with multi-location monitoring, 
              hourly forecasts, historical trends, and smart notifications.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/pricing"
                className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition"
              >
                View Pricing
              </a>
              <a
                href="/dashboard"
                className="px-8 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition border-2 border-white"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatures;
