/**
 * Application Logger
 * Wraps console logging to prevent sensitive data leakage in production.
 */

const isDev = __DEV__;

export const Logger = {
    log: (...args: any[]) => {
        if (isDev) {
            console.log(...args);
        }
    },
    warn: (...args: any[]) => {
        if (isDev) {
            console.warn(...args);
        }
    },
    error: (...args: any[]) => {
        // We typically want errors even in production, but we can filter if needed.
        // For now, let's allow errors but maybe sanitize them in a future step if needed.
        // Or prefer Sentry for production errors.
        if (isDev) {
            console.error(...args);
        } else {
            // In production, you might pipe this to Sentry or similar service.
            // For now, we will still print errors to console for critical debugging if attached,
            // but you can comment this out to silence strictly.
            // console.error(...args); 
        }
    },
    info: (...args: any[]) => {
        if (isDev) {
            console.info(...args);
        }
    },
    debug: (...args: any[]) => {
        if (isDev) {
            console.debug(...args);
        }
    }
};
