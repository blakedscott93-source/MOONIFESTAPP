export interface Task {
  id: string;
  text: string;
  completed: boolean;
  isMustDo: boolean;
  createdAt: string;
}

export interface GuidedSession {
  id: string;
  category: string;
  title: string;
  duration: number; // in seconds
  completedAt?: string;
}

export interface DayProgress {
  date: string;
  tasks: Task[];
  guidedSessions: GuidedSession[]; // Track 3 completed sessions per day
  meditationCompleted: boolean;
  gratitudeEntry: string;
  visionImageAddedToday?: boolean; // Track if vision image was added today (45 NOW requirement)
  isComplete: boolean;
  moodEntryId?: string; // Reference to mood entry for this day
}

export interface AppState {
  currentStreak: number;
  totalDays: number;
  startDate: string | null;
  challengeActive: boolean;
  dailyProgress: { [date: string]: DayProgress };
}
