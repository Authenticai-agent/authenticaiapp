/**
 * Streak & Badge System
 * Tracks consecutive daily check-ins and awards badges
 */

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string;
  totalCheckIns: number;
  badges: Badge[];
  userId?: string; // SECURITY: Track which user this data belongs to
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt: string;
  daysRequired: number;
}

const BADGE_MILESTONES = [
  { days: 3, id: 'beginner', name: 'Getting Started', emoji: '🌱', description: '3 days in a row!' },
  { days: 7, id: 'week_warrior', name: 'Week Warrior', emoji: '⭐', description: '7 days strong!' },
  { days: 14, id: 'two_weeks', name: 'Fortnight Champion', emoji: '🔥', description: '14 days of dedication!' },
  { days: 30, id: 'monthly_master', name: 'Monthly Master', emoji: '👑', description: '30 days of wellness!' },
  { days: 60, id: 'unstoppable', name: 'Unstoppable', emoji: '💎', description: '60 days! Incredible!' },
  { days: 90, id: 'legend', name: 'Wellness Legend', emoji: '🏆', description: '90 days! You\'re a legend!' }
];

export function getStreakData(currentUserId?: string): StreakData {
  try {
    const stored = localStorage.getItem('wellness_streak');
    if (stored) {
      const data = JSON.parse(stored);
      
      // SECURITY: Validate that cached data belongs to current user
      if (currentUserId && data.userId && data.userId !== currentUserId) {
        console.warn('⚠️ Streak data belongs to different user, clearing...');
        localStorage.removeItem('wellness_streak');
        return getDefaultStreakData(currentUserId);
      }
      
      return data;
    }
  } catch (error) {
    console.error('Error loading streak data:', error);
  }

  return getDefaultStreakData(currentUserId);
}

function getDefaultStreakData(userId?: string): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastCheckInDate: '',
    totalCheckIns: 0,
    badges: [],
    userId
  };
}

export function saveStreakData(data: StreakData): void {
  try {
    localStorage.setItem('wellness_streak', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving streak data:', error);
  }
}

export function updateStreak(userId?: string): StreakData {
  const data = getStreakData(userId);
  const today = new Date().toISOString().split('T')[0];
  const lastCheckIn = data.lastCheckInDate;

  // If already checked in today, return current data
  if (lastCheckIn === today) {
    return data;
  }

  // Calculate if streak continues
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastCheckIn === yesterdayStr) {
    // Streak continues!
    data.currentStreak += 1;
  } else if (lastCheckIn === '') {
    // First check-in ever
    data.currentStreak = 1;
  } else {
    // Streak broken, start over
    data.currentStreak = 1;
  }

  // Update stats
  data.lastCheckInDate = today;
  data.totalCheckIns += 1;
  data.userId = userId; // SECURITY: Always set userId when updating
  
  if (data.currentStreak > data.longestStreak) {
    data.longestStreak = data.currentStreak;
  }

  // Check for new badges
  const newBadges = checkForNewBadges(data);
  data.badges = [...data.badges, ...newBadges];

  saveStreakData(data);
  return data;
}

function checkForNewBadges(data: StreakData): Badge[] {
  const newBadges: Badge[] = [];
  const currentStreak = data.currentStreak;
  const existingBadgeIds = data.badges.map(b => b.id);

  for (const milestone of BADGE_MILESTONES) {
    if (currentStreak >= milestone.days && !existingBadgeIds.includes(milestone.id)) {
      newBadges.push({
        id: milestone.id,
        name: milestone.name,
        description: milestone.description,
        emoji: milestone.emoji,
        unlockedAt: new Date().toISOString(),
        daysRequired: milestone.days
      });
    }
  }

  return newBadges;
}

export function getNextBadge(currentStreak: number): { days: number; name: string; emoji: string } | null {
  for (const milestone of BADGE_MILESTONES) {
    if (currentStreak < milestone.days) {
      return {
        days: milestone.days,
        name: milestone.name,
        emoji: milestone.emoji
      };
    }
  }
  return null;
}
