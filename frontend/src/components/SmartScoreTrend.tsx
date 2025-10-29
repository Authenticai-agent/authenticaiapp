import React, { useEffect, useState } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface TrendData {
  date: string;
  score: number;
  level: 'low' | 'moderate' | 'high';
}

interface AirQuality {
  aqi?: number;
  pm25?: number;
  pm10?: number;
  ozone?: number;
  no2?: number;
  so2?: number;
  co?: number;
}

const SmartScoreTrend: React.FC<{ currentScore: number; airQuality?: AirQuality | null }> = ({ currentScore, airQuality }) => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  // Calculate breathing risk score from air quality data
  const calculateRiskScore = (aq: AirQuality | null | undefined): number => {
    if (!aq) return 0;
    
    // Weighted formula based on pollutants
    const aqi = aq.aqi || 0;
    const pm25 = aq.pm25 || 0;
    const ozone = aq.ozone || 0;
    
    // AQI-based risk (0-500 scale, normalize to 0-100)
    const aqiRisk = Math.min(100, (aqi / 300) * 100);
    
    // PM2.5-based risk (0-250 scale, normalize to 0-100)
    const pm25Risk = Math.min(100, (pm25 / 150) * 100);
    
    // Ozone-based risk (0-200 scale, normalize to 0-100)
    const ozoneRisk = Math.min(100, (ozone / 150) * 100);
    
    // Weighted average (AQI 50%, PM2.5 30%, Ozone 20%)
    const riskScore = Math.round(
      (aqiRisk * 0.5) + (pm25Risk * 0.3) + (ozoneRisk * 0.2)
    );
    
    return Math.min(100, Math.max(0, riskScore));
  };

  useEffect(() => {
    // Load trend data from localStorage
    const storedTrend = localStorage.getItem('breathingRiskTrend');
    let trend: TrendData[] = storedTrend ? JSON.parse(storedTrend) : [];

    // Calculate today's score: use riskPrediction if available, otherwise calculate from air quality
    const todayScore = currentScore > 0 ? currentScore : calculateRiskScore(airQuality);
    
    // Add today's score
    const today = new Date().toISOString().split('T')[0];
    const existingIndex = trend.findIndex(t => t.date === today);
    
    const level: 'low' | 'moderate' | 'high' = todayScore < 30 ? 'low' : todayScore < 60 ? 'moderate' : 'high';
    const newEntry: TrendData = { date: today, score: todayScore, level };

    if (existingIndex >= 0) {
      trend[existingIndex] = newEntry;
    } else {
      trend.push(newEntry);
    }

    // Keep only last 7 days
    trend = trend.slice(-7);
    
    localStorage.setItem('breathingRiskTrend', JSON.stringify(trend));
    setTrendData(trend);
  }, [currentScore, airQuality]);

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

  // Generate last 3 days with proper dates
  const generateLast3Days = (): (TrendData | null)[] => {
    const today = new Date();
    const dates = [];
    
    // Generate dates for last 3 days
    for (let i = 2; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Map dates to trend data, using existing data or current score
    return dates.map((date, index) => {
      const existingData = trendData.find(t => t.date === date);
      if (existingData) {
        return existingData;
      }
      
      // For today, always use current score
      if (index === 2) {
        const todayScore = currentScore > 0 ? currentScore : calculateRiskScore(airQuality);
        const level: 'low' | 'moderate' | 'high' = todayScore < 30 ? 'low' : todayScore < 60 ? 'moderate' : 'high';
        return { date, score: todayScore, level };
      }
      
      // For past days without data, return null to show placeholder
      return null;
    });
  };

  const last3Days = generateLast3Days();

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
          style={{ width: `${((last3Days[last3Days.length - 1]?.score || 0) / 100) * 100}%` }}
        />
      </div>

      {/* Interpretation */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          {last3Days.length >= 2 && last3Days[last3Days.length - 1] && last3Days[last3Days.length - 2] && 
           last3Days[last3Days.length - 1]!.score < last3Days[last3Days.length - 2]!.score && (
            '📉 Your breathing risk is improving! Keep up the good habits.'
          )}
          {last3Days.length >= 2 && last3Days[last3Days.length - 1] && last3Days[last3Days.length - 2] && 
           last3Days[last3Days.length - 1]!.score > last3Days[last3Days.length - 2]!.score && (
            '📈 Risk is increasing. Consider indoor activities and check your triggers.'
          )}
          {last3Days.length >= 2 && last3Days[last3Days.length - 1] && last3Days[last3Days.length - 2] && 
           last3Days[last3Days.length - 1]!.score === last3Days[last3Days.length - 2]!.score && (
            '➡️ Risk levels are stable. Continue monitoring your environment.'
          )}
          {last3Days.filter(d => d !== null).length === 1 && (
            '📊 Come back tomorrow to see your 3-day trend! (Day 1 of 3 recorded)'
          )}
          {last3Days.filter(d => d !== null).length === 0 && (
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
