import { MediaCardData } from '../components/MediaCard';
import { GoalCategory } from '../types/goals';

export interface MeditationSession extends MediaCardData {
  type: 'morning' | 'midday' | 'sleep';
  duration: number; // in seconds
  goalCategories?: GoalCategory[]; // Which goals this meditation supports
}

export const MEDITATION_SESSIONS: MeditationSession[] = [
  // Morning Meditations
  {
    id: 'morning-1',
    title: 'Morning Clarity',
    subtitle: 'Meditation · 5 min',
    type: 'morning',
    duration: 300,
    gradient: ['#E8DFF5', '#C7B8EA'],
    icon: 'sunny',
    locked: false,
    playButton: true,
    goalCategories: ['growth', 'happiness', 'career'],
  },
  {
    id: 'morning-2',
    title: 'Energize Your Day',
    subtitle: 'Meditation · 7 min',
    type: 'morning',
    duration: 420,
    gradient: ['#FFF8E7', '#F5E6D3'],
    icon: 'sunny-outline',
    locked: false,
    playButton: true,
    goalCategories: ['health', 'happiness', 'career'],
  },
  {
    id: 'morning-3',
    title: 'Focus & Intention',
    subtitle: 'Meditation · 10 min',
    type: 'morning',
    duration: 600,
    gradient: ['#FAE9ED', '#EED3D9'],
    icon: 'bulb',
    locked: true,
    playButton: true,
    goalCategories: ['career', 'growth', 'creativity'],
  },

  // Midday Meditations
  {
    id: 'midday-1',
    title: 'Midday Reset',
    subtitle: 'Meditation · 5 min',
    type: 'midday',
    duration: 300,
    gradient: ['#FFFCE8', '#F9F3D0'],
    icon: 'partly-sunny',
    locked: false,
    playButton: true,
    goalCategories: ['happiness', 'health', 'career'],
  },
  {
    id: 'midday-2',
    title: 'Stress Relief',
    subtitle: 'Meditation · 8 min',
    type: 'midday',
    duration: 480,
    gradient: ['#E5CFFF', '#9D4EDD'],
    icon: 'cloud',
    locked: false,
    playButton: true,
    goalCategories: ['happiness', 'health', 'love'],
  },
  {
    id: 'midday-3',
    title: 'Productivity Boost',
    subtitle: 'Meditation · 6 min',
    type: 'midday',
    duration: 360,
    gradient: ['#FFE4E9', '#FFB6C1'],
    icon: 'rocket',
    locked: true,
    playButton: true,
    goalCategories: ['career', 'wealth', 'creativity'],
  },

  // Sleep Meditations
  {
    id: 'sleep-1',
    title: 'Deep Sleep',
    subtitle: 'Meditation · 15 min',
    type: 'sleep',
    duration: 900,
    gradient: ['#E8DFF5', '#8B7DD8'],
    icon: 'moon',
    locked: false,
    playButton: true,
    goalCategories: ['health', 'happiness', 'growth'],
  },
  {
    id: 'sleep-2',
    title: 'Peaceful Rest',
    subtitle: 'Meditation · 20 min',
    type: 'sleep',
    duration: 1200,
    gradient: ['#C7B8EA', '#9D4EDD'],
    icon: 'moon-outline',
    locked: false,
    playButton: true,
    goalCategories: ['happiness', 'health', 'love'],
  },
  {
    id: 'sleep-3',
    title: 'Dream Journey',
    subtitle: 'Meditation · 12 min',
    type: 'sleep',
    duration: 720,
    gradient: ['#8B7DD8', '#6B5DD8'],
    icon: 'star',
    locked: true,
    playButton: true,
    goalCategories: ['creativity', 'growth', 'freedom'],
  },
];

export const getMeditationsByType = (type: 'morning' | 'midday' | 'sleep'): MeditationSession[] => {
  return MEDITATION_SESSIONS.filter(session => session.type === type);
};

/**
 * Filter meditations by user goals
 */
export const getMeditationsByGoals = (goalCategories: GoalCategory[]): MeditationSession[] => {
  if (goalCategories.length === 0) return MEDITATION_SESSIONS;

  return MEDITATION_SESSIONS.filter(session => {
    if (!session.goalCategories || session.goalCategories.length === 0) return true;
    return session.goalCategories.some(goal => goalCategories.includes(goal));
  });
};

/**
 * Prioritize meditations based on user goals (most relevant first)
 */
export const prioritizeMeditationsByGoals = (
  meditations: MeditationSession[],
  goalCategories: GoalCategory[]
): MeditationSession[] => {
  if (goalCategories.length === 0) return meditations;

  return [...meditations].sort((a, b) => {
    const aMatches = a.goalCategories?.filter(goal => goalCategories.includes(goal)).length || 0;
    const bMatches = b.goalCategories?.filter(goal => goalCategories.includes(goal)).length || 0;
    return bMatches - aMatches;
  });
};








