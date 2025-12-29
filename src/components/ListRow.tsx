import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  onRightIconPress?: () => void;
  completed?: boolean;
  testID?: string;
}

/**
 * Unified ListRow component
 * Used for rows like "Guided Meditation", task lists, etc.
 * Consistent height, padding, and right chevron style
 * Memoized to prevent unnecessary re-renders
 */
export const ListRow: React.FC<ListRowProps> = React.memo(({
  title,
  subtitle,
  icon,
  iconColor,
  rightIcon = 'chevron-forward',
  onPress,
  onRightIconPress,
  completed,
  testID,
}) => {
  const content = (
    <View style={styles.container}>
      {icon && (
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: iconColor ? `${iconColor}15` : `${Theme.colors.accentSoft}` },
          ]}
        >
          <Ionicons
            name={icon}
            size={22}
            color={iconColor || Theme.colors.accent}
          />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            completed && styles.titleCompleted,
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      {rightIcon && (
        <Ionicons
          name={rightIcon}
          size={18}
          color={onRightIconPress ? Theme.colors.danger : Theme.colors.textTertiary}
          style={styles.rightIcon}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.row}>{content}</View>;
});

const styles = StyleSheet.create({
  row: {
    minHeight: 60, // Comfortable touch target
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Theme.colors.textTertiary,
  },
  subtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs / 2,
  },
  rightIcon: {
    marginLeft: Theme.spacing.sm,
    opacity: 0.4, // Reduced opacity - not dominant
  },
});

