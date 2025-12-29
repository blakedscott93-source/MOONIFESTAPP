import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTabBarInset } from '../hooks/useTabBarInset';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SectionCard, ProgressBar, GlassCard } from '../components/ui';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/layout/Screen';
import { UnifiedCard } from '../components/UnifiedCard';
import { tokens } from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';
import { MoodCheckIn } from '../components/MoodCheckIn';
import { MoodType, EnergyLevel, getMoodOption, getEnergyOption } from '../data/moodTracking';
import { DailySpin, DailySpinButton } from '../components/DailySpin';
import { getQuoteOfTheDay, Quote } from '../data/quotes';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { canSpinToday, DailySpinReward, getNextStreakMilestone, getDaysUntilMilestone } from '../utils/rewards';
import { mediumHaptic, successHaptic } from '../utils/haptics';
import { Confetti } from '../components/Confetti';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REQUIRED_DAILY_AFFIRMATION_SESSIONS, REQUIRED_DAILY_MUST_DO_TASKS } from '../utils/constants';
import { getGoalCategory } from '../data/goalCategories';

const GOAL_MESSAGES: Record<string, string> = {
  wealth: "Let's manifest abundance",
  love: "Let's attract meaningful connections",
  health: "Let's nurture your wellbeing",
  career: "Let's elevate your professional path",
  happiness: "Let's cultivate joy",
  spirituality: "Let's deepen your spiritual practice",
};

// Screen padding constant
const SCREEN_PAD = 16;

export default function HomeScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { theme, isDark } = useTheme();
  const { appState, getTodayProgress, saveMoodEntry, getTodayMood, addGlowPoints, userGoals, goalCategories, hasVisionImageAddedToday, updateTasks } = useApp();
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

  const loadInitialData = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      await Promise.all([
        loadTodayMood(),
        loadOnboardingData(),
        checkSpinStatus(),
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
    await saveMoodEntry(mood, energy, note);
    await loadTodayMood();
    successHaptic();
  }, [saveMoodEntry]);

  const handleSpinReward = useCallback(async (reward: DailySpinReward) => {
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

  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Memoize expensive calculations
  const mustDoTasks = useMemo(() => 
    todayProgress.tasks.filter(t => t.isMustDo), 
    [todayProgress.tasks]
  );
  const mustDoCompleted = useMemo(() => 
    mustDoTasks.filter(t => t.completed).length,
    [mustDoTasks]
  );

  // Next milestone info (memoized)
  const nextMilestone = useMemo(() => 
    getNextStreakMilestone(appState.currentStreak),
    [appState.currentStreak]
  );
  const daysUntilMilestone = useMemo(() => 
    getDaysUntilMilestone(appState.currentStreak),
    [appState.currentStreak]
  );

  // Track previous streak to detect milestone changes
  const previousStreak = useRef(appState.currentStreak);

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
        setTimeout(async () => {
          const { promptForRating } = await import('../utils/appRating');
          await promptForRating({
            streak: appState.currentStreak,
            totalDays: appState.totalDays,
          });
        }, 3000);
      }
    };
    checkRatingPrompt();
  }, [appState.currentStreak, appState.totalDays]);

  // Memoize daily practices array to prevent recreation on every render
  const dailyPractices = useMemo(() => {
    const practices = [
      {
        id: 'must-do-tasks',
        title: `${REQUIRED_DAILY_MUST_DO_TASKS} Must-Do Tasks`,
        subtitle: `${mustDoCompleted}/${REQUIRED_DAILY_MUST_DO_TASKS} completed`,
        icon: 'star',
        color: '#FFD700',
        completed: mustDoCompleted === REQUIRED_DAILY_MUST_DO_TASKS,
        action: () => navigation.navigate('TasksScreen'),
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
        subtitle: 'Write 3 gratitudes',
        icon: 'heart',
        color: '#FF6B9D',
        completed: todayProgress.gratitudeEntry.trim().length > 0,
        action: () => navigation.navigate('Journal'),
      },
      {
        id: 'meditation',
        title: 'Guided Meditation',
        subtitle: 'Complete once',
        icon: 'leaf',
        color: '#4ECDC4',
        completed: todayProgress.meditationCompleted,
        action: () => navigation.navigate('MeditationScreen'),
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
    });
    
    return practices;
  }, [
    mustDoCompleted,
    todayProgress.guidedSessions?.length,
    todayProgress.gratitudeEntry,
    todayProgress.meditationCompleted,
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
        onPress: () => navigation.navigate('SettingsScreen'),
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
        paddingBottom: tabBarInset,
      }}
    >
        {/* TODAY = THE COCKPIT - Clear Progress Overview */}
        <GlassCard style={styles.progressOverviewCard}>
          <View style={styles.progressOverviewHeader}>
            <Text style={[styles.progressOverviewTitle, { color: theme.colors.textPrimary }]}>Today's Progress</Text>
            {isDayComplete && (
              <View style={styles.completeBadge}>
                <Ionicons name="checkmark-circle" size={20} color={tokens.colors.success} />
              </View>
            )}
          </View>
          <View style={styles.progressCountDisplay}>
            <Text style={[styles.progressCountLarge, { color: theme.colors.accent }]}>{completedCount}</Text>
            <Text style={[styles.progressCountDivider, { color: theme.colors.textSecondary }]}>/</Text>
            <Text style={[styles.progressCountTotal, { color: theme.colors.textSecondary }]}>{dailyPractices.length}</Text>
            <Text style={[styles.progressCountLabel, { color: theme.colors.textSecondary }]}>complete</Text>
          </View>
          <ProgressBar
            progress={progressPercentage / 100}
            height={10}
            fillColor={isDayComplete ? tokens.colors.success : tokens.colors.accent}
            trackColor={`${tokens.colors.accent}15`}
          />
        </GlassCard>

        {/* Day Complete Celebration */}
        {isDayComplete && (
          <GlassCard style={styles.celebrationCard}>
            <View style={styles.celebrationContent}>
              <Ionicons name="trophy" size={40} color={tokens.colors.warning} />
              <View style={styles.celebrationText}>
                <Text style={[styles.celebrationTitle, { color: theme.colors.textPrimary }]}>Day Complete! 🎉</Text>
                <Text style={[styles.celebrationSubtitle, { color: theme.colors.textSecondary }]}>
                  {appState.currentStreak > 1
                    ? `${appState.currentStreak} day streak! Keep it going!`
                    : `Great start! Come back tomorrow to build your streak`}
                </Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* 5 DAILY TASKS - Primary Focus */}
        <SectionCard style={styles.dailyTasksCard}>
          <View style={styles.dailyTasksHeader}>
            <Text style={[styles.dailyTasksTitle, { color: theme.colors.textPrimary }]}>Daily Tasks</Text>
            <Text style={[styles.dailyTasksSubtitle, { color: theme.colors.textSecondary }]}>Complete all 5 to finish today</Text>
          </View>
          <View style={styles.dailyTasksList}>
            {dailyPractices.map((practice, index) => (
              <View key={practice.id}>
                <ListRow
                  title={practice.title}
                  subtitle={practice.subtitle}
                  icon={practice.icon as any}
                  iconColor={practice.color}
                  rightIcon={practice.completed ? 'checkmark-circle' : 'chevron-forward'}
                  onPress={practice.action}
                  completed={practice.completed}
                />
                {index < dailyPractices.length - 1 && (
                  <View style={styles.taskSeparator} />
                )}
              </View>
            ))}
          </View>
        </SectionCard>

        {/* SECONDARY SECTIONS - Deemphasized */}

        {/* Streak & Daily Spin - Compact */}
        <SectionCard style={styles.streakCardCompact}>
          <LinearGradient
            colors={['rgba(167, 139, 250, 0.75)', 'rgba(124, 58, 237, 0.65)']}
            style={styles.streakGradientCompact}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('45 NOW')}
              activeOpacity={0.9}
              style={styles.streakTouchableCompact}
              accessibilityLabel="View 45 NOW challenge"
              accessibilityRole="button"
            >
              <Animated.View
                style={[
                  styles.streakIconContainerCompact,
                  appState.currentStreak > 0 && {
                    transform: [{ scale: streakPulseAnim }],
                  },
                ]}
              >
                <Ionicons name="flame" size={20} color="#FFFFFF" />
              </Animated.View>

              <View style={styles.streakTextStackCompact}>
                <Text style={styles.streakMessageCompact}>
                  {appState.currentStreak === 0 ? 'Start streak' : `${appState.currentStreak} day streak`}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>

            <View style={styles.spinButtonWrapperCompact}>
              <DailySpinButton
                onPress={handleOpenSpin}
                hasSpun={hasSpunToday}
              />
            </View>
          </LinearGradient>
        </SectionCard>

        {/* Mood Check-In - Compact */}
        <GlassCard style={{ marginBottom: tokens.spacing.md }}>
          <TouchableOpacity
            onPress={() => setShowMoodModal(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={todayMoodEntry ? 'Update mood' : 'Check in with your mood'}
            style={styles.moodRowItemCompact}
          >
            <View
              style={[
                styles.moodIconCircleCompact,
                {
                  backgroundColor: todayMoodEntry
                    ? `${getMoodOption(todayMoodEntry.mood)?.color}20`
                    : `${tokens.colors.accent}20`,
                },
              ]}
            >
              {todayMoodEntry ? (
                <Text style={styles.moodEmojiCompact}>{getMoodOption(todayMoodEntry.mood)?.emoji}</Text>
              ) : (
                <Ionicons name="happy-outline" size={18} color={tokens.colors.accent} />
              )}
            </View>

            <View style={styles.moodTextContainerCompact}>
              <Text style={[styles.moodTitleCompact, { color: theme.colors.textPrimary }]}>
                {todayMoodEntry ? `Mood: ${getMoodOption(todayMoodEntry.mood)?.label}` : 'Check in with your mood'}
              </Text>
            </View>

            <Ionicons
              name={todayMoodEntry ? 'create-outline' : 'chevron-forward'}
              size={18}
              color={tokens.colors.textSecondary}
            />
          </TouchableOpacity>
        </GlassCard>

        {/* Daily Quote - Simple */}
        <GlassCard style={{ marginBottom: tokens.spacing.md }}>
          <View style={styles.quoteContainerCompact}>
            <Text style={[styles.quoteTextCompact, { color: theme.colors.textPrimary }]}>
              "{dailyQuote?.text || 'Your thoughts create your reality.'}"
            </Text>
            <Text style={[styles.quoteAuthorCompact, { color: theme.colors.textSecondary }]}>
              — {dailyQuote?.author || 'Unknown'}
            </Text>
          </View>
        </GlassCard>

        {/* Extra bottom padding to clear floating tab bar */}
        <View style={{ height: 110 }} />

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

      {/* Task Manager Modal */}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // TODAY = THE COCKPIT - New Styles
  progressOverviewCard: {
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  progressOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  progressOverviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  completeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${tokens.colors.success}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCountDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  progressCountLarge: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  progressCountDivider: {
    fontSize: 28,
    fontWeight: '300',
  },
  progressCountTotal: {
    fontSize: 28,
    fontWeight: '300',
  },
  progressCountLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: tokens.spacing.xs,
  },
  celebrationCard: {
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.lg,
    backgroundColor: `${tokens.colors.success}10`,
  },
  celebrationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  celebrationText: {
    flex: 1,
    gap: 4,
  },
  celebrationTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  celebrationSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  dailyTasksCard: {
    marginBottom: tokens.spacing.lg,
    padding: tokens.spacing.lg,
  },
  dailyTasksHeader: {
    marginBottom: tokens.spacing.md,
    gap: 4,
  },
  dailyTasksTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  dailyTasksSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  dailyTasksList: {
    gap: 0,
  },
  taskSeparator: {
    height: 1,
    backgroundColor: 'rgba(31, 18, 53, 0.05)',
    marginLeft: 60,
    marginRight: 0,
    marginVertical: tokens.spacing.xs,
  },
  // Compact secondary sections
  streakCardCompact: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 0,
    marginBottom: tokens.spacing.md,
  },
  streakGradientCompact: {
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
  },
  streakTouchableCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  streakIconContainerCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTextStackCompact: {
    flex: 1,
  },
  streakMessageCompact: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  spinButtonWrapperCompact: {
    marginLeft: tokens.spacing.md,
  },
  moodRowItemCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
  },
  moodIconCircleCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing.md,
  },
  moodEmojiCompact: {
    fontSize: 20,
  },
  moodTextContainerCompact: {
    flex: 1,
  },
  moodTitleCompact: {
    fontSize: 15,
    fontWeight: '500',
  },
  quoteContainerCompact: {
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  quoteTextCompact: {
    fontSize: 15,
    fontWeight: '400',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  quoteAuthorCompact: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'right',
  },
});
