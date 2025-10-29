import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Brain, TrendingUp, Calendar, Sparkles, Dumbbell } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import DailyAffirmation from '../components/DailyAffirmation';
import DailyChallenge from '../components/DailyChallenge';
import StreakDisplay from '../components/StreakDisplay';
import WellnessReport from '../components/WellnessReport';
import MorningMovementProgram from '../components/MorningMovementProgram';
import { updateStreak } from '../utils/streaks';
import { saveCheckIn } from '../utils/wellnessDataCollector';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

interface CheckIn {
  mood: string;
  mood_intensity: number;
  energy_level: number;
  stress_level: number;
  sleep_quality: number;
  notes: string;
}

interface Recommendation {
  title: string;
  duration_minutes: number;
  category: string;
  description: string;
  instructions?: string;
  why_helpful: string;
  difficulty: string;
}

const Wellness: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'checkin' | 'selfcare' | 'workouts' | 'insights'>('checkin');
  
  // Check-in state
  const [checkIn, setCheckIn] = useState<CheckIn>({
    mood: 'calm',
    mood_intensity: 5,
    energy_level: 5,
    stress_level: 5,
    sleep_quality: 7,
    notes: ''
  });
  
  // Self-care state
  const [availableTime, setAvailableTime] = useState(15);
  const [allRecommendations, setAllRecommendations] = useState<Recommendation[]>([]); // Store all 45
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]); // Display subset
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'breathing' | 'mindfulness' | 'meditation'>('all');
  
  // Insights state
  const [insights, setInsights] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const moods = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'calm', emoji: '😌', label: 'Calm' },
    { value: 'energetic', emoji: '⚡', label: 'Energetic' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'stressed', emoji: '😫', label: 'Stressed' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'tired', emoji: '😴', label: 'Tired' },
    { value: 'angry', emoji: '😠', label: 'Angry' }
  ];

  // Load check-in history and auto-load exercises
  useEffect(() => {
    if (user && activeTab === 'insights') {
      loadHistory();
      loadInsights();
    }
    
    // Auto-load exercises when switching to self-care tab
    if (user && activeTab === 'selfcare' && recommendations.length === 0) {
      handleGetRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wellness/check-in/history/${user?.id}?days=30`);
      setHistory(response.data.checkins || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const loadInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/wellness/mood/insights/${user?.id}`);
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleSubmitCheckIn = async () => {
    if (!user) {
      toast.error('Please log in to save check-ins');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/wellness/check-in`, {
        user_id: user.id,
        ...checkIn
      });

      // Save check-in to localStorage for reports
      saveCheckIn({
        date: new Date().toISOString().split('T')[0],
        ...checkIn
      });

      // Update streak and check for new badges
      const streakData = updateStreak();
      const newBadges = streakData.badges.filter(badge => {
        const unlockedToday = new Date(badge.unlockedAt).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
        return unlockedToday;
      });

      // Show success message with streak info
      if (newBadges.length > 0) {
        toast.success(`🎉 New Badge Unlocked: ${newBadges[0].emoji} ${newBadges[0].name}!`, {
          duration: 5000
        });
      } else {
        toast.success(`Check-in saved! 🔥 ${streakData.currentStreak} day streak!`, {
          icon: '✅',
          duration: 3000
        });
      }

      // Switch to self-care tab
      setActiveTab('selfcare');
      
      // Auto-load recommendations
      handleGetRecommendations();
      
    } catch (error) {
      console.error('Failed to submit check-in:', error);
      toast.error('Failed to save check-in');
    }
  };

  const handleGetRecommendations = async () => {
    if (!user) {
      toast.error('Please log in to get recommendations');
      return;
    }

    setLoadingRecommendations(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/wellness/self-care/recommendations`, {
        user_id: user.id,
        current_mood: checkIn.mood,
        mood_intensity: checkIn.mood_intensity,
        stress_level: checkIn.stress_level,
        energy_level: checkIn.energy_level,
        available_time_minutes: availableTime,
        location_type: 'home',
        shuffle: true  // Request shuffled exercises
      });

      // Store ALL 45 exercises
      const all = response.data.recommendations || [];
      setAllRecommendations(all);
      
      // Filter and display based on selected category
      filterAndDisplayExercises(all, selectedCategory);
      
      toast.success('New exercises loaded! 🌟', {
        duration: 2000,
        icon: '✨'
      });
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Filter exercises by category, time, and show 5 random ones
  const filterAndDisplayExercises = (exercises: Recommendation[], category: 'all' | 'breathing' | 'mindfulness' | 'meditation') => {
    let filtered = exercises;
    
    // Filter by category if not 'all'
    if (category !== 'all') {
      filtered = exercises.filter(ex => ex.category === category);
    }
    
    // Filter by available time - only show exercises that fit within the selected time
    filtered = filtered.filter(ex => ex.duration_minutes <= availableTime);
    
    // If no exercises fit the time, show a message
    if (filtered.length === 0) {
      toast.error(`No exercises found for ${availableTime} minutes. Try increasing your available time.`, {
        duration: 3000
      });
      setRecommendations([]);
      return;
    }
    
    // Shuffle and take 5
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(5, filtered.length));
    setRecommendations(selected);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      breathing: 'bg-blue-100 text-blue-800',
      mindfulness: 'bg-purple-100 text-purple-800',
      meditation: 'bg-indigo-100 text-indigo-800',
      movement: 'bg-green-100 text-green-800',
      social: 'bg-pink-100 text-pink-800',
      creative: 'bg-yellow-100 text-yellow-800',
      rest: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Wellness Center 🌸
          </h1>
          <p className="text-gray-600">
            Track your emotional wellbeing and get personalized self-care guidance
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all whitespace-nowrap ${
              activeTab === 'checkin'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="inline-block w-5 h-5 mr-2" />
            Check-in
          </button>
          <button
            onClick={() => setActiveTab('selfcare')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all whitespace-nowrap ${
              activeTab === 'selfcare'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="inline-block w-5 h-5 mr-2" />
            Self-Care
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all whitespace-nowrap ${
              activeTab === 'workouts'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Dumbbell className="inline-block w-5 h-5 mr-2" />
            Workouts
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all whitespace-nowrap ${
              activeTab === 'insights'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="inline-block w-5 h-5 mr-2" />
            Insights
          </button>
        </div>

        {/* Daily Check-in Tab */}
        {activeTab === 'checkin' && (
          <div className="space-y-6">
            {/* Streak Display */}
            <StreakDisplay />
            
            {/* Daily Affirmation & Challenge */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailyAffirmation />
              <DailyChallenge />
            </div>

            {/* Check-in Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                How are you feeling today?
              </h2>

            {/* Mood Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select your mood
              </label>
              <div className="grid grid-cols-4 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setCheckIn({ ...checkIn, mood: mood.value })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      checkIn.mood === mood.value
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-3xl mb-1">{mood.emoji}</div>
                    <div className="text-sm font-medium text-gray-700">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood Intensity: {checkIn.mood_intensity}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkIn.mood_intensity}
                  onChange={(e) => setCheckIn({ ...checkIn, mood_intensity: parseInt(e.target.value) })}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Level: {checkIn.energy_level}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkIn.energy_level}
                  onChange={(e) => setCheckIn({ ...checkIn, energy_level: parseInt(e.target.value) })}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress Level: {checkIn.stress_level}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkIn.stress_level}
                  onChange={(e) => setCheckIn({ ...checkIn, stress_level: parseInt(e.target.value) })}
                  className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Quality (last night): {checkIn.sleep_quality}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkIn.sleep_quality}
                  onChange={(e) => setCheckIn({ ...checkIn, sleep_quality: parseInt(e.target.value) })}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={checkIn.notes}
                onChange={(e) => setCheckIn({ ...checkIn, notes: e.target.value })}
                placeholder="What's on your mind today?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitCheckIn}
              className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md"
            >
              Save Check-in & Get Self-Care Tips
            </button>
            </div>
          </div>
        )}

        {/* Workouts Tab */}
        {activeTab === 'workouts' && (
          <MorningMovementProgram />
        )}

        {/* Self-Care Tab */}
        {activeTab === 'selfcare' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Professional Self-Care Exercises
            </h2>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              {['all', 'breathing', 'mindfulness', 'meditation'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    const category = cat as 'all' | 'breathing' | 'mindfulness' | 'meditation';
                    setSelectedCategory(category);
                    filterAndDisplayExercises(allRecommendations, category);
                  }}
                  className={`px-4 py-2 font-medium transition-all border-b-2 ${
                    selectedCategory === cat
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {cat === 'all' ? '🌟 All' : cat === 'breathing' ? '🫁 Breathing' : cat === 'mindfulness' ? '🧘 Mindfulness' : '🧘‍♀️ Meditation'}
                </button>
              ))}
            </div>

            {/* Time Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How much time do you have? {availableTime} minutes
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={availableTime}
                onChange={(e) => {
                  const newTime = parseInt(e.target.value);
                  setAvailableTime(newTime);
                  // Re-filter exercises if we already have recommendations
                  if (allRecommendations.length > 0) {
                    filterAndDisplayExercises(allRecommendations, selectedCategory);
                  }
                }}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 min</span>
                <span>30 min</span>
                <span>60 min</span>
              </div>
            </div>

            {/* Get Recommendations Button */}
            {recommendations.length === 0 && (
              <button
                onClick={handleGetRecommendations}
                disabled={loadingRecommendations}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md disabled:opacity-50"
              >
                {loadingRecommendations ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating recommendations...
                  </span>
                ) : (
                  <>
                    <Sparkles className="inline-block w-5 h-5 mr-2" />
                    Get AI-Powered Recommendations
                  </>
                )}
              </button>
            )}

            {/* Recommendations List */}
            {recommendations.length > 0 && (
              <div className="space-y-4">
                {recommendations
                  .filter(rec => selectedCategory === 'all' || rec.category === selectedCategory)
                  .map((rec, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{rec.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(rec.category)}`}>
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{rec.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>⏱️ {rec.duration_minutes} min</span>
                      <span>📊 {rec.difficulty}</span>
                    </div>
                    
                    {/* Instructions */}
                    {rec.instructions && (
                      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-3">
                        <p className="text-sm font-semibold text-blue-900 mb-2">📋 Instructions:</p>
                        <p className="text-sm text-blue-800 whitespace-pre-line">{rec.instructions}</p>
                      </div>
                    )}
                    
                    {/* Benefits */}
                    <div className="bg-purple-50 border-l-4 border-purple-600 p-3 rounded">
                      <p className="text-sm text-purple-900">
                        <strong>✨ Benefits:</strong> {rec.why_helpful}
                      </p>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => filterAndDisplayExercises(allRecommendations, selectedCategory)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Get New Recommendations
                </button>
              </div>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Wellness Reports */}
            <WellnessReport />
            
            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                <Brain className="inline-block w-6 h-6 mr-2" />
                Your Wellness Insights
              </h2>

              {loadingInsights ? (
                <div className="text-center py-12">
                  <svg className="animate-spin h-8 w-8 mx-auto text-purple-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-gray-600 mt-4">Analyzing your patterns...</p>
                </div>
              ) : insights ? (
                <div className="space-y-6">
                  {/* Insights */}
                  {insights.insights && insights.insights.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">💡 Key Insights</h3>
                      <div className="space-y-2">
                        {insights.insights.map((insight: string, index: number) => (
                          <div key={index} className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                            <p className="text-gray-800">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Items */}
                  {insights.action_items && insights.action_items.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">✅ Recommended Actions</h3>
                      <div className="space-y-2">
                        {insights.action_items.map((action: string, index: number) => (
                          <div key={index} className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                            <p className="text-gray-800">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insights.message && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
                      <p className="text-gray-800">{insights.message}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Complete a few check-ins to see personalized insights!</p>
                </div>
              )}
            </div>

            {/* Recent History */}
            {history.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Recent Check-ins
                </h2>
                <div className="space-y-3">
                  {history.slice(0, 7).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {moods.find(m => m.value === entry.mood)?.emoji || '😊'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{entry.mood}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-purple-600">Mood: {entry.mood_intensity}/10</span>
                        <span className="text-green-600">Energy: {entry.energy_level}/10</span>
                        <span className="text-red-600">Stress: {entry.stress_level}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wellness;
