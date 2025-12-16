/**
 * Achievements & Streaks System
 *
 * Gamification to motivate users with milestone badges,
 * visual streak counters, and achievement unlocks
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: 'streak' | 'gratitude' | 'affirmation' | 'task' | 'special';
  requirement: {
    type: 'days_streak' | 'total_check_ins' | 'total_affirmations' | 'total_tasks' | 'glow_points' | 'custom';
    value: number;
  };
  glowReward: number;
  unlockedAt?: string; // ISO timestamp when unlocked
}

export const ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Complete 3 days in a row',
    icon: 'flame',
    color: '#FF6B6B',
    category: 'streak',
    requirement: { type: 'days_streak', value: 3 },
    glowReward: 50,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'trophy',
    color: '#FFD700',
    category: 'streak',
    requirement: { type: 'days_streak', value: 7 },
    glowReward: 100,
  },
  {
    id: 'streak_14',
    title: 'Two Week Champion',
    description: 'Keep going for 14 days straight',
    icon: 'ribbon',
    color: '#9B59B6',
    category: 'streak',
    requirement: { type: 'days_streak', value: 14 },
    glowReward: 200,
  },
  {
    id: 'streak_21',
    title: 'Habit Former',
    description: 'Build the habit with 21 days',
    icon: 'star',
    color: '#F39C12',
    category: 'streak',
    requirement: { type: 'days_streak', value: 21 },
    glowReward: 300,
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Achieve a 30-day streak',
    icon: 'medal',
    color: '#00D9A3',
    category: 'streak',
    requirement: { type: 'days_streak', value: 30 },
    glowReward: 500,
  },
  {
    id: 'streak_45',
    title: '45 NOW Champion',
    description: 'Complete the full 45-day challenge',
    icon: 'trophy',
    color: '#C77DFF',
    category: 'streak',
    requirement: { type: 'days_streak', value: 45 },
    glowReward: 1000,
  },
  {
    id: 'streak_60',
    title: 'Unstoppable',
    description: 'Maintain momentum for 60 days',
    icon: 'flame',
    color: '#FF1744',
    category: 'streak',
    requirement: { type: 'days_streak', value: 60 },
    glowReward: 1500,
  },
  {
    id: 'streak_90',
    title: 'Quarter Master',
    description: 'A full 90 days of dedication',
    icon: 'diamond',
    color: '#00BCD4',
    category: 'streak',
    requirement: { type: 'days_streak', value: 90 },
    glowReward: 2500,
  },
  {
    id: 'streak_100',
    title: 'Centurion',
    description: 'Reach the legendary 100-day streak',
    icon: 'shield',
    color: '#FFD700',
    category: 'streak',
    requirement: { type: 'days_streak', value: 100 },
    glowReward: 5000,
  },

  // Gratitude Check-In Achievements
  {
    id: 'gratitude_10',
    title: 'Grateful Beginner',
    description: 'Complete 10 gratitude check-ins',
    icon: 'heart',
    color: '#FF69B4',
    category: 'gratitude',
    requirement: { type: 'total_check_ins', value: 10 },
    glowReward: 30,
  },
  {
    id: 'gratitude_50',
    title: 'Thankful Heart',
    description: 'Complete 50 gratitude check-ins',
    icon: 'heart-circle',
    color: '#E91E63',
    category: 'gratitude',
    requirement: { type: 'total_check_ins', value: 50 },
    glowReward: 100,
  },
  {
    id: 'gratitude_100',
    title: 'Gratitude Master',
    description: 'Complete 100 gratitude check-ins',
    icon: 'heart-circle',
    color: '#C2185B',
    category: 'gratitude',
    requirement: { type: 'total_check_ins', value: 100 },
    glowReward: 250,
  },
  {
    id: 'gratitude_500',
    title: 'Blessing Counter',
    description: 'Complete 500 gratitude check-ins',
    icon: 'sparkles',
    color: '#880E4F',
    category: 'gratitude',
    requirement: { type: 'total_check_ins', value: 500 },
    glowReward: 1000,
  },

  // Task Completion Achievements
  {
    id: 'tasks_25',
    title: 'Task Starter',
    description: 'Complete 25 tasks',
    icon: 'checkmark-done',
    color: '#4CAF50',
    category: 'task',
    requirement: { type: 'total_tasks', value: 25 },
    glowReward: 50,
  },
  {
    id: 'tasks_100',
    title: 'Productivity Pro',
    description: 'Complete 100 tasks',
    icon: 'checkmark-done-circle',
    color: '#388E3C',
    category: 'task',
    requirement: { type: 'total_tasks', value: 100 },
    glowReward: 200,
  },
  {
    id: 'tasks_500',
    title: 'Action Hero',
    description: 'Complete 500 tasks',
    icon: 'rocket',
    color: '#1B5E20',
    category: 'task',
    requirement: { type: 'total_tasks', value: 500 },
    glowReward: 800,
  },

  // Affirmation Achievements
  {
    id: 'affirmations_20',
    title: 'Positive Vibes',
    description: 'Listen to 20 affirmation sessions',
    icon: 'musical-notes',
    color: '#7FFF00',
    category: 'affirmation',
    requirement: { type: 'total_affirmations', value: 20 },
    glowReward: 50,
  },
  {
    id: 'affirmations_100',
    title: 'Mindset Master',
    description: 'Listen to 100 affirmation sessions',
    icon: 'headset',
    color: '#32CD32',
    category: 'affirmation',
    requirement: { type: 'total_affirmations', value: 100 },
    glowReward: 200,
  },

  // Glow Points Achievements
  {
    id: 'glow_100',
    title: 'Glow Apprentice',
    description: 'Earn 100 Glow points',
    icon: 'star',
    color: '#FFD700',
    category: 'special',
    requirement: { type: 'glow_points', value: 100 },
    glowReward: 25,
  },
  {
    id: 'glow_500',
    title: 'Glow Adept',
    description: 'Earn 500 Glow points',
    icon: 'star',
    color: '#FFA500',
    category: 'special',
    requirement: { type: 'glow_points', value: 500 },
    glowReward: 100,
  },
  {
    id: 'glow_1000',
    title: 'Glow Master',
    description: 'Earn 1000 Glow points',
    icon: 'trophy',
    color: '#FF6347',
    category: 'special',
    requirement: { type: 'glow_points', value: 1000 },
    glowReward: 250,
  },
  {
    id: 'glow_5000',
    title: 'Glow Legend',
    description: 'Earn 5000 Glow points',
    icon: 'diamond',
    color: '#9400D3',
    category: 'special',
    requirement: { type: 'glow_points', value: 5000 },
    glowReward: 1000,
  },

  // Special Achievements
  {
    id: 'first_journal',
    title: 'Journal Journey Begins',
    description: 'Write your first journal entry',
    icon: 'book',
    color: '#8B7DD8',
    category: 'special',
    requirement: { type: 'custom', value: 1 },
    glowReward: 20,
  },
  {
    id: 'voice_journal',
    title: 'Voice of Gratitude',
    description: 'Record your first voice journal',
    icon: 'mic',
    color: '#FF1493',
    category: 'special',
    requirement: { type: 'custom', value: 1 },
    glowReward: 30,
  },
];

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

/**
 * Calculate progress towards an achievement
 */
export function calculateAchievementProgress(
  achievement: Achievement,
  currentValue: number
): { percentage: number; isUnlocked: boolean } {
  const percentage = Math.min(100, (currentValue / achievement.requirement.value) * 100);
  const isUnlocked = currentValue >= achievement.requirement.value;

  return { percentage, isUnlocked };
}

/**
 * Get streak tier based on current streak
 */
export function getStreakTier(streak: number): {
  tier: string;
  color: string;
  icon: string;
  nextMilestone: number | null;
} {
  if (streak >= 100) {
    return { tier: 'Legendary', color: '#FFD700', icon: 'shield', nextMilestone: null };
  } else if (streak >= 90) {
    return { tier: 'Diamond', color: '#00BCD4', icon: 'diamond', nextMilestone: 100 };
  } else if (streak >= 60) {
    return { tier: 'Platinum', color: '#E0E0E0', icon: 'flame', nextMilestone: 90 };
  } else if (streak >= 45) {
    return { tier: 'Gold', color: '#FFD700', icon: 'trophy', nextMilestone: 60 };
  } else if (streak >= 30) {
    return { tier: 'Silver', color: '#C0C0C0', icon: 'medal', nextMilestone: 45 };
  } else if (streak >= 21) {
    return { tier: 'Bronze', color: '#CD7F32', icon: 'star', nextMilestone: 30 };
  } else if (streak >= 14) {
    return { tier: 'Iron', color: '#708090', icon: 'ribbon', nextMilestone: 21 };
  } else if (streak >= 7) {
    return { tier: 'Copper', color: '#B87333', icon: 'trophy', nextMilestone: 14 };
  } else if (streak >= 3) {
    return { tier: 'Beginner', color: '#8B7DD8', icon: 'flame', nextMilestone: 7 };
  } else {
    return { tier: 'Novice', color: '#9E9E9E', icon: 'leaf', nextMilestone: 3 };
  }
}

/**
 * Get motivational message based on streak
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) {
    return 'Start your journey today!';
  } else if (streak === 1) {
    return 'Great start! Keep it going!';
  } else if (streak < 7) {
    return `${streak} days strong! You're building momentum!`;
  } else if (streak < 14) {
    return `${streak} days! You're forming a powerful habit!`;
  } else if (streak < 30) {
    return `${streak} days! Your dedication is inspiring!`;
  } else if (streak < 45) {
    return `${streak} days! You're unstoppable!`;
  } else if (streak < 100) {
    return `${streak} days! You're a manifestation master!`;
  } else {
    return `${streak} days! You're LEGENDARY!`;
  }
}
