import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GUIDED_SESSIONS, AFFIRMATION_CATEGORIES } from '../data/guidedAffirmations';
import { MEDITATION_SESSIONS, getMeditationsByType } from '../data/meditations';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { ChipRow, ChipOption } from '../components/ChipRow';
import { MediaCard, MediaCardData } from '../components/MediaCard';
import { AffirmationsFAB } from '../components/AffirmationsFAB';
import { Theme } from '../utils/theme';

type TabType = 'affirmations' | 'meditations';
type MeditationType = 'morning' | 'midday' | 'sleep' | 'all';

export default function AffirmationsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<TabType>('affirmations');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMeditationType, setSelectedMeditationType] = useState<MeditationType>('all');

  // Affirmation categories for filter chips
  const affirmationChips: ChipOption[] = useMemo(() => {
    const allChip: ChipOption = { id: 'all', label: 'All' };
    const categoryChips: ChipOption[] = AFFIRMATION_CATEGORIES.map(cat => ({
      id: cat.id,
      label: cat.name,
      icon: cat.icon as keyof typeof Ionicons.glyphMap,
    }));
    return [allChip, ...categoryChips];
  }, []);

  // Meditation type chips
  const meditationChips: ChipOption[] = [
    { id: 'all', label: 'All' },
    { id: 'morning', label: 'Morning', icon: 'sunny' },
    { id: 'midday', label: 'Midday', icon: 'partly-sunny' },
    { id: 'sleep', label: 'Sleep', icon: 'moon' },
  ];

  // Filtered affirmations
  const filteredAffirmations = useMemo(() => {
    let sessions = GUIDED_SESSIONS;
    if (selectedCategory !== 'all') {
      sessions = sessions.filter(s => s.categoryId === selectedCategory);
    }
    return sessions.map(session => {
      const category = AFFIRMATION_CATEGORIES.find(c => c.id === session.categoryId);
      return {
        id: session.id,
        title: session.title,
        subtitle: session.subtitle,
        gradient: category?.gradient || ['#E9D5FF', '#F0E8FF'],
        icon: category?.icon as keyof typeof Ionicons.glyphMap,
        locked: session.locked,
        playButton: false,
      } as MediaCardData;
    });
  }, [selectedCategory]);

  // Filtered meditations
  const filteredMeditations = useMemo(() => {
    let sessions = MEDITATION_SESSIONS;
    if (selectedMeditationType !== 'all') {
      sessions = getMeditationsByType(selectedMeditationType);
    }
    return sessions.map(session => ({
      id: session.id,
      title: session.title,
      subtitle: session.subtitle,
      gradient: session.gradient,
      icon: session.icon,
      locked: session.locked,
      playButton: true,
    } as MediaCardData));
  }, [selectedMeditationType]);

  // Current data based on active tab
  const currentData = activeTab === 'affirmations' ? filteredAffirmations : filteredMeditations;
  const currentChips = activeTab === 'affirmations' ? affirmationChips : meditationChips;
  const currentSelected = activeTab === 'affirmations' ? selectedCategory : selectedMeditationType;

  const handleCardPress = (card: MediaCardData) => {
    if (card.locked) {
      // Show upsell/lock flow if exists
      return;
    }
    if (activeTab === 'affirmations') {
      navigation.navigate('AffirmationPlayer', { sessionId: card.id });
    } else {
      // Navigate to meditation player (to be implemented)
      // navigation.navigate('MeditationPlayer', { sessionId: card.id });
    }
  };

  const handleNewAffirmation = () => {
    // Navigate to affirmation library
    navigation.navigate('AffirmationLibrary');
  };

  const renderCard = ({ item, index }: { item: MediaCardData; index: number }) => (
    <MediaCard
      data={item}
      onPress={() => handleCardPress(item)}
      style={[
        styles.card,
        index % 2 === 0 ? styles.cardLeft : styles.cardRight,
      ]}
    />
  );

  const renderHeader = () => (
    <View>
      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segment,
            activeTab === 'affirmations' && styles.segmentActive,
          ]}
          onPress={() => setActiveTab('affirmations')}
          accessibilityLabel="Affirmations tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'affirmations' }}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'affirmations' && styles.segmentTextActive,
            ]}
          >
            Affirmations
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segment,
            activeTab === 'meditations' && styles.segmentActive,
          ]}
          onPress={() => setActiveTab('meditations')}
          accessibilityLabel="Meditations tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'meditations' }}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'meditations' && styles.segmentTextActive,
            ]}
          >
            Meditations
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ChipRow
        chips={currentChips}
        selectedId={currentSelected}
        onSelect={(id) => {
          if (activeTab === 'affirmations') {
            setSelectedCategory(id);
          } else {
            setSelectedMeditationType(id as MeditationType);
          }
        }}
      />
    </View>
  );

  return (
    <Screen style={styles.container}>
      <SectionHeader
        title={activeTab === 'affirmations' ? 'Affirmations' : 'Meditations'}
        subtitle={
          activeTab === 'affirmations'
            ? 'Transform your mindset with powerful affirmations'
            : 'Find peace and clarity with guided meditations'
        }
        rightIcon={{
          name: 'lock-closed',
          onPress: () => {},
          accessibilityLabel: 'Locked sessions',
        }}
      />

      <FlatList
        data={currentData}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: Theme.spacing.xxxl + 80 }} />}
      />

      {/* Premium FAB */}
      {activeTab === 'affirmations' && (
        <AffirmationsFAB onPress={handleNewAffirmation} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.xs,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  segment: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: Theme.colors.surface,
    ...Theme.shadow.subtle,
  },
  segmentText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textSecondary,
  },
  segmentTextActive: {
    color: Theme.colors.accent,
  },
  card: {
    marginBottom: Theme.spacing.lg,
  },
  cardLeft: {
    marginRight: Theme.spacing.sm,
  },
  cardRight: {
    marginLeft: Theme.spacing.sm,
  },
});
