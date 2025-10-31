import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Wind, Clock, TrendingUp, Play, Pause, RotateCcw, 
  Lock, CheckCircle, Star, Filter, Search, Calendar
} from 'lucide-react';
import { 
  breathingExercises, 
  getExercisesByCategory,
  getExercisesByDifficulty,
  getFreeExercises,
  getPremiumExercises,
  type BreathingExercise 
} from '../data/breathingExercises';
import BreathingAnimation from '../components/BreathingAnimation';
import BreathingTimer from '../components/BreathingTimer';
import toast from 'react-hot-toast';

interface ExerciseSession {
  exerciseId: string;
  date: string;
  duration: number;
  completed: boolean;
  breathEase: number; // 1-10 scale
  notes?: string;
}

const BreathingLibrary: React.FC = () => {
  const { user } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sessions, setSessions] = useState<ExerciseSession[]>([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [breathEase, setBreathEase] = useState(5);
  const [sessionNotes, setSessionNotes] = useState('');

  const isPremium = user?.subscription_tier === 'premium';

  useEffect(() => {
    // Load saved sessions from localStorage
    const saved = localStorage.getItem('breathing_sessions');
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  const saveSessions = (newSessions: ExerciseSession[]) => {
    setSessions(newSessions);
    localStorage.setItem('breathing_sessions', JSON.stringify(newSessions));
  };

  const handleExerciseClick = (exercise: BreathingExercise) => {
    if (exercise.isPremium && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setSelectedExercise(exercise);
    setIsPlaying(false);
  };

  const handleCompleteSession = () => {
    if (!selectedExercise) return;

    const newSession: ExerciseSession = {
      exerciseId: selectedExercise.id,
      date: new Date().toISOString(),
      duration: selectedExercise.duration,
      completed: true,
      breathEase: breathEase,
      notes: sessionNotes
    };

    const updatedSessions = [newSession, ...sessions];
    saveSessions(updatedSessions);

    toast.success(`Great job! ${selectedExercise.shortName} completed! 🎉`, {
      duration: 3000,
      icon: '✅'
    });

    setBreathEase(5);
    setSessionNotes('');
    setSelectedExercise(null);
    setIsPlaying(false);
  };

  const getFilteredExercises = () => {
    let filtered = breathingExercises;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(ex => ex.category === filterCategory);
    }

    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(ex => ex.difficulty === filterDifficulty);
    }

    if (searchTerm) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getSessionStats = () => {
    const total = sessions.length;
    const thisWeek = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    }).length;

    const avgBreathEase = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.breathEase, 0) / sessions.length
      : 0;

    return { total, thisWeek, avgBreathEase };
  };

  const stats = getSessionStats();
  const filteredExercises = getFilteredExercises();

  if (selectedExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedExercise(null);
                setIsPlaying(false);
              }}
              className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
            >
              ← Back to Library
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedExercise.name}
            </h1>
            <p className="text-gray-600">{selectedExercise.description}</p>
          </div>

          {/* Animation and Timer */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <BreathingAnimation
              exercise={selectedExercise}
              isPlaying={isPlaying}
            />
            
            <BreathingTimer
              exercise={selectedExercise}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onReset={() => setIsPlaying(false)}
            />
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
            <div className="space-y-4">
              {selectedExercise.instructions.map((instruction) => (
                <div key={instruction.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {instruction.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {instruction.title}
                      {instruction.duration && (
                        <span className="ml-2 text-sm text-gray-500">({instruction.duration})</span>
                      )}
                    </h3>
                    <p className="text-gray-600">{instruction.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Benefits</h3>
              <ul className="space-y-2">
                {selectedExercise.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Best For</h3>
              <ul className="space-y-2">
                {selectedExercise.bestFor.map((use, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Complete Session */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Session</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How easy was your breathing? (1 = Very difficult, 10 = Very easy)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={breathEase}
                  onChange={(e) => setBreathEase(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-blue-600 w-12 text-center">
                  {breathEase}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="How did you feel? Any observations?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <button
              onClick={handleCompleteSession}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Breathing Exercise Library
          </h1>
          <p className="text-gray-600 text-lg">
            Master therapeutic breathing techniques for respiratory health
          </p>
          {!isPremium && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <Lock className="w-4 h-4 inline mr-2" />
                Upgrade to Premium to unlock all {getPremiumExercises().length} advanced breathing techniques
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-3xl font-bold text-gray-900">{stats.thisWeek}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Breath Ease</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.avgBreathEase.toFixed(1)}/10
                </p>
              </div>
              <Wind className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exercises..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="foundational">Foundational</option>
                <option value="therapeutic">Therapeutic</option>
                <option value="yoga">Yoga</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => handleExerciseClick(exercise)}
              className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
                exercise.isPremium && !isPremium ? 'opacity-75' : ''
              }`}
            >
              {exercise.isPremium && !isPremium && (
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Premium
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {exercise.shortName}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {exercise.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {exercise.duration} min
                </div>
                <div className="capitalize">
                  {exercise.difficulty}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    exercise.isPremium && !isPremium
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No exercises found matching your filters.</p>
          </div>
        )}

        {/* Premium Modal */}
        {showPremiumModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <Lock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Premium Feature
                </h2>
                <p className="text-gray-600">
                  Unlock all {getPremiumExercises().length} advanced breathing techniques with Premium
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>8 advanced breathing techniques</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Guided audio instructions</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Progress tracking & analytics</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Unlimited daily briefings</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowPremiumModal(false);
                    toast.success('Premium upgrade coming soon!');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingLibrary;
