import React, { useState, useEffect } from 'react';
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
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { UnifiedCard } from '../components/UnifiedCard';
import { ListRow } from '../components/ListRow';
import { Theme } from '../utils/theme';
import { MoodCheckIn } from '../components/MoodCheckIn';
import { MoodType, EnergyLevel, getMoodOption, getEnergyOption } from '../data/moodTracking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOAL_MESSAGES: Record<string, string> = {
  wealth: "Let's manifest abundance",
  love: "Let's attract meaningful connections",
  health: "Let's nurture your wellbeing",
  career: "Let's elevate your professional path",
  happiness: "Let's cultivate joy",
  spirituality: "Let's deepen your spiritual practice",
};

export default function HomeScreen({ navigation }: any) {
  const { appState, getTodayProgress, saveMoodEntry, getTodayMood } = useApp();
  const todayProgress = getTodayProgress();
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [todayMoodEntry, setTodayMoodEntry] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const [userGoal, setUserGoal] = useState<string>('');

  useEffect(() => {
    loadTodayMood();
    loadOnboardingData();
  }, []);

  const loadTodayMood = async () => {
    const mood = await getTodayMood();
    setTodayMoodEntry(mood);
  };

  const loadOnboardingData = async () => {
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
  };

  const handleMoodSubmit = async (mood: MoodType, energy: EnergyLevel, note?: string) => {
    await saveMoodEntry(mood, energy, note);
    await loadTodayMood();
  };

  const today = new Date();
  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get must-do tasks (first 3 tasks)
  const mustDoTasks = todayProgress.tasks.filter(t => t.isMustDo);
  const mustDoCompleted = mustDoTasks.filter(t => t.completed).length;

  const dailyPractices = [
    {
      id: 'must-do-tasks',
      title: '3 Must-Do Tasks',
      subtitle: `${mustDoCompleted}/3 completed`,
      icon: 'star',
      color: Theme.colors.gold,
      completed: mustDoCompleted === 3,
      action: () => navigation.navigate('45 NOW'),
    },
    {
      id: 'guided-affirmations',
      title: 'Guided Affirmations',
      subtitle: `${todayProgress.guidedSessions?.length || 0}/3 sessions`,
      icon: 'sparkles',
      color: Theme.colors.accent,
      completed: (todayProgress.guidedSessions?.length || 0) >= 3,
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
  ];

  const completedCount = dailyPractices.filter(p => p.completed).length;
  const progressPercentage = (completedCount / dailyPractices.length) * 100;

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
      >
        {/* Personalized Welcome Message */}
        {(userName || userGoal) && (
          <UnifiedCard delay={0} style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>
              {userName ? `Hi ${userName}` : 'Welcome'}{userGoal ? `, ${GOAL_MESSAGES[userGoal]}` : ''}! ✨
            </Text>
          </UnifiedCard>
        )}

        {/* Streak Card */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AchievementsScreen')}
          activeOpacity={0.8}
        >
          <UnifiedCard delay={0} style={styles.streakCard}>
            <LinearGradient
              colors={['#C77DFF', '#9D4EDD']}
              style={styles.streakGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.streakContent}>
                <View style={styles.streakLeft}>
                  <Ionicons name="flame" size={40} color={Theme.colors.textInverse} />
                  <View style={styles.streakInfo}>
                    <Text style={styles.streakNumber}>{appState.currentStreak}</Text>
                    <Text style={styles.streakLabel}>Day Streak</Text>
                  </View>
                </View>
                <View style={styles.streakRight}>
                  <Text style={styles.streakMessage}>
                    {appState.currentStreak === 0
                      ? 'Start your journey today!'
                      : appState.currentStreak < 7
                      ? 'Keep going! 🌟'
                      : appState.currentStreak < 21
                      ? 'Amazing progress! 💫'
                      : 'You\'re unstoppable! ✨'}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={Theme.colors.textInverse} style={{ opacity: 0.7 }} />
                </View>
              </View>
            </LinearGradient>
          </UnifiedCard>
        </TouchableOpacity>

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
            <Text style={styles.progressText}>
              {completedCount}/{dailyPractices.length}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
            />
          </View>
        </UnifiedCard>

        {/* Daily Practices */}
        <UnifiedCard delay={100}>
          <Text style={styles.sectionTitle}>Daily Practices</Text>
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
          </View>
        </UnifiedCard>

        {/* Motivational Quote */}
        <UnifiedCard delay={200}>
          <View style={styles.quoteContainer}>
            <Ionicons name="quote" size={24} color={Theme.colors.accent} />
            <Text style={styles.quoteText}>
              "Your thoughts create your reality. Focus on what you want, not what you fear."
            </Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.lg,
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
  streakCard: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 0,
  },
  streakGradient: {
    padding: Theme.spacing.xl,
    borderRadius: Theme.radius.lg,
  },
  streakContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.lg,
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
  streakRight: {
    flex: 1,
    marginLeft: Theme.spacing.lg,
  },
  streakMessage: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
    textAlign: 'right',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  progressText: {
    ...Theme.typography.subtitle,
    color: Theme.colors.accent,
  },
  progressBar: {
    height: 8,
    backgroundColor: Theme.colors.accentSoft,
    borderRadius: Theme.radius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.radius.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.md,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
    ...Theme.shadow.medium,
  },
  quickActionGradient: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    gap: Theme.spacing.sm,
    minHeight: 100,
    justifyContent: 'center',
  },
  quickActionText: {
    ...Theme.typography.captionBold,
    color: Theme.colors.textInverse,
    textAlign: 'center',
  },
  quoteContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  quoteText: {
    flex: 1,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
});
