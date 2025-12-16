import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, DayProgress, Task, GuidedSession } from '../types';
import { GratitudeCheckIn, getLocalDayKey, getDeviceTimezone } from '../utils/dayRollover';
import {
  getGratitudeCheckIns,
  saveGratitudeCheckIns,
  getCheckInCountForDay,
  markDayComplete,
  recordMissedDay,
  checkDayRollover,
  DayRolloverResult,
} from '../utils/dayRolloverManager';
import {
  registerForPushNotifications,
  scheduleNotifications,
  getNotificationSettings,
} from '../utils/notifications';
import { MoodEntry, MoodType, EnergyLevel } from '../data/moodTracking';

export interface GlowPointsEntry {
  id: string;
  points: number;
  reason: string;
  timestamp: string;
}

interface AppContextType {
  appState: AppState;
  glowPoints: number;
  getTodayProgress: () => DayProgress;
  updateTasks: (tasks: Task[]) => Promise<void>;
  updateGuidedSessions: (sessions: GuidedSession[]) => Promise<void>;
  completeMeditation: () => Promise<void>;
  updateGratitudeEntry: (entry: string) => Promise<void>;
  startChallenge: () => Promise<void>;
  resetChallenge: () => Promise<void>;
  // New gratitude check-in methods
  addGratitudeCheckIn: (text: string) => Promise<GratitudeCheckIn>;
  getTodayCheckIns: () => Promise<GratitudeCheckIn[]>;
  getTodayCheckInCount: () => Promise<number>;
  isTodayGratitudeComplete: () => Promise<boolean>;
  markYesterdayComplete: () => Promise<void>;
  handleMissedDay: () => Promise<void>;
  checkForDayRollover: () => Promise<DayRolloverResult>;
  // Glow points
  addGlowPoints: (points: number, reason: string) => Promise<void>;
  getGlowPointsHistory: () => Promise<GlowPointsEntry[]>;
  // Mood tracking
  saveMoodEntry: (mood: MoodType, energy: EnergyLevel, note?: string) => Promise<MoodEntry>;
  getTodayMood: () => Promise<MoodEntry | null>;
  getMoodHistory: () => Promise<MoodEntry[]>;
}

const defaultAppState: AppState = {
  currentStreak: 0,
  totalDays: 0,
  startDate: null,
  challengeActive: false,
  dailyProgress: {},
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(defaultAppState);
  const [glowPoints, setGlowPoints] = useState<number>(0);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    loadAppState();
    loadGlowPoints();
    initializeNotifications();
  }, []);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    saveAppState();
  }, [appState]);

  // Save glow points whenever they change
  useEffect(() => {
    saveGlowPoints();
  }, [glowPoints]);

  const loadAppState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('appState');
      if (savedState) {
        setAppState(JSON.parse(savedState));
      }
    } catch (error) {
      console.error('Error loading app state:', error);
    }
  };

  const saveAppState = async () => {
    try {
      await AsyncStorage.setItem('appState', JSON.stringify(appState));
    } catch (error) {
      console.error('Error saving app state:', error);
    }
  };

  const loadGlowPoints = async () => {
    try {
      const saved = await AsyncStorage.getItem('@glow_points');
      if (saved) {
        setGlowPoints(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading glow points:', error);
    }
  };

  const saveGlowPoints = async () => {
    try {
      await AsyncStorage.setItem('@glow_points', JSON.stringify(glowPoints));
    } catch (error) {
      console.error('Error saving glow points:', error);
    }
  };

  const initializeNotifications = async () => {
    try {
      const hasPermission = await registerForPushNotifications();
      if (hasPermission) {
        const settings = await getNotificationSettings();
        await scheduleNotifications(settings);
        console.log('✅ Notifications initialized');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const getTodayString = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const getTodayProgress = (): DayProgress => {
    const today = getTodayString();
    if (!appState.dailyProgress[today]) {
      return {
        date: today,
        tasks: [],
        guidedSessions: [],
        meditationCompleted: false,
        gratitudeEntry: '',
        isComplete: false,
      };
    }
    return appState.dailyProgress[today];
  };

  const updateTodayProgress = (updater: (progress: DayProgress) => DayProgress) => {
    const today = getTodayString();
    setAppState((prev) => ({
      ...prev,
      dailyProgress: {
        ...prev.dailyProgress,
        [today]: updater(getTodayProgress()),
      },
    }));
  };

  const updateTasks = async (tasks: Task[]) => {
    updateTodayProgress((progress) => ({
      ...progress,
      tasks,
    }));
  };

  const updateGuidedSessions = async (sessions: GuidedSession[]) => {
    updateTodayProgress((progress) => ({
      ...progress,
      guidedSessions: sessions,
    }));
  };

  const completeMeditation = async () => {
    updateTodayProgress((progress) => ({
      ...progress,
      meditationCompleted: true,
    }));
  };

  const updateGratitudeEntry = async (entry: string) => {
    updateTodayProgress((progress) => ({
      ...progress,
      gratitudeEntry: entry,
    }));
  };

  const startChallenge = async () => {
    setAppState({
      ...defaultAppState,
      challengeActive: true,
      startDate: new Date().toISOString(),
      currentStreak: 0,
      totalDays: 0,
    });
  };

  const resetChallenge = async () => {
    setAppState(defaultAppState);
  };

  // Gratitude check-in methods
  const addGratitudeCheckIn = async (text: string): Promise<GratitudeCheckIn> => {
    const localDayKey = getLocalDayKey();
    const timezoneId = getDeviceTimezone();
    const checkIn: GratitudeCheckIn = {
      id: Date.now().toString(),
      localDayKey,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      timezoneId,
    };

    const checkIns = await getGratitudeCheckIns();
    checkIns.push(checkIn);
    await saveGratitudeCheckIns(checkIns);

    // Award Glow points for gratitude check-in
    await addGlowPoints(10, 'Gratitude check-in');

    // Check if today is now complete (3/3)
    const count = await getCheckInCountForDay(localDayKey);
    if (count >= 3) {
      // Bonus points for completing daily goal
      await addGlowPoints(20, 'Completed 3 daily gratitude check-ins');
      await markDayComplete(localDayKey);
      // Mark gratitude task complete in 45 NOW
      const today = getTodayString();
      setAppState((prev) => {
        const todayProgress = prev.dailyProgress[today] || getTodayProgress();
        // Find or create gratitude task
        const tasks = todayProgress.tasks || [];
        let gratitudeTask = tasks.find(t => t.text.toLowerCase().includes('gratitude') || t.id === 'gratitude-task');
        
        if (!gratitudeTask) {
          // Create gratitude task if it doesn't exist
          gratitudeTask = {
            id: 'gratitude-task',
            text: 'Gratitude Journal (3 check-ins)',
            completed: true,
            isMustDo: true,
            createdAt: new Date().toISOString(),
          };
          tasks.push(gratitudeTask);
        } else {
          // Mark existing task as complete
          gratitudeTask.completed = true;
        }

        return {
          ...prev,
          dailyProgress: {
            ...prev.dailyProgress,
            [today]: {
              ...todayProgress,
              tasks,
              gratitudeEntry: 'COMPLETE',
            },
          },
        };
      });
    }

    return checkIn;
  };

  const getTodayCheckIns = async (): Promise<GratitudeCheckIn[]> => {
    const checkIns = await getGratitudeCheckIns();
    const todayKey = getLocalDayKey();
    return checkIns.filter(ci => ci.localDayKey === todayKey).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getTodayCheckInCount = async (): Promise<number> => {
    return await getCheckInCountForDay(getLocalDayKey());
  };

  const isTodayGratitudeComplete = async (): Promise<boolean> => {
    const count = await getTodayCheckInCount();
    return count >= 3;
  };

  const markYesterdayComplete = async (): Promise<void> => {
    const yesterdayKey = getLocalDayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
    await markDayComplete(yesterdayKey);
    // Update 45 NOW for yesterday
    const yesterdayProgress = appState.dailyProgress[yesterdayKey];
    if (yesterdayProgress) {
      setAppState((prev) => ({
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          [yesterdayKey]: {
            ...yesterdayProgress,
            gratitudeEntry: 'COMPLETE',
          },
        },
      }));
    }
  };

  const handleMissedDay = async (): Promise<void> => {
    const yesterdayKey = getLocalDayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
    await recordMissedDay(yesterdayKey);
    // Break streak logic would go here if needed
  };

  const checkForDayRollover = async (): Promise<DayRolloverResult> => {
    return await checkDayRollover();
  };

  // Glow points functions
  const addGlowPoints = async (points: number, reason: string): Promise<void> => {
    const entry: GlowPointsEntry = {
      id: Date.now().toString(),
      points,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      // Add to history
      const history = await getGlowPointsHistory();
      history.push(entry);
      await AsyncStorage.setItem('@glow_points_history', JSON.stringify(history));

      // Update total
      setGlowPoints((prev) => prev + points);

      console.log(`✨ +${points} Glow points: ${reason}`);
    } catch (error) {
      console.error('Error adding glow points:', error);
    }
  };

  const getGlowPointsHistory = async (): Promise<GlowPointsEntry[]> => {
    try {
      const history = await AsyncStorage.getItem('@glow_points_history');
      if (history) {
        return JSON.parse(history);
      }
      return [];
    } catch (error) {
      console.error('Error loading glow points history:', error);
      return [];
    }
  };

  // Mood tracking functions
  const saveMoodEntry = async (mood: MoodType, energy: EnergyLevel, note?: string): Promise<MoodEntry> => {
    const todayKey = getLocalDayKey();
    const entry: MoodEntry = {
      id: Date.now().toString(),
      mood,
      energy,
      date: todayKey,
      timestamp: new Date().toISOString(),
      note,
    };

    try {
      // Load existing entries
      const entries = await getMoodHistory();

      // Check if mood already logged today
      const existingTodayIndex = entries.findIndex(e => e.date === todayKey);

      if (existingTodayIndex !== -1) {
        // Update existing entry
        entries[existingTodayIndex] = entry;
      } else {
        // Add new entry
        entries.push(entry);
        // Award glow points for first mood check-in of the day
        await addGlowPoints(5, 'Mood check-in');
      }

      // Save to storage
      await AsyncStorage.setItem('@mood_entries', JSON.stringify(entries));

      // Update today's progress with mood entry ID
      updateTodayProgress((progress) => ({
        ...progress,
        moodEntryId: entry.id,
      }));

      console.log('✨ Mood entry saved:', entry);
      return entry;
    } catch (error) {
      console.error('Error saving mood entry:', error);
      throw error;
    }
  };

  const getTodayMood = async (): Promise<MoodEntry | null> => {
    try {
      const entries = await getMoodHistory();
      const todayKey = getLocalDayKey();
      const todayEntry = entries.find(e => e.date === todayKey);
      return todayEntry || null;
    } catch (error) {
      console.error('Error getting today mood:', error);
      return null;
    }
  };

  const getMoodHistory = async (): Promise<MoodEntry[]> => {
    try {
      const data = await AsyncStorage.getItem('@mood_entries');
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading mood history:', error);
      return [];
    }
  };

  return (
    <AppContext.Provider
      value={{
        appState,
        glowPoints,
        getTodayProgress,
        updateTasks,
        updateGuidedSessions,
        completeMeditation,
        updateGratitudeEntry,
        startChallenge,
        resetChallenge,
        addGratitudeCheckIn,
        getTodayCheckIns,
        getTodayCheckInCount,
        isTodayGratitudeComplete,
        markYesterdayComplete,
        handleMissedDay,
        checkForDayRollover,
        addGlowPoints,
        getGlowPointsHistory,
        saveMoodEntry,
        getTodayMood,
        getMoodHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
