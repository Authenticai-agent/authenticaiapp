import React, { useState } from 'react';
import { MapPinIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface LocationData {
  name: string;
  lat: number;
  lon: number;
  briefing?: string;
  riskScore?: number;
  riskLevel?: string;
  loading?: boolean;
}

const testLocations: LocationData[] = [
  { name: 'Los Angeles, CA', lat: 34.0522, lon: -118.2437 },
  { name: 'New York, NY', lat: 40.7128, lon: -74.0060 },
  { name: 'Delhi, India', lat: 28.6139, lon: 77.2090 },
  { name: 'Rural Montana', lat: 46.8797, lon: -110.3626 },
];

const LocationComparisonDemo: React.FC = () => {
  const [locations, setLocations] = useState<LocationData[]>(testLocations);
  const [loading, setLoading] = useState(false);

  const fetchBriefingForLocation = async (location: LocationData, index: number) => {
    try {
      // Update loading state
      const updatedLocations = [...locations];
      updatedLocations[index] = { ...location, loading: true };
      setLocations(updatedLocations);

      const response = await fetch(
        `http://localhost:8000/api/v1/daily-briefing/dynamic-briefing?lat=${location.lat}&lon=${location.lon}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch briefing');
      }

      const data = await response.json();

      // Update with briefing data
      updatedLocations[index] = {
        ...location,
        briefing: data.briefing,
        riskScore: data.metadata.risk_score,
        riskLevel: data.metadata.risk_level,
        loading: false,
      };
      setLocations(updatedLocations);

      toast.success(`Loaded briefing for ${location.name}`);
    } catch (err) {
      console.error('Error fetching briefing:', err);
      toast.error(`Failed to load briefing for ${location.name}`);
      
      const updatedLocations = [...locations];
      updatedLocations[index] = { ...location, loading: false };
      setLocations(updatedLocations);
    }
  };

  const fetchAllBriefings = async () => {
    setLoading(true);
    
    for (let i = 0; i < locations.length; i++) {
      await fetchBriefingForLocation(locations[i], i);
    }
    
    setLoading(false);
  };

  const getRiskColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'very_high':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <MapPinIcon className="w-6 h-6 mr-2 text-blue-600" />
            Location Comparison Demo
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            See how briefings adapt to different locations worldwide
          </p>
        </div>
        <button
          onClick={fetchAllBriefings}
          disabled={loading}
          className={clsx(
            'px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2',
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          <ArrowPathIcon className={clsx('w-5 h-5', loading && 'animate-spin')} />
          <span>{loading ? 'Loading...' : 'Compare All Locations'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((location, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{location.name}</h4>
                <p className="text-xs text-gray-500">
                  {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
                </p>
              </div>
              {location.riskScore !== undefined && (
                <div className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium border',
                  getRiskColor(location.riskLevel)
                )}>
                  Risk: {location.riskScore.toFixed(0)}/100
                </div>
              )}
            </div>

            {location.loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!location.loading && location.briefing && (
              <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                  {location.briefing.substring(0, 400)}
                  {location.briefing.length > 400 && '...'}
                </p>
              </div>
            )}

            {!location.loading && !location.briefing && (
              <button
                onClick={() => fetchBriefingForLocation(location, index)}
                className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                Load Briefing
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">💡 What to Notice:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Delhi, India</strong>: Highest risk scores due to severe air pollution (PM2.5 often &gt;50 μg/m³)</li>
          <li>• <strong>Los Angeles</strong>: Ozone-focused recommendations (peaks 2-6 PM)</li>
          <li>• <strong>New York</strong>: Traffic NO₂ warnings and route selection advice</li>
          <li>• <strong>Rural Montana</strong>: Lowest risk, encourages outdoor activities</li>
          <li>• <strong>Action plans</strong> adapt to primary risk driver (PM2.5 vs ozone vs pollen)</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationComparisonDemo;
