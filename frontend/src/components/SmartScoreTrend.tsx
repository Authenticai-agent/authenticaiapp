import React, { useEffect, useState } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface TrendData {
  date: string;
  score: number;
  level: 'low' | 'moderate' | 'high';
}

const SmartScoreTrend: React.FC<{ currentScore: number }> = ({ currentScore }) => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    // Load trend data from localStorage
    const storedTrend = localStorage.getItem('breathingRiskTrend');
    let trend: TrendData[] = storedTrend ? JSON.parse(storedTrend) : [];

    // Add today's score
    const today = new Date().toISOString().split('T')[0];
    const existingIndex = trend.findIndex(t => t.date === today);
    
    const level: 'low' | 'moderate' | 'high' = currentScore < 30 ? 'low' : currentScore < 60 ? 'moderate' : 'high';
    const newEntry: TrendData = { date: today, score: currentScore, level };

    if (existingIndex >= 0) {
      trend[existingIndex] = newEntry;
    } else {
      trend.push(newEntry);
    }

    // Keep only last 7 days
    trend = trend.slice(-7);
    
    localStorage.setItem('breathingRiskTrend', JSON.stringify(trend));
    setTrendData(trend);
  }, [currentScore]);

  const getColorClass = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const last3Days = trendData.slice(-3);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
          3-Day Breathing Risk Trend
        </h3>
      </div>

      {/* Visual Trend Dots */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        {[0, 1, 2].map((dayIndex) => {
          const day = last3Days[dayIndex];
          const label = dayIndex === 0 ? '2 days ago' : dayIndex === 1 ? 'Yesterday' : 'Today';
          
          return (
            <div key={dayIndex} className="flex flex-col items-center">
              {day ? (
                <div className={`w-12 h-12 rounded-full ${getColorClass(day.level)} flex items-center justify-center text-white font-bold shadow-lg`}>
                  {day.score}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold border-2 border-dashed border-gray-300">
                  ?
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Trend Line */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-500 ${
            last3Days[last3Days.length - 1]?.level === 'low' ? 'bg-green-500' :
            last3Days[last3Days.length - 1]?.level === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${(currentScore / 100) * 100}%` }}
        />
      </div>

      {/* Interpretation */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          {last3Days.length >= 2 && last3Days[last3Days.length - 1].score < last3Days[last3Days.length - 2].score && (
            '📉 Your breathing risk is improving! Keep up the good habits.'
          )}
          {last3Days.length >= 2 && last3Days[last3Days.length - 1].score > last3Days[last3Days.length - 2].score && (
            '📈 Risk is increasing. Consider indoor activities and check your triggers.'
          )}
          {last3Days.length >= 2 && last3Days[last3Days.length - 1].score === last3Days[last3Days.length - 2].score && (
            '➡️ Risk levels are stable. Continue monitoring your environment.'
          )}
          {last3Days.length === 1 && (
            '📊 Come back tomorrow to see your 3-day trend! (Day 1 of 3 recorded)'
          )}
          {last3Days.length === 0 && (
            '📊 Check in daily to start tracking your breathing risk trends.'
          )}
        </p>
      </div>

      {/* 7-Day History */}
      {trendData.length > 3 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">7-Day History</p>
          <div className="flex items-end justify-between h-16 space-x-1">
            {trendData.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full ${getColorClass(day.level)} rounded-t transition-all`}
                  style={{ height: `${(day.score / 100) * 100}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartScoreTrend;
