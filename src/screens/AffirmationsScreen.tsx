import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GUIDED_SESSIONS, AFFIRMATION_CATEGORIES } from '../data/guidedAffirmations';
import { MEDITATION_SESSIONS, getMeditationsByType } from '../data/meditations';
import { Screen } from '../components/layout/Screen';
import { Card } from '../components/ui';
import { ChipRow, ChipOption } from '../components/ChipRow';
import { MediaCard, MediaCardData } from '../components/MediaCard';
import { AffirmationsFAB } from '../components/AffirmationsFAB';
import { Theme } from '../utils/theme';
import { useTheme } from '../theme/ThemeProvider';

type TabType = 'affirmations' | 'meditations';
type MeditationType = 'morning' | 'midday' | 'sleep' | 'all';

export default function AffirmationsScreen({ navigation }: any) {
  const { theme: designTheme } = useTheme();
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
      // Navigate to meditation screen
      navigation.navigate('MeditationScreen');
    }
  };

  const handleNewAffirmation = () => {
    // Navigate to affirmation library
    navigation.navigate('AffirmationLibrary');
  };

  const renderCard = ({ item, index }: { item: MediaCardData; index: number }) => {
    const cardStyle: ViewStyle = index % 2 === 0 
      ? [styles.card, styles.cardLeft] as any
      : [styles.card, styles.cardRight] as any;
    return (
      <MediaCard
        data={item}
        onPress={() => handleCardPress(item)}
        style={cardStyle}
      />
    );
  };

  const renderHeader = () => (
    <View>
      {/* Segmented Control */}
      <Card style={styles.segmentedControlCard}>
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
                { color: designTheme.colors.textSecondary },
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
                { color: designTheme.colors.textSecondary },
                activeTab === 'meditations' && styles.segmentTextActive,
              ]}
            >
              Meditations
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

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
    <Screen
      scroll={false}
      title={activeTab === 'affirmations' ? 'Affirmations' : 'Meditations'}
      subtitle={
        activeTab === 'affirmations'
          ? 'Transform your mindset with powerful affirmations'
          : 'Find peace and clarity with guided meditations'
      }
      rightAction={{
        icon: 'home-outline',
        onPress: () => navigation.navigate('Today'),
        label: 'Back to Today',
      }}
    >
      <FlatList
        data={currentData}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      {/* Premium FAB */}
      {activeTab === 'affirmations' && (
        <AffirmationsFAB onPress={handleNewAffirmation} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  segmentedControlCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
  },
  cardLeft: {
    marginRight: 8,
  },
  cardRight: {
    marginLeft: 8,
  },
});
