/**
 * Trial Notification Drip Sequence
 * Schedules notifications during 7-day free trial to maximize conversions
 * 
 * Research shows 80-90% of trial conversions happen from effective drip campaigns
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Logger } from './logger';

const isExpoGo = Constants.appOwnership === 'expo';
const isAndroid = Platform.OS === 'android';
const notificationsUnsupported = isExpoGo && isAndroid;

interface TrialNotification {
    dayOffset: number;
    hour: number;
    minute: number;
    title: string;
    body: string;
}

/**
 * 7-Day Trial Notification Sequence
 * Based on industry best practices for subscription app conversion
 */
const TRIAL_NOTIFICATIONS: TrialNotification[] = [
    {
        dayOffset: 0,
        hour: 10,
        minute: 0,
        title: 'Welcome to Your Trial! 🌟',
        body: 'Your 7-day transformation journey begins now. Start with a gratitude check-in!',
    },
    {
        dayOffset: 1,
        hour: 11,
        minute: 0,
        title: 'Explore Premium Content 🎵',
        body: 'Unlock your full potential with guided affirmations for wealth, love, and confidence.',
    },
    {
        dayOffset: 3,
        hour: 10,
        minute: 0,
        title: "You're Doing Amazing! 💜",
        body: 'Day 3 of your trial - you\'re unlocking real transformation. Keep the momentum!',
    },
    {
        dayOffset: 5,
        hour: 10,
        minute: 0,
        title: '2 Days Left! ⏰',
        body: "Don't lose your progress. Subscribe now to keep your streak and premium access.",
    },
    {
        dayOffset: 6,
        hour: 10,
        minute: 0,
        title: 'Last Day of Your Trial 🔔',
        body: 'Tomorrow your trial ends. Subscribe today to continue your manifestation journey!',
    },
    {
        dayOffset: 7,
        hour: 10,
        minute: 0,
        title: 'Your Trial Has Ended',
        body: 'Come back for premium features. We\'re saving your progress! Tap to subscribe.',
    },
];

const TRIAL_START_KEY = '@trial_start_date';

/**
 * Schedule trial notification drip sequence
 * Call this when a user starts their free trial
 */
export async function scheduleTrialNotifications(): Promise<void> {
    if (notificationsUnsupported) {
        Logger.log('Trial notifications not supported in Expo Go on Android');
        return;
    }

    try {
        const trialStartDate = new Date();

        // Save trial start date for reference
        await AsyncStorage.setItem(TRIAL_START_KEY, trialStartDate.toISOString());

        for (const notification of TRIAL_NOTIFICATIONS) {
            const notificationDate = new Date(trialStartDate);
            notificationDate.setDate(notificationDate.getDate() + notification.dayOffset);
            notificationDate.setHours(notification.hour, notification.minute, 0, 0);

            // Only schedule if the notification date is in the future
            if (notificationDate > new Date()) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: notification.title,
                        body: notification.body,
                        sound: true,
                        priority: Notifications.AndroidNotificationPriority.HIGH,
                        data: {
                            type: 'trial_notification',
                            dayOffset: notification.dayOffset
                        },
                    },
                    trigger: {
                        type: 'date' as any,
                        date: notificationDate,
                        channelId: 'default',
                    },
                });
            }
        }

        Logger.log('Trial notifications scheduled successfully');
    } catch (error) {
        Logger.error('Error scheduling trial notifications:', error);
    }
}

/**
 * Cancel all trial-related notifications
 * Call this when user subscribes to premium
 */
export async function cancelTrialNotifications(): Promise<void> {
    if (notificationsUnsupported) return;

    try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

        for (const notification of scheduledNotifications) {
            if (notification.content.data?.type === 'trial_notification') {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }
        }

        // Clear trial start date
        await AsyncStorage.removeItem(TRIAL_START_KEY);
        Logger.log('Trial notifications cancelled');
    } catch (error) {
        Logger.error('Error canceling trial notifications:', error);
    }
}

/**
 * Get trial start date
 */
export async function getTrialStartDate(): Promise<Date | null> {
    try {
        const trialStartStr = await AsyncStorage.getItem(TRIAL_START_KEY);
        if (!trialStartStr) return null;
        return new Date(trialStartStr);
    } catch {
        return null;
    }
}

/**
 * Get remaining trial days
 * Returns null if no trial is active
 */
export async function getTrialDaysRemaining(): Promise<number | null> {
    try {
        const trialStart = await getTrialStartDate();
        if (!trialStart) return null;

        const trialEnd = new Date(trialStart);
        trialEnd.setDate(trialEnd.getDate() + 7);

        const now = new Date();
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return Math.max(0, daysRemaining);
    } catch {
        return null;
    }
}

/**
 * Check if trial is active
 */
export async function isTrialActive(): Promise<boolean> {
    const daysRemaining = await getTrialDaysRemaining();
    return daysRemaining !== null && daysRemaining > 0;
}
