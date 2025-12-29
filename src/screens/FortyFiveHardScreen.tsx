/**
 * 45 NOW Screen - THE CONTRACT
 * Shows the system, rules, progress, and motivation
 * NOT for task execution (that's the Today tab)
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/layout/Screen';
import { GlassCard, SectionCard, ProgressBar, PrimaryButton } from '../components/ui';
import { tokens } from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';
import { useTabBarInset } from '../hooks/useTabBarInset';
import {
  CHALLENGE_DURATION_DAYS,
} from '../utils/constants';

export default function FortyFiveHardScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const { appState, getTodayProgress } = useApp();
  const tabBarInset = useTabBarInset();
  const todayProgress = useMemo(() => getTodayProgress(), [getTodayProgress]);

  // Calculate challenge progress
  const currentDay = appState.totalDays || 1;
  const daysRemaining = Math.max(0, CHALLENGE_DURATION_DAYS - currentDay);
  const challengeProgress = (currentDay / CHALLENGE_DURATION_DAYS) * 100;

  // Calculate daily completion status from Today's data
  const dailyRequirements = [
    {
      id: 'tasks',
      title: '3 Must-Do Tasks',
      icon: 'star',
      color: tokens.colors.warning,
      completed: todayProgress.tasks.filter(t => t.isMustDo && t.completed).length >= 3,
    },
    {
      id: 'affirmations',
      title: '3 Affirmation Sessions',
      icon: 'sparkles',
      color: tokens.colors.accent,
      completed: (todayProgress.guidedSessions?.length || 0) >= 3,
    },
    {
      id: 'meditation',
      title: '1 Meditation',
      icon: 'leaf',
      color: '#4ECDC4',
      completed: todayProgress.meditationCompleted === true,
    },
    {
      id: 'vision',
      title: '1 Vision Image',
      icon: 'images',
      color: '#9D4EDD',
      completed: todayProgress.visionImageAddedToday === true,
    },
    {
      id: 'journal',
      title: '1 Journal Entry',
      icon: 'book',
      color: '#FF6B9D',
      completed: todayProgress.gratitudeEntry?.trim().length > 0,
    },
  ];

  const completedToday = dailyRequirements.filter(r => r.completed).length;
  const isDayComplete = completedToday === dailyRequirements.length;

  return (
    <Screen
      scroll
      title="45 NOW Challenge"
      subtitle="Transform your life in 45 days"
      contentContainerStyle={{
        paddingTop: tokens.spacing.xs,
        paddingBottom: tabBarInset,
      }}
    >
      {/* Challenge Explanation - Hero Card */}
      <GlassCard style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroIcon}>
            <Ionicons name="trophy" size={32} color={tokens.colors.warning} />
          </View>
          <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>The 45 NOW Challenge</Text>
          <Text style={[styles.heroDescription, { color: theme.colors.textSecondary }]}>
            Complete 5 daily tasks for 45 consecutive days to transform your habits and manifest your goals through consistent action.
          </Text>
        </View>
      </GlassCard>

      {/* Day Progress - Big & Prominent */}
      <SectionCard style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: theme.colors.textPrimary }]}>Your Progress</Text>
          {isDayComplete && (
            <View style={styles.todayCompleteBadge}>
              <Ionicons name="checkmark-circle" size={18} color={tokens.colors.success} />
              <Text style={styles.todayCompleteText}>Today Done!</Text>
            </View>
          )}
        </View>

        <View style={styles.dayCounterContainer}>
          <View style={styles.dayCounter}>
            <Text style={[styles.dayNumberLabel, { color: theme.colors.textSecondary }]}>Day</Text>
            <Text style={[styles.dayNumber, { color: theme.colors.accent }]}>{currentDay}</Text>
          </View>
          <Text style={[styles.dayDivider, { color: theme.colors.textSecondary }]}>of</Text>
          <View style={styles.dayTotal}>
            <Text style={[styles.dayTotalNumber, { color: theme.colors.textSecondary }]}>{CHALLENGE_DURATION_DAYS}</Text>
          </View>
        </View>

        <ProgressBar
          progress={challengeProgress / 100}
          height={12}
          fillColor={challengeProgress === 100 ? tokens.colors.success : tokens.colors.accent}
          trackColor={`${tokens.colors.accent}15`}
        />

        <Text style={[styles.daysRemainingText, { color: theme.colors.textSecondary }]}>
          {daysRemaining === 0
            ? '🎉 Challenge complete! Amazing work!'
            : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} to go`}
        </Text>
      </SectionCard>

      {/* Daily Requirements - Reference Only (NOT Interactive) */}
      <SectionCard style={styles.requirementsCard}>
        <Text style={[styles.requirementsTitle, { color: theme.colors.textPrimary }]}>Daily Requirements</Text>
        <Text style={[styles.requirementsSubtitle, { color: theme.colors.textSecondary }]}>
          Complete these 5 tasks every day
        </Text>

        <View style={styles.requirementsList}>
          {dailyRequirements.map((req, index) => (
            <View key={req.id}>
              <View style={styles.requirementRow}>
                <View style={[styles.requirementIcon, { backgroundColor: `${req.color}20` }]}>
                  <Ionicons name={req.icon as any} size={20} color={req.color} />
                </View>
                <Text style={[styles.requirementText, { color: theme.colors.textPrimary }]}>{req.title}</Text>
                {req.completed && (
                  <Ionicons name="checkmark-circle" size={20} color={tokens.colors.success} />
                )}
              </View>
              {index < dailyRequirements.length - 1 && (
                <View style={styles.requirementSeparator} />
              )}
            </View>
          ))}
        </View>

        {!isDayComplete && (
          <TouchableOpacity
            style={styles.goToTodayButton}
            onPress={() => navigation.navigate('Today')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[tokens.colors.accent, tokens.colors.primary]}
              style={styles.goToTodayGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.goToTodayText}>Go to Today Tab to Execute</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </SectionCard>

      {/* Streak & Consistency */}
      <SectionCard style={styles.streakCard}>
        <Text style={[styles.streakTitle, { color: theme.colors.textPrimary }]}>Your Consistency</Text>

        <View style={styles.streakDisplay}>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={48} color={tokens.colors.warning} />
            <Text style={styles.streakNumber}>{appState.currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>Day Streak</Text>
          </View>

          <View style={styles.streakStats}>
            <View style={styles.streakStat}>
              <Text style={[styles.streakStatNumber, { color: theme.colors.accent }]}>{appState.totalDays || 0}</Text>
              <Text style={[styles.streakStatLabel, { color: theme.colors.textSecondary }]}>Total Days</Text>
            </View>
            <View style={styles.streakStat}>
              <Text style={[styles.streakStatNumber, { color: theme.colors.accent }]}>
                {Math.round((appState.totalDays / CHALLENGE_DURATION_DAYS) * 100)}%
              </Text>
              <Text style={[styles.streakStatLabel, { color: theme.colors.textSecondary }]}>Complete</Text>
            </View>
          </View>
        </View>

        {/* Motivation Quote */}
        <View style={styles.motivationBox}>
          <Text style={[styles.motivationQuote, { color: theme.colors.textPrimary }]}>
            "Consistency is the bridge between goals and accomplishment"
          </Text>
          <Text style={[styles.motivationAuthor, { color: theme.colors.textSecondary }]}>— Jim Rohn</Text>
        </View>
      </SectionCard>

      {/* Why This Works */}
      <GlassCard style={styles.whyCard}>
        <Text style={[styles.whyTitle, { color: theme.colors.textPrimary }]}>Why 45 Days?</Text>
        <View style={styles.whyList}>
          <View style={styles.whyItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={tokens.colors.accent} />
            <Text style={[styles.whyText, { color: theme.colors.textSecondary }]}>
              Research shows it takes <Text style={[styles.whyBold, { color: theme.colors.textPrimary }]}>21-66 days</Text> to form a habit
            </Text>
          </View>
          <View style={styles.whyItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={tokens.colors.accent} />
            <Text style={[styles.whyText, { color: theme.colors.textSecondary }]}>
              45 days solidifies new behaviors into <Text style={[styles.whyBold, { color: theme.colors.textPrimary }]}>lasting change</Text>
            </Text>
          </View>
          <View style={styles.whyItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={tokens.colors.accent} />
            <Text style={[styles.whyText, { color: theme.colors.textSecondary }]}>
              Consistent daily action <Text style={[styles.whyBold, { color: theme.colors.textPrimary }]}>rewires your brain</Text>
            </Text>
          </View>
          <View style={styles.whyItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={tokens.colors.accent} />
            <Text style={[styles.whyText, { color: theme.colors.textSecondary }]}>
              Builds <Text style={[styles.whyBold, { color: theme.colors.textPrimary }]}>discipline and momentum</Text> for life transformation
            </Text>
          </View>
        </View>
      </GlassCard>

      {/* Rules */}
      <GlassCard style={styles.rulesCard}>
        <Text style={[styles.rulesTitle, { color: theme.colors.textPrimary }]}>The Rules</Text>
        <View style={styles.rulesList}>
          <View style={styles.ruleItem}>
            <Text style={[styles.ruleNumber, { color: theme.colors.accent }]}>1.</Text>
            <Text style={[styles.ruleText, { color: theme.colors.textPrimary }]}>Complete all 5 tasks every single day</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={[styles.ruleNumber, { color: theme.colors.accent }]}>2.</Text>
            <Text style={[styles.ruleText, { color: theme.colors.textPrimary }]}>If you miss a day, restart from Day 1</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={[styles.ruleNumber, { color: theme.colors.accent }]}>3.</Text>
            <Text style={[styles.ruleText, { color: theme.colors.textPrimary }]}>No excuses, no skipping, total commitment</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={[styles.ruleNumber, { color: theme.colors.accent }]}>4.</Text>
            <Text style={[styles.ruleText, { color: theme.colors.textPrimary }]}>Trust the process and stay consistent</Text>
          </View>
        </View>
      </GlassCard>

      {/* Extra bottom padding */}
      <View style={{ height: 110 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Hero Card
  heroCard: {
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.xl,
    backgroundColor: `${tokens.colors.primary}10`,
  },
  heroContent: {
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${tokens.colors.warning}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.xs,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroDescription: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Progress Card
  progressCard: {
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayCompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    backgroundColor: `${tokens.colors.success}15`,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
  },
  todayCompleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.success,
  },
  dayCounterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  dayCounter: {
    alignItems: 'center',
  },
  dayNumberLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -2,
    lineHeight: 56,
  },
  dayDivider: {
    fontSize: 24,
    fontWeight: '300',
    marginTop: 20,
  },
  dayTotal: {
    alignItems: 'center',
    marginTop: 20,
  },
  dayTotalNumber: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -1,
  },
  daysRemainingText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: tokens.spacing.md,
  },

  // Requirements Card
  requirementsCard: {
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  requirementsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  requirementsSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: tokens.spacing.lg,
  },
  requirementsList: {
    marginBottom: tokens.spacing.lg,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  requirementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  requirementSeparator: {
    height: 1,
    backgroundColor: 'rgba(31, 18, 53, 0.05)',
    marginLeft: 52,
  },
  goToTodayButton: {
    borderRadius: tokens.radii.md,
    overflow: 'hidden',
    ...tokens.shadows.card,
  },
  goToTodayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  goToTodayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Streak Card
  streakCard: {
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: tokens.spacing.lg,
    letterSpacing: -0.3,
  },
  streakDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: `${tokens.colors.warning}10`,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radii.lg,
    minWidth: 120,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: tokens.colors.warning,
    marginTop: 4,
    letterSpacing: -1,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  streakStats: {
    flex: 1,
    gap: tokens.spacing.md,
  },
  streakStat: {
    backgroundColor: tokens.colors.surface,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
  },
  streakStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  streakStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  motivationBox: {
    backgroundColor: `${tokens.colors.accent}10`,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radii.md,
    borderLeftWidth: 4,
    borderLeftColor: tokens.colors.accent,
  },
  motivationQuote: {
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: tokens.spacing.xs,
  },
  motivationAuthor: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'right',
  },

  // Why Card
  whyCard: {
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  whyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: tokens.spacing.md,
  },
  whyList: {
    gap: tokens.spacing.md,
  },
  whyItem: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    alignItems: 'flex-start',
  },
  whyText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  whyBold: {
    fontWeight: '600',
  },

  // Rules Card
  rulesCard: {
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.lg,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: tokens.spacing.md,
  },
  rulesList: {
    gap: tokens.spacing.md,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  ruleNumber: {
    fontSize: 16,
    fontWeight: '700',
    width: 24,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
});
