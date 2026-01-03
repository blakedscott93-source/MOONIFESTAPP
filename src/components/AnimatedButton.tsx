/**
 * AnimatedButton Component
 * Button with micro-interactions (scale animation on press)
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { lightHaptic } from '../utils/haptics';

interface AnimatedButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  haptic?: boolean;
  scaleValue?: number;
  style?: ViewStyle;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  haptic = true,
  scaleValue = 0.95,
  style,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: true,
      speed: 50,
    }).start();
    
    if (haptic) {
      lightHaptic();
    }
    
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
    
    onPressOut?.(e);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button, style]}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    // Base styles can be overridden
  },
});
