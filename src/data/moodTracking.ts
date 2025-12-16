/**
 * Mood Tracking System
 * Simple emoji-based mood check-ins to correlate with gratitude practice
 */

export interface MoodEntry {
  id: string;
  mood: MoodType;
  energy: EnergyLevel;
  date: string; // ISO date string (YYYY-MM-DD)
  timestamp: string; // ISO timestamp
  note?: string;
}

export type MoodType = 'amazing' | 'good' | 'okay' | 'low' | 'stressed';
export type EnergyLevel = 'high' | 'medium' | 'low';

export interface MoodOption {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
}

export interface EnergyOption {
  level: EnergyLevel;
  emoji: string;
  label: string;
  color: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    type: 'amazing',
    emoji: '🤩',
    label: 'Amazing',
    color: '#FFD700',
  },
  {
    type: 'good',
    emoji: '😊',
    label: 'Good',
    color: '#4CAF50',
  },
  {
    type: 'okay',
    emoji: '😐',
    label: 'Okay',
    color: '#FFB84D',
  },
  {
    type: 'low',
    emoji: '😔',
    label: 'Low',
    color: '#3498DB',
  },
  {
    type: 'stressed',
    emoji: '😰',
    label: 'Stressed',
    color: '#FF6B6B',
  },
];

export const ENERGY_OPTIONS: EnergyOption[] = [
  {
    level: 'high',
    emoji: '⚡',
    label: 'High Energy',
    color: '#FFD700',
  },
  {
    level: 'medium',
    emoji: '🔋',
    label: 'Medium Energy',
    color: '#4CAF50',
  },
  {
    level: 'low',
    emoji: '🪫',
    label: 'Low Energy',
    color: '#3498DB',
  },
];

/**
 * Get mood option by type
 */
export function getMoodOption(type: MoodType): MoodOption | undefined {
  return MOOD_OPTIONS.find(m => m.type === type);
}

/**
 * Get energy option by level
 */
export function getEnergyOption(level: EnergyLevel): EnergyOption | undefined {
  return ENERGY_OPTIONS.find(e => e.level === level);
}

/**
 * Calculate mood score (for analytics)
 * Amazing = 5, Good = 4, Okay = 3, Low = 2, Stressed = 1
 */
export function getMoodScore(mood: MoodType): number {
  const scores: Record<MoodType, number> = {
    amazing: 5,
    good: 4,
    okay: 3,
    low: 2,
    stressed: 1,
  };
  return scores[mood];
}

/**
 * Calculate average mood for a period
 */
export function calculateAverageMood(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, entry) => sum + getMoodScore(entry.mood), 0);
  return total / entries.length;
}

/**
 * Get mood trend (improving, stable, declining)
 */
export function getMoodTrend(entries: MoodEntry[]): 'improving' | 'stable' | 'declining' | 'unknown' {
  if (entries.length < 3) return 'unknown';

  // Compare first half vs second half
  const midpoint = Math.floor(entries.length / 2);
  const firstHalf = entries.slice(0, midpoint);
  const secondHalf = entries.slice(midpoint);

  const firstAvg = calculateAverageMood(firstHalf);
  const secondAvg = calculateAverageMood(secondHalf);

  const difference = secondAvg - firstAvg;

  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
}

/**
 * Get insights from mood data
 */
export function getMoodInsights(entries: MoodEntry[]): string[] {
  if (entries.length === 0) return ['Start tracking your mood to see insights!'];

  const insights: string[] = [];
  const avgMood = calculateAverageMood(entries);
  const trend = getMoodTrend(entries);

  // Trend insight
  if (trend === 'improving') {
    insights.push('Your mood is improving! Keep up the great work with your practice.');
  } else if (trend === 'declining') {
    insights.push('Your mood has been lower lately. Remember to be gentle with yourself.');
  } else if (trend === 'stable') {
    insights.push('Your mood has been consistent. Stability is a form of success!');
  }

  // Average mood insight
  if (avgMood >= 4.5) {
    insights.push('You\'ve been feeling amazing! Your gratitude practice is working.');
  } else if (avgMood >= 3.5) {
    insights.push('You\'re maintaining a positive mood overall. Great progress!');
  } else if (avgMood < 2.5) {
    insights.push('Consider reaching out to loved ones or a professional if you need support.');
  }

  // Frequency insight
  const recentEntries = entries.filter(e => {
    const entryDate = new Date(e.timestamp);
    const daysAgo = (Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  });

  if (recentEntries.length >= 7) {
    insights.push('You\'re consistent with mood tracking! This helps you understand patterns.');
  } else if (recentEntries.length >= 3) {
    insights.push('Good job tracking your mood! Try to check in daily for better insights.');
  }

  return insights;
}
