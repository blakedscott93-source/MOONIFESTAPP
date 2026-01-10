import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { RefreshControl, Animated, Alert, TouchableOpacity, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTabBarInset } from '../hooks/useTabBarInset';
import { useApp } from '../context/AppContext';
import { Screen } from '../components/layout/Screen';
import { tokens } from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';
import { MoodCheckIn } from '../components/MoodCheckIn';
import { MoodType, EnergyLevel } from '../data/moodTracking';
import { DailySpin } from '../components/DailySpin';
import { getQuoteOfTheDay, Quote } from '../data/quotes';
import { canSpinToday, DailySpinReward, getNextStreakMilestone, getDaysUntilMilestone } from '../utils/rewards';
import { mediumHaptic, successHaptic } from '../utils/haptics';
import { Confetti } from '../components/Confetti';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REQUIRED_DAILY_AFFIRMATION_SESSIONS, REQUIRED_DAILY_MUST_DO_TASKS, REQUIRED_DAILY_GRATITUDE_CHECKINS } from '../utils/constants';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { trackEvent } from '../utils/analytics';
import { TodayScreenProps } from '../types/navigation';
import { AdBanner } from '../components/ads/BannerAd';
import { isPremiumUser } from '../utils/premium';
import { HomeProgressCard } from '../components/home/HomeProgressCard';
import { HomeDailyTasks, DailyPractice } from '../components/home/HomeDailyTasks';
import { HomeSecondaryActions } from '../components/home/HomeSecondaryActions';
import { DayCompleteCelebration } from '../components/home/DayCompleteCelebration';
import { IncompleteDayModal } from '../components/IncompleteDayModal';
import { IncompleteDayInfo } from '../utils/dayRolloverManager';

export default function HomeScreen({ navigation, route }: TodayScreenProps) {
  useScreenTracking('Today');
  const tabBarInset = useTabBarInset();
  const { theme } = useTheme();
  const {
    appState,
    getTodayProgress,
    saveMoodEntry,
    getTodayMood,
    addGlowPoints,
    hasVisionImageAddedToday,
    resetGratitude,
    resetMeditation,
    resetVisionImage,
    checkForDayRollover,
    markYesterdayComplete,
    handleMissedDay,
    resetChallenge,
  } = useApp();

  // Memoize todayProgress to prevent recalculation on every render
  const todayProgress = useMemo(() => getTodayProgress(), [getTodayProgress]);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [hasSpunToday, setHasSpunToday] = useState(true);
  const [todayMoodEntry, setTodayMoodEntry] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const [userGoal, setUserGoal] = useState<string>('');
  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [shouldPromptVisionImage, setShouldPromptVisionImage] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteDay, setIncompleteDay] = useState<IncompleteDayInfo | null>(null);
  const gratitudeLabel = REQUIRED_DAILY_GRATITUDE_CHECKINS === 1 ? 'gratitude' : 'gratitudes';

  // Animation for streak icon pulse
  const streakPulseAnim = useRef(new Animated.Value(1)).current;

  // Check if navigated from Daily Vision Image practice
  useEffect(() => {
    if (route?.params?.fromDailyVisionImage) {
      setShouldPromptVisionImage(true);
      // Clear the param to prevent re-triggering
      navigation.setParams({ fromDailyVisionImage: undefined });
    }
  }, [route?.params?.fromDailyVisionImage, navigation]);

  const loadTodayMood = useCallback(async () => {
    const mood = await getTodayMood();
    setTodayMoodEntry(mood);
  }, [getTodayMood]);

  const loadOnboardingData = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('@onboarding_data');
      if (data) {
        const parsed = JSON.parse(data);
        setUserName(parsed.name || '');
        setUserGoal(parsed.primaryGoal || '');
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    }
  }, []);

  const checkSpinStatus = useCallback(async () => {
    const canSpin = await canSpinToday();
    setHasSpunToday(!canSpin);
  }, []);

  const checkDayRolloverStatus = useCallback(async () => {
    const result = await checkForDayRollover();
    if (result.hasRollover && result.incompleteDay) {
      setIncompleteDay(result.incompleteDay);
      setShowIncompleteModal(true);
    }
  }, [checkForDayRollover]);

  const loadInitialData = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      await Promise.all([
        loadTodayMood(),
        loadOnboardingData(),
        checkSpinStatus(),
        checkDayRolloverStatus(),
      ]);
      setDailyQuote(getQuoteOfTheDay());
    } finally {
      setIsInitialLoading(false);
    }
  }, [loadTodayMood, loadOnboardingData, checkSpinStatus]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, [loadInitialData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Force refresh when screen gains focus (returning from action screens)
  useFocusEffect(
    useCallback(() => {
      // Reload mood and spin status to ensure UI is up to date
      loadTodayMood();
      checkSpinStatus();
      checkDayRolloverStatus();
      isPremiumUser().then(setIsPremium);
      // todayProgress will auto-update via useMemo when AppContext changes
    }, [loadTodayMood, checkSpinStatus])
  );

  // Pulse animation for streak icon when streak is active
  useEffect(() => {
    if (appState.currentStreak > 0) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(streakPulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(streakPulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      streakPulseAnim.setValue(1);
    }
  }, [appState.currentStreak, streakPulseAnim]);

  const handleMoodSubmit = useCallback(async (mood: MoodType, energy: EnergyLevel, note?: string) => {
    trackEvent('mood_check_in', { mood, energy, has_note: !!note });
    await saveMoodEntry(mood, energy, note);
    await loadTodayMood();
    successHaptic();
  }, [saveMoodEntry]);

  const handleSpinReward = useCallback(async (reward: DailySpinReward) => {
    trackEvent('daily_spin_completed', { reward_type: reward.type, reward_value: reward.value });
    // Add points based on reward type
    if (reward.type === 'points' && addGlowPoints) {
      await addGlowPoints(reward.value, `Daily spin reward: ${reward.label}`);
    }

    // Show confetti for rare rewards
    if (reward.rarity === 'rare' || reward.rarity === 'legendary') {
      setShowConfetti(true);
    }

    setHasSpunToday(true);
    successHaptic();
  }, [addGlowPoints]);

  const handleOpenSpin = useCallback(() => {
    mediumHaptic();
    setShowSpinModal(true);
  }, []);

  const today = new Date();
  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleResetTask = useCallback((title: string, onReset: () => Promise<void>) => {
    mediumHaptic();
    Alert.alert(
      "Mark as incomplete?",
      `This will remove your progress for "${title}" today.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Incomplete",
          style: "destructive",
          onPress: async () => {
            await onReset();
            successHaptic();
          }
        }
      ]
    );
  }, []);

  const handleMarkYesterdayComplete = async () => {
    await markYesterdayComplete();
    setShowIncompleteModal(false);
    setIncompleteDay(null);
  };

  const handleRestartChallenge = async () => {
    await resetChallenge();
    setShowIncompleteModal(false);
    setIncompleteDay(null);
  };

  const handleKeepGoing = async () => {
    await handleMissedDay();
    setShowIncompleteModal(false);
    setIncompleteDay(null);
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      "Reset Onboarding?",
      "This will clear your onboarding status and restart the quiz.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem('@hasSeenOnboardingPaywall');
            await AsyncStorage.removeItem('@onboarding_data');
            navigation.getParent()?.reset({
              index: 0,
              routes: [{ name: 'OnboardingQuiz' as never }],
            });
          }
        }
      ]
    );
  };

  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const mustDoTasks = useMemo(() =>
    todayProgress.tasks.filter(t => t.isMustDo),
    [todayProgress.tasks]
  );
  const mustDoCompleted = useMemo(() =>
    mustDoTasks.filter(t => t.completed).length,
    [mustDoTasks]
  );

  // Track previous streak to detect milestone changes
  const previousStreak = useRef(appState.currentStreak);
  const ratingPromptTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for rating prompt on streak milestones
  useEffect(() => {
    const checkRatingPrompt = async () => {
      // Only prompt when streak reaches a milestone (not every time)
      if (
        [7, 14, 21, 30, 45].includes(appState.currentStreak) &&
        previousStreak.current !== appState.currentStreak
      ) {
        previousStreak.current = appState.currentStreak;

        // Delay to avoid interrupting user flow
        if (ratingPromptTimeoutRef.current) {
          clearTimeout(ratingPromptTimeoutRef.current);
        }
        ratingPromptTimeoutRef.current = setTimeout(async () => {
          const { promptForRating } = await import('../utils/appRating');
          await promptForRating({
            streak: appState.currentStreak,
            totalDays: appState.totalDays,
          });
        }, 3000);
      }
    };
    checkRatingPrompt();

    return () => {
      if (ratingPromptTimeoutRef.current) {
        clearTimeout(ratingPromptTimeoutRef.current);
        ratingPromptTimeoutRef.current = null;
      }
    };
  }, [appState.currentStreak, appState.totalDays]);

  // Memoize daily practices array to prevent recreation on every render
  const dailyPractices: DailyPractice[] = useMemo(() => {
    const practices = [
      {
        id: 'must-do-tasks',
        title: `${REQUIRED_DAILY_MUST_DO_TASKS} Must-Do Tasks`,
        subtitle: `${mustDoCompleted}/${REQUIRED_DAILY_MUST_DO_TASKS} completed`,
        icon: 'star',
        color: '#FFD700',
        completed: mustDoCompleted === REQUIRED_DAILY_MUST_DO_TASKS,
        action: () => navigation.getParent()?.navigate('TasksScreen' as never),
      },
      {
        id: 'guided-affirmations',
        title: 'Guided Affirmations',
        subtitle: `${todayProgress.guidedSessions?.length || 0}/${REQUIRED_DAILY_AFFIRMATION_SESSIONS} sessions`,
        icon: 'sparkles',
        color: tokens.colors.accent,
        completed: (todayProgress.guidedSessions?.length || 0) >= REQUIRED_DAILY_AFFIRMATION_SESSIONS,
        action: () => navigation.navigate('Affirmations'),
      },
      {
        id: 'gratitude',
        title: 'Gratitude Journal',
        subtitle: `Write ${REQUIRED_DAILY_GRATITUDE_CHECKINS} ${gratitudeLabel}`,
        icon: 'heart',
        color: '#FF6B9D',
        completed: todayProgress.gratitudeEntry.trim().length > 0,
        action: () => navigation.navigate('Journal'),
        onLongPress: () => {
          if (todayProgress.gratitudeEntry.trim().length > 0) {
            handleResetTask('Gratitude Journal', resetGratitude);
          }
        }
      },
      {
        id: 'meditation',
        title: 'Guided Meditation',
        subtitle: 'Complete once',
        icon: 'leaf',
        color: '#4ECDC4',
        completed: todayProgress.meditationCompleted,
        action: () => navigation.getParent()?.navigate('MeditationScreen' as never),
        onLongPress: () => {
          if (todayProgress.meditationCompleted) {
            handleResetTask('Guided Meditation', resetMeditation);
          }
        }
      },
    ];

    // Add Daily Vision Image (always show for now - can be gated by challengeActive later)
    const visionImageAdded = hasVisionImageAddedToday();
    practices.push({
      id: 'vision-image',
      title: 'Daily Vision Image',
      subtitle: 'Add 1 image to your vision board',
      icon: 'image',
      color: '#9D4EDD',
      completed: visionImageAdded,
      action: () => navigation.navigate('Vision', { fromDailyVisionImage: true }),
      onLongPress: () => {
        if (visionImageAdded) {
          handleResetTask('Daily Vision Image', resetVisionImage);
        }
      }
    });

    return practices;
  }, [
    mustDoCompleted,
    todayProgress.guidedSessions?.length,
    todayProgress.gratitudeEntry,
    todayProgress.meditationCompleted,
    gratitudeLabel,
    hasVisionImageAddedToday,
    navigation,
  ]);

  const completedCount = useMemo(() =>
    dailyPractices.filter(p => p.completed).length,
    [dailyPractices]
  );
  const progressPercentage = useMemo(() =>
    (completedCount / dailyPractices.length) * 100,
    [completedCount, dailyPractices.length]
  );

  // Check if day is complete (all 5 tasks done)
  const isDayComplete = useMemo(() =>
    completedCount === dailyPractices.length,
    [completedCount, dailyPractices.length]
  );

  return (
    <Screen
      scroll
      title={greeting()}
      subtitle={dateString}
      rightAction={{
        icon: 'settings-outline',
        onPress: () => navigation.getParent()?.navigate('SettingsScreen' as never),
        label: 'Open Settings',
      }}
      headerStyle="compact"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tokens.colors.accent}
          colors={[tokens.colors.accent]}
        />
      }
      contentContainerStyle={{
        paddingTop: tokens.spacing.xs,
        paddingBottom: tabBarInset + 100, // Extra padding to clear floating tab bar
      }}
    >
      {/* TODAY = THE COCKPIT - Clear Progress Overview */}
      <HomeProgressCard
        completedCount={completedCount}
        totalCount={dailyPractices.length}
        progressPercentage={progressPercentage}
        isDayComplete={isDayComplete}
      />

      {/* Day Complete Celebration */}
      {isDayComplete && (
        <DayCompleteCelebration streak={appState.currentStreak} />
      )}

      {/* 5 DAILY TASKS - Primary Focus */}
      <HomeDailyTasks practices={dailyPractices} />

      {/* SECONDARY SECTIONS - Deemphasized */}
      <HomeSecondaryActions
        todayMoodEntry={todayMoodEntry}
        onMoodPress={() => setShowMoodModal(true)}
        streak={appState.currentStreak}
        streakPulseAnim={streakPulseAnim}
        onStreakPress={() => navigation.navigate('45 NOW')}
        hasSpunToday={hasSpunToday}
        onSpinPress={handleOpenSpin}
        dailyQuote={dailyQuote}
      />

      {/* DEBUG: Reset Onboarding Trigger */}
      <TouchableOpacity
        style={{ padding: 20, alignItems: 'center', opacity: 0.5 }}
        onPress={handleResetOnboarding}
      >
        <Text style={[{ color: tokens.colors.textSecondary }, tokens.typography.small]}>
          Dev: Reset Onboarding Flow
        </Text>
      </TouchableOpacity>

      {/* Ad Banner - Only for free users */}
      {!isPremium && <AdBanner />}

      {/* Mood Check-In Modal */}
      <MoodCheckIn
        visible={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onSubmit={handleMoodSubmit}
      />

      {/* Daily Spin Modal */}
      <DailySpin
        visible={showSpinModal}
        onClose={() => setShowSpinModal(false)}
        onRewardClaimed={handleSpinReward}
      />

      {/* Celebration Confetti */}
      <Confetti
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />


      {/* Incomplete Day Modal */}
      <IncompleteDayModal
        visible={showIncompleteModal}
        incompleteDay={incompleteDay}
        onMarkComplete={handleMarkYesterdayComplete}
        onRestartChallenge={handleRestartChallenge}
        onKeepGoing={handleKeepGoing}
      />
    </Screen>
  );
}
