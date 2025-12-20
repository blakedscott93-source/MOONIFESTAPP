/**
 * Manifestation Goals Type Definitions
 */

export type GoalCategory =
  | 'wealth'
  | 'love'
  | 'health'
  | 'career'
  | 'growth'
  | 'happiness'
  | 'creativity'
  | 'freedom';

export interface GoalCategoryInfo {
  id: GoalCategory;
  title: string;
  icon: string;
  emoji: string;
  description: string;
  color: string;
  examples: string[];
}

export interface ManifestationGoal {
  id: string;
  category: GoalCategory;
  title: string; // e.g., "Financial Freedom"
  description: string; // User's specific manifestation
  customText?: string; // If user wrote custom goal
  priority: 1 | 2 | 3; // Which of the 3 main goals
  startDate: string;
  targetDate?: string;
  status: 'active' | 'achieved' | 'paused';
  progress: number; // 0-100
  streak: number; // Days working on this goal
  milestones: Milestone[];
  metrics: GoalMetrics;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  achieved: boolean;
  achievedDate?: string;
}

export interface GoalMetrics {
  affirmationsCompleted: number;
  journalEntries: number;
  tasksCompleted: number;
  meditationSessions: number;
  lastActivityDate: string;
}

export interface GoalProgress {
  goalId: string;
  date: string;
  affirmations: number;
  journals: number;
  tasks: number;
  meditations: number;
}
