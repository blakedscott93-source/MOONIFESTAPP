import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { UnifiedCard } from '../components/UnifiedCard';
import { Theme } from '../utils/theme';
import { GratitudeCheckIn, getLocalDayKey } from '../utils/dayRollover';

interface GroupedCheckIns {
  date: string;
  displayDate: string;
  checkIns: GratitudeCheckIn[];
}

export default function JournalHistoryScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allCheckIns, setAllCheckIns] = useState<GratitudeCheckIn[]>([]);
  const [groupedCheckIns, setGroupedCheckIns] = useState<GroupedCheckIns[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<GroupedCheckIns[]>([]);

  useEffect(() => {
    loadAllCheckIns();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = groupedCheckIns
        .map(group => ({
          ...group,
          checkIns: group.checkIns.filter(ci =>
            ci.text.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(group => group.checkIns.length > 0);
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(groupedCheckIns);
    }
  }, [searchQuery, groupedCheckIns]);

  const loadAllCheckIns = async () => {
    try {
      const data = await AsyncStorage.getItem('@gratitude_check_ins');
      if (data) {
        const checkIns: GratitudeCheckIn[] = JSON.parse(data);
        // Sort by date descending (newest first)
        checkIns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllCheckIns(checkIns);

        // Group by date
        const grouped = groupCheckInsByDate(checkIns);
        setGroupedCheckIns(grouped);
        setFilteredGroups(grouped);
      }
    } catch (error) {
      console.error('Error loading check-ins:', error);
      Alert.alert('Error', 'Failed to load journal history');
    }
  };

  const groupCheckInsByDate = (checkIns: GratitudeCheckIn[]): GroupedCheckIns[] => {
    const groups: { [key: string]: GratitudeCheckIn[] } = {};

    checkIns.forEach(checkIn => {
      const date = checkIn.localDayKey;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(checkIn);
    });

    return Object.entries(groups).map(([date, checkIns]) => ({
      date,
      displayDate: formatDateHeader(date),
      checkIns,
    }));
  };

  const formatDateHeader = (dateKey: string): string => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayKey = getLocalDayKey();
    const yesterdayKey = getLocalDayKey(yesterday);

    if (dateKey === todayKey) {
      return 'Today';
    } else if (dateKey === yesterdayKey) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTotalCheckIns = () => allCheckIns.length;
  const getTotalDays = () => groupedCheckIns.length;

  const deleteCheckIn = async (checkInId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this gratitude entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = allCheckIns.filter(ci => ci.id !== checkInId);
              await AsyncStorage.setItem('@gratitude_check_ins', JSON.stringify(updated));
              await loadAllCheckIns();
              Alert.alert('Deleted', 'Entry has been removed');
            } catch (error) {
              console.error('Error deleting check-in:', error);
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen style={styles.container}>
      <AppHeader
        title="Journal History"
        subtitle={`${getTotalCheckIns()} entries across ${getTotalDays()} days`}
        leftIcon={{
          name: 'chevron-back',
          onPress: () => navigation.goBack(),
          accessibilityLabel: 'Go back',
        }}
      />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color={Theme.colors.accent} />
          <Text style={styles.statValue}>{getTotalDays()}</Text>
          <Text style={styles.statLabel}>Days</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="heart" size={24} color={Theme.colors.pink} />
          <Text style={styles.statValue}>{getTotalCheckIns()}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={24} color={Theme.colors.gold} />
          <Text style={styles.statValue}>{Math.round(getTotalCheckIns() / Math.max(getTotalDays(), 1) * 10) / 10}</Text>
          <Text style={styles.statLabel}>Avg/Day</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Theme.colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your gratitude..."
          placeholderTextColor={Theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={Theme.colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Entries List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={60} color={Theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No matching entries' : 'No entries yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try a different search term'
                : 'Start writing gratitude entries to see them here'}
            </Text>
          </View>
        ) : (
          filteredGroups.map((group, groupIndex) => (
            <View key={group.date} style={styles.dayGroup}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateHeaderText}>{group.displayDate}</Text>
                <View style={styles.dateHeaderBadge}>
                  <Text style={styles.dateHeaderBadgeText}>{group.checkIns.length}</Text>
                </View>
              </View>

              {group.checkIns.map((checkIn, index) => (
                <TouchableOpacity
                  key={checkIn.id}
                  style={styles.entryCard}
                  activeOpacity={0.7}
                  onLongPress={() => deleteCheckIn(checkIn.id)}
                >
                  <View style={styles.entryHeader}>
                    <View style={styles.entryHeaderLeft}>
                      <Ionicons name="checkmark-circle" size={20} color={Theme.colors.success} />
                      <Text style={styles.entryTime}>{formatTime(checkIn.createdAt)}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteCheckIn(checkIn.id)}
                      style={styles.deleteButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={18} color={Theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.entryText}>{checkIn.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}

        <View style={{ height: Theme.spacing.xxxl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    gap: Theme.spacing.xs,
    ...Theme.shadow.subtle,
  },
  statValue: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
  },
  statLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.subtle,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    padding: Theme.spacing.md,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
  },
  clearButton: {
    padding: Theme.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xxxl * 2,
  },
  emptyTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  dayGroup: {
    marginBottom: Theme.spacing.xl,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  dateHeaderText: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  dateHeaderBadge: {
    backgroundColor: Theme.colors.accentSoft,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs / 2,
    borderRadius: Theme.radius.full,
  },
  dateHeaderBadgeText: {
    ...Theme.typography.captionBold,
    color: Theme.colors.accent,
  },
  entryCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.subtle,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  entryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  entryTime: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  deleteButton: {
    padding: Theme.spacing.xs,
  },
  entryText: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    lineHeight: 22,
  },
});
