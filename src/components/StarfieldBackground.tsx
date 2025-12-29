/**
 * Starfield Background Component
 * Creates a beautiful starfield effect that adapts to light/dark mode
 * - Light mode: White stars on white background (subtle, decorative)
 * - Dark mode: White stars on black background (visible, beautiful)
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface StarfieldBackgroundProps {
  /** Number of stars to render (default: 100) */
  starCount?: number;
  /** Custom style for the container */
  style?: any;
}

/**
 * Generate random star positions
 * Uses percentage-based positioning for responsive layout
 */
const generateStars = (count: number) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: Math.random() * 100, // Percentage
      y: Math.random() * 100, // Percentage
      size: Math.random() * 2 + 0.5, // 0.5 to 2.5px
      opacity: Math.random() * 0.5 + 0.3, // 0.3 to 0.8
    });
  }
  return stars;
};

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
  starCount = 100,
  style,
}) => {
  const { isDark } = useTheme();

  // Generate stars once - they'll scale with the container
  const stars = useMemo(() => {
    return generateStars(starCount);
  }, [starCount]);

  const backgroundColor = isDark ? '#000000' : '#FFFFFF'; // True black for dark mode
  const starColor = '#FFFFFF'; // Always white stars

  return (
    <View style={[styles.container, { backgroundColor }, style]} pointerEvents="none">
      {stars.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              opacity: isDark ? star.opacity : star.opacity * 0.3, // More subtle in light mode
              backgroundColor: starColor,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    borderRadius: 999,
  },
});

