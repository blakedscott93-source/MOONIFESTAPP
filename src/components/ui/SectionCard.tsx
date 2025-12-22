/**
 * Section Card Component
 * Rounded card container used everywhere
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { tokens } from '../../theme/tokens';

interface SectionCardProps {
  children: ReactNode;
  style?: ViewStyle;
}

/**
 * Standard section card component
 */
export const SectionCard: React.FC<SectionCardProps> = ({ children, style }) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.colors.card,
          borderRadius: tokens.radii.lg,
          borderColor: tokens.colors.border,
          ...tokens.shadows.card,
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
    padding: tokens.spacing.md,
  },
});


