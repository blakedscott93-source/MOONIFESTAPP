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
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SectionCard, GlassCard, RowItem, ProgressBar, IconButton } from '../components/ui';
import { Screen } from '../components/layout/Screen';
import { UnifiedCard } from '../components/UnifiedCard';
import { tokens } from '../theme/tokens';
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

// Tab bar height constants (matching AppNavigator)
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : Platform.OS === 'web' ? 70 : 60;
const BREATHING_ROOM = 16; // Minimum space above tab bar

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { appState, getTodayProgress, saveMoodEntry, getTodayMood, addGlowPoints, userGoals, goalCategories } = useApp();
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
  
  // Animation for streak icon pulse
  const streakPulseAnim = useRef(new Animated.Value(1)).current;

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
  const dailyPractices = useMemo(() => [
    {
      id: 'must-do-tasks',
      title: `${REQUIRED_DAILY_MUST_DO_TASKS} Must-Do Tasks`,
      subtitle: `${mustDoCompleted}/${REQUIRED_DAILY_MUST_DO_TASKS} completed`,
      icon: 'star',
      color: '#FFD700',
      completed: mustDoCompleted === REQUIRED_DAILY_MUST_DO_TASKS,
      action: () => navigation.navigate('45 NOW'),
    },
    {
      id: 'guided-affirmations',
      title: 'Guided Affirmations',
      subtitle: `${todayProgress.guidedSessions?.length || 0}/${REQUIRED_DAILY_AFFIRMATION_SESSIONS} sessions`,
      icon: 'sparkles',
      color: tokens.colors.tintPurple,
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
  ], [
    mustDoCompleted,
    todayProgress.guidedSessions?.length,
    todayProgress.gratitudeEntry,
    todayProgress.meditationCompleted,
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
          tintColor={tokens.colors.tintPurple}
          colors={[tokens.colors.tintPurple]}
        />
      }
      contentContainerStyle={{
        paddingTop: tokens.spacing.xs,
        paddingBottom: TAB_BAR_HEIGHT + insets.bottom + BREATHING_ROOM,
      }}
    >
        {/* Personalized Welcome Message */}
        {(userName || userGoal) && (
          <UnifiedCard delay={0} style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>
              {userName ? `Hi ${userName}` : 'Welcome'}{userGoal ? `, ${GOAL_MESSAGES[userGoal]}` : ''}! ✨
            </Text>
          </UnifiedCard>
        )}

        {/* User's 3 Main Goals */}
        {userGoals && userGoals.length > 0 && (
          <UnifiedCard delay={50} style={styles.goalsCard}>
            <TouchableOpacity
              onPress={() => navigation.navigate('SettingsScreen')}
              activeOpacity={0.8}
              style={styles.goalsHeader}
            >
              <Text style={styles.goalsTitle}>Your Goals</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <View style={styles.goalsList}>
              {userGoals.slice(0, 3).map((goal, index) => {
                const goalInfo = getGoalCategory(goal.category);
                const priorityLabel = index === 0 ? '1st' : index === 1 ? '2nd' : '3rd';

                return (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalItem,
                      { backgroundColor: goalInfo.color + '15', borderLeftColor: goalInfo.color },
                    ]}
                    onPress={() => navigation.navigate('SettingsScreen')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.goalIconContainer}>
                      <Text style={styles.goalEmoji}>{goalInfo.emoji}</Text>
                    </View>
                    <View style={styles.goalContent}>
                      <View style={styles.goalTitleRow}>
                        <Text style={styles.goalTitle}>{goalInfo.title}</Text>
                        <Text style={styles.goalPriority}>#{priorityLabel}</Text>
                      </View>
                      {goal.customText && (
                        <Text style={styles.goalDescription} numberOfLines={1}>
                          {goal.customText}
                        </Text>
                      )}
                      <View style={styles.goalMetrics}>
                        <View style={styles.goalProgressContainer}>
                          <View style={styles.goalProgressBar}>
                            <View
                              style={[
                                styles.goalProgressFill,
                                { width: `${goal.progress}%`, backgroundColor: goalInfo.color },
                              ]}
                            />
                          </View>
                          <Text style={styles.goalProgressText}>{goal.progress}%</Text>
                        </View>
                        {goal.streak > 0 && (
                          <View style={styles.goalStreak}>
                            <Text style={styles.goalStreakText}>{goal.streak}d 🔥</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </UnifiedCard>
        )}

        {/* Daily Practices - FIRST (Primary Section) */}
        <SectionCard style={styles.dailyPracticesCard}>
          <View style={styles.dailyPracticesHeader}>
            <Text style={[styles.sectionTitle, { color: tokens.colors.textPrimary }]}>Daily Practices</Text>
            {completedCount === dailyPractices.length && (
              <View style={styles.allCompleteBadge}>
                <Ionicons name="checkmark-circle" size={18} color={tokens.colors.success} />
                <Text style={styles.allCompleteText}>All done!</Text>
              </View>
            )}
          </View>
          {dailyPractices.map((practice, index) => (
            <React.Fragment key={practice.id}>
              <RowItem
                title={practice.title}
                subtitle={practice.subtitle}
                icon={practice.icon}
                iconColor={practice.color}
                rightIcon={practice.completed ? 'checkmark-circle' : 'chevron-forward'}
                onPress={practice.action}
              />
              {index < dailyPractices.length - 1 && (
                <View style={styles.rowSeparator} />
              )}
            </React.Fragment>
          ))}
        </SectionCard>

        {/* Progress Overview - SECOND (Compact Status Strip) */}
        <SectionCard style={styles.progressCardCompact}>
          <View style={styles.progressHeader}>
            <Text style={[styles.sectionTitle, { color: tokens.colors.textPrimary }]}>Today's Progress</Text>
            <View style={styles.progressCountContainer}>
              <Text style={[styles.progressText, { color: tokens.colors.textSecondary }]}>
                {completedCount}
              </Text>
              <Text style={[styles.progressDivider, { color: tokens.colors.textSecondary }]}>/</Text>
              <Text style={[styles.progressTotal, { color: tokens.colors.textSecondary }]}>
                {dailyPractices.length}
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={progressPercentage / 100}
            height={8}
            fillColor={tokens.colors.tintPurple}
            trackColor={`${tokens.colors.tintLavender}30`}
          />
        </SectionCard>

        {/* Mood Check-In Card - THIRD */}
        <SectionCard style={{ marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setShowMoodModal(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={todayMoodEntry ? 'Update mood check-in' : 'Check in with your mood'}
            style={styles.moodRowItem}
          >
            {/* Left Icon Circle */}
            <View
              style={[
                styles.moodIconCircle,
                {
                  backgroundColor: todayMoodEntry
                    ? `${getMoodOption(todayMoodEntry.mood)?.color}20`
                    : `${tokens.colors.tintPurple}20`,
                },
              ]}
            >
              {todayMoodEntry ? (
                <Text style={styles.moodEmoji}>{getMoodOption(todayMoodEntry.mood)?.emoji}</Text>
              ) : (
                <Ionicons name="happy-outline" size={20} color={tokens.colors.tintPurple} />
              )}
            </View>

            {/* Title & Subtitle */}
            <View style={styles.moodTextContainer}>
              <Text style={[styles.moodTitle, { color: tokens.colors.textPrimary }, tokens.typography.body]}>
                {todayMoodEntry ? 'Today\'s Mood' : 'How are you feeling?'}
              </Text>
              <Text style={[styles.moodSubtitle, { color: tokens.colors.textSecondary }, tokens.typography.caption]}>
                {todayMoodEntry
                  ? `${getMoodOption(todayMoodEntry.mood)?.label} • ${getEnergyOption(todayMoodEntry.energy)?.label}`
                  : 'Check in after your practices'}
              </Text>
            </View>

            {/* Right Chevron */}
            <Ionicons
              name={todayMoodEntry ? 'create-outline' : 'chevron-forward'}
              size={20}
              color={tokens.colors.textSecondary}
              style={styles.moodChevron}
            />
          </TouchableOpacity>
        </SectionCard>

        {/* Streak Card with Daily Spin - LAST */}
        <GlassCard intensity={20} style={styles.streakCard}>
          <LinearGradient
            colors={['#C77DFF', '#9D4EDD', '#7B2CBF']}
            style={styles.streakGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Decorative background elements */}
            <View style={styles.streakBackgroundPattern}>
              <View style={styles.streakCircle1} />
              <View style={styles.streakCircle2} />
            </View>

            <View style={styles.streakContent}>
                <TouchableOpacity
                onPress={() => navigation.navigate('AchievementsScreen')}
                activeOpacity={0.9}
                style={styles.streakTouchable}
                accessibilityLabel="View streak and achievements"
                accessibilityRole="button"
              >
                {/* Left section - Streak display */}
                <View style={styles.streakLeft}>
                  <Animated.View 
                    style={[
                      styles.streakIconContainer,
                      appState.currentStreak > 0 && {
                        transform: [{ scale: streakPulseAnim }],
                      },
                    ]}
                  >
                    <Ionicons name="flame" size={32} color="#FFFFFF" />
                    {appState.currentStreak > 0 && (
                      <Animated.View 
                        style={[
                          styles.streakGlow,
                          {
                            opacity: streakPulseAnim.interpolate({
                              inputRange: [1, 1.1],
                              outputRange: [0.4, 0.7],
                            }),
                          },
                        ]} 
                      />
                    )}
                  </Animated.View>
                  <View style={styles.streakInfo}>
                    <Text style={styles.streakNumber}>{appState.currentStreak}</Text>
                    <Text style={styles.streakLabel}>
                      {appState.currentStreak === 1 ? 'Day' : 'Days'} Streak
                    </Text>
                  </View>
                </View>

                {/* Middle section - Motivational message */}
                <View style={styles.streakMiddle}>
                  <Text style={styles.streakMessagePrimary}>
                    {appState.currentStreak === 0
                      ? 'Begin Your Journey'
                      : appState.currentStreak < 7
                      ? 'Building Momentum'
                      : appState.currentStreak < 21
                      ? 'Incredible Progress'
                      : 'Unstoppable Streak'}
                  </Text>
                  <Text style={styles.streakMessageSecondary} numberOfLines={1}>
                    {appState.currentStreak === 0
                      ? 'Start building your streak today ✨'
                      : appState.currentStreak < 7
                      ? 'Keep going strong! Every day counts 🌟'
                      : appState.currentStreak < 21
                      ? 'You\'re doing amazing! Keep it up 💫'
                      : 'You\'re a true champion! Keep shining ✨'}
                  </Text>
                  {nextMilestone && daysUntilMilestone && daysUntilMilestone <= 7 && (
                    <View style={styles.milestoneBadge}>
                      <Text style={styles.milestoneText}>
                        {daysUntilMilestone}d to {nextMilestone.emoji}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              
              {/* Daily Spin Button */}
              <View style={styles.spinButtonWrapper}>
                <DailySpinButton 
                  onPress={handleOpenSpin} 
                  hasSpun={hasSpunToday}
                />
              </View>
            </View>
          </LinearGradient>
        </GlassCard>

        {/* Quick Actions */}
        <UnifiedCard delay={150}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Affirmations')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="sparkles" size={32} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Browse Affirmations</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('45 NOW')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FF6B9D', '#C44569']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="checkmark-done-circle" size={32} color="#FFFFFF" />
                <Text style={styles.quickActionText}>45 NOW Challenge</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('AchievementsScreen')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#7FFF00', '#32CD32']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="trophy" size={32} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Achievements</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('AffirmationLibrary')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#00D9A3', '#00BCD4']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="library" size={32} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Affirmation Library</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('ProgressScreen')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#8B7DD8', '#6B5B95']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="analytics" size={32} color="#FFFFFF" />
                <Text style={styles.quickActionText}>View Progress</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('ToolsScreen')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FF6B35', '#E55A2B']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="construct" size={32} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Tools</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </UnifiedCard>

        {/* Motivational Quote */}
        <UnifiedCard delay={200}>
          <View style={styles.quoteContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={tokens.colors.tintPurple} />
            <View style={styles.quoteContent}>
              <Text style={styles.quoteText}>
                "{dailyQuote?.text || 'Your thoughts create your reality. Focus on what you want, not what you fear.'}"
              </Text>
              <Text style={styles.quoteAuthor}>
                — {dailyQuote?.author || 'Unknown'}
              </Text>
            </View>
          </View>
        </UnifiedCard>

        <View style={{ height: tokens.spacing.xl }} />

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  dailyPracticesCard: {
    marginBottom: 16, // Spacing between major sections (16-20px)
  },
  rowSeparator: {
    height: 1,
    backgroundColor: 'rgba(31, 18, 53, 0.08)',
    marginLeft: 52, // Align with text content (icon width + gap)
    marginRight: 16,
  },
  welcomeCard: {
    backgroundColor: `${tokens.colors.tintPurple}15`,
    borderWidth: 0,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: tokens.colors.tintPurple,
    textAlign: 'center',
  },
  goalsCard: {
    padding: tokens.spacing.lg,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  goalsTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: tokens.colors.textPrimary,
  },
  goalsList: {
    gap: tokens.spacing.sm,
  },
  goalItem: {
    flexDirection: 'row',
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    borderLeftWidth: 4,
    gap: tokens.spacing.md,
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalEmoji: {
    fontSize: 28,
  },
  goalContent: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  goalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0,
    color: tokens.colors.textPrimary,
  },
  goalPriority: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.1,
    color: '#999',
  },
  goalDescription: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.1,
    color: tokens.colors.textSecondary,
    fontStyle: 'italic',
  },
  goalMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  goalProgressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goalProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalProgressText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
    color: tokens.colors.textSecondary,
    minWidth: 32,
  },
  goalStreak: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
  },
  goalStreakText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
    color: '#F57C00',
  },
  streakCard: {
    padding: 0,
    overflow: 'visible',
    borderWidth: 0,
    marginBottom: 16, // Spacing between major sections
    ...tokens.shadows.lifted,
  },
  streakGradient: {
    padding: tokens.spacing.lg,
    borderRadius: tokens.radii.lg,
    minHeight: 96, // More compact
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  streakBackgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  streakCircle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -30,
    right: -15,
  },
  streakCircle2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    bottom: -15,
    left: -8,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
    position: 'relative',
    zIndex: 1,
  },
  streakTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    minWidth: 90,
  },
  streakIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  streakGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    opacity: 0.6,
  },
  streakInfo: {
    gap: 2,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#FFFFFF',
    opacity: 0.95,
    textTransform: 'uppercase',
  },
  streakMiddle: {
    flex: 1,
    marginLeft: tokens.spacing.md,
    gap: 4,
  },
  streakMessagePrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  streakMessageSecondary: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.1,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 16,
  },
  milestoneBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radii.full,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  milestoneText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
    color: '#FFFFFF',
  },
  spinButtonWrapper: {
    marginLeft: tokens.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  progressCardCompact: {
    paddingVertical: 12, // Reduced vertical padding (10-12 range)
    marginBottom: 16, // Spacing between major sections
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm, // Reduced from md
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0,
    color: tokens.colors.textPrimary,
  },
  progressCountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  progressText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: tokens.colors.tintPurple,
  },
  progressDivider: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: 0,
    color: tokens.colors.textSecondary,
  },
  progressTotal: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: 0,
    color: tokens.colors.textSecondary,
  },
  progressBar: {
    height: 7,
    backgroundColor: `${tokens.colors.tintPurple}20`,
    borderRadius: tokens.radii.full,
    overflow: 'hidden',
    ...tokens.shadows.subtle,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.colors.tintPurple,
    borderRadius: tokens.radii.full,
    ...tokens.shadows.subtle,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.md,
  },
  quickActionCard: {
    width: '47%',
    borderRadius: tokens.radii.lg,
    overflow: 'hidden',
    ...tokens.shadows.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickActionGradient: {
    padding: tokens.spacing.xl,
    alignItems: 'center',
    gap: tokens.spacing.md,
    minHeight: 110,
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  quoteContainer: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  quoteContent: {
    flex: 1,
    gap: tokens.spacing.sm,
  },
  quoteText: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: 0,
    color: tokens.colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  quoteAuthor: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.1,
    color: tokens.colors.textSecondary,
    textAlign: 'right',
  },
  moodRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  moodIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodTextContainer: {
    flex: 1,
    gap: 2,
  },
  moodTitle: {
    // Typography applied via theme
  },
  moodSubtitle: {
    // Typography applied via theme
    opacity: 0.7,
  },
  moodChevron: {
    marginLeft: 8,
  },
  dailyPracticesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  allCompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    backgroundColor: tokens.colors.success + '15',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
  },
  allCompleteText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
    color: tokens.colors.success,
  },
});
