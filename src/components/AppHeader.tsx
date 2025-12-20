import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: {
    name: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  rightIcon?: {
    name: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    accessibilityLabel?: string;
    color?: string;
  };
}

/**
 * Unified App Header component
 * Title centered, optional left/right icon buttons, consistent sizes
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconButton}>
        {leftIcon ? (
          <TouchableOpacity
            style={styles.iconButtonCircle}
            onPress={leftIcon.onPress}
            accessibilityLabel={leftIcon.accessibilityLabel || 'Back'}
            accessibilityRole="button"
          >
            <Ionicons name={leftIcon.name} size={24} color={Theme.colors.accentDark} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButtonCircle} />
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.iconButton}>
        {rightIcon ? (
          <TouchableOpacity
            style={styles.iconButtonCircle}
            onPress={rightIcon.onPress}
            accessibilityLabel={rightIcon.accessibilityLabel || 'Action'}
            accessibilityRole="button"
          >
            <Ionicons
              name={rightIcon.name}
              size={22}
              color={rightIcon.color || Theme.colors.gold}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButtonCircle} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xxxl + Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
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








