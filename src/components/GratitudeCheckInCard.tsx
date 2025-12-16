import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { GratitudeCheckIn } from '../utils/dayRollover';

interface GratitudeCheckInCardProps {
  checkIn: GratitudeCheckIn;
}

export const GratitudeCheckInCard: React.FC<GratitudeCheckInCardProps> = ({ checkIn }) => {
  const [expanded, setExpanded] = useState(false);
  
  const preview = checkIn.text.split('\n').slice(0, 2).join('\n');
  const hasMore = checkIn.text.split('\n').length > 2 || checkIn.text.length > 100;
  
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => hasMore && setExpanded(!expanded)}
      activeOpacity={hasMore ? 0.7 : 1}
      accessibilityLabel={`Check-in from ${formatTime(checkIn.createdAt)}`}
      accessibilityRole={hasMore ? 'button' : 'text'}
    >
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={14} color={Theme.colors.textTertiary} />
          <Text style={styles.time}>{formatTime(checkIn.createdAt)}</Text>
        </View>
        {hasMore && (
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Theme.colors.textTertiary}
          />
        )}
      </View>

      <Text style={styles.preview} numberOfLines={expanded ? undefined : 2}>
        {checkIn.text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.subtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs / 2,
  },
  time: {
    ...Theme.typography.small,
    color: Theme.colors.textTertiary,
  },
  preview: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    lineHeight: Theme.typography.body.lineHeight,
  },
});





