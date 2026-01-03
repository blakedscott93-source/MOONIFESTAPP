import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../utils/themeColors';
import { StarfieldBackground } from './StarfieldBackground';

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
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bg }, style]}
      edges={edges}
    >
      <StarfieldBackground />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});









