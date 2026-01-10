import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UnifiedCard } from './UnifiedCard';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';

interface JournalEntry {
  id: string; // Added id for unique key
  date: string;
  preview: string;
  text?: string;
  audioUri?: string;
}

interface JournalEntriesListProps {
  entries: JournalEntry[];
  onEntryPress: (entry: JournalEntry) => void; // Pass full entry
  onEntryLongPress?: (entry: JournalEntry) => void;
  searchText?: string;
  playingEntryId?: string | null;
  onPlayEntry?: (entry: JournalEntry) => void;
}

export const JournalEntriesList: React.FC<JournalEntriesListProps> = React.memo(({
  entries,
  onEntryPress,
  onEntryLongPress,
  searchText = '',
  playingEntryId,
  onPlayEntry,
}) => {
  const filteredEntries = useMemo(() => {
    if (!searchText.trim()) return entries;
    return entries.filter(
      entry =>
        entry.preview.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.date.includes(searchText)
    );
  }, [entries, searchText]);

  const formatDate = (dateString: string) => {
    const isoDateMatch = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
    const date = isoDateMatch
      ? new Date(
        Number(dateString.slice(0, 4)),
        Number(dateString.slice(5, 7)) - 1,
        Number(dateString.slice(8, 10))
      )
      : new Date(dateString);

    const toLocalDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const today = toLocalDay(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const entryDay = toLocalDay(date);

    if (entryDay.getTime() === today.getTime()) {
      return 'Today';
    }
    if (entryDay.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (filteredEntries.length === 0) {
    return (
      <View style={styles.emptySearch}>
        <Ionicons name="search-outline" size={48} color={Theme.colors.textTertiary} />
        <Text style={styles.emptySearchText}>No entries found</Text>
        <Text style={styles.emptySearchSubtext}>Try a different search term</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Entries</Text>
      {filteredEntries.map((entry, index) => {
        const isPlaying = playingEntryId === entry.id;

        return (
          <UnifiedCard
            key={entry.id || entry.date} // Use id if available, fallback to date
            delay={300 + index * 50}
            onPress={() => onEntryPress(entry)}
            onLongPress={() => onEntryLongPress?.(entry)}
          >
            <View style={styles.entryHeader}>
              <View style={styles.entryDateContainer}>
                <Ionicons name="calendar-outline" size={16} color={Theme.colors.accent} />
                <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
              </View>
              {entry.audioUri ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onPlayEntry?.(entry);
                  }}
                  style={[styles.playButton, isPlaying && styles.playButtonActive]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={16}
                    color={isPlaying ? "#FFFFFF" : Theme.colors.accent}
                  />
                  <Text style={[styles.playButtonText, isPlaying && styles.playButtonTextActive]}>
                    {isPlaying ? "Playing" : "Play Audio"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Ionicons name="chevron-forward" size={18} color={Theme.colors.textTertiary} />
              )}
            </View>
            <Text style={styles.entryPreview} numberOfLines={isPlaying ? undefined : 2}>
              {entry.preview}
            </Text>
          </UnifiedCard>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: Theme.spacing.sm,
  },
  sectionTitle: {
    ...Theme.typography.subtitle,
    color: Theme.colors.textPrimary,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  entryDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  entryDate: {
    ...Theme.typography.captionBold,
    color: Theme.colors.textSecondary,
  },
  entryPreview: {
    ...Theme.typography.body,
    color: Theme.colors.textTertiary,
    lineHeight: 22,
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxxl,
    paddingHorizontal: Theme.spacing.lg,
  },
  emptySearchText: {
    ...Theme.typography.subtitle,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xs,
  },
  emptySearchSubtext: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: Theme.colors.surfaceSecondary,
  },
  playButtonActive: {
    backgroundColor: Theme.colors.accent,
  },
  playButtonText: {
    ...Theme.typography.captionBold,
    color: Theme.colors.accent,
  },
  playButtonTextActive: {
    color: '#FFFFFF',
  },
});
