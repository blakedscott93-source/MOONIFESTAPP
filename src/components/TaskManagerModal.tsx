/**
 * Task Manager Modal
 * Allows users to add/edit their 3 daily must-do tasks
 * Accessible from Today tab
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { tokens } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { Task } from '../types';
import { PrimaryButton } from './ui';

interface TaskManagerModalProps {
  visible: boolean;
  tasks: Task[];
  onClose: () => void;
  onSave: (tasks: Task[]) => void;
}

const MAX_MUST_DO_TASKS = 3;

export const TaskManagerModal: React.FC<TaskManagerModalProps> = ({
  visible,
  tasks,
  onClose,
  onSave,
}) => {
  const { isDark } = useTheme();
  const [editableTasks, setEditableTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (visible) {
      // Initialize with existing must-do tasks or create empty slots
      const mustDoTasks = tasks.filter(t => t.isMustDo);
      const filledTasks = [...mustDoTasks];

      // Fill up to 3 tasks
      while (filledTasks.length < MAX_MUST_DO_TASKS) {
        filledTasks.push({
          id: `temp_${Date.now()}_${filledTasks.length}`,
          text: '',
          completed: false,
          isMustDo: true,
          createdAt: new Date().toISOString(),
        });
      }

      setEditableTasks(filledTasks);
    }
  }, [visible, tasks]);

  const handleTextChange = (index: number, text: string) => {
    const updated = [...editableTasks];
    updated[index] = { ...updated[index], text };
    setEditableTasks(updated);
  };

  const handleToggleComplete = (index: number) => {
    const updated = [...editableTasks];
    updated[index] = { ...updated[index], completed: !updated[index].completed };
    setEditableTasks(updated);
  };

  const handleSave = () => {
    // Filter out empty tasks and update IDs for new tasks
    const validTasks = editableTasks
      .filter(t => t.text.trim() !== '')
      .map(t => ({
        ...t,
        id: t.id.startsWith('temp_') ? `task_${Date.now()}_${Math.random()}` : t.id,
      }));

    // Merge with non-must-do tasks
    const otherTasks = tasks.filter(t => !t.isMustDo);
    onSave([...validTasks, ...otherTasks]);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.backdrop} onPress={handleCancel}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <BlurView
              intensity={isDark ? 80 : 95}
              tint={isDark ? 'dark' : 'light'}
              style={styles.modalContent}
            >
              <View style={[styles.innerContent, { backgroundColor: isDark ? 'rgba(20, 20, 24, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}>
                {/* Header */}
                <View style={styles.header}>
                  <View>
                    <Text style={[styles.title, { color: tokens.colors.textPrimary }]}>
                      Your 3 Must-Do Tasks
                    </Text>
                    <Text style={[styles.subtitle, { color: tokens.colors.textSecondary }]}>
                      Daily priorities for your 45 NOW challenge
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={24} color={tokens.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Task Inputs */}
                <ScrollView
                  style={styles.tasksList}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {editableTasks.map((task, index) => (
                    <View key={task.id} style={styles.taskRow}>
                      <View style={styles.taskNumber}>
                        <Text style={[styles.taskNumberText, { color: tokens.colors.accent }]}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.taskInputWrapper}>
                        <TextInput
                          style={[
                            styles.taskInput,
                            {
                              color: tokens.colors.textPrimary,
                              backgroundColor: tokens.colors.surface,
                              borderColor: tokens.colors.border,
                            },
                          ]}
                          placeholder={`Task ${index + 1} (e.g., "Workout for 30 minutes")`}
                          placeholderTextColor={tokens.colors.textSecondary}
                          value={task.text}
                          onChangeText={(text) => handleTextChange(index, text)}
                          multiline
                          maxLength={100}
                          returnKeyType="done"
                          blurOnSubmit
                        />
                        {task.text.trim() !== '' && (
                          <TouchableOpacity
                            onPress={() => handleToggleComplete(index)}
                            style={styles.checkboxButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons
                              name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                              size={24}
                              color={task.completed ? tokens.colors.success : tokens.colors.textSecondary}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>

                {/* Helper Text */}
                <View style={styles.helperSection}>
                  <Ionicons name="information-circle-outline" size={16} color={tokens.colors.accent} />
                  <Text style={[styles.helperText, { color: tokens.colors.textSecondary }]}>
                    Set meaningful daily goals. You can check them off throughout the day.
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={styles.cancelButton}
                  >
                    <Text style={[styles.cancelButtonText, { color: tokens.colors.textSecondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <PrimaryButton
                    title="Save Tasks"
                    onPress={handleSave}
                    style={styles.saveButton}
                  />
                </View>
              </View>
            </BlurView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.lg,
  },
  modalContent: {
    borderRadius: tokens.radii.xl,
    overflow: 'hidden',
    maxWidth: 500,
    width: '100%',
    ...tokens.shadows.card,
  },
  innerContent: {
    borderRadius: tokens.radii.xl,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  closeButton: {
    marginLeft: tokens.spacing.md,
  },
  tasksList: {
    maxHeight: 400,
    paddingHorizontal: tokens.spacing.xl,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  taskNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${tokens.colors.accent}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: tokens.spacing.sm,
  },
  taskNumberText: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskInputWrapper: {
    flex: 1,
    position: 'relative',
  },
  taskInput: {
    fontSize: 15,
    lineHeight: 22,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    minHeight: 52,
    maxHeight: 100,
    paddingRight: 48, // Space for checkbox
  },
  checkboxButton: {
    position: 'absolute',
    right: tokens.spacing.sm,
    top: tokens.spacing.sm,
  },
  helperSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    backgroundColor: `${tokens.colors.accent}08`,
    marginHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radii.md,
    marginBottom: tokens.spacing.lg,
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    padding: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
  },
});
