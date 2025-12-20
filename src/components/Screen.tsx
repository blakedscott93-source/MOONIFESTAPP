import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../utils/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/**
 * Unified Screen wrapper component
 * Handles SafeArea + background + consistent padding
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  edges = ['top', 'bottom'],
}) => {
  return (
    <SafeAreaView
      style={[styles.container, style]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
});








