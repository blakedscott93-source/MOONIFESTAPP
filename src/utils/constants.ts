/**
 * App-wide Constants
 * Centralized location for all magic numbers and configuration values
 */

// Challenge Constants
export const CHALLENGE_DURATION_DAYS = 45;
export const REQUIRED_DAILY_GRATITUDE_CHECKINS = 3;
export const REQUIRED_DAILY_AFFIRMATION_SESSIONS = 3;
export const REQUIRED_DAILY_MUST_DO_TASKS = 3;

// Gratitude Check-in Constants
export const MIN_CHECKINS_FOR_COMPLETION = 3;
export const MAX_CHECKINS_PER_DAY = 999; // No limit, but track for stats

// Affirmation Constants
export const MAX_SESSIONS_PER_DAY = 3;
export const MORNING_AFFIRMATION_COUNT = 3;
export const AFTERNOON_AFFIRMATION_COUNT = 6;
export const EVENING_AFFIRMATION_COUNT = 9;

// Glow Points Rewards
export const POINTS = {
  GRATITUDE_CHECKIN: 10,
  GRATITUDE_COMPLETE_DAILY: 20,
  AFFIRMATION_SESSION: 15,
  MEDITATION_COMPLETE: 30,
  DAY_COMPLETE_BONUS: 50,
  MOOD_CHECKIN: 5,
} as const;

// Streak Milestones (days)
export const STREAK_MILESTONES = {
  WEEK: 7,
  TWO_WEEKS: 14,
  THREE_WEEKS: 21,
  MONTH: 30,
  CHALLENGE_COMPLETE: 45,
  TWO_MONTHS: 60,
  QUARTER: 90,
  CENTURION: 100,
} as const;

// Progress Screen Milestones
export const PROGRESS_MILESTONES = [
  { day: 7, title: 'Week Warrior' },
  { day: 14, title: 'Fortnight Focus' },
  { day: 21, title: 'Habit Hero' },
  { day: 30, title: 'Month Master' },
  { day: 45, title: '45 NOW Complete!' },
] as const;

// Time Periods (for 369 method and daily scheduling)
export const TIME_PERIODS = {
  MORNING_START: 6,
  MORNING_END: 12,
  AFTERNOON_START: 12,
  AFTERNOON_END: 18,
  EVENING_START: 18,
  EVENING_END: 24,
} as const;

// UI Constants
export const RECENT_ENTRIES_LIMIT = 10;
export const SEARCH_MIN_LENGTH = 0; // Allow empty search (shows all)

// Notification Defaults
export const DEFAULT_NOTIFICATION_TIMES = {
  MORNING: '09:00',
  AFTERNOON: '14:00',
  EVENING: '20:00',
} as const;

export const DEFAULT_AFFIRMATION_FREQUENCY = 3; // notifications per day

// Validation Constants
export const MIN_TEXT_LENGTH = 1;
export const MAX_TEXT_LENGTH = 10000; // For journal entries

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 200,
  MEDIUM: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Export type for better TypeScript support
export type GlowPointsKey = keyof typeof POINTS;



