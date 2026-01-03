/**
 * Smart App Rating System
 * Prompts users to rate the app at optimal moments based on best practices
 */

import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const STORAGE_KEYS = {
  LAST_RATING_PROMPT: '@last_rating_prompt_date',
  RATING_PROMPT_COUNT: '@rating_prompt_count',
  FIRST_APP_OPEN: '@first_app_open_date',
  APP_SESSIONS: '@app_sessions_count',
  USER_RATED: '@user_has_rated',
};

// Minimum requirements before first prompt
const MIN_DAYS_SINCE_INSTALL = 3;
const MIN_APP_SESSIONS = 3;
const MIN_DAYS_BETWEEN_PROMPTS = 30; // iOS/Android also rate-limit, but we track too

// Optimal times of day (2-3 PM and 6-7 PM based on research)
const OPTIMAL_HOURS = [14, 15, 18, 19];

export interface RatingPromptResult {
  shouldPrompt: boolean;
  reason?: string;
}

/**
 * Check if we should prompt for rating based on context
 */
export async function shouldPromptForRating(context: {
  streak?: number;
  totalDays?: number;
  achievementUnlocked?: boolean;
  dayCompleted?: boolean;
  isFirstDayComplete?: boolean;
}): Promise<RatingPromptResult> {
  try {
    // Don't prompt if user already rated
    const hasRated = await AsyncStorage.getItem(STORAGE_KEYS.USER_RATED);
    if (hasRated === 'true') {
      return { shouldPrompt: false, reason: 'User already rated' };
    }

    // Check minimum requirements (days since install, app sessions)
    const firstOpenDate = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_APP_OPEN);
    if (firstOpenDate) {
      const daysSinceInstall = Math.floor(
        (Date.now() - parseInt(firstOpenDate)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceInstall < MIN_DAYS_SINCE_INSTALL) {
        return { shouldPrompt: false, reason: 'Too soon after install' };
      }
    }

    const sessionCount = parseInt(
      (await AsyncStorage.getItem(STORAGE_KEYS.APP_SESSIONS)) || '0'
    );
    if (sessionCount < MIN_APP_SESSIONS) {
      return { shouldPrompt: false, reason: 'Not enough app sessions' };
    }

    // Check if we've prompted recently
    const lastPromptDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RATING_PROMPT);
    if (lastPromptDate) {
      const daysSinceLastPrompt = Math.floor(
        (Date.now() - parseInt(lastPromptDate)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastPrompt < MIN_DAYS_BETWEEN_PROMPTS) {
        return { shouldPrompt: false, reason: 'Prompted too recently' };
      }
    }

    // Check for optimal trigger moments
    const promptCount = parseInt(
      (await AsyncStorage.getItem(STORAGE_KEYS.RATING_PROMPT_COUNT)) || '0'
    );

    // Trigger scenarios (priority order):
    if (context.isFirstDayComplete) {
      return { shouldPrompt: true, reason: 'First day completed' };
    }

    if (context.achievementUnlocked && promptCount === 0) {
      return { shouldPrompt: true, reason: 'First achievement unlocked' };
    }

    if (context.streak && [7, 14, 21, 30, 45].includes(context.streak) && promptCount < 2) {
      return { shouldPrompt: true, reason: `Streak milestone: ${context.streak} days` };
    }

    if (context.totalDays === 45 && promptCount < 3) {
      return { shouldPrompt: true, reason: '45-day challenge completed' };
    }

    return { shouldPrompt: false, reason: 'No trigger moment' };
  } catch (error) {
    console.error('Error checking rating prompt eligibility:', error);
    return { shouldPrompt: false, reason: 'Error checking eligibility' };
  }
}

/**
 * Prompt user to rate the app (if conditions are met)
 */
export async function promptForRating(context: {
  streak?: number;
  totalDays?: number;
  achievementUnlocked?: boolean;
  dayCompleted?: boolean;
  isFirstDayComplete?: boolean;
}): Promise<boolean> {
  try {
    const { shouldPrompt, reason } = await shouldPromptForRating(context);
    
    if (!shouldPrompt) {
      return false;
    }

    // Check if it's an optimal time of day (optional, but recommended)
    const currentHour = new Date().getHours();
    const isOptimalTime = OPTIMAL_HOURS.includes(currentHour);
    
    // Still prompt even if not optimal time, but log it
    if (!isOptimalTime) {
    }

    const isAvailable = await StoreReview.isAvailableAsync();
    
    if (isAvailable) {
      // Record that we've prompted
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_RATING_PROMPT, Date.now().toString());
      const currentCount = parseInt(
        (await AsyncStorage.getItem(STORAGE_KEYS.RATING_PROMPT_COUNT)) || '0'
      );
      await AsyncStorage.setItem(STORAGE_KEYS.RATING_PROMPT_COUNT, (currentCount + 1).toString());

      // Request review (iOS/Android will handle rate-limiting)
      await StoreReview.requestReview();
      return true;
    } else {
      // Fallback: Show custom prompt
      Alert.alert(
        'Love Moonifest? ⭐',
        'Your feedback means the world to us! If you\'re enjoying Moonifest, please consider leaving us a review. It helps us improve and reach more people on their manifestation journey.',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: async () => {
              await AsyncStorage.setItem(STORAGE_KEYS.LAST_RATING_PROMPT, Date.now().toString());
            },
          },
          {
            text: 'Rate Moonifest',
            onPress: async () => {
              // Mark as rated (even if they didn't complete, they showed intent)
              await AsyncStorage.setItem(STORAGE_KEYS.USER_RATED, 'true');
              // In a real implementation, you'd open the app store URL here
              // For now, we'll just mark it
            },
          },
        ]
      );
      return true;
    }
  } catch (error) {
    console.error('Error prompting for rating:', error);
    return false;
  }
}

/**
 * Track app session (call on app open)
 */
export async function trackAppSession(): Promise<void> {
  try {
    // Track first app open date
    const firstOpen = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_APP_OPEN);
    if (!firstOpen) {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_APP_OPEN, Date.now().toString());
    }

    // Increment session count
    const currentCount = parseInt(
      (await AsyncStorage.getItem(STORAGE_KEYS.APP_SESSIONS)) || '0'
    );
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SESSIONS, (currentCount + 1).toString());
  } catch (error) {
    console.error('Error tracking app session:', error);
  }
}

/**
 * Mark that user has rated (called when user explicitly rates)
 */
export async function markUserRated(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_RATED, 'true');
  } catch (error) {
    console.error('Error marking user as rated:', error);
  }
}

/**
 * Reset rating data (for testing purposes)
 */
export async function resetRatingData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.LAST_RATING_PROMPT,
      STORAGE_KEYS.RATING_PROMPT_COUNT,
      STORAGE_KEYS.USER_RATED,
    ]);
  } catch (error) {
    console.error('Error resetting rating data:', error);
  }
}

