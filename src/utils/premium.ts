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
import { Logger } from './logger';
import { Platform } from 'react-native';
import { useState, useEffect } from 'react';

const PREMIUM_STORAGE_KEY = '@is_premium_user';
const PREMIUM_EXPIRY_KEY = '@premium_expiry_date';
const SUBSCRIPTION_TYPE_KEY = '@subscription_type';
const REVENUECAT_ENTITLEMENT_ID = 'Moonifest Pro';

export type SubscriptionType = 'monthly' | 'yearly' | 'lifetime' | 'trial' | null;
export type PaymentProvider = 'revenuecat' | 'stripe' | 'local' | null;

export interface PremiumStatus {
  isPremium: boolean;
  subscriptionType: SubscriptionType;
  expiryDate: string | null;
  provider: PaymentProvider;
  daysRemaining: number | null;
}

// Safely import env variables with fallback (web / missing .env)
let env: any = null;
try {
  env = require('@env');
} catch (error) {
  env = null;
}

function getEnvValue(key: string): string | undefined {
  return env?.[key] ?? (process.env as any)?.[key];
}

// Optional RevenueCat import
let Purchases: any = null;
let revenueCatConfigured = false;
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
  const revenueCatApiKey = getRevenueCatApiKey();

  if (Purchases && revenueCatApiKey && (Platform.OS === 'ios' || Platform.OS === 'android')) {
    try {
      // Enable debug logs in dev when supported
      if (__DEV__) {
        try {
          if (typeof Purchases.setDebugLogsEnabled === 'function') {
            Purchases.setDebugLogsEnabled(true);
          } else if (Purchases.LOG_LEVEL && typeof Purchases.setLogLevel === 'function') {
            Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
          }
        } catch {
          // Ignore logging configuration errors
        }
      }

      await Purchases.configure({
        apiKey: revenueCatApiKey,
        appUserID: await getOrCreateUserId(),
      });
      revenueCatConfigured = true;
    } catch (error) {
      Logger.error('RevenueCat initialization failed:', error);
    }
  }

  // Check if Stripe is configured
  const stripePublishableKey = getEnvValue('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  if (initStripe && stripePublishableKey) {
    try {
      await initStripe({
        publishableKey: stripePublishableKey,
        merchantIdentifier: 'merchant.com.moonifest',
      });
    } catch (error) {
      Logger.error('Stripe initialization failed:', error);
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

function getRevenueCatApiKey(): string | undefined {
  // Prefer per-platform keys, with a legacy single-key fallback.
  const iosKey = getEnvValue('EXPO_PUBLIC_REVENUECAT_IOS_API_KEY');
  const androidKey = getEnvValue('EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY');
  const fallbackKey = getEnvValue('EXPO_PUBLIC_REVENUECAT_API_KEY');

  if (Platform.OS === 'ios') return iosKey || fallbackKey;
  if (Platform.OS === 'android') return androidKey || fallbackKey;
  return undefined;
}

async function ensureRevenueCatConfigured(): Promise<boolean> {
  if (!Purchases) return false;
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return false;

  const apiKey = getRevenueCatApiKey();
  if (!apiKey) return false;
  if (revenueCatConfigured) return true;

  try {
    await Purchases.configure({
      apiKey,
      appUserID: await getOrCreateUserId(),
    });
    revenueCatConfigured = true;
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if premium service is configured with API keys
 */
export async function isPremiumConfigured(): Promise<boolean> {
  const custom = await ensureRevenueCatConfigured();
  if (custom) return true;

  // Also check for Stripe
  const stripeKey = getEnvValue('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  return !!stripeKey;
}

async function getCustomerInfoSafe(): Promise<any | null> {
  if (!Purchases) return null;

  try {
    await ensureRevenueCatConfigured();
    if (typeof Purchases.getCustomerInfo === 'function') {
      return await Purchases.getCustomerInfo();
    }
    if (typeof Purchases.getPurchaserInfo === 'function') {
      return await Purchases.getPurchaserInfo();
    }
    return null;
  } catch (error) {
    return null;
  }
}

function isRevenueCatPremium(customerInfo: any): boolean {
  return !!customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID];
}

/**
 * Check if user has premium subscription
 * Checks RevenueCat first, then Stripe, then local storage
 */
export async function isPremiumUser(): Promise<boolean> {
  // Check RevenueCat
  if (Purchases) {
    try {
      await ensureRevenueCatConfigured();
      const customerInfo = await getCustomerInfoSafe();
      const isPremium = isRevenueCatPremium(customerInfo);
      if (isPremium) {
        await syncPremiumStatus(true, 'revenuecat');
        return true;
      }
    } catch (error) {
      Logger.error('Error checking RevenueCat premium status:', error);
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
    Logger.error('Error checking premium status:', error);
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
      const customerInfo = await getCustomerInfoSafe();
      if (isRevenueCatPremium(customerInfo)) {
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
    Logger.error('Error setting premium status:', error);
  }
}

/**
 * Purchase premium subscription via RevenueCat
 */
export async function purchasePremiumRevenueCat(
  plan: 'monthly' | 'yearly' | 'lifetime' = 'yearly',
  offeringId?: string
): Promise<boolean> {
  if (!Purchases) {
    throw new Error('RevenueCat not installed. Run: npm install react-native-purchases');
  }

  const configured = await ensureRevenueCatConfigured();
  if (!configured) {
    throw new Error('RevenueCat API key not configured. Set EXPO_PUBLIC_REVENUECAT_IOS_API_KEY and/or EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY in .env.');
  }

  try {
    const offerings = await Purchases.getOfferings();
    const offering =
      (offeringId
        ? (offerings?.all?.[offeringId] ??
          (typeof offerings?.offering === 'function' ? offerings.offering(offeringId) : null))
        : null) ||
      offerings?.current ||
      null;

    if (!offering || !offering.availablePackages.length) {
      throw new Error('No offerings available');
    }

    // Prefer the requested plan if available, fallback to first package
    const targetPackageType = plan === 'yearly' ? 'ANNUAL' : plan === 'monthly' ? 'MONTHLY' : 'LIFETIME';
    const matchedPackage = offering.availablePackages.find(
      (pkg: any) => String(pkg.packageType || '').toUpperCase().includes(targetPackageType)
    );
    const packageToPurchase = matchedPackage || offering.availablePackages[0];
    const purchaseResult = await Purchases.purchasePackage(packageToPurchase);

    const customerInfo =
      purchaseResult?.customerInfo ??
      purchaseResult?.purchaserInfo ??
      purchaseResult ??
      null;

    const isPremium = isRevenueCatPremium(customerInfo);
    await syncPremiumStatus(isPremium, 'revenuecat');

    return isPremium;
  } catch (error: any) {
    if (error.userCancelled) {
      return false;
    }
    Logger.error('Purchase error:', error);
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
    await ensureRevenueCatConfigured();
    const restoreResult = await Purchases.restorePurchases();
    const customerInfo = restoreResult?.customerInfo ?? restoreResult?.purchaserInfo ?? restoreResult ?? null;
    const isPremium = isRevenueCatPremium(customerInfo);
    await syncPremiumStatus(isPremium, 'revenuecat');
    return isPremium;
  } catch (error) {
    Logger.error('Restore purchases error:', error);
    return false;
  }
}

/**
 * Premium feature gate component helper
 */
export function getPremiumMessage(featureName: string): string {
  return `Unlock ${featureName} with Vortex Premium!`;
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
  const yearlyValue = 49.99;
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

/**
 * Hook to fetch and return RevenueCat offerings
 */
export function usePremiumOfferings() {
  const [packages, setPackages] = useState<any[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const configured = await isPremiumConfigured();
      setIsConfigured(configured);

      if (configured && Purchases) {
        try {
          const offerings = await Purchases.getOfferings();
          if (offerings.current?.availablePackages?.length) {
            setPackages(offerings.current.availablePackages);
          }
        } catch (e) {
          Logger.warn('Failed to load offerings', e);
        }
      }
    } catch (e) {
      Logger.warn('Error checking premium config', e);
    } finally {
      setLoading(false);
    }
  };

  return { packages, isConfigured, loading };
}

/**
 * Helper to find a package by type/identifier robustly
 * Handles: "ANNUAL", "Annual", "$rc_annual", "yearly", etc.
 */
export function findPackage(packages: any[], type: 'ANNUAL' | 'MONTHLY' | 'LIFETIME') {
  if (!packages || !packages.length) return null;

  return packages.find((pkg) => {
    const id = (pkg.identifier || '').toUpperCase();
    const pkgType = String(pkg.packageType || '').toUpperCase();

    // Check strict SDK type (if string) or Identifier
    // RC standard is $rc_annual, custom is Annual
    if (type === 'ANNUAL') {
      return id.includes('ANNUAL') || id.includes('YEARLY') || pkgType === 'ANNUAL' || pkgType === '3';
    }
    if (type === 'MONTHLY') {
      return id.includes('MONTHLY') || pkgType === 'MONTHLY' || pkgType === '7';
    }
    if (type === 'LIFETIME') {
      return id.includes('LIFETIME') || pkgType === 'LIFETIME' || pkgType === '2';
    }
    return false;
  });
}




