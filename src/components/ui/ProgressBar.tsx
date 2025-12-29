/**
 * Progress Bar Component
 * Thinner, modern progress bar with rounded ends
 * Theme-aware for better dark mode contrast
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/tokens';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  trackColor?: string;
  fillColor?: string;
  style?: ViewStyle;
}

/**
 * Modern progress bar component
 * Enhanced for dark mode: brighter fill, visible track
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  trackColor,
  fillColor,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Theme-aware colors
  const defaultTrackColor = isDark
    ? 'rgba(255, 255, 255, 0.1)' // Visible track in dark mode
    : `${tokens.colors.tintLavender}30`;
  
  const defaultFillColor = fillColor || theme.colors.accent;

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor || defaultTrackColor,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            height,
            borderRadius: height / 2,
            backgroundColor: defaultFillColor,
            // Add subtle glow in dark mode for better visibility
            ...(isDark && {
              shadowColor: defaultFillColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  fill: {
    // Width and height set dynamically
  },
});

