/**
 * Day Rollover Utilities
 * Handles local timezone-based day calculations and rollover logic
 */

export interface GratitudeCheckIn {
  id: string;
  localDayKey: string; // YYYY-MM-DD in local timezone
  text: string;
  createdAt: string; // UTC ISO string
  timezoneId: string; // IANA timezone identifier
}

export interface DayCompletionStatus {
  localDayKey: string;
  checkInCount: number;
  isComplete: boolean; // true when checkInCount >= 3
  completedAt?: string; // UTC ISO string when marked complete
}

/**
 * Get the current local day key (YYYY-MM-DD) in the device's timezone
 */
export function getLocalDayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the device's timezone identifier (IANA format)
 * Falls back to a reasonable default if not available
 */
export function getDeviceTimezone(): string {
  try {
    // React Native doesn't have Intl.supportedValuesOf, so we use a workaround
    // For most cases, we can infer from Date's timezone offset
    // But for accuracy, we'll use a library or system call if available
    // For now, return a default that works for most cases
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  } catch (error) {
    console.warn('Could not determine timezone, using default:', error);
    return 'America/New_York'; // Fallback
  }
}

/**
 * Get yesterday's local day key
 */
export function getYesterdayLocalDayKey(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDayKey(yesterday);
}

/**
 * Check if a day key is today
 */
export function isToday(localDayKey: string): boolean {
  return localDayKey === getLocalDayKey();
}

/**
 * Check if a day key is yesterday
 */
export function isYesterday(localDayKey: string): boolean {
  return localDayKey === getYesterdayLocalDayKey();
}

/**
 * Parse a local day key into a Date object (at midnight local time)
 */
export function parseLocalDayKey(localDayKey: string): Date {
  const [year, month, day] = localDayKey.split('-').map(Number);
  const date = new Date();
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Calculate days between two local day keys
 */
export function daysBetween(startKey: string, endKey: string): number {
  const start = parseLocalDayKey(startKey);
  const end = parseLocalDayKey(endKey);
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}








