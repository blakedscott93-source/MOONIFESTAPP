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
import * as SecureStore from 'expo-secure-store';
import { Logger } from './logger';
import { addBreadcrumb } from './sentry';
import { Platform } from 'react-native';
import { useState, useEffect } from 'react';

const PREMIUM_STORAGE_KEY = '@is_premium_user';
const PREMIUM_EXPIRY_KEY = '@premium_expiry_date';
const SUBSCRIPTION_TYPE_KEY = '@subscription_type';
const DEFAULT_REVENUECAT_ENTITLEMENT_ID = 'premium';

// SecureStore keys for enhanced security
const SECURE_PREMIUM_KEY = 'premium_status';
const SECURE_EXPIRY_KEY = 'premium_expiry';
const SECURE_TYPE_KEY = 'premium_type';
const MIGRATION_DONE_KEY = '@premium_migrated_to_secure';

export type SubscriptionType = 'monthly' | 'yearly' | 'trial' | null;
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

function getRevenueCatEntitlementId(): string {
  return (
    process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ||
    getEnvValue('EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID') ||
    DEFAULT_REVENUECAT_ENTITLEMENT_ID
  );
}

const REVENUECAT_ENTITLEMENT_ID = getRevenueCatEntitlementId();

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
  // Run SecureStore migration first
  await migratePremiumToSecureStore();

  // Check if RevenueCat is configured
  const { apiKey: revenueCatApiKey, keyName } = getRevenueCatKeyInfo();

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

      // Add listener for customer info updates (syncs premium status in real-time)
      try {
        if (typeof Purchases.addCustomerInfoUpdateListener === 'function') {
          Purchases.addCustomerInfoUpdateListener((customerInfo: any) => {
            const isPremium = isRevenueCatPremium(customerInfo);
            syncPremiumStatus(isPremium, 'revenuecat');
            addBreadcrumb({
              message: 'RevenueCat customer info updated via listener',
              category: 'premium',
              level: 'info',
              data: {
                isPremium,
                activeEntitlements: Object.keys(customerInfo?.entitlements?.active || {}),
              },
            });
          });
        }
      } catch (listenerError) {
        // Listener setup failed, but RevenueCat still configured
        Logger.warn('Could not add customer info listener:', listenerError);
      }

      addBreadcrumb({
        message: 'RevenueCat configured',
        category: 'revenuecat',
        level: 'info',
        data: { platform: Platform.OS, keyName: keyName || 'unknown' },
      });
    } catch (error) {
      addBreadcrumb({
        message: 'RevenueCat configure failed',
        category: 'revenuecat',
        level: 'error',
        data: { platform: Platform.OS, keyName: keyName || 'unknown' },
      });
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

function getRevenueCatKeyInfo(): { apiKey?: string; keyName: string | null } {
  // Prefer per-platform keys, with a legacy single-key fallback.
  // NOTE: We access process.env directly to ensure Metro bundler can inline the values.
  const iosKey =
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ||
    getEnvValue('EXPO_PUBLIC_REVENUECAT_IOS_API_KEY');
  const androidKey =
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ||
    getEnvValue('EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY');
  const fallbackKey =
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ||
    getEnvValue('EXPO_PUBLIC_REVENUECAT_API_KEY');

  if (Platform.OS === 'ios') {
    if (iosKey) return { apiKey: iosKey, keyName: 'EXPO_PUBLIC_REVENUECAT_IOS_API_KEY' };
    if (fallbackKey) return { apiKey: fallbackKey, keyName: 'EXPO_PUBLIC_REVENUECAT_API_KEY' };
    return { apiKey: undefined, keyName: null };
  }
  if (Platform.OS === 'android') {
    if (androidKey) return { apiKey: androidKey, keyName: 'EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY' };
    if (fallbackKey) return { apiKey: fallbackKey, keyName: 'EXPO_PUBLIC_REVENUECAT_API_KEY' };
    return { apiKey: undefined, keyName: null };
  }
  return { apiKey: undefined, keyName: null };
}

function getRevenueCatApiKey(): string | undefined {
  return getRevenueCatKeyInfo().apiKey;
}

async function ensureRevenueCatConfigured(): Promise<boolean> {
  if (!Purchases) return false;
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return false;

  const { apiKey, keyName } = getRevenueCatKeyInfo();
  if (!apiKey) return false;
  if (revenueCatConfigured) return true;

  try {
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
      apiKey,
      appUserID: await getOrCreateUserId(),
    });
    revenueCatConfigured = true;
    addBreadcrumb({
      message: 'RevenueCat configured (ensure)',
      category: 'revenuecat',
      level: 'info',
      data: { platform: Platform.OS, keyName: keyName || 'unknown' },
    });
    return true;
  } catch {
    addBreadcrumb({
      message: 'RevenueCat configure failed (ensure)',
      category: 'revenuecat',
      level: 'error',
      data: { platform: Platform.OS, keyName: keyName || 'unknown' },
    });
    return false;
  }
}

/**
 * Identify user in RevenueCat (Sync with Supabase Auth)
 */
export async function identifyUser(userId: string): Promise<void> {
  if (!Purchases || !userId) return;

  try {
    const configured = await ensureRevenueCatConfigured();
    if (configured) {
      await Purchases.logIn(userId);
      await syncPremiumStatus(await isPremiumUser(), 'revenuecat');
    }
  } catch (error) {
    Logger.error('Error identifying user in RevenueCat:', error);
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
  // Check for the configured entitlement ID first
  if (customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID]) {
    return true;
  }

  // Fallback: Check if user has ANY active entitlement (handles ID mismatch)
  const activeEntitlements = customerInfo?.entitlements?.active;
  if (activeEntitlements && Object.keys(activeEntitlements).length > 0) {
    // Log the mismatch for debugging
    addBreadcrumb({
      message: 'Premium detected via fallback (entitlement ID may be misconfigured)',
      category: 'premium',
      level: 'warning',
      data: {
        expectedId: REVENUECAT_ENTITLEMENT_ID,
        actualIds: Object.keys(activeEntitlements),
      },
    });
    Logger.warn('RevenueCat entitlement ID mismatch:', {
      expected: REVENUECAT_ENTITLEMENT_ID,
      found: Object.keys(activeEntitlements),
    });
    return true;
  }

  return false;
}

/**
 * Check if user has premium subscription
 * Checks RevenueCat first, then Stripe, then local storage
 */
export async function isPremiumUser(): Promise<boolean> {
  addBreadcrumb({
    message: 'isPremiumUser check started',
    category: 'premium',
    level: 'info',
    data: { hasPurchasesSDK: !!Purchases, platform: Platform.OS },
  });

  // Check RevenueCat
  if (Purchases) {
    try {
      const configured = await ensureRevenueCatConfigured();
      if (!configured) {
        addBreadcrumb({
          message: 'RevenueCat not configured, skipping',
          category: 'premium',
          level: 'warning',
        });
      } else {
        const customerInfo = await getCustomerInfoSafe();

        // Log detailed customer info for debugging
        addBreadcrumb({
          message: 'RevenueCat customer info retrieved',
          category: 'premium',
          level: 'info',
          data: {
            hasCustomerInfo: !!customerInfo,
            hasEntitlements: !!customerInfo?.entitlements,
            activeEntitlementIds: Object.keys(customerInfo?.entitlements?.active || {}),
            allEntitlementIds: Object.keys(customerInfo?.entitlements?.all || {}),
            expectedEntitlement: REVENUECAT_ENTITLEMENT_ID,
          },
        });

        const isPremium = isRevenueCatPremium(customerInfo);
        if (isPremium) {
          addBreadcrumb({
            message: 'User is premium via RevenueCat',
            category: 'premium',
            level: 'info',
          });
          await syncPremiumStatus(true, 'revenuecat');
          return true;
        } else {
          addBreadcrumb({
            message: 'User is NOT premium via RevenueCat',
            category: 'premium',
            level: 'info',
            data: {
              activeEntitlements: Object.keys(customerInfo?.entitlements?.active || {}),
              checkingFor: REVENUECAT_ENTITLEMENT_ID,
            },
          });
        }
      }
    } catch (error) {
      addBreadcrumb({
        message: 'Error checking RevenueCat premium status',
        category: 'premium',
        level: 'error',
        data: { error: String(error) },
      });
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
      addBreadcrumb({
        message: 'User is premium via local storage',
        category: 'premium',
        level: 'info',
      });
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
 * Migrate premium status from AsyncStorage to SecureStore (run once)
 */
export async function migratePremiumToSecureStore(): Promise<void> {
  try {
    // Check if already migrated
    const migrated = await AsyncStorage.getItem(MIGRATION_DONE_KEY);
    if (migrated === 'true') return;

    // Read from old AsyncStorage
    const oldPremium = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
    const oldExpiry = await AsyncStorage.getItem(PREMIUM_EXPIRY_KEY);
    const oldType = await AsyncStorage.getItem(SUBSCRIPTION_TYPE_KEY);

    // Write to SecureStore
    if (oldPremium) {
      await SecureStore.setItemAsync(SECURE_PREMIUM_KEY, oldPremium);
    }
    if (oldExpiry) {
      await SecureStore.setItemAsync(SECURE_EXPIRY_KEY, oldExpiry);
    }
    if (oldType) {
      await SecureStore.setItemAsync(SECURE_TYPE_KEY, oldType);
    }

    // Mark migration complete
    await AsyncStorage.setItem(MIGRATION_DONE_KEY, 'true');

    Logger.log('Premium status migrated to SecureStore');
  } catch (error) {
    Logger.error('Premium migration error:', error);
  }
}

/**
 * Get premium status from SecureStore
 */
async function getSecurePremiumStatus(): Promise<boolean> {
  try {
    const status = await SecureStore.getItemAsync(SECURE_PREMIUM_KEY);
    if (status !== 'true') return false;

    // Check expiry
    const expiry = await SecureStore.getItemAsync(SECURE_EXPIRY_KEY);
    if (expiry) {
      const expiryDate = new Date(expiry);
      if (expiryDate < new Date()) {
        await setSecurePremiumStatus(false);
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Set premium status in SecureStore
 */
async function setSecurePremiumStatus(
  isPremium: boolean,
  expiryDate?: string
): Promise<void> {
  try {
    await SecureStore.setItemAsync(SECURE_PREMIUM_KEY, isPremium ? 'true' : 'false');
    if (expiryDate) {
      await SecureStore.setItemAsync(SECURE_EXPIRY_KEY, expiryDate);
    } else if (!isPremium) {
      await SecureStore.deleteItemAsync(SECURE_EXPIRY_KEY);
    }
  } catch (error) {
    Logger.error('Error setting secure premium status:', error);
  }
}

/**
 * Sync premium status to local storage (writes to both for backward compatibility)
 */
async function syncPremiumStatus(isPremium: boolean, provider: PaymentProvider): Promise<void> {
  // Write to both storages for compatibility during rollout
  await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, isPremium ? 'true' : 'false');
  await setSecurePremiumStatus(isPremium);
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
  plan: 'monthly' | 'yearly' = 'yearly',
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
    const targetPackageType = plan === 'yearly' ? 'ANNUAL' : 'MONTHLY';
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
 * Trial info aggregated from available packages
 */
export interface TrialInfo {
  hasFreeTrial: boolean;
  trialDays: number;
}

/**
 * Extract trial information from a RevenueCat package
 * The free trial is in the introPrice/introductoryPrice field when available
 */
function extractTrialInfo(pkg: any): TrialInfo {
  if (!pkg) {
    return { hasFreeTrial: false, trialDays: 0 };
  }
  try {
    const product = pkg?.product || pkg?.storeProduct;
    const introPrice = product?.introPrice || product?.introductoryPrice;

    if (introPrice) {
      const isFree = introPrice.price === 0 ||
        introPrice.priceString === '$0.00' ||
        introPrice.paymentMode === 'FREE_TRIAL' ||
        introPrice.paymentMode === 0;

      if (isFree && introPrice.periodNumberOfUnits) {
        const unitRaw = introPrice.periodUnit;
        const count = introPrice.periodNumberOfUnits;
        const unit = typeof unitRaw === 'string' ? unitRaw.toUpperCase() : unitRaw;
        let days = count;

        if (unit === 0 || unit === 'DAY' || unit === 'D') {
          days = count;
        } else if (unit === 1 || unit === 'WEEK' || unit === 'W') {
          days = count * 7;
        } else if (unit === 2 || unit === 'MONTH' || unit === 'M') {
          days = count * 30;
        } else if (unit === 3 || unit === 'YEAR' || unit === 'Y') {
          days = count * 365;
        }

        return { hasFreeTrial: true, trialDays: days };
      }
    }

    const freeTrialPeriod = product?.freeTrialPeriod;
    if (freeTrialPeriod) {
      const match = freeTrialPeriod.match(/P(\d+)([DWMY])/);
      if (match) {
        const count = parseInt(match[1], 10);
        const unit = match[2];
        let days = count;
        if (unit === 'W') days = count * 7;
        else if (unit === 'M') days = count * 30;
        else if (unit === 'Y') days = count * 365;
        return { hasFreeTrial: true, trialDays: days };
      }
    }
  } catch {
    // Ignore parsing errors
  }

  return { hasFreeTrial: false, trialDays: 0 };
}

/**
 * Exported helper for UI components to show trial info per package.
 */
export function getTrialInfoForPackage(pkg: any): TrialInfo {
  return extractTrialInfo(pkg);
}

/**
 * Hook to fetch and return RevenueCat offerings
 */
export function usePremiumOfferings() {
  const [packages, setPackages] = useState<any[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasOfferings, setHasOfferings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trialInfo, setTrialInfo] = useState<TrialInfo>({ hasFreeTrial: false, trialDays: 0 });

  const loadOfferings = async () => {
    setLoading(true);
    setError(null);
    try {
      const configured = await isPremiumConfigured();
      setIsConfigured(configured);

      if (!configured || !Purchases) {
        setPackages([]);
        setHasOfferings(false);
        setTrialInfo({ hasFreeTrial: false, trialDays: 0 });
        setError('Purchases not configured');
        addBreadcrumb({
          message: 'RevenueCat offerings skipped (not configured)',
          category: 'revenuecat',
          level: 'warning',
          data: { platform: Platform.OS },
        });
        return;
      }

      const offerings = await Purchases.getOfferings();
      const availablePackages = offerings.current?.availablePackages ?? [];
      const offeringId = offerings.current?.identifier ?? offerings.current?.id ?? null;

      setPackages(availablePackages);
      setHasOfferings(availablePackages.length > 0);

      // Extract trial info from the first package that has a trial
      let foundTrial: TrialInfo = { hasFreeTrial: false, trialDays: 0 };
      for (const pkg of availablePackages) {
        const info = extractTrialInfo(pkg);
        if (info.hasFreeTrial) {
          foundTrial = info;
          break;
        }
      }
      setTrialInfo(foundTrial);

      if (!availablePackages.length) {
        setError('No offerings available');
      }

      addBreadcrumb({
        message: availablePackages.length ? 'RevenueCat offerings loaded' : 'RevenueCat offerings empty',
        category: 'revenuecat',
        level: availablePackages.length ? 'info' : 'warning',
        data: {
          platform: Platform.OS,
          offeringId: offeringId || 'unknown',
          packageCount: availablePackages.length,
          hasFreeTrial: foundTrial.hasFreeTrial,
          trialDays: foundTrial.trialDays,
        },
      });
    } catch (e) {
      setPackages([]);
      setHasOfferings(false);
      setTrialInfo({ hasFreeTrial: false, trialDays: 0 });
      setError(e instanceof Error ? e.message : 'Failed to load offerings');
      addBreadcrumb({
        message: 'RevenueCat offerings load failed',
        category: 'revenuecat',
        level: 'error',
        data: { platform: Platform.OS },
      });
      Logger.warn('Failed to load offerings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfferings();
  }, []);

  return { packages, isConfigured, loading, hasOfferings, error, trialInfo, reload: loadOfferings };
}

/**
 * Helper to find a package by type/identifier robustly
 * Handles: "ANNUAL", "Annual", "$rc_annual", "yearly", etc.
 */
export function findPackage(packages: any[], type: 'ANNUAL' | 'MONTHLY') {
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
    return false;
  });
}




