import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { getStreakTier, getStreakMessage } from '../data/achievements';
import { LinearGradient } from 'expo-linear-gradient';

interface StreakCounterProps {
  streak: number;
  compact?: boolean;
  onShare?: () => void;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ streak, compact = false, onShare }) => {
  const tier = getStreakTier(streak);
  const message = getStreakMessage(streak);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name={tier.icon as any} size={20} color={tier.color} />
        <Text style={[styles.compactStreak, { color: tier.color }]}>{streak}</Text>
        <Ionicons name="flame" size={16} color={tier.color} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[tier.color + '20', tier.color + '10']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Share Button */}
        {onShare && (
          <TouchableOpacity
            onPress={onShare}
            style={styles.shareButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="share-social" size={22} color={tier.color} />
          </TouchableOpacity>
        )}

        {/* Icon and Streak Number */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: tier.color + '30' }]}>
            <Ionicons name={tier.icon as any} size={40} color={tier.color} />
          </View>
          <View style={styles.streakInfo}>
            <View style={styles.streakRow}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Ionicons name="flame" size={32} color={tier.color} style={styles.flameIcon} />
            </View>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Tier Badge */}
        <View style={[styles.tierBadge, { backgroundColor: tier.color + '20' }]}>
          <Text style={[styles.tierText, { color: tier.color }]}>{tier.tier} Tier</Text>
        </View>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Progress to Next Milestone */}
        {tier.nextMilestone && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Next Milestone</Text>
              <Text style={styles.progressValue}>
                {streak} / {tier.nextMilestone}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(streak / tier.nextMilestone) * 100}%`,
                    backgroundColor: tier.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressSubtext}>
              {tier.nextMilestone - streak} days until next tier
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Theme.spacing.lg,
    marginVertical: Theme.spacing.md,
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
    ...Theme.shadow.medium,
  },
  gradient: {
    padding: Theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.lg,
  },
  streakInfo: {
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    lineHeight: 56,
  },
  flameIcon: {
    marginLeft: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
  },
  streakLabel: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: -Theme.spacing.xs,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    marginBottom: Theme.spacing.md,
  },
  tierText: {
    ...Theme.typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  message: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.lg,
  },
  progressContainer: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  progressLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  progressValue: {
    ...Theme.typography.caption,
    color: Theme.colors.textPrimary,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.full,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: Theme.radius.full,
  },
  progressSubtext: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    ...Theme.shadow.subtle,
  },
  compactStreak: {
    ...Theme.typography.bodyBold,
    marginHorizontal: Theme.spacing.xs,
    fontSize: 16,
  },
  shareButton: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.subtle,
    zIndex: 10,
  },
});
