/**
 * Premium/Subscription Management
 * Handles premium feature gating and subscription management
 * 
 * Supports:
 * - RevenueCat (recommended for cross-platform)
 * - Stripe (alternative)
 * - Local testing mode
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const PREMIUM_STORAGE_KEY = '@is_premium_user';
const PREMIUM_EXPIRY_KEY = '@premium_expiry_date';
const SUBSCRIPTION_TYPE_KEY = '@subscription_type';

export type SubscriptionType = 'monthly' | 'yearly' | 'lifetime' | 'trial' | null;
export type PaymentProvider = 'revenuecat' | 'stripe' | 'local' | null;

export interface PremiumStatus {
  isPremium: boolean;
  subscriptionType: SubscriptionType;
  expiryDate: string | null;
  provider: PaymentProvider;
  daysRemaining: number | null;
}

// Optional RevenueCat import
let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch (error) {
  // RevenueCat not installed
}

// Optional Stripe import
let initStripe: any = null;
let presentPaymentSheet: any = null;
try {
  const stripeModule = require('@stripe/stripe-react-native');
  initStripe = stripeModule.initStripe;
  presentPaymentSheet = stripeModule.presentPaymentSheet;
} catch (error) {
  // Stripe not installed
}

/**
 * Initialize premium system
 * Call this on app startup
 */
export async function initializePremium(): Promise<void> {
  // Check if RevenueCat is configured
  const revenueCatApiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
  
  if (Purchases && revenueCatApiKey) {
    try {
      await Purchases.configure({
        apiKey: revenueCatApiKey,
        appUserID: await getOrCreateUserId(),
      });
    } catch (error) {
      console.error('RevenueCat initialization failed:', error);
    }
  }

  // Check if Stripe is configured
  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (initStripe && stripePublishableKey) {
    try {
      await initStripe({
        publishableKey: stripePublishableKey,
        merchantIdentifier: 'merchant.com.moonifest',
      });
    } catch (error) {
      console.error('Stripe initialization failed:', error);
    }
  }
}

/**
 * Get or create user ID for premium tracking
 */
async function getOrCreateUserId(): Promise<string> {
  const userIdKey = '@premium_user_id';
  let userId = await AsyncStorage.getItem(userIdKey);
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem(userIdKey, userId);
  }
  
  return userId;
}

/**
 * Check if user has premium subscription
 * Checks RevenueCat first, then Stripe, then local storage
 */
export async function isPremiumUser(): Promise<boolean> {
  // Check RevenueCat
  if (Purchases) {
    try {
      const purchaserInfo = await Purchases.getCustomerInfo();
      const isPremium = purchaserInfo.entitlements.active['premium'] !== undefined;
      if (isPremium) {
        await syncPremiumStatus(true, 'revenuecat');
        return true;
      }
    } catch (error) {
      console.error('Error checking RevenueCat premium status:', error);
    }
  }

  // Check local storage (for testing or Stripe)
  try {
    const premiumStatus = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
    if (premiumStatus === 'true') {
      // Check if expired
      const expiryDate = await AsyncStorage.getItem(PREMIUM_EXPIRY_KEY);
      if (expiryDate) {
        const expiry = new Date(expiryDate);
        if (expiry < new Date()) {
          await setPremiumStatus(false);
          return false;
        }
      }
      return true;
    }
  } catch (error) {
    console.error('Error checking premium status:', error);
  }

  return false;
}

/**
 * Get detailed premium status
 */
export async function getPremiumStatus(): Promise<PremiumStatus> {
  const isPremium = await isPremiumUser();
  const subscriptionType = (await AsyncStorage.getItem(SUBSCRIPTION_TYPE_KEY)) as SubscriptionType || null;
  const expiryDate = await AsyncStorage.getItem(PREMIUM_EXPIRY_KEY);
  
  let provider: PaymentProvider = 'local';
  if (Purchases) {
    try {
      const purchaserInfo = await Purchases.getCustomerInfo();
      if (purchaserInfo.entitlements.active['premium']) {
        provider = 'revenuecat';
      }
    } catch (error) {
      // Not using RevenueCat
    }
  }

  let daysRemaining: number | null = null;
  if (expiryDate) {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    isPremium,
    subscriptionType,
    expiryDate,
    provider,
    daysRemaining,
  };
}

/**
 * Sync premium status to local storage
 */
async function syncPremiumStatus(isPremium: boolean, provider: PaymentProvider): Promise<void> {
  await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, isPremium ? 'true' : 'false');
  if (provider) {
    // Store provider info if needed
  }
}

/**
 * Set premium status (for testing/admin purposes)
 */
export async function setPremiumStatus(
  isPremium: boolean,
  subscriptionType: SubscriptionType = null,
  expiryDate: string | null = null
): Promise<void> {
  try {
    await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, isPremium ? 'true' : 'false');
    if (subscriptionType) {
      await AsyncStorage.setItem(SUBSCRIPTION_TYPE_KEY, subscriptionType);
    }
    if (expiryDate) {
      await AsyncStorage.setItem(PREMIUM_EXPIRY_KEY, expiryDate);
    } else if (!isPremium) {
      await AsyncStorage.removeItem(PREMIUM_EXPIRY_KEY);
      await AsyncStorage.removeItem(SUBSCRIPTION_TYPE_KEY);
    }
  } catch (error) {
    console.error('Error setting premium status:', error);
  }
}

/**
 * Purchase premium subscription via RevenueCat
 */
export async function purchasePremiumRevenueCat(
  plan: 'monthly' | 'yearly' = 'yearly',
  offeringId?: string
): Promise<boolean> {
  if (!Purchases) {
    throw new Error('RevenueCat not installed. Run: npm install react-native-purchases');
  }

  try {
    const offerings = await Purchases.getOfferings();
    const offering = offeringId 
      ? offerings.offering(offeringId)
      : offerings.current;

    if (!offering || !offering.availablePackages.length) {
      throw new Error('No offerings available');
    }

    // Prefer the requested plan if available, fallback to first package
    const targetPackageType = plan === 'yearly' ? 'ANNUAL' : 'MONTHLY';
    const matchedPackage = offering.availablePackages.find(
      (pkg: any) => pkg.packageType === targetPackageType
    );
    const packageToPurchase = matchedPackage || offering.availablePackages[0];
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    await syncPremiumStatus(isPremium, 'revenuecat');
    
    return isPremium;
  } catch (error: any) {
    if (error.userCancelled) {
      return false;
    }
    console.error('Purchase error:', error);
    throw error;
  }
}

/**
 * Restore purchases (RevenueCat)
 */
export async function restorePurchases(): Promise<boolean> {
  if (!Purchases) {
    return false;
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    await syncPremiumStatus(isPremium, 'revenuecat');
    return isPremium;
  } catch (error) {
    console.error('Restore purchases error:', error);
    return false;
  }
}

/**
 * Premium feature gate component helper
 */
export function getPremiumMessage(featureName: string): string {
  return `Unlock ${featureName} with Moonifest Premium!`;
}

/**
 * Get subscription pricing info
 */
export function getSubscriptionPricing(): {
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyPerMonth: string;
  yearlySavingsPercent: number;
  trialDays: number;
} {
  const monthlyValue = 9.99;
  const yearlyValue = 59.99;
  const yearlyPerMonth = (yearlyValue / 12).toFixed(2);
  const yearlySavingsPercent = Math.round(
    100 - (yearlyValue / (monthlyValue * 12)) * 100
  );

  return {
    monthlyPrice: `$${monthlyValue.toFixed(2)}`,
    yearlyPrice: `$${yearlyValue.toFixed(2)}`,
    yearlyPerMonth: `$${yearlyPerMonth}`,
    yearlySavingsPercent,
    trialDays: 7,
  };
}




