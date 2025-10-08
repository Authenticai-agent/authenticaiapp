import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon, 
  HeartIcon, 
  FireIcon,
  LightBulbIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalLocation } from '../contexts/LocationContext';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface BriefingMetadata {
  risk_score: number;
  risk_level: string;
  primary_risk_driver: string;
  personalization_factors: {
    user_triggers: string[];
    fitness_goal: string;
    preferences: Record<string, boolean>;
  };
  environmental_summary: {
    pm25: number;
    ozone: number;
    pollen: number;
    humidity: number;
  };
  generated_at: string;
}

interface DynamicBriefingResponse {
  briefing: string;
  metadata: BriefingMetadata;
  location: { lat: number; lon: number };
  generated_at: string;
  engine: string;
}

const DynamicDailyBriefing: React.FC = () => {
  const { user } = useAuth();
  const { currentLocation } = useGlobalLocation();
  const [briefing, setBriefing] = useState<DynamicBriefingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SECURITY: Clear briefing when user changes to prevent data leakage
  useEffect(() => {
    if (user?.id) {
      const lastUserId = localStorage.getItem('lastBriefingUserId');
      
      // If user ID changed, clear briefing
      if (lastUserId && lastUserId !== user.id) {
        setBriefing(null);
      }
      
      // Store current user ID
      localStorage.setItem('lastBriefingUserId', user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (currentLocation) {
      fetchDynamicBriefing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation]);

  const fetchDynamicBriefing = async () => {
    if (!currentLocation) return;

    setLoading(true);
    setError(null);

    try {
      // Try authenticated endpoint first (gets user's actual name and profile)
      const token = localStorage.getItem('token');
      let response;
      
      if (token) {
        // Use authenticated endpoint with user's actual profile
        response = await fetch(
          `http://localhost:8000/api/v1/daily-briefing/dynamic-briefing-authenticated`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      } else {
        // Fallback to public endpoint
        response = await fetch(
          `http://localhost:8000/api/v1/daily-briefing/dynamic-briefing?lat=${currentLocation.lat}&lon=${currentLocation.lon}`
        );
      }

      if (!response.ok) {
        throw new Error('Failed to fetch dynamic briefing');
      }

      const data: DynamicBriefingResponse = await response.json();
      setBriefing(data);
      
      // Show toast notification when location changes
      toast.success(`Briefing updated for location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lon.toFixed(4)}`);
    } catch (err) {
      console.error('Error fetching dynamic briefing:', err);
      setError('Unable to load your personalized briefing. Please try again.');
      toast.error('Failed to load daily briefing');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'very_high':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return <ShieldCheckIcon className="w-6 h-6 text-green-600" />;
      case 'moderate':
        return <LightBulbIcon className="w-6 h-6 text-yellow-600" />;
      case 'high':
        return <FireIcon className="w-6 h-6 text-orange-600" />;
      case 'very_high':
        return <FireIcon className="w-6 h-6 text-red-600" />;
      default:
        return <HeartIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const parseBriefingSections = (briefingText: string): Array<{ type: string; content: string | string[] }> => {
    // Split by the separator lines but keep content
    const parts = briefingText.split(/={60,}/);
    
    const sections: Array<{ type: string; content: string | string[] }> = [];
    
    parts.forEach((section) => {
      const trimmed = section.trim();
      
      if (trimmed.includes('YOUR ACTION PLAN') || trimmed.includes('🎯')) {
        const lines = trimmed.split('\n').filter(line => 
          line.trim() && 
          !line.includes('ACTION PLAN') && 
          !line.includes('🎯') &&
          !line.includes('=')
        );
        sections.push({ type: 'action_plan', content: lines });
      } else if (trimmed.includes('WELLNESS BOOST') || trimmed.includes('💪')) {
        const lines = trimmed.split('\n').filter(line => 
          line.trim() && 
          !line.includes('WELLNESS') && 
          !line.includes('💪') &&
          !line.includes('=')
        );
        sections.push({ type: 'wellness', content: lines });
      } else if (trimmed) {
        sections.push({ type: 'text', content: trimmed });
      }
    });
    
    return sections;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !briefing) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'No briefing available'}</p>
          <button
            onClick={fetchDynamicBriefing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sections = parseBriefingSections(briefing.briefing);
  const { metadata } = briefing;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Your Dynamic Daily Briefing
              </h2>
              <p className="text-sm text-gray-600">
                Personalized for your health profile & today's conditions
              </p>
              {currentLocation && (
                <p className="text-xs text-blue-600 mt-1">
                  📍 Location: {currentLocation.lat.toFixed(4)}°, {currentLocation.lon.toFixed(4)}°
                </p>
              )}
            </div>
          </div>
          <div className={clsx(
            'flex items-center space-x-2 px-4 py-2 rounded-lg border',
            getRiskLevelColor(metadata.risk_level)
          )}>
            {getRiskIcon(metadata.risk_level)}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide">
                {metadata.risk_level.replace('_', ' ')}
              </p>
              <p className="text-lg font-bold">
                {metadata.risk_score.toFixed(0)}/100
              </p>
            </div>
          </div>
        </div>

        {/* Environmental Summary */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-blue-200">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">PM2.5</p>
            <p className="text-lg font-bold text-gray-900">
              {metadata.environmental_summary.pm25.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">μg/m³</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Ozone</p>
            <p className="text-lg font-bold text-gray-900">
              {metadata.environmental_summary.ozone.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">ppb</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Pollen</p>
            <p className="text-lg font-bold text-gray-900">
              {metadata.environmental_summary.pollen.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">/100</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Humidity</p>
            <p className="text-lg font-bold text-gray-900">
              {metadata.environmental_summary.humidity.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">%</p>
          </div>
        </div>
      </div>

      {/* Daily Briefing Content */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Briefing</h3>
        {sections.map((section, index) => {
          if (section.type === 'action_plan' || section.type === 'wellness') {
            return null; // Skip these, we'll render them separately
          } else {
            // Parse and color-code conditions
            const content = section.content as string;
            const lines = content.split('\n');
            
            return (
              <div key={index} className="mb-4">
                {lines.map((line, lineIndex) => {
                  // Determine colors based on keywords
                  let styles: React.CSSProperties = {};
                  let textColor = '#374151'; // gray-700
                  
                  if (line.includes('EXCELLENT') || line.includes('✓') || line.includes('BENEFIT')) {
                    styles = { backgroundColor: '#f0fdf4', borderLeft: '4px solid #22c55e', padding: '8px 12px', marginBottom: '8px', borderRadius: '0 4px 4px 0' };
                    textColor = '#166534'; // green-800
                  } else if (line.includes('UNHEALTHY') || line.includes('HIGH') || line.includes('VERY')) {
                    styles = { backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '8px 12px', marginBottom: '8px', borderRadius: '0 4px 4px 0' };
                    textColor = '#991b1b'; // red-800
                  } else if (line.includes('MODERATE') || line.includes('elevated')) {
                    styles = { backgroundColor: '#fefce8', borderLeft: '4px solid #eab308', padding: '8px 12px', marginBottom: '8px', borderRadius: '0 4px 4px 0' };
                    textColor = '#854d0e'; // yellow-800
                  } else if (line.includes('low') || line.includes('LOW') || line.includes('Minimal')) {
                    styles = { backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '8px 12px', marginBottom: '8px', borderRadius: '0 4px 4px 0' };
                    textColor = '#1e40af'; // blue-800
                  } else if (line.includes('⚠️') || line.includes('INTERACTION')) {
                    styles = { backgroundColor: '#fff7ed', borderLeft: '4px solid #f97316', padding: '8px 12px', marginBottom: '8px', borderRadius: '0 4px 4px 0' };
                    textColor = '#9a3412'; // orange-800
                  }
                  
                  if (line.trim().startsWith('•') && Object.keys(styles).length > 0) {
                    return (
                      <div key={lineIndex} style={styles}>
                        <p style={{ color: textColor, fontWeight: 500 }}>{line}</p>
                      </div>
                    );
                  } else if (line.trim()) {
                    return (
                      <p key={lineIndex} style={{ color: '#374151', lineHeight: '1.625', paddingTop: '4px' }}>{line}</p>
                    );
                  }
                  return null;
                })}
              </div>
            );
          }
        })}
      </div>

      {/* Your Action Plan - Separate Card */}
      {sections.find(s => s.type === 'action_plan') && (
        <div className="bg-blue-50 rounded-xl shadow-lg p-8 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <ShieldCheckIcon className="w-6 h-6 mr-2 text-blue-600" />
            🎯 Your Action Plan
          </h3>
          <ul className="space-y-3">
            {(sections.find(s => s.type === 'action_plan')?.content as string[]).map((item, i) => (
              <li key={i} className="flex items-start text-blue-900 font-medium">
                <span className="mr-2">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Wellness Boost - Separate Card */}
      {sections.find(s => s.type === 'wellness') && (
        <div className="bg-green-50 rounded-xl shadow-lg p-8 border-2 border-green-200">
          <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
            <HeartIcon className="w-6 h-6 mr-2 text-green-600" />
            💪 Wellness Boost
          </h3>
          <ul className="space-y-3">
            {(sections.find(s => s.type === 'wellness')?.content as string[]).map((item, i) => (
              <li key={i} className="flex items-start text-green-800 font-medium">
                <span className="mr-2">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metadata Footer */}
      <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Primary Risk: {metadata.primary_risk_driver.toUpperCase()}</p>
            <p>Generated: {new Date(metadata.generated_at).toLocaleString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })} (local time)</p>
          </div>
          <button
            onClick={fetchDynamicBriefing}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicDailyBriefing;
