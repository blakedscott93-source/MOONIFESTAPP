/**
 * Section Header Component
 * Consistent section titles with optional subtitle
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { tokens } from '../../theme/tokens';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

/**
 * Section header component
 * Uses unified typography tokens
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: tokens.colors.textPrimary }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: tokens.colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xs,
  },
  title: {
    ...tokens.typography.h3,
    fontWeight: '600',
  },
  subtitle: {
    ...tokens.typography.caption,
    marginTop: tokens.spacing.xs / 2,
  },
});











