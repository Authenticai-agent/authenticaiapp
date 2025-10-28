/**
 * Daily Reset Utility
 * Ensures all "daily" features reset at midnight
 */

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function isToday(dateString: string): boolean {
  return dateString === getTodayDate();
}

export function isDailyActionCompleted(storageKey: string): boolean {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return false;
    
    const data = JSON.parse(stored);
    return data.date === getTodayDate() && data.completed === true;
  } catch {
    return false;
  }
}

export function setDailyActionCompleted(storageKey: string): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      date: getTodayDate(),
      completed: true
    }));
  } catch (error) {
    console.error('Error saving daily action:', error);
  }
}

export function clearDailyAction(storageKey: string): void {
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error clearing daily action:', error);
  }
}

// Check if we need to reset daily data (called on app load)
export function checkAndResetDailyData(): void {
  const lastResetDate = localStorage.getItem('last_daily_reset');
  const today = getTodayDate();
  
  if (lastResetDate !== today) {
    console.log('🔄 New day detected - resetting daily data');
    
    // Reset all daily completions
    const dailyKeys = [
      'affirmation_completed_date',
      'daily_challenge_completed',
      'daily_inspiration_viewed',
      'good_day_challenge_submitted'
    ];
    
    // Don't actually delete, just let the components check the date
    // This preserves history while allowing new selections
    
    localStorage.setItem('last_daily_reset', today);
    console.log('✅ Daily reset complete');
  }
}
