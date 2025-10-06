import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CloudIcon, 
  ExclamationTriangleIcon, 
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalLocation } from '../contexts/LocationContext';
import { predictionsAPI, airQualityAPI, forecastAPI } from '../services/api';
import { resolveEffectiveLocation } from '../utils/location';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Free Tier Components
import TomorrowOutlook from '../components/TomorrowOutlook';
import SmartScoreTrend from '../components/SmartScoreTrend';
import LungEnergyMeter from '../components/LungEnergyMeter';
import CommunityGoodDayChallenge from '../components/CommunityGoodDayChallenge';
import EducationalMicroTips from '../components/EducationalMicroTips';
import IndoorWellnessTip from '../components/IndoorWellnessTip';
import DonationCTA from '../components/DonationCTA';

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
              <div className="space-y-3">
                {dailyBriefing.content.split('\n').filter(line => {
                  // Only show main briefing - stop at action plan section
                  const lowerLine = line.toLowerCase();
                  
                  // Stop at action plan or wellness sections
                  if (lowerLine.includes('your action plan') || 
                      lowerLine.includes('wellness boost') ||
                      lowerLine.includes('stay resilient')) {
                    return false;
                  }
                  
                  // Exclude all action and wellness emojis (comprehensive list)
                  const actionWellnessEmojis = ['⏰', '🚫', '🌳', '🏃', '🚗', '💊', '🎒', 
                                                 '🥗', '😴', '🫐', '💧', '🪴', '💪', '🥶', '🌡️',
                                                 '🍓', '🍅', '🛏️', '🥵', '🧘', '🚶', '🏊', '⛰️',
                                                 '🚴', '🫁', '🐟', '🍵', '🥜', '🌿', '🍋', '🥤',
                                                 '🎨', '🎵', '📚', '🌳', '🧘', '🎶', '📖', '✍️'];
                  if (actionWellnessEmojis.some(emoji => line.includes(emoji))) {
                    return false;
                  }
                  
                  // Exclude WEATHER BENEFIT (appears in wellness section)
                  if (line.includes('WEATHER BENEFIT') || line.includes('Best outdoor exercise window')) {
                    return false;
                  }
                  
                  // Exclude ALL wellness/action items - Daily Briefing should ONLY show environmental conditions
                  const excludeKeywords = [
                    // Actions
                    'Take controller', 'Keep rescue', 'Best exercise', 'Limit outdoor', 
                    'Choose routes', 'Pre-medicate', 'Layer clothing', 'Drink more water', 
                    'AC removes', 'Wear scarf', 'Watch for heat', 'Dehumidifier', 'Humid weather',
                    // Nutrition (comprehensive)
                    'Blueberries', 'Tomatoes', 'Strawberries', 'Mango', 'Garlic', 'Peanuts',
                    'Carrots', 'beta-carotene', 'lycopene', 'resveratrol', 'enzymes', 'allicin',
                    'Walnuts', 'Citrus', 'Grapes', 'Avocado', 'Peppers', 'Cucumber',
                    'Fish', 'Broccoli', 'Kale', 'Sweet potato', 'Apple', 'Lemon', 'Beans',
                    'Dieffenbachia', 'Peaches', 'vitamin A', 'vitamin C', 'vitamin E',
                    'antioxidants', 'omega-3', 'fiber', 'mucous membranes', 'Salmon',
                    // Sleep/wellness
                    'Deep sleep', 'Dust mite', 'Sleep', 'bedroom', 'pillow', 'mattress',
                    // Generic wellness (comprehensive)
                    'Electrolyte', 'Indoor plants', 'HEALTH IMPACT', 'strengthens', 'protects',
                    'optimizes', 'inflammation', 'immunity', 'reduces', 'improves',
                    'reduce anxiety', 'reduce stress', 'promote calm', 'lowers stress',
                    'decreases stress', 'soothes', 'relaxation', 'mindfulness', 'meditation',
                    'therapy', 'cortisol', 'hormones', 'tension', 'anxiety', 'calm',
                    // Activities that are wellness not conditions
                    'Birdwatching', 'nature observation', 'Tandem biking', 'swimming',
                    'tai chi', 'qigong', 'photography', 'sketching', 'painting', 'gardening',
                    'Creative activities', 'Nature sounds', 'Music', 'Reading', 'Journaling',
                    'Coloring', 'Poetry', 'Beach walks', 'Gardening', 'Body scan',
                    'Binaural beats', 'Nature exposure'
                  ];
                  if (excludeKeywords.some(keyword => line.includes(keyword))) {
                    return false;
                  }
                  
                  return true;
                }).map((line, index) => {
                  // Skip empty lines and separator lines
                  if (!line.trim() || line.includes('====')) return null;
                  
                  // Color code based on keywords and pollutant levels
                  let styles: React.CSSProperties = {};
                  let textColor = '#1f2937'; // gray-800
                  let isHeader = line.includes('📍') || line.includes('🎯') || line.includes('💪');
                  
                  // GREEN - Good/Excellent/Low/Minimal/Benefit
                  if (line.includes('EXCELLENT') || line.includes('✓') || line.includes('BENEFIT') || 
                      line.includes('Good conditions') || line.includes('low right now') ||
                      (line.includes('low') && (line.includes('Minimal') || line.includes('ppb') || line.includes('μg/m³'))) ||
                      line.includes('Minimal allergy') || line.includes('Minimal traffic') || 
                      line.includes('Minimal industrial') || line.includes('Minimal agricultural') ||
                      line.includes('Minimal impact')) {
                    styles = { backgroundColor: '#f0fdf4', borderLeft: '3px solid #22c55e', padding: '6px 10px', marginBottom: '3px', borderRadius: '0 3px 3px 0', fontSize: '13px', lineHeight: '1.4' };
                    textColor = '#166534';
                  } 
                  // RED - Unhealthy/Very Unhealthy/Hazardous
                  else if (line.includes('UNHEALTHY') || line.includes('VERY') || line.includes('HAZARDOUS')) {
                    styles = { backgroundColor: '#fef2f2', borderLeft: '3px solid #ef4444', padding: '6px 10px', marginBottom: '3px', borderRadius: '0 3px 3px 0', fontSize: '13px', lineHeight: '1.4' };
                    textColor = '#991b1b';
                  } 
                  // YELLOW - Moderate
                  else if (line.includes('MODERATE') || line.includes('Moderate') || 
                           line.includes('elevated') || line.includes('slightly elevated')) {
                    styles = { backgroundColor: '#fefce8', borderLeft: '3px solid #eab308', padding: '6px 10px', marginBottom: '3px', borderRadius: '0 3px 3px 0', fontSize: '13px', lineHeight: '1.4' };
                    textColor = '#854d0e';
                  } 
                  // BLUE - Low levels (specific pollutants)
                  else if ((line.includes('LOW') && line.includes('Pollen')) ||
                           line.includes('CALM CONDITIONS') || line.includes('very light wind')) {
                    styles = { backgroundColor: '#eff6ff', borderLeft: '3px solid #3b82f6', padding: '6px 10px', marginBottom: '3px', borderRadius: '0 3px 3px 0', fontSize: '13px', lineHeight: '1.4' };
                    textColor = '#1e40af';
                  } 
                  // ORANGE - Warnings/Interactions/Inversions
                  else if (line.includes('⚠️') || line.includes('INTERACTION') || 
                           line.includes('High air pressure') || line.includes('Almost NO WIND') || 
                           line.includes('temperature inversion') || line.includes('traps pollution') ||
                           line.includes('amplify each other') || line.includes('Combined effect')) {
                    styles = { backgroundColor: '#fff7ed', borderLeft: '3px solid #f97316', padding: '6px 10px', marginBottom: '3px', borderRadius: '0 3px 3px 0', fontSize: '13px', lineHeight: '1.4' };
                    textColor = '#9a3412';
                  }
                  // LIGHT GREEN - Rain/Benefits
                  else if (line.includes('☑️') || line.includes('Rain') || line.includes('BENEFIT')) {
                    styles = { backgroundColor: '#f0fdf4', borderLeft: '3px solid #10b981', padding: '6px 10px', marginBottom: '3px', borderRadius: '0 3px 3px 0', fontSize: '13px', lineHeight: '1.4' };
                    textColor = '#065f46';
                  }
                  
                  // Section headers
                  if (isHeader) {
                    return (
                      <div key={index} style={{ 
                        fontSize: '15px', 
                        fontWeight: 600, 
                        color: '#111827',
                        marginTop: index > 0 ? '16px' : '0',
                        marginBottom: '8px',
                        paddingBottom: '4px',
                        borderBottom: '2px solid #e5e7eb'
                      }}>
                        {line}
                      </div>
                    );
                  }
                  
                  // Colored condition lines
                  if (line.trim().startsWith('•') && Object.keys(styles).length > 0) {
                    return (
                      <div key={index} style={styles}>
                        <span style={{ color: textColor, fontWeight: 500 }}>{line}</span>
                      </div>
                    );
                  } 
                  
                  // Regular text lines
                  if (line.trim()) {
                    return (
                      <div key={index} style={{ 
                        color: '#374151', 
                        fontSize: '13px', 
                        lineHeight: '1.5',
                        marginBottom: '2px'
                      }}>
                        {line}
                      </div>
                    );
                  }
                  
                  return null;
                })}
                <div style={{ 
                  marginTop: '16px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '11px',
                  color: '#6b7280'
                }}>
                  Generated {dailyBriefing.created_at ? new Date(dailyBriefing.created_at).toLocaleString('en-US', { 
                    month: 'numeric', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  }) : 'just now'}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Click "Generate" to get your personalized daily health briefing.
              </p>
            )}
          </div>

          {/* Your Action Plan */}
          <div className="card border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Your Action Plan
            </h3>
            {dailyBriefing ? (
              <div className="space-y-2">
                {(() => {
                  const lines = dailyBriefing.content.split('\n');
                  const actionPlanIndex = lines.findIndex(line => line.toLowerCase().includes('your action plan'));
                  const wellnessIndex = lines.findIndex(line => line.toLowerCase().includes('wellness boost'));
                  
                  // Get lines between "YOUR ACTION PLAN" and "WELLNESS BOOST"
                  if (actionPlanIndex !== -1 && wellnessIndex !== -1) {
                    return lines.slice(actionPlanIndex + 1, wellnessIndex).filter(line => line.trim() && !line.includes('===='));
                  }
                  
                  // Fallback: look for action emojis
                  return lines.filter(line => 
                    line.includes('⏰') || line.includes('🚫') || line.includes('🌳') || 
                    line.includes('🏃') || line.includes('🚗') || line.includes('💊') ||
                    line.includes('🎒')
                  );
                })().map((line, index) => {
                  // Remove emoji from line for cleaner display
                  const cleanLine = line.replace(/[⏰🚫🌳🏃🚗💊🎒]/g, '').trim();
                  const emoji = line.match(/[⏰🚫🌳🏃🚗💊🎒]/)?.[0] || '•';
                  
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                      <span className="text-xl flex-shrink-0">{emoji}</span>
                      <span className="text-sm text-gray-800 leading-relaxed">{cleanLine}</span>
                    </div>
                  );
                })}
                {(() => {
                  const lines = dailyBriefing.content.split('\n');
                  const actionPlanIndex = lines.findIndex(line => line.toLowerCase().includes('your action plan'));
                  const wellnessIndex = lines.findIndex(line => line.toLowerCase().includes('wellness boost'));
                  
                  if (actionPlanIndex !== -1 && wellnessIndex !== -1) {
                    const actionLines = lines.slice(actionPlanIndex + 1, wellnessIndex).filter(line => line.trim() && !line.includes('===='));
                    return actionLines.length === 0;
                  }
                  return false;
                })() && (
                  <p className="text-blue-600 text-sm italic">No specific actions needed today - conditions are favorable!</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Generate briefing to see your personalized action plan.
              </p>
            )}
          </div>
        </div>

        {/* Wellness Boost - Full Width */}
        <div className="card border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 mb-8">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">💪</span>
            Wellness Boost
          </h3>
          {dailyBriefing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(() => {
                const lines = dailyBriefing.content.split('\n');
                const wellnessIndex = lines.findIndex(line => line.toLowerCase().includes('wellness boost'));
                const stayResilientIndex = lines.findIndex(line => line.toLowerCase().includes('stay resilient'));
                
                // Get lines between "WELLNESS BOOST" and "Stay resilient" (or end)
                if (wellnessIndex !== -1) {
                  const endIndex = stayResilientIndex !== -1 ? stayResilientIndex : lines.length;
                  return lines.slice(wellnessIndex + 1, endIndex).filter(line => {
                    if (!line.trim() || line.includes('====')) return false;
                    
                    // Exclude interaction warnings
                    const isInteractionWarning = line.includes('INTERACTION') || 
                                               line.includes('PM2.5 (64.3) + Ozone') ||
                                               line.includes('PM2.5 (64.3) + PMD') ||
                                               line.includes('Heat (28°C) + Ozone');
                    
                    return !isInteractionWarning;
                  });
                }
                
                // Fallback: look for wellness emojis
                return lines.filter(line => {
                  const hasWellnessEmoji = line.includes('🥗') || line.includes('😴') || 
                                          line.includes('🫐') || line.includes('💧') || line.includes('🪴');
                  const isInteractionWarning = line.includes('INTERACTION');
                  return hasWellnessEmoji && !isInteractionWarning;
                });
              })().map((line, index) => {
                // Remove emoji from line for cleaner display
                const cleanLine = line.replace(/[🥗😴🫐💧🪴⚠️]/g, '').trim();
                const emoji = line.match(/[🥗😴🫐💧🪴⚠️]/)?.[0] || '•';
                
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                    <span className="text-xl flex-shrink-0">{emoji}</span>
                    <span className="text-sm text-gray-800 leading-relaxed">{cleanLine}</span>
                  </div>
                );
              })}
              {(() => {
                const lines = dailyBriefing.content.split('\n');
                const wellnessIndex = lines.findIndex(line => line.toLowerCase().includes('wellness boost'));
                const stayResilientIndex = lines.findIndex(line => line.toLowerCase().includes('stay resilient'));
                
                if (wellnessIndex !== -1) {
                  const endIndex = stayResilientIndex !== -1 ? stayResilientIndex : lines.length;
                  const wellnessLines = lines.slice(wellnessIndex + 1, endIndex).filter(line => {
                    if (!line.trim() || line.includes('====')) return false;
                    const isInteractionWarning = line.includes('INTERACTION');
                    return !isInteractionWarning;
                  });
                  return wellnessLines.length === 0;
                }
                return false;
              })() && (
                <p className="text-green-600 text-sm italic col-span-2">No specific wellness tips for today.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Generate briefing to see your wellness recommendations.
            </p>
          )}
        </div>

        {/* Donation CTA - Last on page */}
        <div className="mt-8">
          <DonationCTA />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
