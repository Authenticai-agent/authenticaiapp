import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon, 
  ChatBubbleLeftRightIcon, 
  LightBulbIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { coachingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface CoachingSession {
  id: string;
  content: string;
  session_type: string;
  created_at: string;
  recommendations?: string;
}

interface TodayRecommendations {
  recommendations: string;
  created_at: string;
}

const Coaching: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dailyBriefing, setDailyBriefing] = useState<CoachingSession | null>(null);
  const [todaysRecommendations, setTodaysRecommendations] = useState<TodayRecommendations | null>(null);
  const [realTimeBriefing, setRealTimeBriefing] = useState<CoachingSession | null>(null);
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [activeTab, setActiveTab] = useState<'briefing' | 'recommendations' | 'realtime' | 'history'>('briefing');

  const resolveLatLon = () => {
    const lat = user?.location?.lat;
    const lon = user?.location?.lon;
    if (lat !== undefined && lon !== undefined) return { lat, lon };
    try {
      const cached = localStorage.getItem('riskPrediction');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.location?.lat !== undefined && parsed?.location?.lon !== undefined) {
          return { lat: parsed.location.lat, lon: parsed.location.lon };
        }
      }
    } catch {}
    return null;
  };

  const generateDailyBriefing = async () => {
    setLoading(true);
    try {
      const email = user?.email;
      const coords = resolveLatLon();
      if (!email || !coords) throw new Error('Missing user email or location (lat/lon). Update profile location first.');
      const { lat, lon } = coords;
      const response = await coachingAPI.getDailyBriefing(email, lat, lon);
      setDailyBriefing(response.data);
      toast.success('Daily briefing generated!');
    } catch (error) {
      console.error('Error generating daily briefing:', error);
      toast.error('Failed to generate daily briefing');
    } finally {
      setLoading(false);
    }
  };

  const generateTodaysRecommendations = async () => {
    setLoading(true);
    try {
      // Since there's no direct endpoint, we'll use the daily briefing endpoint
      // and extract recommendations from it
      const email = user?.email;
      const coords = resolveLatLon();
      if (!email || !coords) throw new Error('Missing user email or location (lat/lon). Update profile location first.');
      const { lat, lon } = coords;
      const response = await coachingAPI.getDailyBriefing(email, lat, lon);
      if (response.data.recommendations) {
        setTodaysRecommendations({
          recommendations: response.data.recommendations,
          created_at: response.data.created_at
        });
        toast.success('Today\'s recommendations generated!');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateRealTimeBriefing = async () => {
    setLoading(true);
    try {
      // Use the real-time briefing endpoint
      const email = user?.email;
      const coords = resolveLatLon();
      if (!email || !coords) throw new Error('Missing user email or location (lat/lon). Update profile location first.');
      const { lat, lon } = coords;
      const response = await coachingAPI.getDailyBriefing(email, lat, lon); // This will be updated when real-time endpoint is available
      setRealTimeBriefing(response.data);
      toast.success('Real-time briefing generated!');
    } catch (error) {
      console.error('Error generating real-time briefing:', error);
      toast.error('Failed to generate real-time briefing');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await coachingAPI.getSessions(10);
      setSessions(response.data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const tabs = [
    { id: 'briefing', name: 'Daily Briefing', icon: SparklesIcon },
    { id: 'recommendations', name: 'Today\'s Recommendations', icon: LightBulbIcon },
    { id: 'realtime', name: 'Real-time Briefing', icon: ClockIcon },
    { id: 'history', name: 'History', icon: ChatBubbleLeftRightIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">AI Health Coaching</h1>
          <p className="mt-1 text-sm text-gray-600">
            Personalized health guidance powered by advanced ML models
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="input"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={clsx(
                      'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Daily Briefing Tab */}
          {activeTab === 'briefing' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Daily Health Briefing</h2>
                  <p className="text-sm text-gray-600">
                    Get your personalized daily health summary with ML-powered insights
                  </p>
                </div>
                <button
                  onClick={generateDailyBriefing}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <SparklesIcon className="h-4 w-4" />
                  )}
                  <span>Generate Briefing</span>
                </button>
              </div>

              {dailyBriefing ? (
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <SparklesIcon className="h-6 w-6 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Your Daily Briefing</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {dailyBriefing.content}
                        </p>
                      </div>
                      <div className="mt-4 text-xs text-gray-500">
                        Generated {new Date(dailyBriefing.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No briefing yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Click "Generate Briefing" to get your personalized daily health summary.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Today's Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Today's Recommendations</h2>
                  <p className="text-sm text-gray-600">
                    Actionable health recommendations based on current conditions
                  </p>
                </div>
                <button
                  onClick={generateTodaysRecommendations}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <LightBulbIcon className="h-4 w-4" />
                  )}
                  <span>Get Recommendations</span>
                </button>
              </div>

              {todaysRecommendations ? (
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <LightBulbIcon className="h-6 w-6 text-green-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Your Action Plan</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {todaysRecommendations.recommendations}
                        </p>
                      </div>
                      <div className="mt-4 text-xs text-gray-500">
                        Generated {new Date(todaysRecommendations.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Click "Get Recommendations" to receive your personalized action plan.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Real-time Briefing Tab */}
          {activeTab === 'realtime' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Real-time Briefing</h2>
                  <p className="text-sm text-gray-600">
                    Get instant health guidance based on current environmental conditions
                  </p>
                </div>
                <button
                  onClick={generateRealTimeBriefing}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <ClockIcon className="h-4 w-4" />
                  )}
                  <span>Get Real-time Briefing</span>
                </button>
              </div>

              {realTimeBriefing ? (
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <ClockIcon className="h-6 w-6 text-orange-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Current Conditions Briefing</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {realTimeBriefing.content}
                        </p>
                      </div>
                      <div className="mt-4 text-xs text-gray-500">
                        Generated {new Date(realTimeBriefing.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No real-time briefing yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Click "Get Real-time Briefing" for instant health guidance.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Coaching History</h2>
                  <p className="text-sm text-gray-600">
                    View your previous coaching sessions and recommendations
                  </p>
                </div>
                <button
                  onClick={loadSessions}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={clsx(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              session.session_type === 'daily_briefing' ? 'bg-blue-100 text-blue-800' :
                              session.session_type === 'recommendations' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {session.session_type.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(session.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {session.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Generate your first coaching session to see it here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Coaching;
