import React, { useState, useEffect } from 'react';
import { Flame, Award } from 'lucide-react';
import { getStreakData, getNextBadge } from '../utils/streaks';
import type { StreakData } from '../utils/streaks';
import { useAuth } from '../contexts/AuthContext';

const StreakDisplay: React.FC = () => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  useEffect(() => {
    // SECURITY: Pass user ID to validate cached data belongs to current user
    const data = getStreakData(user?.id);
    setStreakData(data);
  }, [user?.id]);

  if (!streakData) return null;

  const nextBadge = getNextBadge(streakData.currentStreak);
  const daysUntilNext = nextBadge ? nextBadge.days - streakData.currentStreak : 0;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Flame className="w-5 h-5 mr-2 text-orange-600" />
          Wellness Streak
        </h3>
        <Award className="w-6 h-6 text-orange-400" />
      </div>

      {/* Current Streak */}
      <div className="text-center mb-6">
        <div className="text-6xl font-bold text-orange-600 mb-2">
          {streakData.currentStreak}
        </div>
        <p className="text-gray-700 font-medium">
          {streakData.currentStreak === 1 ? 'Day' : 'Days'} in a Row! 🔥
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{streakData.longestStreak}</p>
          <p className="text-xs text-gray-600">Longest Streak</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{streakData.totalCheckIns}</p>
          <p className="text-xs text-gray-600">Total Check-ins</p>
        </div>
      </div>

      {/* Next Badge */}
      {nextBadge && (
        <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Next Badge</p>
              <p className="font-semibold text-gray-900">
                {nextBadge.emoji} {nextBadge.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">{daysUntilNext}</p>
              <p className="text-xs text-gray-600">days to go</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-500"
              style={{ width: `${(streakData.currentStreak / nextBadge.days) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Badges */}
      {streakData.badges.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
            <Award className="w-4 h-4 mr-1" />
            Your Badges ({streakData.badges.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {streakData.badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white rounded-lg px-3 py-2 border-2 border-orange-200 hover:border-orange-400 transition-colors cursor-pointer"
                title={badge.description}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <p className="text-xs font-medium text-gray-700 mt-1">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivation */}
      <div className="mt-4 bg-orange-100 rounded-lg p-3">
        <p className="text-sm text-orange-900 text-center font-medium">
          {streakData.currentStreak === 0 && "Start your wellness journey today! 🌟"}
          {streakData.currentStreak === 1 && "Great start! Keep it going tomorrow! 💪"}
          {streakData.currentStreak >= 2 && streakData.currentStreak < 7 && "You're building a habit! 🚀"}
          {streakData.currentStreak >= 7 && streakData.currentStreak < 30 && "Incredible dedication! 🌟"}
          {streakData.currentStreak >= 30 && "You're a wellness champion! 👑"}
        </p>
      </div>
    </div>
  );
};

export default StreakDisplay;
