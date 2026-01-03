import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { GUIDED_SESSIONS, AFFIRMATION_CATEGORIES } from '../data/guidedAffirmations';
import { MEDITATION_SESSIONS } from '../data/meditations';
import { Screen } from '../components/layout/Screen';
import { Card } from '../components/ui';
import { ChipRow, ChipOption } from '../components/ChipRow';
import { MediaCardData } from '../components/MediaCard';
import { AffirmationsFAB } from '../components/AffirmationsFAB';
import { Theme } from '../utils/theme';
import { useTheme } from '../theme/ThemeProvider';
import { AffirmationsMainScreenProps } from '../types/navigation';
import { useScreenTracking } from '../hooks/useScreenTracking';

type TabType = 'affirmations' | 'meditations';
type MeditationType = 'morning' | 'midday' | 'sleep' | 'all';
type SceneVariant = 'dawn' | 'sunset' | 'forest' | 'night';
type MeditationCard = MediaCardData & { type: MeditationType };

const SCENE_VARIANTS: SceneVariant[] = ['dawn', 'sunset', 'forest', 'night'];
const SCENE_PALETTE: Record<SceneVariant, {
  sun: string;
  glow: string;
  hillBack: string;
  hillFront: string;
}> = {
  dawn: {
    sun: 'rgba(255, 255, 255, 0.7)',
    glow: 'rgba(255, 255, 255, 0.35)',
    hillBack: 'rgba(255, 255, 255, 0.25)',
    hillFront: 'rgba(255, 255, 255, 0.35)',
  },
  sunset: {
    sun: 'rgba(255, 244, 214, 0.75)',
    glow: 'rgba(255, 204, 128, 0.35)',
    hillBack: 'rgba(255, 255, 255, 0.2)',
    hillFront: 'rgba(255, 255, 255, 0.3)',
  },
  forest: {
    sun: 'rgba(236, 255, 234, 0.7)',
    glow: 'rgba(180, 240, 190, 0.35)',
    hillBack: 'rgba(255, 255, 255, 0.2)',
    hillFront: 'rgba(255, 255, 255, 0.3)',
  },
  night: {
    sun: 'rgba(240, 240, 255, 0.6)',
    glow: 'rgba(180, 190, 255, 0.35)',
    hillBack: 'rgba(255, 255, 255, 0.18)',
    hillFront: 'rgba(255, 255, 255, 0.25)',
  },
};

const getSceneVariant = (seed: string, offset: number = 0): SceneVariant => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 997;
  }
  return SCENE_VARIANTS[(hash + offset) % SCENE_VARIANTS.length];
};

const SceneBackdrop: React.FC<{ variant: SceneVariant }> = ({ variant }) => {
  const palette = SCENE_PALETTE[variant];
  return (
    <View style={styles.sceneBackdrop} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
        <Circle cx="40" cy="30" r="18" fill={palette.sun} />
        <Circle cx="150" cy="35" r="28" fill={palette.glow} />
        <Path
          d="M0 78 C 40 60, 90 62, 130 75 C 160 85, 190 84, 200 86 L 200 120 L 0 120 Z"
          fill={palette.hillBack}
        />
        <Path
          d="M0 92 C 50 76, 110 80, 160 92 C 180 98, 192 100, 200 102 L 200 120 L 0 120 Z"
          fill={palette.hillFront}
        />
      </Svg>
    </View>
  );
};

export default function AffirmationsScreen({ navigation }: AffirmationsMainScreenProps) {
  useScreenTracking('Affirmations');
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

  const heroAffirmation: MediaCardData = useMemo(() => {
    const first = filteredAffirmations[0];
    if (first) {
      return first;
    }
    return {
      id: 'daily-reset',
      title: 'Daily Reset',
      subtitle: '5 min - Reset your mindset',
      gradient: ['#E9D5FF', '#F0E8FF', '#FFFFFF'],
      icon: 'sparkles',
      locked: false,
      playButton: false,
    };
  }, [filteredAffirmations]);

  const heroCtaLabel = heroAffirmation.locked ? 'Unlock Session' : 'Start Session';

  const forYouAffirmations = useMemo(
    () => filteredAffirmations.slice(0, 6),
    [filteredAffirmations]
  );

  const quickResetAffirmations = useMemo(
    () => filteredAffirmations.slice(6, 12),
    [filteredAffirmations]
  );

  const unwindAffirmations = useMemo(
    () => filteredAffirmations.slice(12, 18),
    [filteredAffirmations]
  );

  const allMeditations: MeditationCard[] = useMemo(() => {
    return MEDITATION_SESSIONS.map(session => ({
      id: session.id,
      title: session.title,
      subtitle: session.subtitle,
      gradient: session.gradient,
      icon: session.icon as keyof typeof Ionicons.glyphMap,
      locked: session.locked,
      playButton: true,
      type: session.type,
    }));
  }, []);

  const filteredMeditations = useMemo(() => {
    if (selectedMeditationType === 'all') {
      return allMeditations;
    }
    return allMeditations.filter((session) => session.type === selectedMeditationType);
  }, [allMeditations, selectedMeditationType]);

  const meditationHero: MeditationCard = useMemo(() => {
    const first = filteredMeditations[0];
    if (first) {
      return first;
    }
    return {
      id: 'meditation-reset',
      title: 'Quiet Focus',
      subtitle: 'Meditation - 6 min',
      gradient: ['#E8DFF5', '#C7B8EA', '#FFFFFF'],
      icon: 'moon',
      locked: false,
      playButton: true,
      type: 'midday',
    };
  }, [filteredMeditations]);

  const meditationCtaLabel = meditationHero.locked ? 'Unlock Session' : 'Start Meditation';

  const meditationPreview = useMemo(
    () => allMeditations.slice(0, 6),
    [allMeditations]
  );

  const morningMeditations = useMemo(
    () => allMeditations.filter((session) => session.type === 'morning'),
    [allMeditations]
  );

  const middayMeditations = useMemo(
    () => allMeditations.filter((session) => session.type === 'midday'),
    [allMeditations]
  );

  const sleepMeditations = useMemo(
    () => allMeditations.filter((session) => session.type === 'sleep'),
    [allMeditations]
  );

  const handleCardPress = (card: MediaCardData) => {
    if (card.locked) {
      // Show upsell/lock flow if exists
      return;
    }
    if (activeTab === 'affirmations') {
      const session = GUIDED_SESSIONS.find(item => item.id === card.id);
      if (!session) {
        return;
      }
      navigation.navigate('AffirmationPlayer', {
        session: {
          id: session.id,
          categoryId: session.categoryId,
          title: session.title,
          subtitle: session.subtitle,
          duration: session.duration,
          affirmations: session.affirmations,
        },
      });
    } else {
      // Navigate to meditation screen
      navigation.getParent()?.getParent()?.navigate('MeditationScreen' as never);
    }
  };

  const handleNewAffirmation = () => {
    // Navigate to affirmation library
    navigation.navigate('AffirmationLibrary');
  };

  const openMeditationsTab = () => {
    setSelectedMeditationType('all');
    setActiveTab('meditations');
  };

  const renderTabSwitch = () => (
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
  );

  const renderHorizontalCard = ({ item, index }: { item: MediaCardData; index: number }) => {
    const sceneVariant = getSceneVariant(item.id, index);
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.85}
        accessibilityLabel={`${item.title}, ${item.subtitle}${item.locked ? ', locked' : ''}`}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={item.gradient as any}
          style={styles.horizontalGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SceneBackdrop variant={sceneVariant} />
          {item.locked && (
            <View style={styles.horizontalLock}>
              <Ionicons name="lock-closed" size={12} color={Theme.colors.textPrimary} />
            </View>
          )}
          {item.playButton && !item.locked && (
            <View style={styles.horizontalPlayBadge}>
              <Ionicons name="play" size={14} color={Theme.colors.textPrimary} />
            </View>
          )}
          {item.icon && (
            <Ionicons name={item.icon} size={34} color={Theme.colors.accent} style={styles.horizontalIcon} />
          )}
        </LinearGradient>
        <View style={styles.horizontalInfo}>
          <Text style={[styles.horizontalTitle, { color: designTheme.colors.textPrimary }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.horizontalSubtitle, { color: designTheme.colors.textSecondary }]} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHorizontalSection = (
    title: string,
    subtitle: string,
    data: MediaCardData[],
    actionLabel?: string,
    onAction?: () => void,
  ) => {
    if (!data.length) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: designTheme.colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.sectionSubtitle, { color: designTheme.colors.textSecondary }]}>{subtitle}</Text>
          </View>
          {actionLabel && onAction && (
            <TouchableOpacity
              onPress={onAction}
              style={styles.sectionAction}
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
            >
              <Text style={[styles.sectionActionText, { color: designTheme.colors.accent }]}>
                {actionLabel}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={designTheme.colors.accent} />
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderHorizontalCard}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  };

  const renderAffirmationsHeader = () => (
    <View>
      {renderTabSwitch()}

      <TouchableOpacity
        style={styles.heroCard}
        onPress={() => handleCardPress(heroAffirmation)}
        activeOpacity={0.9}
        accessibilityLabel={`${heroAffirmation.title}, ${heroAffirmation.subtitle}`}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={heroAffirmation.gradient as any}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SceneBackdrop variant={getSceneVariant(heroAffirmation.id)} />
          <View style={styles.heroBadge}>
            <Text style={[styles.heroBadgeText, { color: designTheme.colors.textPrimary }]}>DAILY</Text>
          </View>
          {heroAffirmation.locked && (
            <View style={styles.heroLockBadge}>
              <Ionicons name="lock-closed" size={14} color={Theme.colors.textPrimary} />
            </View>
          )}
          <View style={styles.heroContent}>
            {heroAffirmation.icon && (
              <Ionicons name={heroAffirmation.icon} size={36} color={Theme.colors.accent} />
            )}
            <Text style={[styles.heroTitle, { color: designTheme.colors.textPrimary }]}>
              {heroAffirmation.title}
            </Text>
            <Text style={[styles.heroSubtitle, { color: designTheme.colors.textSecondary }]}>
              {heroAffirmation.subtitle}
            </Text>
            <View style={styles.heroCta}>
              <Ionicons
                name={heroAffirmation.locked ? 'lock-closed' : 'play'}
                size={16}
                color={Theme.colors.textInverse}
              />
              <Text style={[styles.heroCtaText, { color: Theme.colors.textInverse }]}>
                {heroCtaLabel}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionTitle, { color: designTheme.colors.textPrimary }]}>Browse by theme</Text>
        <Text style={[styles.sectionSubtitle, { color: designTheme.colors.textSecondary }]}>
          Filter by the feeling you want to grow.
        </Text>
      </View>
      <ChipRow
        chips={affirmationChips}
        selectedId={selectedCategory}
        onSelect={(id) => setSelectedCategory(id)}
        style={styles.chipRow}
      />

      {renderHorizontalSection('For You', 'Personalized picks to start your day.', forYouAffirmations)}
      {renderHorizontalSection('Quick Reset', 'Short sessions for fast calm.', quickResetAffirmations)}
      {renderHorizontalSection('Unwind', 'Slow down and soften your mind.', unwindAffirmations)}
      {renderHorizontalSection(
        'Meditations',
        'Guided sessions to help you reset.',
        meditationPreview,
        'See all',
        openMeditationsTab
      )}

      <TouchableOpacity
        style={styles.libraryCard}
        onPress={handleNewAffirmation}
        activeOpacity={0.85}
        accessibilityLabel="Open affirmation library"
        accessibilityRole="button"
      >
        <View style={styles.libraryContent}>
          <View style={styles.libraryIcon}>
            <Ionicons name="library" size={20} color={Theme.colors.accent} />
          </View>
          <View style={styles.libraryText}>
            <Text style={[styles.libraryTitle, { color: designTheme.colors.textPrimary }]}>
              Explore the full library
            </Text>
            <Text style={[styles.librarySubtitle, { color: designTheme.colors.textSecondary }]}>
              Browse every guided session and save your favorites.
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={designTheme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const renderMeditationsHeader = () => (
    <View>
      {renderTabSwitch()}

      <TouchableOpacity
        style={styles.heroCard}
        onPress={() => handleCardPress(meditationHero)}
        activeOpacity={0.9}
        accessibilityLabel={`${meditationHero.title}, ${meditationHero.subtitle}`}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={meditationHero.gradient as any}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SceneBackdrop variant={getSceneVariant(meditationHero.id, 1)} />
          <View style={styles.heroBadge}>
            <Text style={[styles.heroBadgeText, { color: designTheme.colors.textPrimary }]}>MEDITATION</Text>
          </View>
          {meditationHero.locked && (
            <View style={styles.heroLockBadge}>
              <Ionicons name="lock-closed" size={14} color={Theme.colors.textPrimary} />
            </View>
          )}
          <View style={styles.heroContent}>
            {meditationHero.icon && (
              <Ionicons name={meditationHero.icon} size={36} color={Theme.colors.accent} />
            )}
            <Text style={[styles.heroTitle, { color: designTheme.colors.textPrimary }]}>
              {meditationHero.title}
            </Text>
            <Text style={[styles.heroSubtitle, { color: designTheme.colors.textSecondary }]}>
              {meditationHero.subtitle}
            </Text>
            <View style={styles.heroCta}>
              <Ionicons
                name={meditationHero.locked ? 'lock-closed' : 'play'}
                size={16}
                color={Theme.colors.textInverse}
              />
              <Text style={[styles.heroCtaText, { color: Theme.colors.textInverse }]}>
                {meditationCtaLabel}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionTitle, { color: designTheme.colors.textPrimary }]}>Choose a mood</Text>
        <Text style={[styles.sectionSubtitle, { color: designTheme.colors.textSecondary }]}>
          Filter meditations by time of day.
        </Text>
      </View>
      <ChipRow
        chips={meditationChips}
        selectedId={selectedMeditationType}
        onSelect={(id) => setSelectedMeditationType(id as MeditationType)}
        style={styles.chipRow}
      />

      {selectedMeditationType === 'all' ? (
        <>
          {renderHorizontalSection('Morning Ease', 'Gentle starts to your day.', morningMeditations)}
          {renderHorizontalSection('Midday Reset', 'Short resets for clarity.', middayMeditations)}
          {renderHorizontalSection('Sleep and Restore', 'Wind down with calm sessions.', sleepMeditations)}
        </>
      ) : (
        renderHorizontalSection('Sessions', 'Pick a guided meditation.', filteredMeditations)
      )}
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
        onPress: () => navigation.getParent()?.navigate('Today' as never),
        label: 'Back to Today',
      }}
    >
      {activeTab === 'affirmations' ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          keyExtractor={(_, index) => `affirmations-${index}`}
          ListHeaderComponent={renderAffirmationsHeader}
          contentContainerStyle={styles.affirmationsContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 140 }} />}
        />
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          keyExtractor={(_, index) => `meditations-${index}`}
          ListHeaderComponent={renderMeditationsHeader}
          contentContainerStyle={styles.affirmationsContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 140 }} />}
        />
      )}

      {/* Premium FAB */}
      {activeTab === 'affirmations' && (
        <AffirmationsFAB onPress={handleNewAffirmation} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  affirmationsContent: {
    paddingTop: Theme.spacing.sm,
    paddingBottom: 20,
  },
  sceneBackdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  heroCard: {
    marginHorizontal: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadow.large,
  },
  heroGradient: {
    padding: Theme.spacing.xl,
    minHeight: 220,
    justifyContent: 'space-between',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  heroLockBadge: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.subtle,
  },
  heroBadgeText: {
    ...Theme.typography.small,
    letterSpacing: 1,
    fontWeight: '700',
  },
  heroContent: {
    marginTop: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  heroTitle: {
    ...Theme.typography.title,
  },
  heroSubtitle: {
    ...Theme.typography.body,
  },
  heroCta: {
    marginTop: Theme.spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    backgroundColor: 'rgba(31, 18, 53, 0.85)',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
  },
  heroCtaText: {
    ...Theme.typography.captionBold,
  },
  sectionBlock: {
    marginTop: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs / 2,
    paddingVertical: Theme.spacing.xs,
  },
  sectionActionText: {
    ...Theme.typography.captionBold,
  },
  sectionTitle: {
    ...Theme.typography.section,
  },
  sectionSubtitle: {
    ...Theme.typography.caption,
    marginTop: 4,
  },
  horizontalList: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  horizontalCard: {
    width: 190,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: Theme.colors.surface,
    marginRight: Theme.spacing.md,
    ...Theme.shadow.medium,
  },
  horizontalGradient: {
    height: 130,
    padding: Theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  horizontalIcon: {
    opacity: 0.35,
  },
  horizontalLock: {
    position: 'absolute',
    top: Theme.spacing.sm,
    left: Theme.spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  horizontalPlayBadge: {
    position: 'absolute',
    bottom: Theme.spacing.sm,
    right: Theme.spacing.sm,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.subtle,
  },
  horizontalInfo: {
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
  },
  horizontalTitle: {
    ...Theme.typography.bodyBold,
    marginBottom: 2,
  },
  horizontalSubtitle: {
    ...Theme.typography.caption,
  },
  chipRow: {
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
  },
  libraryCard: {
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.xl,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Theme.shadow.subtle,
  },
  libraryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Theme.spacing.md,
  },
  libraryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryText: {
    flex: 1,
  },
  libraryTitle: {
    ...Theme.typography.bodyBold,
  },
  librarySubtitle: {
    ...Theme.typography.caption,
    marginTop: 2,
  },
});
