import { MediaCardData } from '../components/MediaCard';

export interface MeditationSession extends MediaCardData {
  type: 'morning' | 'midday' | 'sleep';
  duration: number; // in seconds
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
  },
];

export const getMeditationsByType = (type: 'morning' | 'midday' | 'sleep'): MeditationSession[] => {
  return MEDITATION_SESSIONS.filter(session => session.type === type);
};





