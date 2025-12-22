/**
 * Row Item Component
 * Used for list rows like Daily Practices
 * Left icon circle, title, subtitle, chevron
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '../../theme/tokens';

interface RowItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

/**
 * Row item component for lists
 */
export const RowItem: React.FC<RowItemProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  rightIcon = 'chevron-forward',
  onPress,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  const content = (
    <View style={[styles.container, style]}>
      {/* Left Icon */}
      {icon && (
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: iconColor ? `${iconColor}20` : `${tokens.colors.tintLavender}20` },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={iconColor || tokens.colors.tintPurple}
          />
        </View>
      )}

      {/* Title & Subtitle */}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            { color: tokens.colors.textPrimary },
            tokens.typography.body,
            titleStyle,
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: tokens.colors.textSecondary },
              tokens.typography.caption,
              subtitleStyle,
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Chevron */}
      {rightIcon && (
        <Ionicons
          name={rightIcon}
          size={20}
          color={tokens.colors.textSecondary}
          style={styles.chevron}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    // Typography applied via theme
  },
  subtitle: {
    // Typography applied via theme
    opacity: 0.7,
  },
  chevron: {
    marginLeft: 8,
  },
});

