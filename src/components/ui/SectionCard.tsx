/**
 * Section Card Component
 * Unified card style for sections - consistent with design system
 * Theme-aware for proper dark mode contrast
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/tokens';

interface SectionCardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof tokens.spacing;
}

/**
 * Standard section card component
 * Uses unified design system: 16px radius, subtle shadow
 * Dark mode: Elevated surface with better contrast
 */
export const SectionCard: React.FC<SectionCardProps> = ({ children, style, padding = 'lg' }) => {
  const { theme } = useTheme();
  
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface, // Theme-aware background
          borderRadius: tokens.radii.md, // 16px - unified card radius
          borderColor: theme.colors.border, // Theme-aware border
          padding: tokens.spacing[padding],
          ...theme.shadows.card, // Theme-aware shadows
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
  },
});






