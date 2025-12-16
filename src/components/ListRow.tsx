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
 */
export const ListRow: React.FC<ListRowProps> = ({
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
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon}
            size={24}
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
        <TouchableOpacity
          onPress={onRightIconPress || onPress}
          disabled={!onRightIconPress && !onPress}
          style={styles.rightIconContainer}
        >
          <Ionicons
            name={rightIcon}
            size={20}
            color={onRightIconPress ? Theme.colors.danger : Theme.colors.textTertiary}
          />
        </TouchableOpacity>
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
};

const styles = StyleSheet.create({
  row: {
    minHeight: TOUCH_TARGET_MIN + Theme.spacing.md,
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  textContainer: {
    flex: 1,
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
    marginTop: Theme.spacing.xs,
  },
  rightIconContainer: {
    padding: Theme.spacing.xs,
    minWidth: TOUCH_TARGET_MIN,
    minHeight: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

