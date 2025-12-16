import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../utils/theme';

interface StreakCalendarProps {
  completedDates: string[]; // Array of ISO date strings
  currentStreak: number;
  longestStreak: number;
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({
  completedDates,
  currentStreak,
  longestStreak,
}) => {
  // Get last 42 days (6 weeks)
  const getDaysArray = () => {
    const days = [];
    const today = new Date();

    for (let i = 41; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }

    return days;
  };

  const days = getDaysArray();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const isCompleted = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return completedDates.includes(dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFuture = (date: Date) => {
    return date > new Date();
  };

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <View style={[styles.statIconCircle, { backgroundColor: '#FF6B6B20' }]}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
          </View>
          <Text style={styles.statNumber}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <View style={[styles.statIconCircle, { backgroundColor: '#FFD70020' }]}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
          </View>
          <Text style={styles.statNumber}>{longestStreak}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <View style={[styles.statIconCircle, { backgroundColor: '#4ECDC420' }]}>
            <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
          </View>
          <Text style={styles.statNumber}>{completedDates.length}</Text>
          <Text style={styles.statLabel}>Total Days</Text>
        </View>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        {/* Week day headers */}
        <View style={styles.weekDaysRow}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar days */}
        <View style={styles.daysGrid}>
          {days.map((date, index) => {
            const completed = isCompleted(date);
            const today = isToday(date);
            const future = isFuture(date);

            return (
              <View key={index} style={styles.dayCell}>
                <View
                  style={[
                    styles.dayCircle,
                    completed && styles.dayCircleCompleted,
                    today && styles.dayCircleToday,
                    future && styles.dayCircleFuture,
                  ]}
                >
                  {completed && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                  {today && !completed && (
                    <View style={styles.todayDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.dayNumber,
                    completed && styles.dayNumberCompleted,
                    today && styles.dayNumberToday,
                    future && styles.dayNumberFuture,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Theme.colors.accent }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Theme.colors.border }]} />
          <Text style={styles.legendText}>Missed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { borderWidth: 2, borderColor: Theme.colors.accent }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    ...Theme.shadow.subtle,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xs,
  },
  statNumber: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
  },
  statLabel: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: Theme.colors.border,
  },
  calendarContainer: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    ...Theme.shadow.subtle,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    ...Theme.typography.captionBold,
    color: Theme.colors.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 7 days per week
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dayCircleCompleted: {
    backgroundColor: Theme.colors.accent,
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: Theme.colors.accent,
  },
  dayCircleFuture: {
    opacity: 0.3,
  },
  dayNumber: {
    ...Theme.typography.small,
    fontSize: 10,
    color: Theme.colors.textSecondary,
  },
  dayNumberCompleted: {
    color: Theme.colors.accent,
    fontWeight: '600',
  },
  dayNumberToday: {
    color: Theme.colors.accent,
    fontWeight: '700',
  },
  dayNumberFuture: {
    opacity: 0.3,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.accent,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
  },
});
