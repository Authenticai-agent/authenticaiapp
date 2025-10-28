import React, { useEffect, useState } from 'react';
import { Target, RefreshCw, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { getTodayDate, isDailyActionCompleted, setDailyActionCompleted } from '../utils/dailyReset';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

interface Challenge {
  id: string;
  challenge: string;
  description: string;
  category: string;
  duration: string;
  difficulty: string;
  emoji: string;
}

const DailyChallenge: React.FC = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchChallenge();
    // Check if completed today
    const isCompleted = isDailyActionCompleted('daily_challenge_completed');
    setCompleted(isCompleted);
  }, []);

  const fetchChallenge = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/challenges/daily`);
      setChallenge(response.data.challenge);
      setCompleted(false);
    } catch (error) {
      console.error('Failed to fetch challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    setDailyActionCompleted('daily_challenge_completed');
    setCompleted(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!challenge) return null;

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'easy') return 'bg-green-100 text-green-700';
    if (difficulty === 'moderate') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold">Today's Challenge</h3>
          </div>
          <button
            onClick={fetchChallenge}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            title="Get new challenge"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Challenge Content */}
      <div className="p-6">
        <div className="text-center mb-4">
          <span className="text-5xl mb-3 block">{challenge.emoji}</span>
          <h4 className="text-xl font-bold text-gray-900 mb-2">
            {challenge.challenge}
          </h4>
          <p className="text-gray-600">
            {challenge.description}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            ⏱️ {challenge.duration}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {challenge.category}
          </span>
        </div>

        {!completed ? (
          <button
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Mark as Complete</span>
          </button>
        ) : (
          <div className="bg-green-100 border-2 border-green-400 rounded-lg p-3 text-center">
            <p className="text-green-800 font-semibold flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>✅ Challenge Completed!</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;
