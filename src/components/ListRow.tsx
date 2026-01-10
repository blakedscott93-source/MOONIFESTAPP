import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  onLongPress?: () => void;
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
  onLongPress,
  onRightIconPress,
  completed,
  testID,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(completed ? 1 : 1)).current;

  React.useEffect(() => {
    if (completed) {
      // Subtle pulse animation for completed items
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [completed, scaleAnim]);

  const content = (
    <View style={[styles.container, completed && styles.containerCompleted]}>
      {icon && (
        <View
          style={[
            styles.iconCircle,
            completed && styles.iconCircleCompleted,
            { backgroundColor: completed ? '#4CAF5020' : (iconColor ? `${iconColor}15` : `${Theme.colors.accentSoft}`) },
          ]}
        >
          <Ionicons
            name={icon}
            size={22}
            color={completed ? '#4CAF50' : (iconColor || Theme.colors.accent)}
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
          <Text style={[styles.subtitle, completed && styles.subtitleCompleted]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightIcon && (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons
            name={rightIcon}
            size={completed ? 24 : 18}
            color={
              completed
                ? '#22C55E' // Vibrant green checkmark for completed items
                : onRightIconPress
                  ? Theme.colors.danger
                  : Theme.colors.textTertiary
            }
            style={styles.rightIcon}
          />
        </Animated.View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        onLongPress={onLongPress}
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
  containerCompleted: {
    backgroundColor: '#22C55E08', // Very subtle green background tint
    borderRadius: 8,
    paddingHorizontal: Theme.spacing.sm,
    marginHorizontal: -Theme.spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  iconCircleCompleted: {
    borderWidth: 2,
    borderColor: '#22C55E40', // Vibrant green border
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
    textDecorationColor: '#22C55E', // Vibrant green strikethrough
    textDecorationStyle: 'solid',
    color: '#22C55E', // Vibrant green text for completed items
    fontWeight: '600',
  },
  subtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs / 2,
  },
  subtitleCompleted: {
    color: '#22C55E80', // Vibrant green subtitle
    fontWeight: '500',
  },
  rightIcon: {
    marginLeft: Theme.spacing.sm,
    opacity: 0.4, // Reduced opacity - not dominant
  },
});

