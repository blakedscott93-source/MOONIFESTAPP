import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef, ReactNode } from 'react';
import { Platform } from 'react-native';
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
import {
  REQUIRED_DAILY_GRATITUDE_CHECKINS,
  MIN_CHECKINS_FOR_COMPLETION,
  REQUIRED_DAILY_AFFIRMATION_SESSIONS,
  REQUIRED_DAILY_MUST_DO_TASKS,
  POINTS
} from '../utils/constants';
import { ManifestationGoal, GoalCategory } from '../types/goals';
import { loadGoals, getPrimaryGoals, updateGoalMetrics } from '../utils/goalManager';

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
  // Goals
  userGoals: ManifestationGoal[];
  goalCategories: GoalCategory[];
  refreshGoals: () => Promise<void>;
  trackGoalActivity: (goalId: string, activityType: 'affirmation' | 'journal' | 'task' | 'meditation') => Promise<void>;
  // Vision Board
  markVisionImageAdded: () => Promise<void>;
  hasVisionImageAddedToday: () => boolean;
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
  if (__DEV__) {
    console.log('✅ AppProvider rendering...');
  }
  
  const [appState, setAppState] = useState<AppState>(defaultAppState);
  const [glowPoints, setGlowPoints] = useState<number>(0);
  const [userGoals, setUserGoals] = useState<ManifestationGoal[]>([]);
  const [goalCategories, setGoalCategories] = useState<GoalCategory[]>([]);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    loadAppState();
    loadGlowPoints();
    loadUserGoals();
    // Only initialize notifications on native platforms
    if (Platform.OS !== 'web') {
      initializeNotifications();
    }
  }, []);

  // Recalculate streaks on initial load (after state is loaded from storage)
  useEffect(() => {
    // Use a small delay to ensure state is fully loaded
    const timer = setTimeout(() => {
      if (Object.keys(appState.dailyProgress).length > 0) {
        const { currentStreak, totalDays } = calculateStreaks(appState.dailyProgress);
        // Only update if values are different
        setAppState(prev => {
          if (currentStreak !== prev.currentStreak || totalDays !== prev.totalDays) {
            return { ...prev, currentStreak, totalDays };
          }
          return prev;
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  // Debounce AsyncStorage saves to prevent excessive writes
  const saveAppStateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveGlowPointsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_DELAY = 300; // ms

  // Save state to AsyncStorage whenever it changes (debounced)
  useEffect(() => {
    if (saveAppStateTimeoutRef.current) {
      clearTimeout(saveAppStateTimeoutRef.current);
    }
    saveAppStateTimeoutRef.current = setTimeout(() => {
      saveAppState();
    }, DEBOUNCE_DELAY);
    
    return () => {
      if (saveAppStateTimeoutRef.current) {
        clearTimeout(saveAppStateTimeoutRef.current);
      }
    };
  }, [appState]);

  // Save glow points whenever they change (debounced)
  useEffect(() => {
    if (saveGlowPointsTimeoutRef.current) {
      clearTimeout(saveGlowPointsTimeoutRef.current);
    }
    saveGlowPointsTimeoutRef.current = setTimeout(() => {
      saveGlowPoints();
    }, DEBOUNCE_DELAY);
    
    return () => {
      if (saveGlowPointsTimeoutRef.current) {
        clearTimeout(saveGlowPointsTimeoutRef.current);
      }
    };
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

  const loadUserGoals = async () => {
    try {
      const goals = await loadGoals();
      setUserGoals(goals);
      // Extract unique goal categories from user's goals
      const categories = goals.map(g => g.category);
      setGoalCategories(categories);
      console.log('✅ Loaded', goals.length, 'user goals');
    } catch (error) {
      console.error('Error loading user goals:', error);
    }
  };

  const refreshGoals = async () => {
    await loadUserGoals();
  };

  const trackGoalActivity = async (
    goalId: string,
    activityType: 'affirmation' | 'journal' | 'task' | 'meditation'
  ) => {
    try {
      await updateGoalMetrics(goalId, activityType);
      // Refresh goals to get updated progress
      await loadUserGoals();
      console.log(`✅ Tracked ${activityType} for goal ${goalId}`);
    } catch (error) {
      console.error('Error tracking goal activity:', error);
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

  // Memoize getTodayProgress to prevent unnecessary recalculations
  const getTodayProgress = useCallback((): DayProgress => {
    const today = getTodayString();
    if (!appState.dailyProgress[today]) {
      return {
        date: today,
        tasks: [],
        guidedSessions: [],
        meditationCompleted: false,
        gratitudeEntry: '',
        visionImageAddedToday: false,
        isComplete: false,
      };
    }
    return appState.dailyProgress[today];
  }, [appState.dailyProgress]);

  const updateTodayProgress = (updater: (progress: DayProgress) => DayProgress) => {
    const today = getTodayString();
    setAppState((prev) => {
      const updatedProgress = updater(getTodayProgress());
      // Check if day is complete after update (using sync version)
      const isComplete = checkDayCompleteSync(updatedProgress);
      const finalProgress = { ...updatedProgress, isComplete };
      
      const newState = {
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          [today]: finalProgress,
        },
      };
      
      // If day just became complete, recalculate streaks and total days
      if (isComplete && !updatedProgress.isComplete) {
        const { currentStreak, totalDays } = calculateStreaks(newState.dailyProgress);
        return {
          ...newState,
          currentStreak,
          totalDays,
        };
      }
      
      return newState;
    });
  };

  // Check if all daily requirements are complete
  const checkDayComplete = async (progress: DayProgress, date: string): Promise<boolean> => {
    // Check must-do tasks
    const mustDoTasks = progress.tasks?.filter(t => t.isMustDo) || [];
    const allTasksComplete = mustDoTasks.length >= REQUIRED_DAILY_MUST_DO_TASKS &&
      mustDoTasks.every(t => t.completed && t.text.trim() !== '');
    
    // Check affirmations (3 sessions)
    const affirmationsComplete = (progress.guidedSessions?.length || 0) >= REQUIRED_DAILY_AFFIRMATION_SESSIONS;
    
    // Check meditation
    const meditationComplete = progress.meditationCompleted === true;
    
    // Check gratitude (3 check-ins)
    const gratitudeComplete = await isTodayGratitudeComplete();
    // Also check if gratitudeEntry indicates completion (legacy check)
    const gratitudeEntryComplete = progress.gratitudeEntry === 'COMPLETE' || 
      (progress.gratitudeEntry?.trim().length || 0) > 0;
    
    // Check vision image (always required for now - can be gated by challengeActive later)
    const visionImageComplete = progress.visionImageAddedToday === true;
    
    return allTasksComplete && affirmationsComplete && meditationComplete && 
           (gratitudeComplete || gratitudeEntryComplete) && visionImageComplete;
  };

  // Synchronous version for use in updateTodayProgress (without async gratitude check)
  const checkDayCompleteSync = (progress: DayProgress): boolean => {
    // Check must-do tasks
    const mustDoTasks = progress.tasks?.filter(t => t.isMustDo) || [];
    const allTasksComplete = mustDoTasks.length >= REQUIRED_DAILY_MUST_DO_TASKS &&
      mustDoTasks.every(t => t.completed && t.text.trim() !== '');
    
    // Check affirmations (3 sessions)
    const affirmationsComplete = (progress.guidedSessions?.length || 0) >= REQUIRED_DAILY_AFFIRMATION_SESSIONS;
    
    // Check meditation
    const meditationComplete = progress.meditationCompleted === true;
    
    // Check gratitude entry (legacy format)
    const gratitudeEntryComplete = progress.gratitudeEntry === 'COMPLETE' || 
      (progress.gratitudeEntry?.trim().length || 0) > 0;
    
    // Check vision image (always required for now - can be gated by challengeActive later)
    const visionImageComplete = progress.visionImageAddedToday === true;
    
    return allTasksComplete && affirmationsComplete && meditationComplete && gratitudeEntryComplete && visionImageComplete;
  };

  // Calculate streaks and total days from daily progress
  const calculateStreaks = (dailyProgress: { [date: string]: DayProgress }): { currentStreak: number; totalDays: number } => {
    // Sort dates chronologically
    const dates = Object.keys(dailyProgress)
      .filter(date => dailyProgress[date].isComplete)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    if (dates.length === 0) {
      return { currentStreak: 0, totalDays: 0 };
    }
    
    // Calculate current streak (consecutive days ending today)
    const today = getTodayString();
    let currentStreak = 0;
    
    // Start from today and count backwards
    let currentDate = new Date();
    while (true) {
      const dateKey = getLocalDayKey(currentDate);
      // Check both formats - ISO date string and local day key
      const progress = dailyProgress[dateKey] || dailyProgress[currentDate.toISOString().split('T')[0]];
      if (progress?.isComplete) {
        currentStreak++;
        // Go to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Total days is just the count of completed days
    const totalDays = dates.length;
    
    return { currentStreak, totalDays };
  };

  const updateTasks = useCallback(async (tasks: Task[]) => {
    updateTodayProgress((progress) => ({
      ...progress,
      tasks,
    }));
    // Recalculate streaks after task update
    setAppState((prev) => {
      const { currentStreak, totalDays } = calculateStreaks(prev.dailyProgress);
      return { ...prev, currentStreak, totalDays };
    });
  }, []);

  const updateGuidedSessions = useCallback(async (sessions: GuidedSession[]) => {
    updateTodayProgress((progress) => ({
      ...progress,
      guidedSessions: sessions,
    }));
    // Recalculate streaks after session update
    setAppState((prev) => {
      const { currentStreak, totalDays } = calculateStreaks(prev.dailyProgress);
      return { ...prev, currentStreak, totalDays };
    });
  }, []);

  const completeMeditation = useCallback(async () => {
    updateTodayProgress((progress) => ({
      ...progress,
      meditationCompleted: true,
    }));
    // Recalculate streaks after meditation completion
    setAppState((prev) => {
      const { currentStreak, totalDays } = calculateStreaks(prev.dailyProgress);
      return { ...prev, currentStreak, totalDays };
    });
  }, []);

  const updateGratitudeEntry = useCallback(async (entry: string) => {
    updateTodayProgress((progress) => ({
      ...progress,
      gratitudeEntry: entry,
    }));
  }, []);

  const startChallenge = useCallback(async () => {
    setAppState({
      ...defaultAppState,
      challengeActive: true,
      startDate: new Date().toISOString(),
      currentStreak: 0,
      totalDays: 0,
    });
  }, []);

  const resetChallenge = useCallback(async () => {
    setAppState(defaultAppState);
  }, []);

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
    await addGlowPoints(POINTS.GRATITUDE_CHECKIN, 'Gratitude check-in');

    // Check if today is now complete
    const count = await getCheckInCountForDay(localDayKey);
    if (count >= MIN_CHECKINS_FOR_COMPLETION) {
      // Bonus points for completing daily goal
      await addGlowPoints(POINTS.GRATITUDE_COMPLETE_DAILY, `Completed ${REQUIRED_DAILY_GRATITUDE_CHECKINS} daily gratitude check-ins`);
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
            text: `Gratitude Journal (${REQUIRED_DAILY_GRATITUDE_CHECKINS} check-ins)`,
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
        await addGlowPoints(POINTS.MOOD_CHECKIN, 'Mood check-in');
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

  // Vision Board - Mark vision image as added today
  const markVisionImageAdded = async (): Promise<void> => {
    updateTodayProgress((progress) => ({
      ...progress,
      visionImageAddedToday: true,
    }));
    // Award glow points for adding vision image
    await addGlowPoints(POINTS.VISION_IMAGE || 10, 'Added vision image');
  };

  // Vision Board - Check if vision image was added today
  const hasVisionImageAddedToday = (): boolean => {
    const todayProgress = getTodayProgress();
    return todayProgress.visionImageAddedToday === true;
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
        userGoals,
        goalCategories,
        refreshGoals,
        trackGoalActivity,
        markVisionImageAdded,
        hasVisionImageAddedToday,
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
