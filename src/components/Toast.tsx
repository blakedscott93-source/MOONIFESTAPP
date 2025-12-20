import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOAST_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);

export type ToastType = 'success' | 'error' | 'info' | 'achievement' | 'points';

export interface ToastProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  points?: number;
  icon?: string;
  duration?: number;
  onHide: () => void;
}

const TOAST_CONFIGS = {
  success: {
    icon: 'checkmark-circle',
    colors: ['#4ECDC4', '#44A08D'],
    textColor: '#FFFFFF',
  },
  error: {
    icon: 'alert-circle',
    colors: ['#FF6B9D', '#C44569'],
    textColor: '#FFFFFF',
  },
  info: {
    icon: 'information-circle',
    colors: ['#667EEA', '#764BA2'],
    textColor: '#FFFFFF',
  },
  achievement: {
    icon: 'trophy',
    colors: ['#FFD700', '#FFA500'],
    textColor: '#FFFFFF',
  },
  points: {
    icon: 'sparkles',
    colors: ['#C77DFF', '#9D4EDD'],
    textColor: '#FFFFFF',
  },
};

export const Toast: React.FC<ToastProps> = ({
  visible,
  type,
  title,
  message,
  points,
  icon,
  duration = 3000,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  const config = TOAST_CONFIGS[type];
  const displayIcon = icon || config.icon;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={hideToast}
        style={styles.touchable}
      >
        <LinearGradient
          colors={config.colors as any}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Subtle overlay for depth (BlurView removed due to module resolution issues) */}
          {Platform.OS === 'ios' && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.2)' }]} />
          )}

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name={displayIcon as any} size={28} color={config.textColor} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: config.textColor }]}>
                {title}
              </Text>
              {message && (
                <Text style={[styles.message, { color: config.textColor }]}>
                  {message}
                </Text>
              )}
            </View>

            {/* Points badge */}
            {points !== undefined && (
              <View style={styles.pointsBadge}>
                <Ionicons name="sparkles" size={14} color="#FFD700" />
                <Text style={styles.pointsText}>+{points}</Text>
              </View>
            )}
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={hideToast}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={20} color={config.textColor} style={{ opacity: 0.7 }} />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: (SCREEN_WIDTH - TOAST_WIDTH) / 2,
    width: TOAST_WIDTH,
    zIndex: 9999,
    elevation: 10,
  },
  touchable: {
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadow.large,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
    minHeight: 70,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Theme.typography.bodyBold,
    fontSize: 16,
    marginBottom: 2,
  },
  message: {
    ...Theme.typography.caption,
    fontSize: 13,
    opacity: 0.9,
    lineHeight: 18,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    gap: 4,
  },
  pointsText: {
    ...Theme.typography.captionBold,
    color: '#FFFFFF',
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
});
