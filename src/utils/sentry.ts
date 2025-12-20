import * as Sentry from '@sentry/react-native';
import { SENTRY_DSN } from '@env';

/**
 * Initialize Sentry error tracking
 *
 * To enable Sentry:
 * 1. Sign up at https://sentry.io (free tier available)
 * 2. Create a new React Native project
 * 3. Copy your DSN from Settings > Projects > [Your Project] > Client Keys (DSN)
 * 4. Add to .env file: SENTRY_DSN=your-dsn-here
 *
 * Features:
 * - Automatic crash reporting
 * - Error tracking with stack traces
 * - Performance monitoring
 * - User context tracking
 * - Breadcrumbs for debugging
 */

export function initSentry() {
  // Only initialize if DSN is configured
  if (!SENTRY_DSN || SENTRY_DSN === 'your-sentry-dsn-here') {
    console.log('⚠️ Sentry not configured - error tracking disabled');
    console.log('💡 To enable: Sign up at https://sentry.io and add SENTRY_DSN to .env');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,

      // Enable performance monitoring (optional)
      tracesSampleRate: 1.0,

      // Set environment
      environment: __DEV__ ? 'development' : 'production',

      // Enable debug mode in development
      debug: __DEV__,

      // Capture unhandled promise rejections
      enableAutoSessionTracking: true,

      // Enable native crash tracking
      enableNative: true,

      // Enable auto performance monitoring
      enableAutoPerformanceTracing: true,

      // Configure what gets sent to Sentry
      beforeSend(event, hint) {
        // Don't send events in development unless explicitly enabled
        if (__DEV__ && !shouldSendInDev()) {
          console.log('🔍 Sentry event (not sent in dev):', event);
          return null;
        }

        // Filter out sensitive information
        if (event.request) {
          delete event.request.cookies;
        }

        return event;
      },
    });

    console.log('✅ Sentry initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error);
  }
}

/**
 * Check if we should send errors to Sentry in development
 * Set SENTRY_DEV=true in .env to enable
 */
function shouldSendInDev(): boolean {
  return process.env.SENTRY_DEV === 'true';
}

/**
 * Capture an error manually
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (!SENTRY_DSN) {
    console.error('Error (Sentry not configured):', error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setContext(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture a message/log
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!SENTRY_DSN) {
    console.log(`Message (Sentry not configured): [${level}] ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}) {
  if (!SENTRY_DSN) return;

  Sentry.setUser(user);
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUser() {
  if (!SENTRY_DSN) return;

  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging context
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: 'info' | 'warning' | 'error' | 'debug';
  data?: Record<string, any>;
}) {
  if (!SENTRY_DSN) return;

  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Set custom context/tags
 */
export function setContext(key: string, context: Record<string, any>) {
  if (!SENTRY_DSN) return;

  Sentry.setContext(key, context);
}

export function setTag(key: string, value: string) {
  if (!SENTRY_DSN) return;

  Sentry.setTag(key, value);
}

/**
 * Check if Sentry is enabled
 */
export function isSentryEnabled(): boolean {
  return !!(SENTRY_DSN && SENTRY_DSN !== 'your-sentry-dsn-here');
}

// Export Sentry instance for advanced usage
export { Sentry };
