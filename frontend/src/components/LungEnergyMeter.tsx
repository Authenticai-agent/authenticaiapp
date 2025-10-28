import React, { useEffect, useState } from 'react';
import { FireIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { getTodayDate } from '../utils/dailyReset';

interface CheckInData {
  date: string;
  noFlareUp: boolean;
}

const LungEnergyMeter: React.FC = () => {
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [todaySelection, setTodaySelection] = useState<boolean | null>(null);

  useEffect(() => {
    // Load data from localStorage
    const storedCheckIns = localStorage.getItem('lungEnergyCheckIns');
    const checkIns: CheckInData[] = storedCheckIns ? JSON.parse(storedCheckIns) : [];
    
    const today = getTodayDate();
    const todayCheckIn = checkIns.find(c => c.date === today);
    
    setCheckedInToday(!!todayCheckIn);
    if (todayCheckIn) {
      setTodaySelection(todayCheckIn.noFlareUp);
    }
    
    // Calculate streak
    let currentStreak = 0;
    const sortedCheckIns = checkIns.sort((a, b) => b.date.localeCompare(a.date));
    
    for (let i = 0; i < sortedCheckIns.length; i++) {
      const checkInDate = new Date(sortedCheckIns[i].date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (checkInDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
    setTotalPoints(checkIns.filter(c => c.noFlareUp).length);
  }, []);

  const handleCheckIn = (noFlareUp: boolean) => {
    const storedCheckIns = localStorage.getItem('lungEnergyCheckIns');
    const checkIns: CheckInData[] = storedCheckIns ? JSON.parse(storedCheckIns) : [];
    
    const today = getTodayDate();
    const existingIndex = checkIns.findIndex(c => c.date === today);
    
    if (existingIndex >= 0) {
      checkIns[existingIndex] = { date: today, noFlareUp };
    } else {
      checkIns.push({ date: today, noFlareUp });
    }
    
    localStorage.setItem('lungEnergyCheckIns', JSON.stringify(checkIns));
    setCheckedInToday(true);
    setTodaySelection(noFlareUp);
    
    // Recalculate points
    setTotalPoints(checkIns.filter(c => c.noFlareUp).length);
  };

  const getLevel = (points: number) => {
    if (points < 7) return { name: 'Beginner', color: 'text-gray-600', icon: '🌱' };
    if (points < 30) return { name: 'Consistent', color: 'text-blue-600', icon: '💪' };
    if (points < 90) return { name: 'Champion', color: 'text-purple-600', icon: '🏆' };
    return { name: 'Legend', color: 'text-yellow-600', icon: '⭐' };
  };

  const level = getLevel(totalPoints);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">💨 Lung Energy Meter</h3>
        <div className="flex items-center space-x-2">
          <FireIcon className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-semibold text-gray-700">{streak} day streak</span>
        </div>
      </div>

      {/* Level Badge */}
      <div className="flex items-center justify-center mb-6">
        <div className="text-center">
          <div className="text-4xl mb-2">{level.icon}</div>
          <p className={`text-xl font-bold ${level.color}`}>{level.name}</p>
          <p className="text-sm text-gray-500">{totalPoints} points</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress to next level</span>
          <span>{totalPoints % 30}/30</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${((totalPoints % 30) / 30) * 100}%` }}
          />
        </div>
      </div>

      {/* Check-in Section */}
      <div className="space-y-3">
        <p className="text-sm text-gray-700 text-center mb-3">
          {checkedInToday ? 'Change your selection?' : 'How are your lungs feeling today?'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleCheckIn(true)}
            className={`py-3 px-4 border-2 rounded-lg transition-all hover:scale-105 ${
              todaySelection === true
                ? 'bg-green-50 border-green-500 ring-2 ring-green-400'
                : 'bg-green-50 border-green-300 opacity-60'
            }`}
          >
            <CheckCircleIcon className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-semibold text-green-700">No Flare-ups</p>
            <p className="text-xs text-green-600">+1 point</p>
            {todaySelection === true && (
              <div className="text-xs text-green-600 mt-1 font-bold">✓ Selected</div>
            )}
          </button>
          <button
            onClick={() => handleCheckIn(false)}
            className={`py-3 px-4 border-2 rounded-lg transition-all hover:scale-105 ${
              todaySelection === false
                ? 'bg-gray-50 border-gray-500 ring-2 ring-gray-400'
                : 'bg-gray-50 border-gray-300 opacity-60'
            }`}
          >
            <div className="text-2xl mb-1">😔</div>
            <p className="text-sm font-semibold text-gray-700">Had Issues</p>
            <p className="text-xs text-gray-500">Track it</p>
            {todaySelection === false && (
              <div className="text-xs text-gray-600 mt-1 font-bold">✓ Selected</div>
            )}
          </button>
        </div>
        {checkedInToday && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Thanks for checking in! You can change your selection anytime.
          </p>
        )}
      </div>

      {/* Milestones */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Next Milestones</p>
        <div className="space-y-1">
          {totalPoints < 7 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">🌱 Beginner (7 days)</span>
              <span className="text-gray-400">{7 - totalPoints} to go</span>
            </div>
          )}
          {totalPoints >= 7 && totalPoints < 30 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">💪 Champion (30 days)</span>
              <span className="text-gray-400">{30 - totalPoints} to go</span>
            </div>
          )}
          {totalPoints >= 30 && totalPoints < 90 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">🏆 Legend (90 days)</span>
              <span className="text-gray-400">{90 - totalPoints} to go</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LungEnergyMeter;
