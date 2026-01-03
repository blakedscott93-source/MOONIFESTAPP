/**
 * SwipeableRow Component
 * Provides swipe-to-reveal actions (delete, archive, etc.)
 */

import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Theme } from '../utils/theme';
import { lightHaptic } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 25% of screen width

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onArchive?: () => void;
  rightActions?: Array<{
    label: string;
    icon: string;
    color: string;
    onPress: () => void;
  }>;
  leftActions?: Array<{
    label: string;
    icon: string;
    color: string;
    onPress: () => void;
  }>;
  style?: ViewStyle;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onDelete,
  onArchive,
  rightActions,
  leftActions,
  style,
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const actions = rightActions || [];
    
    // Add delete action if provided
    if (onDelete && !actions.find(a => a.label === 'Delete')) {
      actions.push({
        label: 'Delete',
        icon: 'trash',
        color: '#FF6B6B',
        onPress: () => {
          lightHaptic();
          onDelete();
          swipeableRef.current?.close();
        },
      });
    }

    // Add archive action if provided
    if (onArchive && !actions.find(a => a.label === 'Archive')) {
      actions.push({
        label: 'Archive',
        icon: 'archive',
        color: Theme.colors.accent,
        onPress: () => {
          lightHaptic();
          onArchive();
          swipeableRef.current?.close();
        },
      });
    }

    if (actions.length === 0) return null;

    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [SCREEN_WIDTH, 0],
    });

    return (
      <View style={styles.rightActionsContainer}>
        {actions.map((action, index) => {
          const scale = progress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.8, 0.9, 1],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.actionButton,
                {
                  backgroundColor: action.color,
                  transform: [{ scale }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.actionButtonContent}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
                <Animated.Text
                  style={[
                    styles.actionLabel,
                    {
                      opacity: progress,
                    },
                  ]}
                >
                  {action.label}
                </Animated.Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>) => {
    if (!leftActions || leftActions.length === 0) return null;

    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-SCREEN_WIDTH, 0],
    });

    return (
      <View style={styles.leftActionsContainer}>
        {leftActions.map((action, index) => {
          const scale = progress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.8, 0.9, 1],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.actionButton,
                {
                  backgroundColor: action.color,
                  transform: [{ scale }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.actionButtonContent}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
                <Animated.Text
                  style={[
                    styles.actionLabel,
                    {
                      opacity: progress,
                    },
                  ]}
                >
                  {action.label}
                </Animated.Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  return (
    <GestureHandlerRootView>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        rightThreshold={SWIPE_THRESHOLD}
        leftThreshold={SWIPE_THRESHOLD}
        overshootRight={false}
        overshootLeft={false}
        onSwipeableWillOpen={() => lightHaptic()}
      >
        <View style={[styles.content, style]}>{children}</View>
      </Swipeable>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  content: {
    backgroundColor: Theme.colors.surface,
  },
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: Theme.spacing.md,
  },
  leftActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: Theme.spacing.md,
  },
  actionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.xs,
    borderRadius: Theme.radius.md,
  },
  actionButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.xs,
  },
  actionLabel: {
    ...Theme.typography.caption,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
