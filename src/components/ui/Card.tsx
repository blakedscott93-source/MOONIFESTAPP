/**
 * Standard Surface Card Component
 * White-ish card with soft border, large radius, and soft shadow
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

/**
 * Standard surface card component
 */
export const Card: React.FC<CardProps> = ({ children, style }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.border,
          ...theme.shadows.soft,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 16,
  },
});


