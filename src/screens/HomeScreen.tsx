import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { UnifiedCard } from '../components/UnifiedCard';
import { ListRow } from '../components/ListRow';
import { Theme } from '../utils/theme';
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

export default function HomeScreen({ navigation }: any) {
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
      color: Theme.colors.gold,
      completed: mustDoCompleted === REQUIRED_DAILY_MUST_DO_TASKS,
      action: () => navigation.navigate('45 NOW'),
    },
    {
      id: 'guided-affirmations',
      title: 'Guided Affirmations',
      subtitle: `${todayProgress.guidedSessions?.length || 0}/${REQUIRED_DAILY_AFFIRMATION_SESSIONS} sessions`,
      icon: 'sparkles',
      color: Theme.colors.accent,
      completed: (todayProgress.guidedSessions?.length || 0) >= REQUIRED_DAILY_AFFIRMATION_SESSIONS,
      action: () => navigation.navigate('Affirmations'),
    },
    {
      id: 'gratitude',
      title: 'Gratitude Journal',
      subtitle: 'Write 3 gratitudes',
      icon: 'heart',
      color: Theme.colors.pink,
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
    <Screen>
      <AppHeader
        title={greeting()}
        subtitle={today.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
        rightIcon={{
          name: 'settings-outline',
          onPress: () => navigation.navigate('SettingsScreen'),
          accessibilityLabel: 'Settings',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.accent}
            colors={[Theme.colors.accent]}
          />
        }
        scrollEventThrottle={16}
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

        {/* Streak Card with Daily Spin */}
        <UnifiedCard delay={0} style={styles.streakCard}>
          <LinearGradient
            colors={['#C77DFF', '#9D4EDD']}
            style={styles.streakGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.streakContent}>
              <TouchableOpacity
                onPress={() => navigation.navigate('AchievementsScreen')}
                activeOpacity={0.8}
                style={styles.streakTouchable}
              >
                <View style={styles.streakLeft}>
                  <Ionicons name="flame" size={40} color={Theme.colors.textInverse} />
                  <View style={styles.streakInfo}>
                    <Text style={styles.streakNumber}>{appState.currentStreak}</Text>
                    <Text style={styles.streakLabel}>Day Streak</Text>
                  </View>
                </View>
                <View style={styles.streakMiddle}>
                  <Text style={styles.streakMessage}>
                    {appState.currentStreak === 0
                      ? 'Start today!'
                      : appState.currentStreak < 7
                      ? 'Keep going! 🌟'
                      : appState.currentStreak < 21
                      ? 'Amazing! 💫'
                      : 'Unstoppable! ✨'}
                  </Text>
                  {nextMilestone && daysUntilMilestone && daysUntilMilestone <= 7 && (
                    <Text style={styles.milestoneHint}>
                      {daysUntilMilestone}d to {nextMilestone.emoji}
                    </Text>
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
        </UnifiedCard>

        {/* Mood Check-In Card */}
        <TouchableOpacity
          onPress={() => setShowMoodModal(true)}
          activeOpacity={0.8}
        >
          <UnifiedCard delay={25}>
            <View style={styles.moodCard}>
              <View style={styles.moodLeft}>
                <View style={[styles.moodIconCircle, { backgroundColor: todayMoodEntry ? getMoodOption(todayMoodEntry.mood)?.color + '20' : Theme.colors.accentSoft }]}>
                  {todayMoodEntry ? (
                    <Text style={styles.moodEmoji}>{getMoodOption(todayMoodEntry.mood)?.emoji}</Text>
                  ) : (
                    <Ionicons name="happy-outline" size={28} color={Theme.colors.accent} />
                  )}
                </View>
                <View style={styles.moodInfo}>
                  <Text style={styles.moodTitle}>
                    {todayMoodEntry ? 'Today\'s Mood' : 'How are you feeling?'}
                  </Text>
                  <Text style={styles.moodSubtitle}>
                    {todayMoodEntry
                      ? `${getMoodOption(todayMoodEntry.mood)?.label} • ${getEnergyOption(todayMoodEntry.energy)?.label}`
                      : 'Check in with your emotions'}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={todayMoodEntry ? "create-outline" : "chevron-forward"}
                size={24}
                color={Theme.colors.textSecondary}
              />
            </View>
          </UnifiedCard>
        </TouchableOpacity>

        {/* Progress Overview */}
        <UnifiedCard delay={50}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <View style={styles.progressCountContainer}>
              <Text style={styles.progressText}>
                {completedCount}
              </Text>
              <Text style={styles.progressDivider}>/</Text>
              <Text style={styles.progressTotal}>
                {dailyPractices.length}
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
            />
          </View>
        </UnifiedCard>

        {/* Daily Practices */}
        <UnifiedCard delay={100}>
          <View style={styles.dailyPracticesHeader}>
            <Text style={styles.sectionTitle}>Daily Practices</Text>
            {completedCount === dailyPractices.length && (
              <View style={styles.allCompleteBadge}>
                <Ionicons name="checkmark-circle" size={18} color={Theme.colors.success} />
                <Text style={styles.allCompleteText}>All done!</Text>
              </View>
            )}
          </View>
          {dailyPractices.map((practice) => (
            <ListRow
              key={practice.id}
              title={practice.title}
              subtitle={practice.subtitle}
              icon={practice.icon as any}
              iconColor={practice.color}
              rightIcon={practice.completed ? 'checkmark-circle' : 'chevron-forward'}
              onPress={practice.action}
            />
          ))}
        </UnifiedCard>

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
                <Ionicons name="sparkles" size={32} color={Theme.colors.textInverse} />
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
                <Ionicons name="checkmark-done-circle" size={32} color={Theme.colors.textInverse} />
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
                <Ionicons name="trophy" size={32} color={Theme.colors.textInverse} />
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
                <Ionicons name="library" size={32} color={Theme.colors.textInverse} />
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
                <Ionicons name="analytics" size={32} color={Theme.colors.textInverse} />
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
                <Ionicons name="construct" size={32} color={Theme.colors.textInverse} />
                <Text style={styles.quickActionText}>Tools</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </UnifiedCard>

        {/* Motivational Quote */}
        <UnifiedCard delay={200}>
          <View style={styles.quoteContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={Theme.colors.accent} />
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

        <View style={{ height: Theme.spacing.xxxl }} />
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding for tab bar
    paddingTop: Theme.spacing.sm,
  },
  welcomeCard: {
    backgroundColor: Theme.colors.accentSoft,
    borderWidth: 0,
  },
  welcomeText: {
    ...Theme.typography.h3,
    color: Theme.colors.accent,
    textAlign: 'center',
  },
  goalsCard: {
    padding: Theme.spacing.lg,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  goalsTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  goalsList: {
    gap: Theme.spacing.sm,
  },
  goalItem: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    borderLeftWidth: 4,
    gap: Theme.spacing.md,
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
    gap: Theme.spacing.xs,
  },
  goalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    ...Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  goalPriority: {
    ...Theme.typography.small,
    color: '#999',
    fontWeight: '500',
  },
  goalDescription: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  goalMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
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
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    minWidth: 32,
  },
  goalStreak: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
  },
  goalStreakText: {
    ...Theme.typography.small,
    fontWeight: '600',
    color: '#F57C00',
  },
  streakCard: {
    padding: 0,
    overflow: 'visible',
    borderWidth: 0,
  },
  streakGradient: {
    padding: Theme.spacing.xl,
    borderRadius: Theme.radius.lg,
    minHeight: 120,
    justifyContent: 'center',
    overflow: 'visible',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
  },
  streakTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  streakInfo: {
    gap: Theme.spacing.xs,
  },
  streakNumber: {
    ...Theme.typography.h2,
    color: Theme.colors.textInverse,
  },
  streakLabel: {
    ...Theme.typography.chip,
    color: Theme.colors.textInverse,
    opacity: 0.9,
  },
  streakMiddle: {
    flex: 1,
    marginLeft: Theme.spacing.md,
    gap: Theme.spacing.xs,
  },
  streakMessage: {
    ...Theme.typography.caption,
    color: Theme.colors.textInverse,
    fontWeight: '600',
  },
  milestoneHint: {
    ...Theme.typography.small,
    color: Theme.colors.textInverse,
    opacity: 0.8,
  },
  spinButtonWrapper: {
    marginLeft: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  progressCountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  progressText: {
    ...Theme.typography.h2,
    color: Theme.colors.accent,
    fontWeight: '700',
  },
  progressDivider: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    fontSize: 16,
  },
  progressTotal: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    fontSize: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: Theme.colors.accentSoft,
    borderRadius: Theme.radius.full,
    overflow: 'hidden',
    ...Theme.shadow.subtle,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.radius.full,
    ...Theme.shadow.subtle,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.md,
  },
  quickActionCard: {
    width: '47%',
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadow.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickActionGradient: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    gap: Theme.spacing.md,
    minHeight: 110,
    justifyContent: 'center',
  },
  quickActionText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  quoteContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  quoteContent: {
    flex: 1,
    gap: Theme.spacing.sm,
  },
  quoteText: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  quoteAuthor: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    textAlign: 'right',
  },
  moodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    flex: 1,
  },
  moodIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.subtle,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodInfo: {
    flex: 1,
    gap: Theme.spacing.xs,
  },
  moodTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
  },
  moodSubtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  dailyPracticesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  allCompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    backgroundColor: Theme.colors.success + '15',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
  },
  allCompleteText: {
    ...Theme.typography.captionBold,
    color: Theme.colors.success,
    fontSize: 12,
  },
});
