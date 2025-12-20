/**
 * Premium/Subscription Management
 * Handles premium feature gating
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_STORAGE_KEY = '@is_premium_user';

/**
 * Check if user has premium subscription
 * For now, this is a simple local check
 * In production, integrate with your payment provider (RevenueCat, Stripe, etc.)
 */
export async function isPremiumUser(): Promise<boolean> {
  try {
    const premiumStatus = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
    // For development/testing, you can set this to true
    // In production, verify with your payment provider
    return premiumStatus === 'true';
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

/**
 * Set premium status (for testing/admin purposes)
 */
export async function setPremiumStatus(isPremium: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, isPremium ? 'true' : 'false');
  } catch (error) {
    console.error('Error setting premium status:', error);
  }
}

/**
 * Premium feature gate component helper
 */
export function getPremiumMessage(featureName: string): string {
  return `Unlock ${featureName} with Moonifest Premium!`;
}



