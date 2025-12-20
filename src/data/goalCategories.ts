/**
 * Goal Categories Data
 *
 * Predefined manifestation goal categories with metadata,
 * examples, and content recommendations.
 */

import { GoalCategory, GoalCategoryInfo } from '../types/goals';

export const GOAL_CATEGORIES: Record<GoalCategory, GoalCategoryInfo> = {
  wealth: {
    id: 'wealth',
    title: 'Wealth & Abundance',
    icon: 'cash',
    emoji: '💰',
    description: 'Attract financial prosperity, abundance, and material success',
    color: '#10B981', // Green
    examples: [
      'Achieve financial freedom',
      'Build a successful business',
      'Increase income to $100k+',
      'Create multiple income streams',
      'Attract unexpected money',
      'Become debt-free',
    ],
  },
  love: {
    id: 'love',
    title: 'Love & Relationships',
    icon: 'heart',
    emoji: '💕',
    description: 'Manifest meaningful relationships, romance, and deep connections',
    color: '#EC4899', // Pink
    examples: [
      'Find my soulmate',
      'Strengthen current relationship',
      'Attract loving partner',
      'Build deeper friendships',
      'Heal family relationships',
      'Experience unconditional love',
    ],
  },
  health: {
    id: 'health',
    title: 'Health & Wellness',
    icon: 'fitness',
    emoji: '💪',
    description: 'Achieve optimal physical health, vitality, and well-being',
    color: '#3B82F6', // Blue
    examples: [
      'Reach ideal weight',
      'Build strength and fitness',
      'Heal chronic condition',
      'Boost energy levels',
      'Improve sleep quality',
      'Develop healthy habits',
    ],
  },
  career: {
    id: 'career',
    title: 'Career & Success',
    icon: 'briefcase',
    emoji: '🚀',
    description: 'Advance your career, achieve professional goals, and find purpose',
    color: '#8B5CF6', // Purple
    examples: [
      'Get dream job',
      'Earn promotion',
      'Start own business',
      'Find fulfilling career',
      'Become industry leader',
      'Work remotely',
    ],
  },
  growth: {
    id: 'growth',
    title: 'Personal Growth',
    icon: 'trending-up',
    emoji: '🌱',
    description: 'Develop yourself, learn new skills, and reach your potential',
    color: '#06B6D4', // Cyan
    examples: [
      'Master new skill',
      'Build confidence',
      'Overcome limiting beliefs',
      'Develop discipline',
      'Become better version of self',
      'Learn new language',
    ],
  },
  happiness: {
    id: 'happiness',
    title: 'Happiness & Peace',
    icon: 'happy',
    emoji: '😊',
    description: 'Cultivate inner peace, joy, and lasting happiness',
    color: '#F59E0B', // Amber
    examples: [
      'Find inner peace',
      'Experience daily joy',
      'Reduce anxiety/stress',
      'Live in the moment',
      'Feel grateful daily',
      'Overcome depression',
    ],
  },
  creativity: {
    id: 'creativity',
    title: 'Creativity & Expression',
    icon: 'color-palette',
    emoji: '🎨',
    description: 'Unlock creative potential and express your authentic self',
    color: '#EF4444', // Red
    examples: [
      'Create artistic masterpiece',
      'Launch creative project',
      'Find creative voice',
      'Build online presence',
      'Write a book',
      'Perform on stage',
    ],
  },
  freedom: {
    id: 'freedom',
    title: 'Freedom & Adventure',
    icon: 'airplane',
    emoji: '✈️',
    description: 'Live life on your terms with freedom, travel, and adventure',
    color: '#14B8A6', // Teal
    examples: [
      'Travel the world',
      'Achieve location independence',
      'Break free from 9-5',
      'Live in dream location',
      'Experience new cultures',
      'Have flexible lifestyle',
    ],
  },
};

/**
 * Get goal category by ID
 */
export function getGoalCategory(id: GoalCategory): GoalCategoryInfo {
  return GOAL_CATEGORIES[id];
}

/**
 * Get all goal categories as array
 */
export function getAllGoalCategories(): GoalCategoryInfo[] {
  return Object.values(GOAL_CATEGORIES);
}

/**
 * Get goal categories by IDs
 */
export function getGoalCategories(ids: GoalCategory[]): GoalCategoryInfo[] {
  return ids.map((id) => GOAL_CATEGORIES[id]);
}

/**
 * Content tags mapping - which content applies to which goals
 */
export const CONTENT_GOAL_TAGS = {
  // Affirmations
  affirmations: {
    wealth: ['financial-freedom', 'abundance', 'prosperity', 'success'],
    love: ['soulmate', 'relationships', 'self-love', 'romance'],
    health: ['fitness', 'wellness', 'healing', 'vitality'],
    career: ['success', 'professional', 'leadership', 'achievement'],
    growth: ['personal-development', 'confidence', 'discipline', 'mindset'],
    happiness: ['peace', 'joy', 'gratitude', 'positivity'],
    creativity: ['creative', 'expression', 'artistic', 'innovation'],
    freedom: ['freedom', 'adventure', 'travel', 'independence'],
  },

  // Meditations
  meditations: {
    wealth: ['abundance-meditation', 'prosperity-visualization', 'money-mindset'],
    love: ['heart-opening', 'compassion', 'loving-kindness', 'relationship-healing'],
    health: ['body-scan', 'healing-energy', 'vitality-boost', 'wellness'],
    career: ['success-visualization', 'confidence-building', 'goal-setting'],
    growth: ['self-discovery', 'inner-wisdom', 'transformation', 'growth-mindset'],
    happiness: ['peace-meditation', 'joy-cultivation', 'gratitude-practice'],
    creativity: ['creative-flow', 'inspiration', 'imagination', 'expression'],
    freedom: ['liberation', 'adventure-visualization', 'letting-go'],
  },

  // Journal Prompts
  journalPrompts: {
    wealth: [
      'What does financial freedom mean to you?',
      'Describe your ideal abundant life in detail',
      'What money beliefs are you ready to release?',
      'How will you feel when you achieve your financial goals?',
    ],
    love: [
      'What qualities do you want in your ideal partner?',
      'How can you show more love to yourself today?',
      'Describe your perfect relationship',
      'What limiting beliefs about love are you releasing?',
    ],
    health: [
      'What does your healthiest self look like?',
      'How will you feel when you achieve your fitness goals?',
      'What healthy habits are you committed to?',
      'Describe your ideal morning wellness routine',
    ],
    career: [
      'What does your dream career look like?',
      'How will success feel when you achieve it?',
      'What professional skills are you developing?',
      'Describe your ideal workday in detail',
    ],
    growth: [
      'What version of yourself are you becoming?',
      'What limiting beliefs are you releasing?',
      'How are you growing today?',
      'What lessons have you learned recently?',
    ],
    happiness: [
      'What brings you genuine joy?',
      'How can you cultivate more peace today?',
      'What are you deeply grateful for?',
      'Describe a moment of pure happiness',
    ],
    creativity: [
      'What creative project excites you most?',
      'How do you express your authentic self?',
      'What inspires your creativity?',
      'Describe your creative vision coming to life',
    ],
    freedom: [
      'What does true freedom mean to you?',
      'Where will you travel when fully free?',
      'How will your ideal free lifestyle look?',
      'What are you ready to release to gain freedom?',
    ],
  },

  // Tasks
  tasks: {
    wealth: [
      'Review and update budget',
      'Research investment opportunities',
      'Read chapter on wealth mindset',
      'Track daily expenses',
      'Visualize financial goals for 5 minutes',
    ],
    love: [
      'Practice self-love affirmations',
      'Write letter to future partner',
      'Do something kind for loved one',
      'Reflect on ideal relationship qualities',
      'Work on communication skills',
    ],
    health: [
      '30-minute workout',
      'Prepare healthy meal',
      'Drink 8 glasses of water',
      '8 hours of sleep',
      'Morning stretch routine',
    ],
    career: [
      'Update resume/portfolio',
      'Learn new professional skill',
      'Network with industry contact',
      'Work on passion project',
      'Read industry article',
    ],
    growth: [
      'Read personal development book',
      'Try something outside comfort zone',
      'Reflect on lessons learned',
      'Practice new skill for 30 minutes',
      'Challenge limiting belief',
    ],
    happiness: [
      '10-minute gratitude practice',
      'Do something that brings joy',
      'Practice mindfulness',
      'Connect with loved one',
      'Spend time in nature',
    ],
    creativity: [
      'Work on creative project',
      'Freewrite for 15 minutes',
      'Try new creative technique',
      'Seek creative inspiration',
      'Share creative work',
    ],
    freedom: [
      'Research dream destination',
      'Plan mini adventure',
      'Declutter and simplify',
      'Learn about location independence',
      'Visualize free lifestyle',
    ],
  },
};

/**
 * Get content suggestions based on goals
 */
export function getContentForGoals(
  goals: GoalCategory[],
  contentType: 'affirmations' | 'meditations' | 'journalPrompts' | 'tasks'
): string[] {
  const allContent: string[] = [];

  goals.forEach((goal) => {
    const content = CONTENT_GOAL_TAGS[contentType][goal];
    if (content) {
      allContent.push(...content);
    }
  });

  return allContent;
}

/**
 * Calculate goal progress based on activities
 */
export function calculateGoalProgress(
  goalId: string,
  metrics: {
    affirmationsCompleted: number;
    journalEntries: number;
    tasksCompleted: number;
    meditationSessions: number;
  }
): number {
  // Simple formula: each activity contributes to progress
  // Could be made more sophisticated based on goal type
  const total =
    metrics.affirmationsCompleted * 2 + // Affirmations worth 2 points
    metrics.journalEntries * 5 + // Journal entries worth 5 points
    metrics.tasksCompleted * 3 + // Tasks worth 3 points
    metrics.meditationSessions * 4; // Meditations worth 4 points

  // Cap at 100%
  return Math.min(100, Math.floor((total / 500) * 100));
}
