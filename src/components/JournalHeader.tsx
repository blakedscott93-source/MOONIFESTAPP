import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';

interface JournalHeaderProps {
  entryCount: number;
  onHistoryPress?: () => void;
}

export const JournalHeader: React.FC<JournalHeaderProps> = ({
  entryCount,
  onHistoryPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Left spacer - no profile button */}
      <View style={styles.iconButton} />

      <View style={styles.titleContainer}>
        <Text style={styles.title} accessibilityRole="header">
          My Journal
        </Text>
        <Text style={styles.subtitle}>
          {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={onHistoryPress}
        activeOpacity={0.7}
        accessibilityLabel="Journal History"
        accessibilityRole="button"
        accessibilityHint="View your journal history"
      >
        <View style={styles.iconButtonCircle}>
          <Ionicons name="time-outline" size={22} color={Theme.colors.accent} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  iconButton: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonCircle: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    borderRadius: TOUCH_TARGET_MIN / 2,
    backgroundColor: Theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.subtle,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...Theme.typography.title,
    color: Theme.colors.textPrimary,
  },
  subtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
});
