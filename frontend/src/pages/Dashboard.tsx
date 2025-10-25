import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalLocation } from '../contexts/LocationContext';
import { predictionsAPI, airQualityAPI, forecastAPI } from '../services/api';
import { resolveEffectiveLocation } from '../utils/location';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  ExclamationTriangleIcon, 
  CloudIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import TomorrowOutlook from '../components/TomorrowOutlook';
import SmartScoreTrend from '../components/SmartScoreTrend';
import LungEnergyMeter from '../components/LungEnergyMeter';
import CommunityGoodDayChallenge from '../components/CommunityGoodDayChallenge';
import EducationalMicroTips from '../components/EducationalMicroTips';
import IndoorWellnessTip from '../components/IndoorWellnessTip';
import DonationCTA from '../components/DonationCTA';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

interface RiskPrediction {
  id: string;
  risk_score: number;
  risk_level: string;
  factors: any;
  recommendations: any[];
  prediction_date: string;
}

interface AirQualityData {
  id: string;
  aqi: number;
  pm25: number;
  pm10?: number;
  ozone?: number;
  no2?: number;
  so2?: number;
  co?: number;
  source: string;
  timestamp: string;
}

interface DailyBriefing {
  id: string;
  content: string;
  session_type: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentLocation } = useGlobalLocation();
  const [loading, setLoading] = useState(true);
  const [riskPrediction, setRiskPrediction] = useState<RiskPrediction | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [dailyBriefing, setDailyBriefing] = useState<DailyBriefing | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [tomorrowForecast, setTomorrowForecast] = useState<any>(null);

  // SECURITY: Clear all cached data when user changes
  useEffect(() => {
    if (user?.id) {
      const lastUserId = localStorage.getItem('lastUserId');
      
      // If user ID changed, clear all cached data
      if (lastUserId && lastUserId !== user.id) {
        // Clear all state
        setRiskPrediction(null);
        setAirQuality(null);
        setDailyBriefing(null);
        
        // Clear localStorage to prevent data leakage between users
        localStorage.removeItem('riskPrediction');
        localStorage.removeItem('airQuality');
        localStorage.removeItem('dailyBriefing');
      }
      
      // Store current user ID to detect user changes
      localStorage.setItem('lastUserId', user.id);
    }
  }, [user?.id]); // Only trigger when user ID changes

  useEffect(() => {
    // Clear briefing when location changes to prevent showing stale data
    setDailyBriefing(null);
    
    // Load data from localStorage first, then fetch fresh data
    loadCachedData();
    if (currentLocation) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [currentLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debug air quality state changes
  useEffect(() => {
    console.log('Air quality state changed:', airQuality);
  }, [airQuality]);

  // Handle donation success/cancel from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const donationStatus = params.get('donation');
    
    if (donationStatus === 'success') {
      toast.success('Thank you for your donation! 💚 Your support helps keep AuthentiCare free for everyone.', {
        duration: 6000,
        icon: '🎉',
      });
      // Remove query param
      window.history.replaceState({}, '', '/dashboard');
    } else if (donationStatus === 'cancelled') {
      toast('Donation cancelled. You can try again anytime!', {
        duration: 4000,
        icon: 'ℹ️',
      });
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const loadCachedData = () => {
    try {
      // Load cached data from localStorage with timestamp validation
      const cachedRiskPrediction = localStorage.getItem('riskPrediction');
      const cachedAirQuality = localStorage.getItem('airQuality');
      const cachedDailyBriefing = localStorage.getItem('dailyBriefing');
      
      // Check if cached data is still fresh (less than 5 minutes old)
      const isDataFresh = (timestamp: string) => {
        const cacheTime = new Date(timestamp).getTime();
        const now = new Date().getTime();
        return (now - cacheTime) < 5 * 60 * 1000; // 5 minutes
      };
      
      if (cachedRiskPrediction) {
        const parsed = JSON.parse(cachedRiskPrediction);
        if (parsed.timestamp && isDataFresh(parsed.timestamp)) {
          setRiskPrediction(parsed);
        }
      }
      if (cachedAirQuality) {
        const parsed = JSON.parse(cachedAirQuality);
        if (parsed.timestamp && isDataFresh(parsed.timestamp)) {
          setAirQuality(parsed);
        }
      }
      if (cachedDailyBriefing) {
        const parsed = JSON.parse(cachedDailyBriefing);
        if (parsed.timestamp && isDataFresh(parsed.timestamp)) {
          setDailyBriefing(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load cached data:', error);
    }
  };

  const saveCachedData = (riskPrediction: RiskPrediction | null, airQuality: AirQualityData | null, dailyBriefing: DailyBriefing | null) => {
    try {
      const timestamp = new Date().toISOString();
      
      if (riskPrediction) {
        localStorage.setItem('riskPrediction', JSON.stringify({
          ...riskPrediction,
          timestamp
        }));
      }
      if (airQuality) {
        localStorage.setItem('airQuality', JSON.stringify({
          ...airQuality,
          timestamp
        }));
      }
      if (dailyBriefing) {
        localStorage.setItem('dailyBriefing', JSON.stringify({
          ...dailyBriefing,
          timestamp
        }));
      }
    } catch (error) {
      console.warn('Failed to save cached data:', error);
    }
  };

  const loadDashboardData = async (overrideLocation?: { lat: number; lon: number }) => {
    console.log('loadDashboardData called with override:', overrideLocation);
    console.log('Current location:', currentLocation);
    
    // Use override location if provided, otherwise use global location, otherwise resolve effective location
    let effectiveLocation = overrideLocation || (currentLocation ? { lat: currentLocation.lat, lon: currentLocation.lon } : null);
    
    if (!effectiveLocation) {
      console.log('No effective location, trying to resolve...');
      const resolvedLocation = await resolveEffectiveLocation(user?.location);
      if (!resolvedLocation) {
        console.error('Failed to resolve location');
        toast.error('Unable to determine your location. Please try again.');
        setLoading(false);
        return;
      }
      effectiveLocation = resolvedLocation;
    }

    try {
      setLoading(true);
      // Load data with individual error handling to prevent one failure from breaking everything
      console.log('Loading dashboard data with location:', effectiveLocation);
      const promises = [
        predictionsAPI.getFlareupRisk(effectiveLocation.lat, effectiveLocation.lon).then(res => {
          console.log('Risk prediction response:', res);
          return res;
        }).catch(err => {
          console.error('Risk prediction failed:', err);
          toast.error('Failed to load risk predictions');
          return null;
        }),
         airQualityAPI.getComprehensive(effectiveLocation.lat, effectiveLocation.lon).then(res => {
           console.log('Air quality data received:', res?.data);
           // Transform comprehensive data to match expected format
           if (res?.data?.air_quality) {
             return {
               data: [{
                 id: `comprehensive_${Date.now()}`,
                 location: res.data.location,
                 timestamp: res.data.timestamp,
                 source: 'comprehensive',
                 aqi: res.data.air_quality.aqi,
                 pm25: res.data.air_quality.pm25,
                 pm10: res.data.air_quality.pm10,
                 ozone: res.data.air_quality.ozone,
                 no2: res.data.air_quality.no2,
                 so2: res.data.air_quality.so2,
                 co: res.data.air_quality.co,
                 nh3: res.data.air_quality.nh3,
                 created_at: res.data.timestamp
               }]
             };
           }
           return res;
         }).catch(err => {
          console.warn('Air quality data failed:', err);
          return null;
        }),
        forecastAPI.getTomorrowForecast(effectiveLocation.lat, effectiveLocation.lon).then(res => {
          console.log('Tomorrow forecast received:', res?.data);
          return res;
        }).catch(err => {
          console.warn('Forecast data failed:', err);
          return null;
        })
      ];

      const [predictionRes, airQualityRes, forecastRes] = await Promise.all(promises);

      let newRiskPrediction = null;
      let newAirQuality = null;

      if (predictionRes?.data) {
        newRiskPrediction = predictionRes.data;
        setRiskPrediction(newRiskPrediction);
      }

      if (airQualityRes?.data && airQualityRes.data.length > 0) {
        newAirQuality = airQualityRes.data[0];
        console.log('Setting air quality data:', newAirQuality);
        console.log('AQI value:', newAirQuality.aqi);
        setAirQuality(newAirQuality);
        console.log('Air quality state set');
      } else {
        console.log('No air quality data received:', airQualityRes);
      }

      if (forecastRes?.data) {
        console.log('Setting forecast data:', forecastRes.data);
        setTomorrowForecast(forecastRes.data);
      }

      // Save to localStorage for persistence across tabs
      saveCachedData(newRiskPrediction, newAirQuality, dailyBriefing);

      // Show a more informative message if some services are unavailable
      const failedServices = [];
      if (!predictionRes) failedServices.push('risk predictions');
      if (!airQualityRes) failedServices.push('air quality data');
      
      if (failedServices.length > 0) {
        toast.error(`Some services are temporarily unavailable: ${failedServices.join(', ')}`, {
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateDailyBriefing = async () => {
    if (!currentLocation) {
      toast.error('Location not available. Please wait for location to load.');
      return;
    }
    
    setBriefingLoading(true);
    try {
      console.log('🔵 Generating daily briefing for location:', currentLocation);
      console.log('🔵 Using coordinates:', currentLocation.lat, currentLocation.lon);
      console.log('🔵 Current risk score:', riskPrediction?.risk_score);
      console.log('🔵 Current PM2.5:', airQuality?.pm25);
      
      let data;
      const token = localStorage.getItem('token');
      
      // Try authenticated endpoint first if user has a token
      if (token && user) {
        try {
          const authResponse = await fetch(
            `${API_BASE_URL}/daily-briefing/dynamic-briefing-authenticated?lat=${currentLocation.lat}&lon=${currentLocation.lon}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (authResponse.ok) {
            data = await authResponse.json();
            console.log('✅ Used authenticated endpoint');
          } else if (authResponse.status === 401) {
            console.log('⚠️ Authentication failed, falling back to public endpoint');
            // Fall through to public endpoint
          } else {
            throw new Error(`Authenticated endpoint failed: ${authResponse.status}`);
          }
        } catch (authError) {
          console.log('⚠️ Authenticated endpoint error, falling back to public endpoint:', authError);
          // Fall through to public endpoint
        }
      }
      
      // Use public endpoint if authenticated failed or no token
      if (!data) {
        const publicResponse = await fetch(
          `${API_BASE_URL}/daily-briefing/dynamic-briefing?lat=${currentLocation.lat}&lon=${currentLocation.lon}`
        );
        
        if (!publicResponse.ok) {
          throw new Error(`Public endpoint failed: ${publicResponse.status}`);
        }
        
        data = await publicResponse.json();
        console.log('✅ Used public endpoint');
      }
      
      console.log('Daily briefing response:', data);
      
      const newDailyBriefing = {
        id: `briefing_${Date.now()}`,
        content: data.briefing || 'No briefing available',
        session_type: 'daily_briefing',
        created_at: data.generated_at || new Date().toISOString(),
        risk_score: data.metadata?.risk_score || 0,
        risk_level: data.metadata?.risk_level || 'unknown'
      };
      console.log('Formatted daily briefing:', newDailyBriefing);
      setDailyBriefing(newDailyBriefing);
      // Save to localStorage for persistence
      saveCachedData(riskPrediction, airQuality, newDailyBriefing);
      toast.success('Daily briefing generated!');
    } catch (error) {
      console.error('Error generating briefing:', error);
      toast.error('Failed to generate daily briefing. Please try again.');
    } finally {
      setBriefingLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-success-600 bg-success-50';
      case 'moderate':
        return 'text-warning-600 bg-warning-50';
      case 'high':
        return 'text-danger-600 bg-danger-50';
      case 'very_high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Show skeleton UI while loading */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="card">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user?.location) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-warning-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">Setup Required</h2>
            <p className="mt-1 text-sm text-gray-500">
              Please complete your profile setup to start using Authenticai.
            </p>
            <div className="mt-6">
              <Link to="/profile" className="btn-primary">
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.first_name || 'there'}!
          </h1>
          <p className="mt-2 text-gray-600">
            {currentLocation?.displayName || currentLocation?.city || 'Your location'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today's Risk */}
          <div className="card bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Today's Risk</p>
                {riskPrediction ? (
                  <>
                    <p className="text-4xl font-bold text-gray-900 mb-2">
                      {Math.round(riskPrediction.risk_score)}
                    </p>
                    <span className={clsx(
                      'px-3 py-1 text-sm font-medium rounded-full capitalize',
                      getRiskColor(riskPrediction.risk_level)
                    )}>
                      {riskPrediction.risk_level.replace('_', ' ').toLowerCase()}
                    </span>
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-gray-400 mb-2">--</p>
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-500">
                      Loading...
                    </span>
                  </>
                )}
              </div>
              <ExclamationTriangleIcon className="h-16 w-16 text-blue-200" />
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {currentLocation?.displayName || currentLocation?.city || 'Your location'}
            </p>
          </div>

          {/* Air Quality (AQI) */}
          <div className="card bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Air Quality (AQI)</p>
                {airQuality ? (
                  <>
                    <p className="text-4xl font-bold text-gray-900 mb-2">
                      {airQuality.aqi || 'N/A'}
                    </p>
                    <span className={clsx(
                      'px-3 py-1 text-sm font-medium rounded-full',
                      getAQIColor(airQuality.aqi)
                    )}>
                      {getAQIDescription(airQuality.aqi)}
                    </span>
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-gray-400 mb-2">--</p>
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-500">
                      Loading...
                    </span>
                  </>
                )}
              </div>
              <CloudIcon className="h-16 w-16 text-green-200" />
            </div>
            <Link to="/air-quality" className="text-xs text-primary-600 hover:text-primary-500 mt-3 inline-block">
              View Details →
            </Link>
          </div>

          {/* Plan */}
          <div className="card bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Plan</p>
                <p className="text-4xl font-bold text-gray-900 mb-2 capitalize">
                  {user.subscription_tier}
                </p>
                {user.subscription_tier === 'free' && (
                  <button 
                    disabled
                    className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-400 cursor-not-allowed inline-block"
                    title="Coming Soon"
                  >
                    Upgrade (Coming Soon)
                  </button>
                )}
              </div>
              <SparklesIcon className="h-16 w-16 text-purple-200" />
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {user.subscription_tier === 'free' ? 'Premium features coming soon' : 'Full access'}
            </p>
          </div>
        </div>

        {/* Free Tier Engagement Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <TomorrowOutlook 
            currentAQI={airQuality?.aqi || 0}
            tomorrowAQI={tomorrowForecast?.aqi}
            currentPM25={airQuality?.pm25 || 0}
            tomorrowPM25={tomorrowForecast?.pm25}
            currentOzone={airQuality?.ozone || 0}
            tomorrowOzone={tomorrowForecast?.ozone}
          />
          <SmartScoreTrend currentScore={riskPrediction?.risk_score || 0} />
          <LungEnergyMeter />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <CommunityGoodDayChallenge />
          <EducationalMicroTips />
          <IndoorWellnessTip />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Briefing - Main Summary */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Daily Briefing</h3>
              <button
                onClick={generateDailyBriefing}
                disabled={briefingLoading}
                className="btn-primary text-sm"
              >
                {briefingLoading ? <LoadingSpinner size="sm" /> : 'Generate'}
              </button>
            </div>
            {dailyBriefing ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  className="text-gray-700 leading-relaxed"
                  components={{
                    h1: ({...props}) => <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2" {...props} />,
                    h2: ({...props}) => <h2 className="text-lg font-semibold text-gray-800 mt-3 mb-2" {...props} />,
                    h3: ({...props}) => <h3 className="text-base font-semibold text-gray-800 mt-2 mb-1" {...props} />,
                    p: ({...props}) => <p className="text-gray-700 mb-3 leading-relaxed" {...props} />,
                    ul: ({...props}) => <ul className="list-disc list-inside space-y-1 mb-3" {...props} />,
                    ol: ({...props}) => <ol className="list-decimal list-inside space-y-1 mb-3" {...props} />,
                    li: ({...props}) => <li className="text-gray-700" {...props} />,
                    strong: ({...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                  }}
                >
                  {dailyBriefing.content}
                </ReactMarkdown>
                <p className="text-xs text-gray-500 mt-4">
                  Generated {new Date(dailyBriefing.created_at).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Click "Generate" to get your personalized daily briefing</p>
            )}
          </div>

          {/* Action Plan and Wellness Boost are now included in the main briefing above */}
          {/* No need for separate sections - everything renders with markdown */}
        </div>

        {/* Right Column - Tomorrow Outlook & Trends */}
        <div className="space-y-6">
          <TomorrowOutlook />
          <SmartScoreTrend currentScore={riskPrediction?.risk_score || 0} />
        </div>
      </div>

      {/* Bottom Section - Additional Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LungEnergyMeter />
        <CommunityGoodDayChallenge />
        <EducationalMicroTips />
      </div>

      <IndoorWellnessTip />
      <DonationCTA />
    </div>
  );
};

export default Dashboard;
