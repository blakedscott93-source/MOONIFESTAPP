import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Check if we're running in Expo Go (where push notifications aren't supported on Android in SDK 53+)
const isExpoGo = Constants.appOwnership === 'expo';
const isAndroid = Platform.OS === 'android';
const notificationsUnsupported = isExpoGo && isAndroid;

// Configure notification behavior (wrap in try-catch for Expo Go compatibility)
try {
  if (!notificationsUnsupported) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (error) {
  console.log('Notifications not supported in this environment:', error);
}

export interface NotificationSettings {
  enabled: boolean;
  morningTime: string; // "09:00"
  afternoonTime: string; // "14:00"
  eveningTime: string; // "20:00"
  affirmationFrequency: 3 | 6 | 9; // Number of daily affirmations
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  morningTime: '09:00',
  afternoonTime: '14:00',
  eveningTime: '20:00',
  affirmationFrequency: 3, // Default to 3 daily affirmations
};

const STORAGE_KEY = '@notification_settings';

// Request notification permissions
export async function registerForPushNotifications(): Promise<boolean> {
  // Skip if notifications aren't supported (Expo Go on Android SDK 53+)
  if (notificationsUnsupported) {
    console.log('📱 Push notifications are not supported in Expo Go on Android. Use a development build for full notification support.');
    return false;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C77DFF',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    return true;
  } catch (error) {
    console.log('Error registering for push notifications:', error);
    return false;
  }
}

// Get notification settings from storage
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEY);
    if (settings) {
      return JSON.parse(settings);
    }

    // No saved settings - check onboarding data for personalized defaults
    const onboardingData = await AsyncStorage.getItem('@onboarding_data');
    if (onboardingData) {
      const { dailyTime, experience } = JSON.parse(onboardingData);

      // Adjust affirmation frequency based on experience level
      let affirmationFrequency: 3 | 6 | 9 = 3; // Default for beginners
      if (experience === 'intermediate') {
        affirmationFrequency = 6;
      } else if (experience === 'advanced') {
        affirmationFrequency = 9;
      }

      // Adjust notification times based on user's preferred daily time
      let personalizedSettings = { ...DEFAULT_SETTINGS, affirmationFrequency };

      if (dailyTime === 'morning') {
        personalizedSettings.morningTime = '07:00';
        personalizedSettings.afternoonTime = '12:00';
        personalizedSettings.eveningTime = '18:00';
      } else if (dailyTime === 'afternoon') {
        personalizedSettings.morningTime = '10:00';
        personalizedSettings.afternoonTime = '15:00';
        personalizedSettings.eveningTime = '20:00';
      } else if (dailyTime === 'evening') {
        personalizedSettings.morningTime = '12:00';
        personalizedSettings.afternoonTime = '17:00';
        personalizedSettings.eveningTime = '21:00';
      }

      // Save personalized defaults for future use
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(personalizedSettings));
      console.log('✨ Applied personalized notification defaults based on onboarding quiz');

      return personalizedSettings;
    }

    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Save notification settings
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    await scheduleNotifications(settings);
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

// Manifestation prompts for notifications (journal reminders)
const MANIFESTATION_PROMPTS = [
  "✨ Time to manifest! What are you grateful for today?",
  "🌟 Your daily check-in awaits. What's bringing you joy?",
  "💜 Pause and reflect. What abundance are you experiencing?",
  "🎯 Manifestation time! Express gratitude for what you have.",
  "🌙 Take a moment to appreciate the beauty around you.",
  "⭐ Your future self will thank you. Journal your gratitude now.",
  "💫 Energy flows where attention goes. What are you thankful for?",
  "🔮 The universe is listening. Share your gratitude.",
];

// Daily affirmations for relaxation and inspiration (like I AM app)
const DAILY_AFFIRMATIONS = [
  "I am worthy of love and abundance.",
  "I trust the journey of my life.",
  "I am capable of achieving my dreams.",
  "I release all negative energy and embrace peace.",
  "I am grateful for this moment.",
  "I attract positive energy and opportunities.",
  "I am enough exactly as I am.",
  "I choose to see the good in every situation.",
  "I am becoming the best version of myself.",
  "I radiate confidence and self-love.",
  "My thoughts create my reality.",
  "I am aligned with my highest purpose.",
  "I welcome miracles into my life.",
  "I am open to receiving abundance.",
  "I trust in perfect timing.",
  "I am worthy of all good things.",
  "I let go of what no longer serves me.",
  "I am powerful beyond measure.",
  "I choose peace over worry.",
  "I am creating my dream life now.",
  "I am surrounded by love and support.",
  "I trust my intuition and inner wisdom.",
  "I am exactly where I need to be.",
  "I embrace change with an open heart.",
  "I am deserving of happiness and success.",
  "I attract wealth and prosperity effortlessly.",
  "I am grateful for my unique journey.",
  "I release all fear and doubt.",
  "I am magnetic to my desires.",
  "I choose love over fear every time.",
  "I am in harmony with the universe.",
  "I trust that everything works out for me.",
  "I am creating magic in my life.",
  "I breathe in peace and exhale stress.",
  "I am a powerful manifestor.",
  "I celebrate my progress every day.",
  "I am connected to infinite possibilities.",
  "I choose thoughts that empower me.",
  "I am living my best life right now.",
  "I trust the universe has my back.",
];

// Get random prompt
function getRandomPrompt(): string {
  return MANIFESTATION_PROMPTS[Math.floor(Math.random() * MANIFESTATION_PROMPTS.length)];
}

// Get random affirmation
function getRandomAffirmation(): string {
  return DAILY_AFFIRMATIONS[Math.floor(Math.random() * DAILY_AFFIRMATIONS.length)];
}

// Parse time string to hour and minute
function parseTime(timeStr: string): { hour: number; minute: number } {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
}

// Schedule all daily notifications
export async function scheduleNotifications(settings: NotificationSettings): Promise<void> {
  // Skip if notifications aren't supported (Expo Go on Android SDK 53+)
  if (notificationsUnsupported) {
    console.log('📱 Notification scheduling skipped - not supported in Expo Go on Android.');
    return;
  }

  try {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Error cancelling notifications:', error);
    return;
  }

  if (!settings.enabled) {
    return;
  }

  // Schedule morning notification
  const morning = parseTime(settings.morningTime);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Good Morning! 🌅',
      body: getRandomPrompt(),
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { type: 'daily_reminder', time: 'morning' },
    },
    trigger: {
      type: 'daily' as any,
      hour: morning.hour,
      minute: morning.minute,
      channelId: 'default',
      repeats: true,
    },
  });

  // Schedule afternoon notification
  const afternoon = parseTime(settings.afternoonTime);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Afternoon Check-in ☀️',
      body: getRandomPrompt(),
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { type: 'daily_reminder', time: 'afternoon' },
    },
    trigger: {
      type: 'daily' as any,
      hour: afternoon.hour,
      minute: afternoon.minute,
      channelId: 'default',
      repeats: true,
    },
  });

  // Schedule evening notification
  const evening = parseTime(settings.eveningTime);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Evening Reflection 🌙',
      body: getRandomPrompt(),
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { type: 'daily_reminder', time: 'evening' },
    },
    trigger: {
      type: 'daily' as any,
      hour: evening.hour,
      minute: evening.minute,
      channelId: 'default',
      repeats: true,
    },
  });

  // Schedule affirmation notifications throughout the day (like I AM app)
  // User can customize frequency: 3, 6, or 9 affirmations per day
  const affirmationTimeSets = {
    3: [
      { hour: 10, minute: 0 },
      { hour: 14, minute: 0 },
      { hour: 18, minute: 0 },
    ],
    6: [
      { hour: 10, minute: 0 },
      { hour: 12, minute: 0 },
      { hour: 14, minute: 0 },
      { hour: 16, minute: 0 },
      { hour: 18, minute: 0 },
      { hour: 21, minute: 0 },
    ],
    9: [
      { hour: 9, minute: 0 },
      { hour: 11, minute: 0 },
      { hour: 13, minute: 0 },
      { hour: 15, minute: 0 },
      { hour: 17, minute: 0 },
      { hour: 19, minute: 0 },
      { hour: 21, minute: 0 },
      { hour: 22, minute: 30 },
      { hour: 23, minute: 30 },
    ],
  };

  const affirmationTimes = affirmationTimeSets[settings.affirmationFrequency] || affirmationTimeSets[3];

  for (const time of affirmationTimes) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✨ Affirmation',
        body: getRandomAffirmation(),
        sound: false, // Silent for relaxation
        priority: Notifications.AndroidNotificationPriority.LOW,
        data: { type: 'daily_affirmation' },
      },
      trigger: {
        type: 'daily' as any,
        hour: time.hour,
        minute: time.minute,
        channelId: 'default',
        repeats: true,
      },
    });
  }

  console.log(`✅ Notifications scheduled successfully (3 journal reminders + ${settings.affirmationFrequency} daily affirmations)`);
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  if (notificationsUnsupported) return;
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Error cancelling notifications:', error);
  }
}

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  if (notificationsUnsupported) return [];
  
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Error getting scheduled notifications:', error);
    return [];
  }
}

// Schedule streak reminder (fired at midnight if user hasn't completed today's tasks)
export async function scheduleStreakReminder(): Promise<void> {
  if (notificationsUnsupported) return;
  
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Don\'t Break Your Streak!',
        body: 'You haven\'t completed today\'s gratitude check-ins yet. Keep your momentum going!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { type: 'streak_reminder' },
      },
      trigger: {
        type: 'daily' as any,
        hour: 22,
        minute: 0,
        channelId: 'default',
        repeats: true,
      },
    });
  } catch (error) {
    console.log('Error scheduling streak reminder:', error);
  }
}

// Handle notification tap (navigate to appropriate screen)
export function setupNotificationListeners(navigation: any) {
  // Skip if notifications aren't supported (Expo Go on Android SDK 53+)
  if (notificationsUnsupported) {
    return () => {}; // Return empty cleanup function
  }

  try {
    // Handle notification received while app is foregrounded
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    // Handle notification tap
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;

      if (data.type === 'daily_reminder' || data.type === 'streak_reminder') {
        // Navigate to journal screen
        navigation.navigate('Journal', {
          screen: 'VoiceJournal',
        });
      }
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  } catch (error) {
    console.log('Error setting up notification listeners:', error);
    return () => {};
  }
}

// Export helper to check if notifications are supported
export function areNotificationsSupported(): boolean {
  return !notificationsUnsupported;
}
