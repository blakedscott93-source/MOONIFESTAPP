import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UnifiedCard } from './UnifiedCard';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';

interface JournalEntry {
  date: string;
  preview: string;
}

interface JournalEntriesListProps {
  entries: JournalEntry[];
  onEntryPress: (date: string) => void;
  searchText?: string;
}

export const JournalEntriesList: React.FC<JournalEntriesListProps> = ({
  entries,
  onEntryPress,
  searchText = '',
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
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
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
      {filteredEntries.map((entry, index) => (
        <UnifiedCard
          key={entry.date}
          delay={300 + index * 50}
          onPress={() => onEntryPress(entry.date)}
        >
          <View style={styles.entryHeader}>
            <View style={styles.entryDateContainer}>
              <Ionicons name="calendar-outline" size={16} color={Theme.colors.accent} />
              <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.textTertiary} />
          </View>
          <Text style={styles.entryPreview} numberOfLines={2}>
            {entry.preview}
          </Text>
        </UnifiedCard>
      ))}
    </View>
  );
};

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
});

