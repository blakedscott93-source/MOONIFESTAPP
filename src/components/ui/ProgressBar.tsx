/**
 * Progress Bar Component
 * Thinner, modern progress bar with rounded ends
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
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
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  trackColor,
  fillColor,
  style,
}) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor || `${tokens.colors.tintLavender}30`,
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
            backgroundColor: fillColor || tokens.colors.tintPurple,
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

