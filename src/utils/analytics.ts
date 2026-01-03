/**
 * Analytics Integration
 * Supports Firebase Analytics and Amplitude
 * 
 * Setup:
 * 1. For Firebase: npm install @react-native-firebase/analytics
 *    Add EXPO_PUBLIC_FIREBASE_ANALYTICS_ENABLED=true to .env
 * 
 * 2. For Amplitude: npm install @amplitude/analytics-react-native
 *    Add EXPO_PUBLIC_AMPLITUDE_API_KEY=your-key to .env
 */

// Safely import env variables
let FIREBASE_ANALYTICS_ENABLED: boolean = false;
let AMPLITUDE_API_KEY: string | undefined;

try {
  const env = require('@env');
  FIREBASE_ANALYTICS_ENABLED = env.EXPO_PUBLIC_FIREBASE_ANALYTICS_ENABLED === 'true';
  AMPLITUDE_API_KEY = env.EXPO_PUBLIC_AMPLITUDE_API_KEY;
} catch (error) {
  // @env not available
}

// Optional Firebase Analytics
let firebaseAnalytics: any = null;
try {
  if (FIREBASE_ANALYTICS_ENABLED) {
    // For Expo, use expo-firebase-analytics or @react-native-firebase/analytics
    // firebaseAnalytics = require('@react-native-firebase/analytics').default();
  }
} catch (error) {
  // Firebase not installed
}

// Optional Amplitude
let amplitude: any = null;
try {
  if (AMPLITUDE_API_KEY) {
    // amplitude = require('@amplitude/analytics-react-native').init(AMPLITUDE_API_KEY);
  }
} catch (error) {
  // Amplitude not installed
}

/**
 * Track a screen view
 */
export function trackScreenView(screenName: string, properties?: Record<string, any>) {
  // Firebase Analytics
  if (firebaseAnalytics) {
    try {
      firebaseAnalytics.logScreenView({
        screen_name: screenName,
        screen_class: screenName,
        ...properties,
      });
    } catch (error) {
      console.error('Firebase Analytics error:', error);
    }
  }

  // Amplitude
  if (amplitude) {
    try {
      amplitude.logEvent('Screen View', {
        screen_name: screenName,
        ...properties,
      });
    } catch (error) {
      console.error('Amplitude error:', error);
    }
  }
}

/**
 * Track an event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  // Firebase Analytics
  if (firebaseAnalytics) {
    try {
      firebaseAnalytics.logEvent(eventName, properties);
    } catch (error) {
      console.error('Firebase Analytics error:', error);
    }
  }

  // Amplitude
  if (amplitude) {
    try {
      amplitude.logEvent(eventName, properties);
    } catch (error) {
      console.error('Amplitude error:', error);
    }
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  // Firebase Analytics
  if (firebaseAnalytics) {
    try {
      Object.keys(properties).forEach(key => {
        firebaseAnalytics.setUserProperty(key, String(properties[key]));
      });
    } catch (error) {
      console.error('Firebase Analytics error:', error);
    }
  }

  // Amplitude
  if (amplitude) {
    try {
      amplitude.setUserProperties(properties);
    } catch (error) {
      console.error('Amplitude error:', error);
    }
  }
}

/**
 * Set user ID
 */
export function setUserId(userId: string) {
  // Firebase Analytics
  if (firebaseAnalytics) {
    try {
      firebaseAnalytics.setUserId(userId);
    } catch (error) {
      console.error('Firebase Analytics error:', error);
    }
  }

  // Amplitude
  if (amplitude) {
    try {
      amplitude.setUserId(userId);
    } catch (error) {
      console.error('Amplitude error:', error);
    }
  }
}

/**
 * Track app open
 */
export function trackAppOpen() {
  trackEvent('app_open', {
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(featureName: string, properties?: Record<string, any>) {
  trackEvent('feature_used', {
    feature_name: featureName,
    ...properties,
  });
}

/**
 * Track conversion events
 */
export function trackConversion(eventName: string, value?: number, currency?: string) {
  trackEvent(eventName, {
    value,
    currency: currency || 'USD',
  });
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return !!(firebaseAnalytics || amplitude);
}
