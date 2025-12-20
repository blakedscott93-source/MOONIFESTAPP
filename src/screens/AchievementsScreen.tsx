import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { useApp } from '../context/AppContext';
import {
  ACHIEVEMENTS,
  Achievement,
  calculateAchievementProgress,
  getAchievementsByCategory,
} from '../data/achievements';
import { StreakCounter } from '../components/StreakCounter';
import { StreakCalendar } from '../components/StreakCalendar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { shareAchievement, shareStreak, shareProgress } from '../utils/sharing';
import { useToast } from '../context/ToastContext';
import { Confetti } from '../components/Confetti';
import { celebrationHaptic, successHaptic, lightHaptic } from '../utils/haptics';

const UNLOCKED_ACHIEVEMENTS_KEY = '@unlocked_achievements';

interface UnlockedAchievement extends Achievement {
  unlockedAt: string;
}

export default function AchievementsScreen({ navigation }: any) {
  const { appState, glowPoints, getTodayCheckInCount } = useApp();
  // Note: appState is needed for rating prompts
  const { showSuccess, showInfo, showAchievement } = useToast();
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all');
  const [showCalendar, setShowCalendar] = useState(false);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newlyUnlockedId, setNewlyUnlockedId] = useState<string | null>(null);
  
  // Animation for newly unlocked achievements
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadUnlockedAchievements();
    loadCompletedDates();
  }, []);

  useEffect(() => {
    checkForNewAchievements();
  }, [appState.currentStreak, glowPoints]);

  const loadUnlockedAchievements = async () => {
    try {
      const saved = await AsyncStorage.getItem(UNLOCKED_ACHIEVEMENTS_KEY);
      if (saved) {
        setUnlockedAchievements(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading unlocked achievements:', error);
    }
  };

  const loadCompletedDates = async () => {
    try {
      // Get all dates from daily progress
      const dates = Object.keys(appState.dailyProgress).filter(date => {
        const progress = appState.dailyProgress[date];
        // Consider a day completed if user did at least one check-in
        return progress.gratitudeEntry.trim().length > 0 ||
               progress.tasks.some(t => t.completed) ||
               progress.meditationCompleted;
      });
      setCompletedDates(dates);
    } catch (error) {
      console.error('Error loading completed dates:', error);
    }
  };

  // Calculate longest streak from completed dates
  const calculateLongestStreak = (): number => {
    if (completedDates.length === 0) return appState.currentStreak;

    // Sort dates chronologically
    const sortedDates = [...completedDates].sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    if (sortedDates.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;

    // Calculate consecutive days
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      
      // Calculate days between dates
      const daysDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // Consecutive day
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        // Streak broken
        currentStreak = 1;
      }
    }

    // Return the maximum of calculated longest streak and current streak
    return Math.max(longestStreak, appState.currentStreak);
  };

  // Share handlers
  const handleShareAchievement = async (achievement: Achievement) => {
    const success = await shareAchievement(
      achievement.title,
      achievement.description,
      achievement.glowReward
    );
    if (success) {
      showSuccess('Shared!', 'Achievement shared successfully');
    }
  };

  const handleShareStreak = async () => {
    const success = await shareStreak(appState.currentStreak);
    if (success) {
      showSuccess('Shared!', 'Streak shared successfully');
    }
  };

  const handleShareProgress = async () => {
    const success = await shareProgress({
      streak: appState.currentStreak,
      totalDays: appState.totalDays,
      achievements: unlockedAchievements.length,
      glowPoints,
    });
    if (success) {
      showSuccess('Shared!', 'Progress shared successfully');
    }
  };

  const unlockAchievement = async (achievement: Achievement) => {
    try {
      const newUnlocked: UnlockedAchievement = {
        ...achievement,
        unlockedAt: new Date().toISOString(),
      };
      const updated = [...unlockedAchievements, newUnlocked];
      setUnlockedAchievements(updated);
      await AsyncStorage.setItem(UNLOCKED_ACHIEVEMENTS_KEY, JSON.stringify(updated));

      // Show celebration effects
      setNewlyUnlockedId(achievement.id);
      setShowConfetti(true);
      celebrationHaptic();
      
      // Pulse animation for the newly unlocked achievement
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.95, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      
      // Show toast notification
      showAchievement?.(achievement.title, `+${achievement.glowReward} Glow Points!`);
      
      // Clear newly unlocked state after animation
      setTimeout(() => setNewlyUnlockedId(null), 3000);

      // Prompt for rating after achievement unlock (first achievement only)
      if (unlockedAchievements.length === 0) {
        setTimeout(async () => {
          const { promptForRating } = await import('../utils/appRating');
          await promptForRating({
            streak: appState.currentStreak,
            totalDays: appState.totalDays,
            achievementUnlocked: true,
          });
        }, 2000);
      }

      console.log(`🏆 Achievement Unlocked: ${achievement.title} (+${achievement.glowReward} Glow)`);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  const checkForNewAchievements = async () => {
    // Check each achievement to see if it should be unlocked
    for (const achievement of ACHIEVEMENTS) {
      const isAlreadyUnlocked = unlockedAchievements.some(u => u.id === achievement.id);
      if (isAlreadyUnlocked) continue;

      let shouldUnlock = false;

      switch (achievement.requirement.type) {
        case 'days_streak':
          shouldUnlock = appState.currentStreak >= achievement.requirement.value;
          break;
        case 'glow_points':
          shouldUnlock = glowPoints >= achievement.requirement.value;
          break;
        // Add other types as needed
      }

      if (shouldUnlock) {
        await unlockAchievement(achievement);
      }
    }
  };

  const getCurrentValue = (achievement: Achievement): number => {
    switch (achievement.requirement.type) {
      case 'days_streak':
        return appState.currentStreak;
      case 'glow_points':
        return glowPoints;
      case 'total_check_ins':
        // This would need to be tracked in AppContext
        return 0;
      case 'total_affirmations':
        // This would need to be tracked in AppContext
        return 0;
      case 'total_tasks':
        // Count all completed tasks across all days
        return Object.values(appState.dailyProgress).reduce(
          (sum, day) => sum + day.tasks.filter(t => t.completed).length,
          0
        );
      default:
        return 0;
    }
  };

  const isAchievementUnlocked = (achievementId: string): boolean => {
    return unlockedAchievements.some(u => u.id === achievementId);
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? ACHIEVEMENTS
      : getAchievementsByCategory(selectedCategory);

  const unlockedCount = filteredAchievements.filter(a => isAchievementUnlocked(a.id)).length;
  const totalCount = filteredAchievements.length;

  const categories: Array<{ id: Achievement['category'] | 'all'; label: string; icon: string }> = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'streak', label: 'Streaks', icon: 'flame' },
    { id: 'gratitude', label: 'Gratitude', icon: 'heart' },
    { id: 'task', label: 'Tasks', icon: 'checkmark-done' },
    { id: 'affirmation', label: 'Affirmations', icon: 'musical-notes' },
    { id: 'special', label: 'Special', icon: 'star' },
  ];

  const renderAchievementCard = (achievement: Achievement) => {
    const isUnlocked = isAchievementUnlocked(achievement.id);
    const currentValue = getCurrentValue(achievement);
    const progress = calculateAchievementProgress(achievement, currentValue);
    const isNewlyUnlocked = newlyUnlockedId === achievement.id;

    const cardContent = (
      <View
        style={[
          styles.achievementCard,
          !isUnlocked && styles.achievementCardLocked,
          isNewlyUnlocked && styles.achievementCardNewlyUnlocked,
        ]}
      >
        <View style={styles.achievementContent}>
          {/* Icon */}
          <View
            style={[
              styles.achievementIcon,
              { backgroundColor: isUnlocked ? achievement.color + '20' : Theme.colors.surfaceSecondary },
            ]}
          >
            <Ionicons
              name={achievement.icon as any}
              size={32}
              color={isUnlocked ? achievement.color : Theme.colors.textTertiary}
            />
          </View>

          {/* Info */}
          <View style={styles.achievementInfo}>
            <Text
              style={[
                styles.achievementTitle,
                !isUnlocked && styles.achievementTitleLocked,
              ]}
            >
              {achievement.title}
            </Text>
            <Text
              style={[
                styles.achievementDescription,
                !isUnlocked && styles.achievementDescriptionLocked,
              ]}
            >
              {achievement.description}
            </Text>

            {/* Progress Bar */}
            {!isUnlocked && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress.percentage}%`,
                        backgroundColor: achievement.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {currentValue} / {achievement.requirement.value}
                </Text>
              </View>
            )}

            {/* Glow Reward */}
            <View style={styles.rewardBadge}>
              <Ionicons name="star" size={14} color={Theme.colors.gold} />
              <Text style={styles.rewardText}>+{achievement.glowReward} Glow</Text>
            </View>
          </View>

          {/* Checkmark and Share */}
          {isUnlocked && (
            <View style={styles.achievementActions}>
              <TouchableOpacity
                onPress={() => handleShareAchievementWithHaptic(achievement)}
                style={[styles.shareIconButton, { backgroundColor: achievement.color + '20' }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="share-social" size={18} color={achievement.color} />
              </TouchableOpacity>
              <View style={[styles.checkmark, { backgroundColor: achievement.color }]}>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </View>
            </View>
          )}
        </View>
      </View>
    );
    
    // Wrap newly unlocked achievements in animated view
    if (isNewlyUnlocked) {
      return (
        <Animated.View 
          key={achievement.id}
          style={{ transform: [{ scale: pulseAnim }] }}
        >
          {cardContent}
        </Animated.View>
      );
    }
    
    return <View key={achievement.id}>{cardContent}</View>;
  };

  const handleCategoryPress = (categoryId: Achievement['category'] | 'all') => {
    lightHaptic();
    setSelectedCategory(categoryId);
  };

  const handleShareAchievementWithHaptic = async (achievement: Achievement) => {
    successHaptic();
    await handleShareAchievement(achievement);
  };

  return (
    <Screen>
      {/* Celebration Confetti */}
      <Confetti 
        active={showConfetti} 
        onComplete={() => setShowConfetti(false)}
        pieceCount={60}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Achievements</Text>
          <TouchableOpacity
            onPress={handleShareProgress}
            style={styles.shareButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="share-social" size={24} color={Theme.colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Streak Counter */}
        <StreakCounter streak={appState.currentStreak} onShare={handleShareStreak} />

        {/* Calendar Toggle */}
        <TouchableOpacity
          onPress={() => setShowCalendar(!showCalendar)}
          style={styles.calendarToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showCalendar ? 'calendar' : 'calendar-outline'}
            size={20}
            color={Theme.colors.accent}
          />
          <Text style={styles.calendarToggleText}>
            {showCalendar ? 'Hide' : 'Show'} Calendar View
          </Text>
          <Ionicons
            name={showCalendar ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Streak Calendar */}
        {showCalendar && (
          <StreakCalendar
            completedDates={completedDates}
            currentStreak={appState.currentStreak}
            longestStreak={calculateLongestStreak()}
          />
        )}

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{unlockedAchievements.length}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{glowPoints}</Text>
            <Text style={styles.statLabel}>Glow Points</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilters}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={18}
                color={
                  selectedCategory === category.id
                    ? Theme.colors.accent
                    : Theme.colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <Text style={styles.progressHeaderText}>
            {unlockedCount} of {totalCount} achievements
          </Text>
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsList}>
          {filteredAchievements.map(renderAchievementCard)}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
  },
  backButton: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.radius.full,
  },
  shareButton: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.radius.full,
  },
  headerTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    ...Theme.shadow.subtle,
  },
  statValue: {
    ...Theme.typography.h2,
    color: Theme.colors.accent,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  categoryFilters: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.surface,
    gap: Theme.spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: Theme.colors.accent + '20',
  },
  categoryChipText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: Theme.colors.accent,
  },
  progressHeader: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  progressHeaderText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textSecondary,
  },
  achievementsList: {
    paddingHorizontal: Theme.spacing.lg,
  },
  achievementCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadow.medium,
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  achievementCardNewlyUnlocked: {
    borderWidth: 2,
    borderColor: Theme.colors.gold,
    shadowColor: Theme.colors.gold,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    ...Theme.typography.bodyBold,
    fontSize: 17,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  achievementTitleLocked: {
    color: Theme.colors.textSecondary,
  },
  achievementDescription: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  achievementDescriptionLocked: {
    color: Theme.colors.textTertiary,
  },
  progressContainer: {
    marginBottom: Theme.spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.full,
    overflow: 'hidden',
    marginBottom: Theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: Theme.radius.full,
  },
  progressText: {
    ...Theme.typography.small,
    color: Theme.colors.textTertiary,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.gold + '20',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs / 2,
    borderRadius: Theme.radius.sm,
    gap: Theme.spacing.xs / 2,
  },
  rewardText: {
    ...Theme.typography.small,
    color: Theme.colors.gold,
    fontWeight: '700',
  },
  achievementActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  shareIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    gap: Theme.spacing.sm,
    ...Theme.shadow.subtle,
  },
  calendarToggleText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
  },
});
