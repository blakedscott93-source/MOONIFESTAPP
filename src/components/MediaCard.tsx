import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../utils/theme';

export interface MediaCardData {
  id: string;
  title: string;
  subtitle: string; // e.g., "10 affirmations · 2 min" or "Meditation · 7 min"
  gradient: string[];
  icon?: keyof typeof Ionicons.glyphMap;
  locked?: boolean;
  playButton?: boolean; // Show play button overlay for meditations
}

interface MediaCardProps {
  data: MediaCardData;
  onPress: () => void;
  style?: ViewStyle;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  data,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={`${data.title}, ${data.subtitle}${data.locked ? ', locked' : ''}`}
      accessibilityRole="button"
      disabled={false} // Always tappable to show lock state
    >
      <LinearGradient
        colors={data.gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Lock Badge */}
        {data.locked && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={14} color={Theme.colors.textPrimary} />
          </View>
        )}

        {/* Play Button Overlay (for meditations) */}
        {data.playButton && !data.locked && (
          <View style={styles.playButton}>
            <View style={styles.playButtonCircle}>
              <Ionicons name="play" size={20} color={Theme.colors.textInverse} />
            </View>
          </View>
        )}

        {/* Icon/Illustration */}
        <View style={styles.iconContainer}>
          {data.icon && (
            <Ionicons
              name={data.icon}
              size={48}
              color={Theme.colors.accent}
              style={styles.icon}
            />
          )}
        </View>
      </LinearGradient>

      {/* Card Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {data.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {data.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: Theme.colors.surface,
    ...Theme.shadow.medium,
  },
  gradient: {
    height: 200,
    padding: Theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    top: Theme.spacing.md,
    left: Theme.spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.subtle,
  },
  playButton: {
    position: 'absolute',
    bottom: Theme.spacing.md,
    right: Theme.spacing.md,
  },
  playButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.medium,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    opacity: 0.3,
  },
  info: {
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
  },
  title: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs / 2,
  },
  subtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
});





