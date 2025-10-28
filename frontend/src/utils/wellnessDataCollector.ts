/**
 * Wellness Data Collector
 * Aggregates all user wellness data for report generation
 */

import { getStreakData } from './streaks';

export interface CheckInData {
  date: string;
  mood: string;
  mood_intensity: number;
  stress_level: number;
  energy_level: number;
  sleep_quality: number;
  notes: string;
}

export interface AggregatedWellnessData {
  period: 'weekly' | 'monthly';
  start_date: string;
  end_date: string;
  check_ins: CheckInData[];
  mood_data: {
    average_intensity: number;
    most_common: string;
    distribution: Record<string, number>;
  };
  stress_data: {
    average: number;
    highest: number;
    lowest: number;
    trend: string;
  };
  sleep_data: {
    average: number;
    best_night: number;
    worst_night: number;
    consistency: string;
  };
  energy_data: {
    average: number;
    peak_times: string[];
    low_times: string[];
  };
  exercises_completed: string[];
  affirmations_completed: number;
  challenges_completed: number;
  streak_data: any;
  total_check_ins: number;
}

export function getDateRange(period: 'weekly' | 'monthly'): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  
  if (period === 'weekly') {
    start.setDate(end.getDate() - 7);
  } else {
    start.setDate(end.getDate() - 30);
  }
  
  return { start, end };
}

export function collectWellnessData(period: 'weekly' | 'monthly'): AggregatedWellnessData {
  const { start, end } = getDateRange(period);
  
  // Collect check-ins from localStorage
  const checkIns = getCheckInsFromStorage(start, end);
  
  // Collect streak data
  const streakData = getStreakData();
  
  // Collect completion data
  const affirmationsCompleted = getAffirmationsCompleted(start, end);
  const challengesCompleted = getChallengesCompleted(start, end);
  const exercisesCompleted = getExercisesCompleted(start, end);
  
  // Calculate aggregated metrics
  const moodData = aggregateMoodData(checkIns);
  const stressData = aggregateStressData(checkIns);
  const sleepData = aggregateSleepData(checkIns);
  const energyData = aggregateEnergyData(checkIns);
  
  return {
    period,
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
    check_ins: checkIns,
    mood_data: moodData,
    stress_data: stressData,
    sleep_data: sleepData,
    energy_data: energyData,
    exercises_completed: exercisesCompleted,
    affirmations_completed: affirmationsCompleted,
    challenges_completed: challengesCompleted,
    streak_data: streakData,
    total_check_ins: checkIns.length
  };
}

function getCheckInsFromStorage(start: Date, end: Date): CheckInData[] {
  try {
    const stored = localStorage.getItem('wellness_check_ins');
    if (!stored) return [];
    
    const allCheckIns: CheckInData[] = JSON.parse(stored);
    
    // Filter by date range
    return allCheckIns.filter(checkIn => {
      const checkInDate = new Date(checkIn.date);
      return checkInDate >= start && checkInDate <= end;
    });
  } catch (error) {
    console.error('Error loading check-ins:', error);
    return [];
  }
}

function aggregateMoodData(checkIns: CheckInData[]) {
  if (checkIns.length === 0) {
    return {
      average_intensity: 0,
      most_common: 'N/A',
      distribution: {}
    };
  }
  
  const intensities = checkIns.map(c => c.mood_intensity);
  const moods = checkIns.map(c => c.mood);
  
  const distribution: Record<string, number> = {};
  moods.forEach(mood => {
    distribution[mood] = (distribution[mood] || 0) + 1;
  });
  
  const mostCommon = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  
  return {
    average_intensity: intensities.reduce((a, b) => a + b, 0) / intensities.length,
    most_common: mostCommon,
    distribution
  };
}

function aggregateStressData(checkIns: CheckInData[]) {
  if (checkIns.length === 0) {
    return {
      average: 0,
      highest: 0,
      lowest: 0,
      trend: 'N/A'
    };
  }
  
  const stressLevels = checkIns.map(c => c.stress_level);
  const average = stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length;
  
  // Calculate trend (first half vs second half)
  const midpoint = Math.floor(stressLevels.length / 2);
  const firstHalf = stressLevels.slice(0, midpoint);
  const secondHalf = stressLevels.slice(midpoint);
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  let trend = 'stable';
  if (secondAvg < firstAvg - 1) trend = 'decreasing';
  if (secondAvg > firstAvg + 1) trend = 'increasing';
  
  return {
    average,
    highest: Math.max(...stressLevels),
    lowest: Math.min(...stressLevels),
    trend
  };
}

function aggregateSleepData(checkIns: CheckInData[]) {
  if (checkIns.length === 0) {
    return {
      average: 0,
      best_night: 0,
      worst_night: 0,
      consistency: 'N/A'
    };
  }
  
  const sleepQuality = checkIns.map(c => c.sleep_quality);
  const average = sleepQuality.reduce((a, b) => a + b, 0) / sleepQuality.length;
  
  // Calculate consistency (standard deviation)
  const variance = sleepQuality.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / sleepQuality.length;
  const stdDev = Math.sqrt(variance);
  
  let consistency = 'consistent';
  if (stdDev > 2) consistency = 'inconsistent';
  if (stdDev < 1) consistency = 'very consistent';
  
  return {
    average,
    best_night: Math.max(...sleepQuality),
    worst_night: Math.min(...sleepQuality),
    consistency
  };
}

function aggregateEnergyData(checkIns: CheckInData[]) {
  if (checkIns.length === 0) {
    return {
      average: 0,
      peak_times: [],
      low_times: []
    };
  }
  
  const energyLevels = checkIns.map(c => c.energy_level);
  const average = energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length;
  
  // Find peak and low energy days
  const peakThreshold = average + 1.5;
  const lowThreshold = average - 1.5;
  
  const peakTimes: string[] = [];
  const lowTimes: string[] = [];
  
  checkIns.forEach(checkIn => {
    if (checkIn.energy_level >= peakThreshold) {
      peakTimes.push(checkIn.date);
    }
    if (checkIn.energy_level <= lowThreshold) {
      lowTimes.push(checkIn.date);
    }
  });
  
  return {
    average,
    peak_times: peakTimes,
    low_times: lowTimes
  };
}

function getAffirmationsCompleted(start: Date, end: Date): number {
  try {
    const stored = localStorage.getItem('affirmation_completed_date');
    if (!stored) return 0;
    
    // Count days with completed affirmations in range
    const completedDate = new Date(stored);
    return (completedDate >= start && completedDate <= end) ? 1 : 0;
  } catch {
    return 0;
  }
}

function getChallengesCompleted(start: Date, end: Date): number {
  try {
    const stored = localStorage.getItem('challenges_completed');
    if (!stored) return 0;
    
    const completed: string[] = JSON.parse(stored);
    return completed.filter(date => {
      const d = new Date(date);
      return d >= start && d <= end;
    }).length;
  } catch {
    return 0;
  }
}

function getExercisesCompleted(start: Date, end: Date): string[] {
  try {
    const stored = localStorage.getItem('exercises_completed');
    if (!stored) return [];
    
    const exercises: Array<{date: string; exercise: string}> = JSON.parse(stored);
    return exercises
      .filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      })
      .map(e => e.exercise);
  } catch {
    return [];
  }
}

// Helper function to save check-ins
export function saveCheckIn(checkIn: CheckInData): void {
  try {
    const stored = localStorage.getItem('wellness_check_ins');
    const checkIns: CheckInData[] = stored ? JSON.parse(stored) : [];
    
    // Add new check-in
    checkIns.push({
      ...checkIn,
      date: new Date().toISOString().split('T')[0]
    });
    
    // Keep only last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const filtered = checkIns.filter(c => new Date(c.date) >= ninetyDaysAgo);
    
    localStorage.setItem('wellness_check_ins', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error saving check-in:', error);
  }
}
