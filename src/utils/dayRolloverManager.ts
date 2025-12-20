/**
 * Day Rollover Manager
 * Handles day transitions, incomplete day detection, and archiving
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDayKey, getYesterdayLocalDayKey, DayCompletionStatus, GratitudeCheckIn } from './dayRollover';
import { MIN_CHECKINS_FOR_COMPLETION } from './constants';

const LAST_SEEN_DAY_KEY = 'lastSeenDayKey';
const GRATITUDE_CHECKINS_KEY = 'gratitudeCheckIns';
const DAY_COMPLETION_STATUS_KEY = 'dayCompletionStatus';

export interface IncompleteDayInfo {
  localDayKey: string;
  checkInCount: number;
  wasComplete: boolean;
}

export interface DayRolloverResult {
  hasRollover: boolean;
  incompleteDay?: IncompleteDayInfo;
  currentDayKey: string;
}

/**
 * Get all gratitude check-ins from storage
 */
export async function getGratitudeCheckIns(): Promise<GratitudeCheckIn[]> {
  try {
    const stored = await AsyncStorage.getItem(GRATITUDE_CHECKINS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading gratitude check-ins:', error);
    return [];
  }
}

/**
 * Save gratitude check-ins to storage
 */
export async function saveGratitudeCheckIns(checkIns: GratitudeCheckIn[]): Promise<void> {
  try {
    await AsyncStorage.setItem(GRATITUDE_CHECKINS_KEY, JSON.stringify(checkIns));
  } catch (error) {
    console.error('Error saving gratitude check-ins:', error);
  }
}

/**
 * Get day completion statuses from storage
 */
export async function getDayCompletionStatuses(): Promise<{ [key: string]: DayCompletionStatus }> {
  try {
    const stored = await AsyncStorage.getItem(DAY_COMPLETION_STATUS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading day completion statuses:', error);
    return {};
  }
}

/**
 * Save day completion statuses to storage
 */
export async function saveDayCompletionStatuses(statuses: { [key: string]: DayCompletionStatus }): Promise<void> {
  try {
    await AsyncStorage.setItem(DAY_COMPLETION_STATUS_KEY, JSON.stringify(statuses));
  } catch (error) {
    console.error('Error saving day completion statuses:', error);
  }
}

/**
 * Get the last seen day key from storage
 */
export async function getLastSeenDayKey(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_SEEN_DAY_KEY);
  } catch (error) {
    console.error('Error loading last seen day key:', error);
    return null;
  }
}

/**
 * Save the last seen day key to storage
 */
export async function saveLastSeenDayKey(localDayKey: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SEEN_DAY_KEY, localDayKey);
  } catch (error) {
    console.error('Error saving last seen day key:', error);
  }
}

/**
 * Check if a day is complete (has minimum required check-ins)
 */
export function isDayComplete(checkInCount: number): boolean {
  return checkInCount >= MIN_CHECKINS_FOR_COMPLETION;
}

/**
 * Get check-in count for a specific day
 */
export async function getCheckInCountForDay(localDayKey: string): Promise<number> {
  const checkIns = await getGratitudeCheckIns();
  return checkIns.filter(ci => ci.localDayKey === localDayKey).length;
}

/**
 * Check for day rollover and return incomplete day info if applicable
 */
export async function checkDayRollover(): Promise<DayRolloverResult> {
  const currentDayKey = getLocalDayKey();
  const lastSeenDayKey = await getLastSeenDayKey();

  // First time opening app
  if (!lastSeenDayKey) {
    await saveLastSeenDayKey(currentDayKey);
    return {
      hasRollover: false,
      currentDayKey,
    };
  }

  // Same day - no rollover
  if (lastSeenDayKey === currentDayKey) {
    return {
      hasRollover: false,
      currentDayKey,
    };
  }

  // Day has rolled over
  const yesterdayKey = getYesterdayLocalDayKey();
  const checkInCount = await getCheckInCountForDay(yesterdayKey);
  const wasComplete = isDayComplete(checkInCount);

  // Update last seen day key
  await saveLastSeenDayKey(currentDayKey);

  return {
    hasRollover: true,
    incompleteDay: yesterdayKey === lastSeenDayKey && !wasComplete
      ? {
          localDayKey: yesterdayKey,
          checkInCount,
          wasComplete: false,
        }
      : undefined,
    currentDayKey,
  };
}

/**
 * Mark a day as complete retroactively
 */
export async function markDayComplete(localDayKey: string): Promise<void> {
  const statuses = await getDayCompletionStatuses();
  const checkInCount = await getCheckInCountForDay(localDayKey);
  
  statuses[localDayKey] = {
    localDayKey,
    checkInCount,
    isComplete: true,
    completedAt: new Date().toISOString(),
  };

  await saveDayCompletionStatuses(statuses);
}

/**
 * Record a missed day (breaks streak)
 */
export async function recordMissedDay(localDayKey: string): Promise<void> {
  const statuses = await getDayCompletionStatuses();
  
  statuses[localDayKey] = {
    localDayKey,
    checkInCount: await getCheckInCountForDay(localDayKey),
    isComplete: false,
  };

  await saveDayCompletionStatuses(statuses);
}






