/**
 * Daily Briefing Limit System
 * Free tier: 5 briefings per day
 */

export interface BriefingUsage {
  date: string;
  count: number;
  limit: number;
}

const DAILY_LIMIT = 5;

export function getBriefingUsage(): BriefingUsage {
  try {
    const stored = localStorage.getItem('briefing_usage');
    if (stored) {
      const usage: BriefingUsage = JSON.parse(stored);
      const today = new Date().toISOString().split('T')[0];
      
      // Reset if it's a new day
      if (usage.date !== today) {
        return {
          date: today,
          count: 0,
          limit: DAILY_LIMIT
        };
      }
      
      return usage;
    }
  } catch (error) {
    console.error('Error loading briefing usage:', error);
  }

  // Default usage
  return {
    date: new Date().toISOString().split('T')[0],
    count: 0,
    limit: DAILY_LIMIT
  };
}

export function saveBriefingUsage(usage: BriefingUsage): void {
  try {
    localStorage.setItem('briefing_usage', JSON.stringify(usage));
  } catch (error) {
    console.error('Error saving briefing usage:', error);
  }
}

export function incrementBriefingCount(): BriefingUsage {
  const usage = getBriefingUsage();
  usage.count += 1;
  saveBriefingUsage(usage);
  return usage;
}

export function canGenerateBriefing(): boolean {
  const usage = getBriefingUsage();
  return usage.count < usage.limit;
}

export function getRemainingBriefings(): number {
  const usage = getBriefingUsage();
  return Math.max(0, usage.limit - usage.count);
}
