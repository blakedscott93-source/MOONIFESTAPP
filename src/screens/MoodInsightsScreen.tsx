import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  DimensionValue,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { UnifiedCard } from '../components/UnifiedCard';
import { Theme } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { 
  MoodEntry, 
  getMoodScore, 
  calculateAverageMood, 
  getMoodTrend,
  getMoodInsights,
  getMoodOption,
  getEnergyOption,
} from '../data/moodTracking';
import { MoodInsightsScreenProps } from '../types/navigation';
import { useScreenTracking } from '../hooks/useScreenTracking';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TimeRange = 'week' | 'month' | 'all';

export default function MoodInsightsScreen({ navigation }: MoodInsightsScreenProps) {
  useScreenTracking('MoodInsights');
  const { getMoodHistory } = useApp();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

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

  // Filter entries by time range
  const filteredEntries = useMemo(() => {
    if (timeRange === 'all') return moodEntries;
    
    const now = new Date();
    const cutoff = new Date();
    
    if (timeRange === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      cutoff.setMonth(now.getMonth() - 1);
    }
    
    return moodEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= cutoff;
    });
  }, [moodEntries, timeRange]);

  // Get mood trend data for line chart
  const moodTrendData = useMemo(() => {
    const sortedEntries = [...filteredEntries].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return sortedEntries.map(entry => ({
      date: new Date(entry.timestamp),
      score: getMoodScore(entry.mood),
      mood: entry.mood,
      energy: entry.energy,
    }));
  }, [filteredEntries]);

  // Calculate insights
  const insights = useMemo(() => getMoodInsights(filteredEntries), [filteredEntries]);
  const trend = useMemo(() => getMoodTrend(filteredEntries), [filteredEntries]);
  const avgMood = useMemo(() => calculateAverageMood(filteredEntries), [filteredEntries]);

  const stats = useMemo(() => {
    if (filteredEntries.length === 0) return null;

    const moodCounts: Record<string, number> = {};
    const energyCounts: Record<string, number> = {};
    const totalEntries = filteredEntries.length;

    filteredEntries.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      energyCounts[entry.energy] = (energyCounts[entry.energy] || 0) + 1;
    });

    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) =>
      moodCounts[a] > moodCounts[b] ? a : b
    );
    const mostCommonEnergy = Object.keys(energyCounts).reduce((a, b) =>
      energyCounts[a] > energyCounts[b] ? a : b
    );

    return {
      totalEntries,
      mostCommonMood,
      mostCommonEnergy,
      averageMood: avgMood,
      moodCounts,
      energyCounts,
    };
  }, [filteredEntries, avgMood]);

  const recentEntries = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return filteredEntries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= sevenDaysAgo;
    });
  }, [filteredEntries]);

  const entriesByDay = useMemo(() => {
    const dayCounts: Record<string, number> = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    filteredEntries.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    });

    return dayCounts;
  }, [filteredEntries]);

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

  if (moodEntries.length === 0 || filteredEntries.length === 0) {
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
        subtitle={`${filteredEntries.length} ${filteredEntries.length === 1 ? 'entry' : 'entries'} - ${timeRange === 'week' ? 'Last 7 days' : timeRange === 'month' ? 'Last 30 days' : 'All time'}`}
        leftIcon={{
          name: 'chevron-back',
          onPress: () => navigation.goBack(),
        }}
      />

      <FlatList
        style={styles.container}
        data={[]}
        renderItem={() => null}
        keyExtractor={(_, index) => `insights-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            {/* Time Range Selector */}
            <View style={styles.timeRangeContainer}>
              {(['week', 'month', 'all'] as TimeRange[]).map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.timeRangeButton,
                    timeRange === range && styles.timeRangeButtonActive,
                  ]}
                  onPress={() => setTimeRange(range)}
                >
                  <Text
                    style={[
                      styles.timeRangeText,
                      timeRange === range && styles.timeRangeTextActive,
                    ]}
                  >
                    {range === 'week' ? '7D' : range === 'month' ? '30D' : 'All'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Insights Card */}
            {insights.length > 0 && (
              <UnifiedCard>
                <View style={styles.insightsHeader}>
                  <Ionicons name="bulb" size={24} color={Theme.colors.accent} />
                  <Text style={styles.sectionTitle}>Insights</Text>
                </View>
                {insights.map((insight, index) => (
                  <View key={index} style={styles.insightItem}>
                    <View style={styles.insightBullet} />
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
                {trend !== 'unknown' && (
                  <View style={styles.trendBadge}>
                    <Ionicons
                      name={trend === 'improving' ? 'trending-up' : trend === 'declining' ? 'trending-down' : 'remove'}
                      size={16}
                      color={trend === 'improving' ? '#4CAF50' : trend === 'declining' ? '#FF6B6B' : Theme.colors.textSecondary}
                    />
                    <Text style={[styles.trendText, { color: trend === 'improving' ? '#4CAF50' : trend === 'declining' ? '#FF6B6B' : Theme.colors.textSecondary }]}>
                      {trend === 'improving' ? 'Improving' : trend === 'declining' ? 'Declining' : 'Stable'}
                    </Text>
                  </View>
                )}
              </UnifiedCard>
            )}

            {/* Mood Trend Line Chart */}
            {moodTrendData.length > 0 && (
              <UnifiedCard>
                <Text style={styles.sectionTitle}>Mood Trend</Text>
                <Text style={styles.sectionSubtitle}>
                  Your mood over the last {timeRange === 'week' ? '7 days' : timeRange === 'month' ? '30 days' : 'period'}
                </Text>
                <View style={styles.chartContainer}>
                  <View style={styles.chartYAxis}>
                    {[5, 4, 3, 2, 1].map((score) => (
                      <Text key={score} style={styles.chartYLabel}>
                        {score}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.chartArea}>
                    <View style={styles.chartGrid}>
                      {[5, 4, 3, 2, 1].map((score) => (
                        <View key={score} style={styles.chartGridLine} />
                      ))}
                    </View>
                    <View style={styles.chartLine}>
                  {moodTrendData.map((point, index) => {
                    const maxScore = 5;
                    const minScore = 1;
                    const height = ((point.score - minScore) / (maxScore - minScore)) * 100;
                    const nextHeight = moodTrendData[index + 1]
                      ? ((moodTrendData[index + 1].score - minScore) / (maxScore - minScore)) * 100
                      : height;
                    const isLast = index === moodTrendData.length - 1;
                    const pointColor = getMoodOption(point.mood)?.color || Theme.colors.accent;
                    
                    return (
                      <View key={index} style={styles.chartPointContainer}>
                        {!isLast && (
                          <View
                            style={[
                              styles.chartLineSegment,
                              {
                                height: `${Math.abs(nextHeight - height)}%` as DimensionValue,
                                bottom: `${Math.min(height, nextHeight)}%` as DimensionValue,
                                backgroundColor: pointColor,
                                opacity: 0.4,
                              },
                            ]}
                          />
                            )}
                            <View
                              style={[
                                styles.chartPoint,
                                {
                                  bottom: `${height}%`,
                                  backgroundColor: pointColor,
                                },
                              ]}
                            />
                            {(index === 0 || index === moodTrendData.length - 1 || index % Math.max(1, Math.floor(moodTrendData.length / 4)) === 0) && (
                              <Text style={styles.chartXLabel}>
                                {point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
                <View style={styles.chartLegend}>
                  <View style={styles.chartLegendItem}>
                    <View style={[styles.chartLegendDot, { backgroundColor: '#FFD700' }]} />
                    <Text style={styles.chartLegendText}>Amazing</Text>
                  </View>
                  <View style={styles.chartLegendItem}>
                    <View style={[styles.chartLegendDot, { backgroundColor: '#4CAF50' }]} />
                    <Text style={styles.chartLegendText}>Good</Text>
                  </View>
                  <View style={styles.chartLegendItem}>
                    <View style={[styles.chartLegendDot, { backgroundColor: '#FFB84D' }]} />
                    <Text style={styles.chartLegendText}>Okay</Text>
                  </View>
                  <View style={styles.chartLegendItem}>
                    <View style={[styles.chartLegendDot, { backgroundColor: '#3498DB' }]} />
                    <Text style={styles.chartLegendText}>Low</Text>
                  </View>
                  <View style={styles.chartLegendItem}>
                    <View style={[styles.chartLegendDot, { backgroundColor: '#FF6B6B' }]} />
                    <Text style={styles.chartLegendText}>Stressed</Text>
                  </View>
                </View>
              </UnifiedCard>
            )}

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
                      {avgMood.toFixed(1)}
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
                          {getMoodLabel(entry.mood)} - {getEnergyLabel(entry.energy)}
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
          </>
        }
        ListFooterComponent={<View style={{ height: Theme.spacing.xxxl }} />}
      />
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
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  timeRangeButton: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  timeRangeButtonActive: {
    backgroundColor: Theme.colors.accent,
    borderColor: Theme.colors.accent,
  },
  timeRangeText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  timeRangeTextActive: {
    color: Theme.colors.textInverse,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  insightBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.accent,
    marginTop: 6,
    marginRight: Theme.spacing.md,
  },
  insightText: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.md,
    alignSelf: 'flex-start',
  },
  trendText: {
    ...Theme.typography.body,
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
    marginTop: Theme.spacing.lg,
  },
  chartYAxis: {
    width: 30,
    justifyContent: 'space-between',
    paddingRight: Theme.spacing.sm,
  },
  chartYLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  chartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  chartGridLine: {
    height: 1,
    backgroundColor: Theme.colors.border,
    opacity: 0.3,
  },
  chartLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    position: 'relative',
    paddingBottom: 20,
  },
  chartPointContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  chartPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    zIndex: 2,
    ...Theme.shadow.medium,
  },
  chartLineSegment: {
    position: 'absolute',
    width: 2,
    left: '50%',
    transform: [{ translateX: -1 }],
    zIndex: 1,
  },
  chartXLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    fontSize: 10,
    position: 'absolute',
    bottom: -18,
    textAlign: 'center',
    width: 60,
    marginLeft: -30,
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  chartLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLegendText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontSize: 11,
  },
});


