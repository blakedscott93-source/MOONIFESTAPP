/**
 * Goal Management Utility
 *
 * Handles saving, loading, and managing user manifestation goals
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ManifestationGoal, GoalCategory, GoalProgress } from '../types/goals';
import { GOAL_CATEGORIES, calculateGoalProgress } from '../data/goalCategories';

const GOALS_STORAGE_KEY = '@moonifest:goals';
const GOAL_PROGRESS_STORAGE_KEY = '@moonifest:goal_progress';

/**
 * Save user goals
 */
export async function saveGoals(goals: ManifestationGoal[]): Promise<void> {
  try {
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Failed to save goals:', error);
    throw error;
  }
}

/**
 * Load user goals
 */
export async function loadGoals(): Promise<ManifestationGoal[]> {
  try {
    const goalsJson = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
    if (!goalsJson) return [];

    return JSON.parse(goalsJson);
  } catch (error) {
    console.error('Failed to load goals:', error);
    return [];
  }
}

/**
 * Get active goals (non-paused)
 */
export async function getActiveGoals(): Promise<ManifestationGoal[]> {
  const goals = await loadGoals();
  return goals.filter((goal) => goal.status === 'active');
}

/**
 * Get primary goals (top 3 by priority)
 */
export async function getPrimaryGoals(): Promise<ManifestationGoal[]> {
  const goals = await loadGoals();
  return goals
    .filter((goal) => goal.status === 'active')
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
}

/**
 * Create new goal
 */
export async function createGoal(
  category: GoalCategory,
  title: string,
  description: string,
  priority: 1 | 2 | 3,
  customText?: string
): Promise<ManifestationGoal> {
  const goals = await loadGoals();

  const newGoal: ManifestationGoal = {
    id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    category,
    title,
    description,
    customText,
    priority,
    startDate: new Date().toISOString(),
    status: 'active',
    progress: 0,
    streak: 0,
    milestones: [],
    metrics: {
      affirmationsCompleted: 0,
      journalEntries: 0,
      tasksCompleted: 0,
      meditationSessions: 0,
      lastActivityDate: new Date().toISOString(),
    },
  };

  goals.push(newGoal);
  await saveGoals(goals);

  return newGoal;
}

/**
 * Update goal
 */
export async function updateGoal(
  goalId: string,
  updates: Partial<ManifestationGoal>
): Promise<void> {
  const goals = await loadGoals();
  const goalIndex = goals.findIndex((g) => g.id === goalId);

  if (goalIndex === -1) {
    throw new Error(`Goal ${goalId} not found`);
  }

  goals[goalIndex] = {
    ...goals[goalIndex],
    ...updates,
  };

  await saveGoals(goals);
}

/**
 * Update goal metrics after an activity
 */
export async function updateGoalMetrics(
  goalId: string,
  activityType: 'affirmation' | 'journal' | 'task' | 'meditation'
): Promise<void> {
  const goals = await loadGoals();
  const goal = goals.find((g) => g.id === goalId);

  if (!goal) {
    throw new Error(`Goal ${goalId} not found`);
  }

  // Update metrics
  switch (activityType) {
    case 'affirmation':
      goal.metrics.affirmationsCompleted += 1;
      break;
    case 'journal':
      goal.metrics.journalEntries += 1;
      break;
    case 'task':
      goal.metrics.tasksCompleted += 1;
      break;
    case 'meditation':
      goal.metrics.meditationSessions += 1;
      break;
  }

  goal.metrics.lastActivityDate = new Date().toISOString();

  // Recalculate progress
  goal.progress = calculateGoalProgress(goalId, goal.metrics);

  // Update streak
  const lastActivity = new Date(goal.metrics.lastActivityDate);
  const today = new Date();
  const daysSinceLastActivity = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastActivity === 0) {
    // Same day, continue streak
  } else if (daysSinceLastActivity === 1) {
    // Next day, increment streak
    goal.streak += 1;
  } else {
    // Missed days, reset streak
    goal.streak = 1;
  }

  await saveGoals(goals);
}

/**
 * Track goal progress over time
 */
export async function trackGoalProgress(goalProgress: GoalProgress): Promise<void> {
  try {
    const progressJson = await AsyncStorage.getItem(GOAL_PROGRESS_STORAGE_KEY);
    const allProgress: GoalProgress[] = progressJson ? JSON.parse(progressJson) : [];

    allProgress.push(goalProgress);

    // Keep last 90 days of progress
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentProgress = allProgress.filter((p) => {
      const progressDate = new Date(p.date);
      return progressDate >= ninetyDaysAgo;
    });

    await AsyncStorage.setItem(GOAL_PROGRESS_STORAGE_KEY, JSON.stringify(recentProgress));
  } catch (error) {
    console.error('Failed to track goal progress:', error);
  }
}

/**
 * Get goal progress history
 */
export async function getGoalProgressHistory(goalId: string): Promise<GoalProgress[]> {
  try {
    const progressJson = await AsyncStorage.getItem(GOAL_PROGRESS_STORAGE_KEY);
    if (!progressJson) return [];

    const allProgress: GoalProgress[] = JSON.parse(progressJson);
    return allProgress.filter((p) => p.goalId === goalId);
  } catch (error) {
    console.error('Failed to get goal progress history:', error);
    return [];
  }
}

/**
 * Suggest content based on user goals
 */
export async function getGoalBasedSuggestions(
  contentType: 'affirmation' | 'meditation' | 'journal' | 'task'
): Promise<GoalCategory[]> {
  const primaryGoals = await getPrimaryGoals();
  return primaryGoals.map((goal) => goal.category);
}

/**
 * Filter content by goal categories
 */
export function filterContentByGoals(
  content: any[],
  userGoals: GoalCategory[],
  getContentGoals: (item: any) => GoalCategory[]
): any[] {
  if (userGoals.length === 0) return content;

  return content.filter((item) => {
    const itemGoals = getContentGoals(item);
    return itemGoals.some((goal) => userGoals.includes(goal));
  });
}

/**
 * Prioritize content based on user goals
 */
export function prioritizeContentByGoals(
  content: any[],
  userGoals: GoalCategory[],
  getContentGoals: (item: any) => GoalCategory[]
): any[] {
  return content.sort((a, b) => {
    const aGoals = getContentGoals(a);
    const bGoals = getContentGoals(b);

    // Count matching goals
    const aMatches = aGoals.filter((goal) => userGoals.includes(goal)).length;
    const bMatches = bGoals.filter((goal) => userGoals.includes(goal)).length;

    // Higher matches come first
    return bMatches - aMatches;
  });
}

/**
 * Check if goals have been set
 */
export async function hasGoalsSet(): Promise<boolean> {
  const goals = await loadGoals();
  return goals.length > 0;
}

/**
 * Delete goal
 */
export async function deleteGoal(goalId: string): Promise<void> {
  const goals = await loadGoals();
  const filteredGoals = goals.filter((g) => g.id !== goalId);
  await saveGoals(filteredGoals);
}

/**
 * Get goal by ID
 */
export async function getGoalById(goalId: string): Promise<ManifestationGoal | null> {
  const goals = await loadGoals();
  return goals.find((g) => g.id === goalId) || null;
}

/**
 * Get goals by category
 */
export async function getGoalsByCategory(category: GoalCategory): Promise<ManifestationGoal[]> {
  const goals = await loadGoals();
  return goals.filter((g) => g.category === category);
}

/**
 * Mark goal as achieved
 */
export async function markGoalAsAchieved(goalId: string): Promise<void> {
  await updateGoal(goalId, {
    status: 'achieved',
    progress: 100,
  });
}

/**
 * Pause/resume goal
 */
export async function toggleGoalPause(goalId: string): Promise<void> {
  const goal = await getGoalById(goalId);
  if (!goal) throw new Error(`Goal ${goalId} not found`);

  const newStatus = goal.status === 'paused' ? 'active' : 'paused';
  await updateGoal(goalId, { status: newStatus });
}
