import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';

interface TodayHeaderProps {
  title: string;
  subtitle?: string;
  onSettingsPress: () => void;
}

/**
 * Compact Apple-style header for Today/Home screen
 * Clean, minimal design with proper spacing and contrast
 */
export const TodayHeader: React.FC<TodayHeaderProps> = ({
  title,
  subtitle,
  onSettingsPress,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + 8; // Safe area + 8px padding

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.content}>
        {/* Left: Empty space (no avatar/ghost circle) */}
        <View style={styles.leftSpacer} />

        {/* Center: Title and Date */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right: Settings button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onSettingsPress}
          accessibilityLabel="Settings"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.settingsButtonInner}>
            <Ionicons
              name="settings-outline"
              size={20}
              color={Theme.colors.textPrimary}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
    paddingBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    minHeight: 56, // Base height without safe area
  },
  leftSpacer: {
    width: 44, // Match right button width for balance
    height: 44,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: Theme.colors.textPrimary,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Theme.colors.textSecondary,
    opacity: 0.65,
    marginTop: 2,
  },
  settingsButton: {
    width: TOUCH_TARGET_MIN, // 44x44 touch target
    height: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

