/**
 * Tasks Screen - Premium Purple Glass Design with Autosave
 * Apple-quality task manager with glassmorphism
 *
 * Features:
 * - 3 Must-Do tasks for daily challenge (priority section at top)
 * - Additional tasks below (rollover, not daily-specific)
 * - Autosave: debounced for text (400ms), immediate for checkboxes/deletes
 * - Premium glass design matching floating tab bar
 * - Smooth animations, haptic feedback, keyboard handling
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Screen } from '../components/layout/Screen';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '../theme/tokens';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { successHaptic, lightHaptic } from '../utils/haptics';
import { useTabBarInset } from '../hooks/useTabBarInset';
import { useTheme } from '../theme/ThemeProvider';
import { REQUIRED_DAILY_MUST_DO_TASKS } from '../utils/constants';
import { TasksScreenProps } from '../types/navigation';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { trackEvent } from '../utils/analytics';

interface ExtendedTask extends Task {
  isEditing?: boolean;
}

// Glass styling constants (matching footer)
const GLASS_BLUR_INTENSITY = 25; // Lighter than footer (50)
const GLASS_BG_LIGHT = 'rgba(255, 255, 255, 0.55)';
const GLASS_BG_DARK = 'rgba(20, 20, 24, 0.55)';
const GLASS_BORDER_LIGHT = 'rgba(124, 58, 237, 0.18)'; // Purple tint
const GLASS_BORDER_DARK = 'rgba(124, 58, 237, 0.25)';
const GLASS_OVERLAY_LIGHT = 'rgba(255, 255, 255, 0.6)';
const GLASS_OVERLAY_DARK = 'rgba(255, 255, 255, 0.15)';

// Autosave debounce delay (ms)
const AUTOSAVE_DEBOUNCE = 400;

export default function TasksScreen({ navigation }: TasksScreenProps) {
  useScreenTracking('Tasks');
  const { getTodayProgress, updateTasks } = useApp();
  const tabBarInset = useTabBarInset();
  const { isDark } = useTheme();
  const todayProgress = useMemo(() => getTodayProgress(), [getTodayProgress]);

  // Separate must-do and additional tasks
  // Separate must-do and additional tasks with strict capping
  const mustDoTasks = useMemo(() => {
    const allMustDo = todayProgress.tasks?.filter(t => t.isMustDo) || [];
    // Strict cap at REQUIRED_DAILY_MUST_DO_TASKS
    return allMustDo.slice(0, REQUIRED_DAILY_MUST_DO_TASKS);
  }, [todayProgress.tasks]);

  const additionalTasks = useMemo(() => {
    const allMustDo = todayProgress.tasks?.filter(t => t.isMustDo) || [];
    // Identify overflow must-dos and force them to be additional
    const overflowMustDo = allMustDo.slice(REQUIRED_DAILY_MUST_DO_TASKS).map(t => ({
      ...t,
      isMustDo: false
    }));

    const properAdditional = todayProgress.tasks?.filter(t => !t.isMustDo) || [];
    return [...overflowMustDo, ...properAdditional];
  }, [todayProgress.tasks]);

  // Initialize with 3 must-do slots (required for daily challenge)
  const [editableMustDo, setEditableMustDo] = useState<ExtendedTask[]>(() => {
    const tasks = [...mustDoTasks];
    while (tasks.length < REQUIRED_DAILY_MUST_DO_TASKS) {
      tasks.push({
        id: `temp_${Date.now()}_${tasks.length}`,
        text: '',
        completed: false,
        isMustDo: true,
        createdAt: new Date().toISOString(),
      });
    }
    return tasks;
  });

  const [editableAdditional, setEditableAdditional] = useState<ExtendedTask[]>(additionalTasks);

  // Refs for focusing new task inputs and debounce timers
  const additionalInputRefs = useRef<{ [key: string]: TextInput | null }>({});
  const listRef = useRef<FlatList<ExtendedTask>>(null);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const addTaskTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs to track latest state for autosave (avoids stale closures)
  const editableMustDoRef = useRef(editableMustDo);
  const editableAdditionalRef = useRef(editableAdditional);

  const updateMustDo = useCallback((updater: (prev: ExtendedTask[]) => ExtendedTask[]) => {
    setEditableMustDo(prev => {
      const next = updater(prev);
      editableMustDoRef.current = next;
      return next;
    });
  }, []);

  const updateAdditional = useCallback((updater: (prev: ExtendedTask[]) => ExtendedTask[]) => {
    setEditableAdditional(prev => {
      const next = updater(prev);
      editableAdditionalRef.current = next;
      return next;
    });
  }, []);

  const areTasksEqual = (a: ExtendedTask[], b: ExtendedTask[]) => {
    if (a.length !== b.length) return false;
    return a.every((task, index) => {
      const other = b[index];
      return (
        task.id === other.id &&
        task.text === other.text &&
        task.completed === other.completed &&
        task.isMustDo === other.isMustDo
      );
    });
  };

  // Sync local state when todayProgress changes (e.g., from another screen)
  useEffect(() => {
    const currentMustDo = mustDoTasks;
    const currentAdditional = additionalTasks;

    // Only update if different (avoid unnecessary re-renders)
    if (!areTasksEqual(currentMustDo, editableMustDoRef.current)) {
      const tasks = [...currentMustDo];
      while (tasks.length < REQUIRED_DAILY_MUST_DO_TASKS) {
        tasks.push({
          id: `temp_${Date.now()}_${tasks.length}`,
          text: '',
          completed: false,
          isMustDo: true,
          createdAt: new Date().toISOString(),
        });
      }
      updateMustDo(() => tasks);
    }

    if (!areTasksEqual(currentAdditional, editableAdditionalRef.current)) {
      updateAdditional(() => currentAdditional);
    }
  }, [mustDoTasks, additionalTasks, updateMustDo, updateAdditional]);

  useEffect(() => {
    editableMustDoRef.current = editableMustDo;
  }, [editableMustDo]);

  useEffect(() => {
    editableAdditionalRef.current = editableAdditional;
  }, [editableAdditional]);

  // Autosave function - normalizes task IDs and saves to AppContext
  const autosave = useCallback(async () => {
    // Read from refs to get latest state (avoids stale closures)
    const mustDo = editableMustDoRef.current;
    const additional = editableAdditionalRef.current;

    // Normalize task IDs (replace temp IDs with permanent ones)
    const validMustDo = mustDo.map(t => ({
      ...t,
      id: t.id.startsWith('temp_') ? `task_${Date.now()}_${Math.random()}` : t.id,
    }));

    const validAdditional = additional
      .filter(t => t.text.trim() !== '' || t.completed) // Keep completed tasks even if empty
      .map(t => ({
        ...t,
        id: t.id.startsWith('temp_') ? `task_${Date.now()}_${Math.random()}` : t.id,
      }));

    // Save to AppContext (which triggers AsyncStorage save via debounced effect)
    try {
      await updateTasks([...validMustDo, ...validAdditional]);
    } catch (error) {
      // Ignore autosave failures to avoid blocking UI; user can retry by editing.
    }
  }, [updateTasks]);

  // Debounced autosave for text changes
  const scheduleAutosave = useCallback(() => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = setTimeout(() => {
      autosave();
    }, AUTOSAVE_DEBOUNCE);
  }, [autosave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      if (addTaskTimeoutRef.current) {
        clearTimeout(addTaskTimeoutRef.current);
        addTaskTimeoutRef.current = null;
      }
    };
  }, []);

  // Handle task text change with debounced autosave
  const handleTaskTextChange = useCallback((index: number, text: string, isMustDo: boolean) => {
    if (isMustDo) {
      updateMustDo(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], text };
        return updated;
      });
    } else {
      updateAdditional(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], text };
        return updated;
      });
    }
    // Schedule debounced autosave
    scheduleAutosave();
  }, [scheduleAutosave, updateMustDo, updateAdditional]);

  // Toggle task completion with immediate autosave
  const handleToggle = useCallback((index: number, isMustDo: boolean) => {
    lightHaptic();
    const task = isMustDo ? editableMustDo[index] : editableAdditional[index];
    const wasCompleted = task?.completed || false;

    if (isMustDo) {
      updateMustDo(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], completed: !updated[index].completed };
        return updated;
      });
    } else {
      updateAdditional(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], completed: !updated[index].completed };
        return updated;
      });
    }

    // Track task completion
    if (!wasCompleted) {
      trackEvent('task_completed', {
        is_must_do: isMustDo,
        task_index: index
      });
    }

    // Immediate autosave for checkbox
    autosave();
  }, [autosave, updateMustDo, updateAdditional, editableMustDo, editableAdditional]);

  // Add new additional task - Inserts immediately, focuses, and autosaves
  const handleAddTask = useCallback(() => {
    const newTask: ExtendedTask = {
      id: `task_${Date.now()}_${Math.random()}`,
      text: '',
      completed: false,
      isMustDo: false,
      createdAt: new Date().toISOString(),
      isEditing: true,
    };

    updateAdditional(prev => [...prev, newTask]);
    lightHaptic();
    trackEvent('task_added', { is_must_do: false });

    if (addTaskTimeoutRef.current) {
      clearTimeout(addTaskTimeoutRef.current);
    }
    addTaskTimeoutRef.current = setTimeout(() => {
      const inputRef = additionalInputRefs.current[newTask.id];
      if (inputRef) {
        inputRef.focus();
      }
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Handle blur - remove empty tasks and autosave
  const handleTaskBlur = useCallback((taskId: string, index: number) => {
    updateAdditional(prev => {
      const task = prev[index];
      if (task && task.text.trim() === '' && task.id === taskId && !task.completed) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });
    scheduleAutosave();
  }, [scheduleAutosave, updateAdditional]);

  // Delete task with immediate autosave
  const handleDelete = useCallback((index: number, isMustDo: boolean) => {
    lightHaptic();
    if (isMustDo) {
      updateMustDo(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], text: '', completed: false };
        return updated;
      });
    } else {
      updateAdditional(prev => prev.filter((_, i) => i !== index));
    }
    // Immediate autosave for delete
    autosave();
  }, [autosave, updateMustDo, updateAdditional]);

  const mustDoCompleted = editableMustDo.filter(t => t.completed && t.text.trim() !== '').length;
  const additionalCompleted = editableAdditional.filter(t => t.completed).length;

  // Animated values for checkbox press
  const checkboxScale = useRef(new Animated.Value(1)).current;

  const animateCheckbox = () => {
    Animated.sequence([
      Animated.timing(checkboxScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(checkboxScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCheckboxPress = (index: number, isMustDo: boolean) => {
    animateCheckbox();
    handleToggle(index, isMustDo);
  };

  // List padding: ensure content doesn't hide behind footer
  const scrollPaddingBottom = tabBarInset + tokens.spacing.lg;

  return (
    <Screen
      title="Tasks"
      subtitle="Daily priorities & ongoing work"
      rightAction={{
        icon: 'home-outline',
        onPress: () => {
          navigation.navigate('MainTabs', { screen: 'Today' });
        },
        label: 'Back to Today',
      }}
      scroll={false}
      headerContainerStyle={{ paddingTop: 0 }}
    >
      {/* Root container with flex:1 - ensures proper layout */}
      <View style={styles.rootContainer}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          enabled={true}
        >
          {/* Scrollable Content */}
          <FlatList
            ref={listRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: scrollPaddingBottom },
            ]}
            data={editableAdditional}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <TaskRow
                task={item}
                index={index}
                isMustDo={false}
                onToggle={() => handleCheckboxPress(index, false)}
                onTextChange={(text) => handleTaskTextChange(index, text, false)}
                onDelete={() => handleDelete(index, false)}
                onBlur={() => handleTaskBlur(item.id, index)}
                inputRef={(ref) => {
                  additionalInputRefs.current[item.id] = ref;
                }}
                autoFocus={item.isEditing}
                checkboxScale={checkboxScale}
                isDark={isDark}
              />
            )}
            ListHeaderComponent={
              <>
                {/* Must-Do Today Section - Premium Glass Card */}
                <View style={styles.mustDoSection}>
                  <GlassCard isDark={isDark} style={styles.mustDoCard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionTitleRow}>
                        <View style={styles.mustDoIconBadge}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                        </View>
                        <Text style={styles.mustDoTitle}>Must-Do Today</Text>
                      </View>
                      <View style={styles.progressContainer}>
                        <View style={styles.counterPill}>
                          <Text style={styles.sectionCounter}>
                            {mustDoCompleted} / {REQUIRED_DAILY_MUST_DO_TASKS}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.mustDoSubtitle}>
                      Complete all 3 tasks to finish your daily challenge
                    </Text>

                    {/* 3 Must-Do Task Rows */}
                    <View style={styles.taskList}>
                      {editableMustDo.map((task, index) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          index={index}
                          isMustDo={true}
                          onToggle={() => handleCheckboxPress(index, true)}
                          onTextChange={(text) => handleTaskTextChange(index, text, true)}
                          onDelete={() => handleDelete(index, true)}
                          checkboxScale={checkboxScale}
                          isDark={isDark}
                        />
                      ))}
                    </View>
                  </GlassCard>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Additional Tasks Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Additional Tasks</Text>
                    {editableAdditional.length > 0 && (
                      <View style={styles.counterPill}>
                        <Text style={styles.sectionCounter}>
                          {additionalCompleted} / {editableAdditional.length}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.sectionSubtitle}>
                    Tasks that roll over until completed
                  </Text>
                </View>
              </>
            }
            ListFooterComponent={
              <>
                {/* Add New Task Button - Glass Style */}
                <TouchableOpacity
                  style={styles.addTaskButton}
                  onPress={handleAddTask}
                  activeOpacity={0.7}
                  accessibilityLabel="Add new task"
                  accessibilityRole="button"
                >
                  <View style={styles.addTaskIconContainer}>
                    <Ionicons name="add" size={18} color={tokens.colors.primary} />
                  </View>
                  <Text style={styles.addTaskText}>Add new task</Text>
                </TouchableOpacity>

                {/* Pro Tips - Light Glass Card */}
                <GlassCard isDark={isDark} style={styles.tipsCard} intensity={18}>
                  <View style={styles.tipsHeader}>
                    <Ionicons name="information-circle" size={18} color={tokens.colors.accent} />
                    <Text style={styles.tipsTitle}>Pro Tips</Text>
                  </View>
                  <View style={styles.tipsList}>
                    <View style={styles.tipRow}>
                      <View style={styles.tipDot} />
                      <Text style={styles.tipText}>
                        Must-do tasks reset daily - focus on today's priorities
                      </Text>
                    </View>
                    <View style={styles.tipRow}>
                      <View style={styles.tipDot} />
                      <Text style={styles.tipText}>
                        Additional tasks roll over until you complete them
                      </Text>
                    </View>
                    <View style={styles.tipRow}>
                      <View style={styles.tipDot} />
                      <Text style={styles.tipText}>
                        Be specific: "Walk 30 minutes" instead of "Exercise"
                      </Text>
                    </View>
                    <View style={styles.tipRow}>
                      <View style={styles.tipDot} />
                      <Text style={styles.tipText}>
                        Changes save automatically - no need to tap save
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </>
            }
            ItemSeparatorComponent={() => <View style={styles.taskSeparator} />}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          />
        </KeyboardAvoidingView>
      </View>
    </Screen>
  );
}

// Glass Card Component - Premium Purple Glass
interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
  isDark: boolean;
  intensity?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  isDark,
  intensity = GLASS_BLUR_INTENSITY,
}) => {
  const glassBg = isDark ? GLASS_BG_DARK : GLASS_BG_LIGHT;
  const glassBorder = isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT;
  const glassOverlay = isDark ? GLASS_OVERLAY_DARK : GLASS_OVERLAY_LIGHT;

  return (
    <View style={[styles.glassCard, { borderColor: glassBorder }, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={intensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        >
          <View style={[styles.glassOverlay, { backgroundColor: glassOverlay }]} />
        </BlurView>
      ) : (
        <View style={[styles.glassOverlay, { backgroundColor: glassBg }]} />
      )}
      <View style={styles.glassContent}>{children}</View>
    </View>
  );
};

// Task Row Component - Reusable with animations
interface TaskRowProps {
  task: ExtendedTask;
  index: number;
  isMustDo: boolean;
  onToggle: () => void;
  onTextChange: (text: string) => void;
  onDelete: () => void;
  onBlur?: () => void;
  inputRef?: (ref: TextInput | null) => void;
  autoFocus?: boolean;
  checkboxScale: Animated.Value;
  isDark: boolean;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  index,
  isMustDo,
  onToggle,
  onTextChange,
  onDelete,
  onBlur,
  inputRef,
  autoFocus = false,
  checkboxScale,
  isDark,
}) => {
  const isDisabled = isMustDo && task.text.trim() === '';
  const checkboxColor = isDisabled
    ? tokens.colors.textTertiary
    : task.completed
      ? tokens.colors.success
      : tokens.colors.primary;
  const rowBackground = isDark ? 'rgba(26, 24, 36, 0.65)' : 'rgba(255, 255, 255, 0.75)';
  const rowBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124, 58, 237, 0.12)';
  const deleteBackground = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(28, 27, 34, 0.04)';
  const deleteBorder = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(90, 84, 120, 0.2)';
  const deleteIconColor = isDark ? 'rgba(255, 255, 255, 0.72)' : tokens.colors.textSecondary;

  return (
    <View style={[styles.taskRow, { backgroundColor: rowBackground, borderColor: rowBorder }]}>
      {/* Animated Checkbox */}
      <TouchableOpacity
        onPress={onToggle}
        disabled={isDisabled}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.checkboxContainer}
        accessibilityLabel={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
      >
        <Animated.View style={{ transform: [{ scale: checkboxScale }] }}>
          <Ionicons
            name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={26}
            color={checkboxColor}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Task Input - Seamless styling */}
      <TextInput
        ref={inputRef}
        style={[
          styles.taskInput,
          task.completed && styles.taskInputCompleted,
        ]}
        placeholder={isMustDo ? `Must-do task ${index + 1}` : 'Task name'}
        placeholderTextColor={tokens.colors.textTertiary}
        value={task.text}
        onChangeText={onTextChange}
        onBlur={onBlur}
        maxLength={100}
        returnKeyType="done"
        autoCorrect={false}
        autoFocus={autoFocus}
        editable={true}
        keyboardAppearance={Platform.OS === 'ios' ? (isDark ? 'dark' : 'light') : 'default'}
        selectionColor={tokens.colors.primary}
        underlineColorAndroid="transparent"
        accessibilityLabel={isMustDo ? `Must-do task ${index + 1}` : 'Task name'}
      />

      {/* Delete button */}
      {task.text.trim() !== '' && (
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[styles.deleteButton, { backgroundColor: deleteBackground, borderColor: deleteBorder }]}
          accessibilityLabel="Delete task"
          accessibilityRole="button"
          activeOpacity={0.6}
        >
          <Ionicons name="close" size={16} color={deleteIconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.lg,
  },
  // Must-Do Section
  mustDoSection: {
    marginBottom: tokens.spacing.xl,
  },
  mustDoCard: {
    // Glass card styling handled by GlassCard component
  },
  section: {
    marginBottom: tokens.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mustDoIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${tokens.colors.warning}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mustDoTitle: {
    ...tokens.typography.h2,
    color: tokens.colors.textPrimary,
  },
  sectionTitle: {
    ...tokens.typography.h2,
    color: tokens.colors.textPrimary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionCounter: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.accent,
  },
  counterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: tokens.radii.full,
    backgroundColor: `${tokens.colors.accent}12`,
    borderWidth: 1,
    borderColor: `${tokens.colors.accent}20`,
  },
  mustDoSubtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.md,
  },
  sectionSubtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.md,
  },
  taskList: {
    gap: 10,
    width: '100%',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 56,
    width: '100%',
  },
  checkboxContainer: {
    marginRight: 12,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    flexShrink: 0,
  },
  taskInput: {
    flex: 1,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '500',
    color: tokens.colors.textPrimary,
    padding: 0,
    margin: 0,
    minHeight: 44,
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...(Platform.OS === 'web'
      ? ({
        outlineStyle: 'none',
        outlineWidth: 0,
        outline: 'none',
        border: 'none',
        minWidth: 0,
      } as any)
      : null),
  },
  taskInputCompleted: {
    textDecorationLine: 'line-through',
    color: tokens.colors.textSecondary,
    opacity: 0.7,
  },
  deleteButton: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    flexGrow: 0,
  },
  addTaskButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${tokens.colors.primary}0D`,
    borderRadius: tokens.radii.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: `${tokens.colors.primary}25`,
    minHeight: 56,
  },
  addTaskIconContainer: {
    marginRight: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${tokens.colors.primary}30`,
    backgroundColor: `${tokens.colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTaskText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: tokens.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.borderSubtle,
    marginVertical: tokens.spacing.lg,
    opacity: 0.5,
  },
  taskSeparator: {
    height: 10,
  },
  tipsCard: {
    marginTop: tokens.spacing.md,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: tokens.spacing.sm,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
  },
  tipsList: {
    gap: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.colors.accent,
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    ...tokens.typography.caption,
    color: tokens.colors.textSecondary,
  },
  // Glass Card Styles
  glassCard: {
    borderRadius: tokens.radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...tokens.shadows.floating,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  glassContent: {
    padding: tokens.spacing.lg,
    width: '100%',
  },
});
