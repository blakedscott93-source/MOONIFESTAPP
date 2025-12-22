/**
 * Screen Component
 * Standard screen wrapper with safe area padding + background
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '../../theme/tokens';

interface ScreenProps {
  children: ReactNode;
  style?: ViewStyle;
}

/**
 * Standard screen wrapper component
 */
export const Screen: React.FC<ScreenProps> = ({ children, style }) => {
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: tokens.colors.bg },
        style,
      ]}
      edges={['top', 'bottom']}
    >
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.md,
  },
});


