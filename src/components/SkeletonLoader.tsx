import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Theme } from '../utils/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton loader component for loading states
 * Provides a shimmer animation effect
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = Theme.radius.sm,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  // Convert width to number if it's a percentage string, or use as-is if number
  const widthStyle = typeof width === 'string' ? { width: width as any } : { width };
  
  return (
    <Animated.View
      style={[
        styles.skeleton,
        widthStyle,
        {
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  style?: ViewStyle;
}

/**
 * Skeleton card for card loading states
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <SkeletonLoader width="60%" height={20} borderRadius={Theme.radius.sm} />
      <SkeletonLoader width="100%" height={16} borderRadius={Theme.radius.sm} style={{ marginTop: 12 }} />
      <SkeletonLoader width="80%" height={16} borderRadius={Theme.radius.sm} style={{ marginTop: 8 }} />
      <View style={styles.cardFooter}>
        <SkeletonLoader width={60} height={16} borderRadius={Theme.radius.sm} />
        <SkeletonLoader width={40} height={16} borderRadius={Theme.radius.sm} />
      </View>
    </View>
  );
};

interface SkeletonListProps {
  count?: number;
}

/**
 * Skeleton list for list loading states
 */
export const SkeletonList: React.FC<SkeletonListProps> = ({ count = 3 }) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
          <View style={styles.listContent}>
            <SkeletonLoader width="70%" height={16} borderRadius={Theme.radius.sm} />
            <SkeletonLoader width="50%" height={14} borderRadius={Theme.radius.sm} style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Theme.colors.surfaceSecondary,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadow.subtle,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    ...Theme.shadow.subtle,
  },
  listContent: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
});


