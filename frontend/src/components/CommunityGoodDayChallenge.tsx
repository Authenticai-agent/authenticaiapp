import React, { useState, useEffect } from 'react';
import { FaceSmileIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface DayFeeling {
  date: string;
  emoji: string;
  label: string;
}

const CommunityGoodDayChallenge: React.FC = () => {
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [submittedToday, setSubmittedToday] = useState(false);
  const [communityStats, setCommunityStats] = useState({ great: 0, good: 0, okay: 0 });

  const feelings = [
    { emoji: '😃', label: 'Great!', value: 'great', color: 'bg-green-50 border-green-500 text-green-700' },
    { emoji: '😊', label: 'Good', value: 'good', color: 'bg-blue-50 border-blue-500 text-blue-700' },
    { emoji: '😐', label: 'Okay', value: 'okay', color: 'bg-yellow-50 border-yellow-500 text-yellow-700' },
  ];

  useEffect(() => {
    // Load today's submission
    const storedFeelings = localStorage.getItem('dailyFeelings');
    const feelings: DayFeeling[] = storedFeelings ? JSON.parse(storedFeelings) : [];
    
    const today = new Date().toISOString().split('T')[0];
    const todayFeeling = feelings.find(f => f.date === today);
    
    if (todayFeeling) {
      setSelectedFeeling(todayFeeling.label);
      setSubmittedToday(true);
    }

    // Calculate community stats (simulated - in production, fetch from backend)
    const last7Days = feelings.slice(-7);
    const stats = {
      great: last7Days.filter(f => f.label === 'Great!').length,
      good: last7Days.filter(f => f.label === 'Good').length,
      okay: last7Days.filter(f => f.label === 'Okay').length,
    };
    setCommunityStats(stats);
  }, []);

  const handleSubmit = (emoji: string, label: string) => {
    const storedFeelings = localStorage.getItem('dailyFeelings');
    const feelings: DayFeeling[] = storedFeelings ? JSON.parse(storedFeelings) : [];
    
    const today = new Date().toISOString().split('T')[0];
    const newFeeling = { date: today, emoji, label };
    
    const existingIndex = feelings.findIndex(f => f.date === today);
    if (existingIndex >= 0) {
      feelings[existingIndex] = newFeeling;
    } else {
      feelings.push(newFeeling);
    }
    
    // Keep only last 30 days
    const recentFeelings = feelings.slice(-30);
    localStorage.setItem('dailyFeelings', JSON.stringify(recentFeelings));
    
    setSelectedFeeling(label);
    setSubmittedToday(true);

    // Update community stats
    const last7Days = recentFeelings.slice(-7);
    const stats = {
      great: last7Days.filter(f => f.label === 'Great!').length,
      good: last7Days.filter(f => f.label === 'Good').length,
      okay: last7Days.filter(f => f.label === 'Okay').length,
    };
    setCommunityStats(stats);
  };

  const totalResponses = communityStats.great + communityStats.good + communityStats.okay;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaceSmileIcon className="w-5 h-5 mr-2 text-purple-600" />
          Good Day Challenge
        </h3>
        <UserGroupIcon className="w-5 h-5 text-gray-400" />
      </div>

      {!submittedToday ? (
        <div>
          <p className="text-sm text-gray-600 mb-4 text-center">
            How did you feel today?
          </p>
          <div className="grid grid-cols-3 gap-3">
            {feelings.map((feeling) => (
              <button
                key={feeling.value}
                onClick={() => handleSubmit(feeling.emoji, feeling.label)}
                className={`py-4 px-2 border-2 rounded-lg transition-all hover:scale-105 ${feeling.color}`}
              >
                <div className="text-3xl mb-2">{feeling.emoji}</div>
                <p className="text-xs font-semibold">{feeling.label}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="inline-block p-4 bg-purple-50 rounded-full mb-3">
            <div className="text-4xl">
              {feelings.find(f => f.label === selectedFeeling)?.emoji}
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Thanks for sharing!
          </p>
          <p className="text-xs text-gray-500">
            You felt {selectedFeeling?.toLowerCase()} today
          </p>
        </div>
      )}

      {/* Community Insights */}
      {totalResponses > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-3">Your 7-Day Pattern</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">😃</span>
                <span className="text-xs text-gray-600">Great days</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${(communityStats.great / totalResponses) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-6">{communityStats.great}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">😊</span>
                <span className="text-xs text-gray-600">Good days</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${(communityStats.good / totalResponses) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-6">{communityStats.good}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">😐</span>
                <span className="text-xs text-gray-600">Okay days</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500"
                    style={{ width: `${(communityStats.okay / totalResponses) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-6">{communityStats.okay}</span>
              </div>
            </div>
          </div>

          {communityStats.great >= 5 && (
            <div className="mt-3 p-2 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 text-center">
                🎉 You're having a great week! Keep it up!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityGoodDayChallenge;
