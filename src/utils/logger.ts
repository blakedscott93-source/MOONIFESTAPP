/**
 * Application Logger
 * Wraps console logging to prevent sensitive data leakage in production.
 */

import { captureError } from './sentry';

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
        if (isDev) {
            console.error(...args);
        } else {
            // In production, pipe errors to Sentry
            try {
                // Formatting args into a readable message or object
                const message = args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');

                // Extract the first error object if present for better stack traces
                const errorObj = args.find(arg => arg instanceof Error);

                if (errorObj) {
                    captureError(errorObj, { rawArgs: message });
                } else {
                    captureError(new Error(message));
                }
            } catch (e) {
                // Fallback if Sentry fails
                console.error(...args);
            }
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
