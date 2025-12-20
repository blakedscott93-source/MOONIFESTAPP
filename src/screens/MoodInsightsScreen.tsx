import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { UnifiedCard } from '../components/UnifiedCard';
import { Theme } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { MoodEntry } from '../data/moodTracking';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MoodInsightsScreen({ navigation }: any) {
  const { getMoodHistory } = useApp();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    try {
      const entries = await getMoodHistory();
      setMoodEntries(entries);
    } catch (error) {
      console.error('Error loading mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const getMoodStats = () => {
    if (moodEntries.length === 0) return null;

    const moodCounts: Record<string, number> = {};
    const energyCounts: Record<string, number> = {};
    let totalEntries = moodEntries.length;

    moodEntries.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      energyCounts[entry.energy] = (energyCounts[entry.energy] || 0) + 1;
    });

    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) =>
      moodCounts[a] > moodCounts[b] ? a : b
    );
    const mostCommonEnergy = Object.keys(energyCounts).reduce((a, b) =>
      energyCounts[a] > energyCounts[b] ? a : b
    );

    // Calculate average (simplified - using numeric values)
    const moodValues: Record<string, number> = {
      'very-happy': 5,
      'happy': 4,
      'neutral': 3,
      'sad': 2,
      'very-sad': 1,
    };
    const averageMood =
      moodEntries.reduce((sum, e) => sum + (moodValues[e.mood] || 3), 0) /
      totalEntries;

    return {
      totalEntries,
      mostCommonMood,
      mostCommonEnergy,
      averageMood,
      moodCounts,
      energyCounts,
    };
  };

  // Get entries from last 7 days
  const getRecentEntries = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return moodEntries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= sevenDaysAgo;
    });
  };

  // Get entries by day of week
  const getEntriesByDayOfWeek = () => {
    const dayCounts: Record<string, number> = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    moodEntries.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    });

    return dayCounts;
  };

  const stats = getMoodStats();
  const recentEntries = getRecentEntries();
  const entriesByDay = getEntriesByDayOfWeek();

  const getMoodEmoji = (mood: string) => {
    const emojiMap: Record<string, string> = {
      'very-happy': '😄',
      'happy': '😊',
      'neutral': '😐',
      'sad': '😢',
      'very-sad': '😭',
    };
    return emojiMap[mood] || '😐';
  };

  const getMoodLabel = (mood: string) => {
    const labelMap: Record<string, string> = {
      'very-happy': 'Very Happy',
      'happy': 'Happy',
      'neutral': 'Neutral',
      'sad': 'Sad',
      'very-sad': 'Very Sad',
    };
    return labelMap[mood] || mood;
  };

  const getEnergyLabel = (energy: string) => {
    const labelMap: Record<string, string> = {
      'very-high': 'Very High',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low',
      'very-low': 'Very Low',
    };
    return labelMap[energy] || energy;
  };

  if (loading) {
    return (
      <Screen>
        <AppHeader
          title="Mood Insights"
          subtitle="Your emotional patterns"
          leftIcon={{
            name: 'chevron-back',
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading insights...</Text>
        </View>
      </Screen>
    );
  }

  if (moodEntries.length === 0) {
    return (
      <Screen>
        <AppHeader
          title="Mood Insights"
          subtitle="Your emotional patterns"
          leftIcon={{
            name: 'chevron-back',
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={['#C77DFF', '#9D4EDD']}
            style={styles.emptyCircle}
          >
            <Ionicons name="analytics-outline" size={60} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No Mood Data Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start tracking your mood on the Today tab to see insights and patterns over time.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader
        title="Mood Insights"
        subtitle={`${moodEntries.length} ${moodEntries.length === 1 ? 'entry' : 'entries'}`}
        leftIcon={{
          name: 'chevron-back',
          onPress: () => navigation.goBack(),
        }}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Overall Stats */}
        {stats && (
          <UnifiedCard>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalEntries}</Text>
                <Text style={styles.statLabel}>Total Entries</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>
                  {getMoodEmoji(stats.mostCommonMood)}
                </Text>
                <Text style={styles.statLabel}>Most Common</Text>
                <Text style={styles.statSublabel}>
                  {getMoodLabel(stats.mostCommonMood)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats.averageMood.toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Avg. Mood</Text>
                <Text style={styles.statSublabel}>Out of 5</Text>
              </View>
            </View>
          </UnifiedCard>
        )}

        {/* Recent Activity */}
        <UnifiedCard>
          <Text style={styles.sectionTitle}>Last 7 Days</Text>
          <Text style={styles.sectionSubtitle}>
            {recentEntries.length} mood {recentEntries.length === 1 ? 'check-in' : 'check-ins'}
          </Text>
          {recentEntries.length > 0 && (
            <View style={styles.recentList}>
              {recentEntries.slice(0, 7).map((entry, index) => (
                <View key={index} style={styles.recentItem}>
                  <Text style={styles.recentEmoji}>
                    {getMoodEmoji(entry.mood)}
                  </Text>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentMood}>
                      {getMoodLabel(entry.mood)} • {getEnergyLabel(entry.energy)}
                    </Text>
                    <Text style={styles.recentDate}>
                      {new Date(entry.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </UnifiedCard>

        {/* Mood Distribution */}
        {stats && (
          <UnifiedCard>
            <Text style={styles.sectionTitle}>Mood Distribution</Text>
            <Text style={styles.sectionSubtitle}>
              How often you've felt each mood
            </Text>
            <View style={styles.distributionContainer}>
              {Object.entries(stats.moodCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([mood, count]) => {
                  const percentage = (count / stats!.totalEntries) * 100;
                  return (
                    <View key={mood} style={styles.distributionItem}>
                      <View style={styles.distributionHeader}>
                        <Text style={styles.distributionEmoji}>
                          {getMoodEmoji(mood)}
                        </Text>
                        <Text style={styles.distributionLabel}>
                          {getMoodLabel(mood)}
                        </Text>
                        <Text style={styles.distributionCount}>
                          {count} ({percentage.toFixed(0)}%)
                        </Text>
                      </View>
                      <View style={styles.distributionBarContainer}>
                        <View
                          style={[
                            styles.distributionBar,
                            { width: `${percentage}%` },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
            </View>
          </UnifiedCard>
        )}

        {/* Day of Week Pattern */}
        <UnifiedCard>
          <Text style={styles.sectionTitle}>Check-in Patterns</Text>
          <Text style={styles.sectionSubtitle}>
            Most active days for mood tracking
          </Text>
          <View style={styles.dayPatternContainer}>
            {Object.entries(entriesByDay)
              .sort((a, b) => b[1] - a[1])
              .map(([day, count]) => (
                <View key={day} style={styles.dayPatternItem}>
                  <Text style={styles.dayPatternDay}>{day.slice(0, 3)}</Text>
                  <View style={styles.dayPatternBarContainer}>
                    <View
                      style={[
                        styles.dayPatternBar,
                        {
                          height: `${Math.max((count / Math.max(...Object.values(entriesByDay))) * 100, 10)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayPatternCount}>{count}</Text>
                </View>
              ))}
          </View>
        </UnifiedCard>

        <View style={{ height: Theme.spacing.xxxl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: Theme.spacing.xxxl,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  emptyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xl,
    ...Theme.shadow.large,
  },
  emptyTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  sectionSubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...Theme.typography.h2,
    color: Theme.colors.accent,
    fontSize: 32,
  },
  statEmoji: {
    fontSize: 40,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  statSublabel: {
    ...Theme.typography.small,
    color: Theme.colors.textTertiary,
    marginTop: Theme.spacing.xs / 2,
  },
  recentList: {
    marginTop: Theme.spacing.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  recentEmoji: {
    fontSize: 32,
    marginRight: Theme.spacing.md,
  },
  recentInfo: {
    flex: 1,
  },
  recentMood: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs / 2,
  },
  recentDate: {
    ...Theme.typography.small,
    color: Theme.colors.textTertiary,
  },
  distributionContainer: {
    marginTop: Theme.spacing.md,
  },
  distributionItem: {
    marginBottom: Theme.spacing.lg,
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  distributionEmoji: {
    fontSize: 24,
    marginRight: Theme.spacing.sm,
  },
  distributionLabel: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    flex: 1,
  },
  distributionCount: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  distributionBarContainer: {
    height: 8,
    backgroundColor: Theme.colors.accentSoft,
    borderRadius: Theme.radius.full,
    overflow: 'hidden',
  },
  distributionBar: {
    height: '100%',
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.radius.full,
  },
  dayPatternContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    marginTop: Theme.spacing.lg,
  },
  dayPatternItem: {
    alignItems: 'center',
    flex: 1,
  },
  dayPatternDay: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  dayPatternBarContainer: {
    width: '80%',
    height: 150,
    backgroundColor: Theme.colors.accentSoft,
    borderRadius: Theme.radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  dayPatternBar: {
    width: '100%',
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.radius.sm,
    minHeight: 4,
  },
  dayPatternCount: {
    ...Theme.typography.small,
    color: Theme.colors.textTertiary,
    marginTop: Theme.spacing.xs,
  },
});

