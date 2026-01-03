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
            style={[styles.iconButtonCircle, { opacity: 1 }]} // Full opacity for interactive
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
            style={[styles.iconButtonCircle, { opacity: 1 }]} // Full opacity for interactive
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
    paddingTop: Theme.spacing.xl + Theme.spacing.sm, // Reduced from xxxl (40) to xl (20) - ~50% reduction
    paddingBottom: Theme.spacing.sm, // Reduced from md (12) to sm (8)
  },
  iconButton: {
    width: 44, // Ensure 44x44 hit area
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.accentSoft,
    opacity: 0.12, // Reduced opacity for decorative left element
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24, // Reduced from 28 to 24
    fontWeight: '700',
    fontFamily: Theme.typography.h2.fontFamily,
    letterSpacing: -0.3,
    color: Theme.colors.textPrimary,
    lineHeight: 30, // Reduced from 34
  },
  subtitle: {
    fontSize: 13, // Keep at 13 (within 13-14 range)
    fontWeight: '600',
    fontFamily: 'Sora_400Regular',
    color: Theme.colors.textSecondary,
    marginTop: 3, // Reduced from 4
  },
});









