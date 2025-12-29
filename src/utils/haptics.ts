/**
 * Haptic Feedback Utility
 * 
 * Provides tactile feedback for a premium feel
 * Gracefully degrades on unsupported devices
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Check if haptics are available
let hapticsAvailable = true;

/**
 * Light haptic - for subtle interactions
 * Use for: button taps, selections, toggles
 */
export async function lightHaptic(): Promise<void> {
  if (!hapticsAvailable || Platform.OS === 'web') return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    hapticsAvailable = false;
    console.log('Haptics not available');
  }
}

/**
 * Medium haptic - for confirmations
 * Use for: successful actions, card selections
 */
export async function mediumHaptic(): Promise<void> {
  if (!hapticsAvailable || Platform.OS === 'web') return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    hapticsAvailable = false;
  }
}

/**
 * Heavy haptic - for important confirmations
 * Use for: completing tasks, achievements, saving entries
 */
export async function heavyHaptic(): Promise<void> {
  if (!hapticsAvailable || Platform.OS === 'web') return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    hapticsAvailable = false;
  }
}

/**
 * Success haptic - for positive outcomes
 * Use for: achievements, completed streaks, saved entries
 */
export async function successHaptic(): Promise<void> {
  if (!hapticsAvailable || Platform.OS === 'web') return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    hapticsAvailable = false;
  }
}

/**
 * Warning haptic - for alerts
 * Use for: streak warnings, errors
 */
export async function warningHaptic(): Promise<void> {
  if (!hapticsAvailable || Platform.OS === 'web') return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    hapticsAvailable = false;
  }
}

/**
 * Error haptic - for failures
 * Use for: validation errors, failed actions
 */
export async function errorHaptic(): Promise<void> {
  if (!hapticsAvailable || Platform.OS === 'web') return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    hapticsAvailable = false;
  }
}

/**
 * Selection haptic - for selections
 * Use for: tab changes, picker selections
 */
export async function selectionHaptic(): Promise<void> {
  if (!hapticsAvailable || Platform.OS === 'web') return;
  
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    hapticsAvailable = false;
  }
}

/**
 * Celebration haptic pattern - for big wins
 * Use for: jackpots, major achievements, completing challenges
 */
export async function celebrationHaptic(): Promise<void> {
  if (!hapticsAvailable || Platform.OS === 'web') return;
  
  try {
    // Create a celebration pattern
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    hapticsAvailable = false;
  }
}

/**
 * Spinning haptic - for slot machine effect
 * Use for: daily spin wheel
 */
export async function spinningHaptic(ticks: number = 10): Promise<void> {
  if (!hapticsAvailable || Platform.OS === 'web') return;
  
  try {
    for (let i = 0; i < ticks; i++) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Slow down progressively
      await new Promise(resolve => setTimeout(resolve, 50 + i * 20));
    }
    // Final selection
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    hapticsAvailable = false;
  }
}

























