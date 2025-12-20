import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { UnifiedCard } from '../components/UnifiedCard';
import { ListRow } from '../components/ListRow';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { successHaptic, lightHaptic, warningHaptic, celebrationHaptic } from '../utils/haptics';
import { DayCompleteCelebration } from '../components/DayCompleteCelebration';
import { 
  REQUIRED_DAILY_AFFIRMATION_SESSIONS, 
  REQUIRED_DAILY_MUST_DO_TASKS,
  CHALLENGE_DURATION_DAYS,
  POINTS 
} from '../utils/constants';

export default function FortyFiveHardScreen({ navigation }: any) {
  const { getTodayProgress, updateTasks, completeMeditation, appState, addGlowPoints } = useApp();
  // Memoize todayProgress to prevent recalculation
  const todayProgress = useMemo(() => getTodayProgress(), [getTodayProgress]);
  const [newTaskText, setNewTaskText] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const hasShownCelebration = useRef(false);
  const previousCompletionState = useRef(false);

  // Memoize tasks initialization
  const tasks = useMemo(() => 
    todayProgress.tasks.length === 0
      ? Array.from({ length: REQUIRED_DAILY_MUST_DO_TASKS }, (_, i) => ({
          id: String(i + 1),
          text: '',
          completed: false,
          isMustDo: true,
          createdAt: new Date().toISOString(),
        }))
      : todayProgress.tasks,
    [todayProgress.tasks]
  );

  // Memoize completion checks
  const mustDoTasks = useMemo(() => tasks.filter((t) => t.isMustDo), [tasks]);
  const allMustDoComplete = useMemo(() => 
    mustDoTasks.every((t) => t.completed && t.text.trim() !== ''),
    [mustDoTasks]
  );
  const allAffirmationsComplete = useMemo(() => 
    (todayProgress.guidedSessions?.length || 0) >= REQUIRED_DAILY_AFFIRMATION_SESSIONS,
    [todayProgress.guidedSessions?.length]
  );
  const meditationComplete = useMemo(() => 
    todayProgress.meditationCompleted === true,
    [todayProgress.meditationCompleted]
  );
  const isDayComplete = useMemo(() => 
    allMustDoComplete && allAffirmationsComplete && meditationComplete,
    [allMustDoComplete, allAffirmationsComplete, meditationComplete]
  );

  // Watch for day completion to trigger celebration
  useEffect(() => {
    // Only show celebration when transitioning from incomplete to complete
    // And only once per session
    if (isDayComplete && !previousCompletionState.current && !hasShownCelebration.current) {
      hasShownCelebration.current = true;
      setShowCelebration(true);
      celebrationHaptic();
      
      // Award bonus glow points for completing the day
      if (addGlowPoints) {
        addGlowPoints(POINTS.DAY_COMPLETE_BONUS, 'Day Complete Bonus');
      }

      // Check if this is first day complete and prompt for rating after a delay
      const checkFirstDayComplete = async () => {
        const { promptForRating } = await import('../utils/appRating');
        const completedDays = Object.values(appState.dailyProgress || {}).filter(day => day.isComplete).length;
        const isFirstDayComplete = completedDays === 1;
        
        // Prompt after celebration animation (2 seconds delay)
        setTimeout(async () => {
          await promptForRating({
            streak: appState.currentStreak,
            totalDays: appState.totalDays,
            dayCompleted: true,
            isFirstDayComplete,
          });
        }, 2000);
      };
      
      checkFirstDayComplete();
    }
    previousCompletionState.current = isDayComplete;
  }, [isDayComplete, appState]);

  // Reset celebration flag at midnight (when day changes)
  useEffect(() => {
    hasShownCelebration.current = false;
    previousCompletionState.current = false;
  }, [todayProgress.date]);

  const toggleTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const wasCompleted = task?.completed || false;
    
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    updateTasks(updatedTasks);
    
    // Haptic feedback
    if (!wasCompleted) {
      successHaptic(); // Task completed
    } else {
      lightHaptic(); // Task uncompleted
    }
  }, [updateTasks]);

  const updateTaskText = useCallback((taskId: string, text: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, text } : task
    );
    updateTasks(updatedTasks);
  }, [updateTasks, tasks]);

  const addTask = useCallback(() => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText,
        completed: false,
        isMustDo: false,
        createdAt: new Date().toISOString(),
      };
      updateTasks([...tasks, newTask]);
      setNewTaskText('');
      lightHaptic();
    }
  }, [updateTasks, tasks, newTaskText]);

  const deleteTask = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task?.isMustDo) {
      warningHaptic();
      Alert.alert('Cannot Delete', 'The 3 must-do tasks cannot be deleted.');
      return;
    }
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    updateTasks(updatedTasks);
    lightHaptic();
  }, [updateTasks, tasks]);

  const openAffirmationEntry = useCallback((period: 'morning' | 'afternoon' | 'evening') => {
    navigation.navigate('AffirmationEntry', { period });
  }, [navigation]);

  const getCurrentPeriod = (): 'morning' | 'afternoon' | 'evening' | null => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 24) return 'evening';
    return null;
  };

  const optionalTasks = tasks.filter((t) => !t.isMustDo);
  const currentPeriod = getCurrentPeriod();

  const handleCelebrationClose = () => {
    setShowCelebration(false);
  };

  return (
    <Screen>
      <AppHeader
        title="Today's Tasks"
        subtitle={`Day ${appState.totalDays} of ${CHALLENGE_DURATION_DAYS}`}
        rightIcon={{
          name: 'notifications-outline',
          onPress: () => navigation.navigate('NotificationSettings'),
          accessibilityLabel: 'Notification Settings',
          color: Theme.colors.accent,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Day Complete Banner */}
        {isDayComplete && (
          <UnifiedCard delay={0}>
            <View style={styles.completeBanner}>
              <View style={styles.completeBannerIcon}>
                <Ionicons name="trophy" size={32} color="#FFD700" />
              </View>
              <View style={styles.completeBannerText}>
                <Text style={styles.completeBannerTitle}>🎉 Day Complete!</Text>
                <Text style={styles.completeBannerSubtitle}>
                  Amazing work! You've completed all tasks for today.
                </Text>
              </View>
            </View>
          </UnifiedCard>
        )}

        {/* Must-Do Tasks */}
        <UnifiedCard delay={0}>
          <Text style={styles.sectionTitle}>⭐ {REQUIRED_DAILY_MUST_DO_TASKS} Must-Do Tasks</Text>
          <Text style={styles.sectionSubtitle}>These MUST be completed today</Text>
          {mustDoTasks.map((task, index) => (
            <View key={task.id} style={styles.mustDoTaskContainer}>
              <TouchableOpacity
                onPress={() => toggleTask(task.id)}
                style={styles.checkbox}
                accessibilityLabel={task.completed ? 'Mark incomplete' : 'Mark complete'}
                accessibilityRole="button"
              >
                <Ionicons
                  name={task.completed ? 'checkbox' : 'square-outline'}
                  size={28}
                  color={task.completed ? Theme.colors.gold : Theme.colors.accent}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.mustDoInput}
                placeholder={`Must-Do Task ${index + 1}`}
                placeholderTextColor={Theme.colors.textTertiary}
                value={task.text}
                onChangeText={(text) => updateTaskText(task.id, text)}
              />
            </View>
          ))}
        </UnifiedCard>

        {/* Guided Affirmations */}
        <UnifiedCard delay={100}>
          <Text style={styles.sectionTitle}>✨ {REQUIRED_DAILY_AFFIRMATION_SESSIONS} Guided Affirmations</Text>
          <Text style={styles.sectionSubtitle}>Listen to {REQUIRED_DAILY_AFFIRMATION_SESSIONS} sessions today (any category)</Text>

          <View style={styles.affirmationContainer}>
            <Text style={styles.progressText}>
              Completed: {todayProgress.guidedSessions?.length || 0} / {REQUIRED_DAILY_AFFIRMATION_SESSIONS}
            </Text>

            <ListRow
              title="Browse Affirmation Sessions"
              subtitle={
                todayProgress.guidedSessions?.length === 0
                  ? 'Start your first session'
                  : todayProgress.guidedSessions?.length === 1
                  ? `${REQUIRED_DAILY_AFFIRMATION_SESSIONS - 1} more to go today`
                  : todayProgress.guidedSessions?.length === 2
                  ? '1 more to go today'
                  : 'All done! ✓'
              }
              icon="sparkles"
              iconColor={Theme.colors.gold}
              onPress={() => navigation.navigate('Affirmations')}
            />

            {/* Show completed sessions */}
            {todayProgress.guidedSessions?.map((session) => (
              <View key={session.id} style={styles.completedSession}>
                <Ionicons name="checkmark-circle" size={20} color={Theme.colors.success} />
                <Text style={styles.completedSessionText}>
                  {session.title} - {session.category}
                </Text>
              </View>
            ))}
          </View>
        </UnifiedCard>

        {/* Meditation */}
        <UnifiedCard delay={200}>
          <Text style={styles.sectionTitle}>🧘 Guided Meditation</Text>
          <Text style={styles.sectionSubtitle}>Complete once today</Text>
          <TouchableOpacity
            style={[
              styles.meditationButton,
              todayProgress.meditationCompleted && styles.meditationCompleted,
            ]}
            onPress={() => navigation.navigate('MeditationScreen')}
            accessibilityRole="button"
            accessibilityLabel={
              todayProgress.meditationCompleted
                ? 'Meditation complete'
                : 'Start meditation'
            }
          >
            <Ionicons
              name={todayProgress.meditationCompleted ? 'checkmark-circle' : 'play-circle-outline'}
              size={32}
              color={Theme.colors.textInverse}
            />
            <Text style={styles.meditationButtonText}>
              {todayProgress.meditationCompleted ? 'Meditation Complete ✓' : 'Start Meditation'}
            </Text>
          </TouchableOpacity>
        </UnifiedCard>

        {/* Optional Tasks */}
        <UnifiedCard delay={300}>
          <Text style={styles.sectionTitle}>Additional Tasks</Text>
          <Text style={styles.sectionSubtitle}>Optional but encouraged</Text>
          {optionalTasks.map((task) => (
            <ListRow
              key={task.id}
              title={task.text || 'Untitled task'}
              completed={task.completed}
              icon="square-outline"
              iconColor={task.completed ? Theme.colors.accent : Theme.colors.textTertiary}
              rightIcon="trash-outline"
              onPress={() => toggleTask(task.id)}
              onRightIconPress={() => deleteTask(task.id)}
            />
          ))}

          <View style={styles.addTaskContainer}>
            <TextInput
              style={styles.addTaskInput}
              placeholder="Add optional task..."
              placeholderTextColor={Theme.colors.textTertiary}
              value={newTaskText}
              onChangeText={setNewTaskText}
              onSubmitEditing={addTask}
            />
            <TouchableOpacity
              onPress={addTask}
              style={styles.addButton}
              accessibilityRole="button"
              accessibilityLabel="Add task"
            >
              <Ionicons name="add-circle" size={32} color={Theme.colors.accent} />
            </TouchableOpacity>
          </View>
        </UnifiedCard>

        <View style={{ height: Theme.spacing.xxxl }} />
      </ScrollView>

      {/* Day Complete Celebration Modal */}
      <DayCompleteCelebration
        visible={showCelebration}
        onClose={handleCelebrationClose}
        dayNumber={appState.totalDays}
        streakCount={appState.currentStreak}
        glowPointsEarned={50}
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
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  sectionSubtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
  },
  mustDoTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.accentSoft,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.gold,
  },
  checkbox: {
    marginRight: Theme.spacing.md,
    minWidth: TOUCH_TARGET_MIN,
    minHeight: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mustDoInput: {
    flex: 1,
    color: Theme.colors.textPrimary,
    ...Theme.typography.body,
  },
  affirmationContainer: {
    gap: Theme.spacing.md,
  },
  progressText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.gold,
    marginBottom: Theme.spacing.sm,
  },
  completedSession: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.sm,
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  completedSessionText: {
    ...Theme.typography.caption,
    color: Theme.colors.success,
  },
  meditationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
    gap: Theme.spacing.md,
    minHeight: TOUCH_TARGET_MIN + Theme.spacing.md,
  },
  meditationCompleted: {
    backgroundColor: Theme.colors.success,
  },
  meditationButtonText: {
    ...Theme.typography.h3,
    color: Theme.colors.textInverse,
  },
  addTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  addTaskInput: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.sm,
    padding: Theme.spacing.md,
    color: Theme.colors.textPrimary,
    ...Theme.typography.body,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  addButton: {
    padding: Theme.spacing.xs,
    minWidth: TOUCH_TARGET_MIN,
    minHeight: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    gap: Theme.spacing.md,
  },
  completeBannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBannerText: {
    flex: 1,
  },
  completeBannerTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.gold,
    marginBottom: Theme.spacing.xs,
  },
  completeBannerSubtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
});
