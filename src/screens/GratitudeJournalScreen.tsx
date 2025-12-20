import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { JournalHeader } from '../components/JournalHeader';
import { UnifiedCard } from '../components/UnifiedCard';
import { JournalEmptyState } from '../components/JournalEmptyState';
import { JournalEntriesList } from '../components/JournalEntriesList';
import { JournalFAB } from '../components/JournalFAB';
import { IncompleteDayModal } from '../components/IncompleteDayModal';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { GratitudeCheckIn } from '../utils/dayRollover';
import { IncompleteDayInfo } from '../utils/dayRolloverManager';
import { successHaptic, celebrationHaptic } from '../utils/haptics';

const DAILY_PROMPTS = [
  { text: "Write about one thing you like about your appearance today.", emoji: "✨" },
  { text: "What made you smile today?", emoji: "😊" },
  { text: "Who are you grateful for and why?", emoji: "💝" },
  { text: "What's a small win you experienced today?", emoji: "🎯" },
  { text: "What brought you joy today?", emoji: "🌟" },
  { text: "What challenged you and how did you grow?", emoji: "💪" },
  { text: "What are you looking forward to tomorrow?", emoji: "🌅" },
];

export default function GratitudeJournalScreen({ navigation }: any) {
  const { 
    appState, 
    getTodayProgress,
    getTodayCheckIns,
    getTodayCheckInCount,
    isTodayGratitudeComplete,
    checkForDayRollover,
    markYesterdayComplete,
    handleMissedDay,
    resetChallenge,
  } = useApp();
  // Memoize todayProgress
  const todayProgress = useMemo(() => getTodayProgress(), [getTodayProgress]);

  const todayPrompt = DAILY_PROMPTS[new Date().getDay()];
  const [searchText, setSearchText] = useState('');
  const [showFAB, setShowFAB] = useState(true);
  const [checkInCount, setCheckInCount] = useState(0);
  const [isTodayComplete, setIsTodayComplete] = useState(false);
  const [todayCheckIns, setTodayCheckIns] = useState<GratitudeCheckIn[]>([]);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteDay, setIncompleteDay] = useState<IncompleteDayInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fabOpacity = useRef(new Animated.Value(1)).current;
  const streakScale = useRef(new Animated.Value(0.95)).current;
  const scrollViewRef = useRef<any>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for day rollover on mount
  useEffect(() => {
    checkDayRollover();
  }, []);

  // Load today's check-in data
  useEffect(() => {
    loadTodayData();
  }, []);

  const checkDayRollover = async () => {
    const result = await checkForDayRollover();
    if (result.hasRollover && result.incompleteDay) {
      setIncompleteDay(result.incompleteDay);
      setShowIncompleteModal(true);
    }
  };

  const loadTodayData = async () => {
    try {
      setIsLoading(true);
      const count = await getTodayCheckInCount();
      const complete = await isTodayGratitudeComplete();
      const checkIns = await getTodayCheckIns();
      
      setCheckInCount(count);
      setIsTodayComplete(complete);
      setTodayCheckIns(checkIns);
    } catch (error) {
      console.error('Error loading today data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const entryCount = useMemo(
    () =>
      Object.keys(appState.dailyProgress || {}).filter(
        date => appState.dailyProgress[date]?.gratitudeEntry?.trim() && 
                appState.dailyProgress[date]?.gratitudeEntry !== 'COMPLETE'
      ).length,
    [appState.dailyProgress]
  );

  const hasEntries = entryCount > 0 || todayCheckIns.length > 0;
  const hasTodayEntry = isTodayComplete || checkInCount > 0;

  // Get recent entries for list (with search filtering)
  const recentEntries = useMemo(() => {
    if (!hasEntries) return [];
    
    const todayKey = new Date().toISOString().split('T')[0];
    let entries: Array<{ date: string; preview: string }> = [];
    
    // Get entries from old format (dailyProgress.gratitudeEntry)
    const oldEntries = Object.keys(appState.dailyProgress || {})
      .filter(date => {
        const entry = appState.dailyProgress[date]?.gratitudeEntry;
        return entry?.trim() && entry !== 'COMPLETE' && date !== todayKey;
      })
      .map(date => ({
        date,
        preview: appState.dailyProgress[date].gratitudeEntry.split('|||')[0].trim(),
      }));
    
    entries = [...oldEntries];
    
    // Add today's check-ins to entries (prefer check-ins over old format for today)
    if (todayCheckIns.length > 0) {
      const todayCheckInPreviews = todayCheckIns.map(checkIn => ({
        date: todayKey,
        preview: checkIn.text,
      }));
      entries = [...todayCheckInPreviews, ...entries];
    } else if (appState.dailyProgress[todayKey]?.gratitudeEntry?.trim() && 
               appState.dailyProgress[todayKey]?.gratitudeEntry !== 'COMPLETE') {
      // Fallback to old format if no check-ins for today
      entries.unshift({
        date: todayKey,
        preview: appState.dailyProgress[todayKey].gratitudeEntry.split('|||')[0].trim(),
      });
    }
    
    // Filter by search text if provided
    if (searchText.trim().length > 0) {
      const searchLower = searchText.toLowerCase().trim();
      entries = entries.filter(entry => 
        entry.preview.toLowerCase().includes(searchLower) ||
        entry.date.includes(searchLower)
      );
    }
    
    // Sort by date (most recent first) and limit to 10
    return entries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [appState.dailyProgress, hasEntries, todayCheckIns, searchText]);

  // Animate streak ring on mount
  useEffect(() => {
    Animated.spring(streakScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  // Hide FAB when scrolling down, show when scrolling up
  // Also track scroll state for FAB icon/text animation
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        
        // Track scrolling state
        setIsScrolling(true);
        
        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        // Set timeout to detect when scrolling stops (slightly longer for smoother transitions)
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 200);
        
        // Show/hide FAB based on scroll position
        if (offsetY > 50 && showFAB) {
          setShowFAB(false);
          Animated.timing(fabOpacity, {
            toValue: 0,
            duration: Theme.animation.fast,
            useNativeDriver: true,
          }).start();
        } else if (offsetY <= 50 && !showFAB) {
          setShowFAB(true);
          Animated.timing(fabOpacity, {
            toValue: 1,
            duration: Theme.animation.fast,
            useNativeDriver: true,
          }).start();
        }
      },
    }
  );
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Get days of week for streak display
  const getDaysOfWeek = useMemo(() => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay();
    return days.map((day, index) => ({
      label: day,
      isToday: index === today,
      completed: index === today && isTodayComplete,
    }));
  }, [isTodayComplete]);

  const handleWrite = () => {
    navigation.navigate('VoiceJournal');
  };

  const handlePromptSelect = (promptType: string) => {
    // Navigate to write screen with prompt type
    navigation.navigate('VoiceJournal');
  };

  const handleEntryPress = (date: string) => {
    // Navigate to view/edit entry
    navigation.navigate('VoiceJournal');
  };

  const handleMarkYesterdayComplete = async () => {
    await markYesterdayComplete();
    setShowIncompleteModal(false);
    setIncompleteDay(null);
    // Reload data
    await loadTodayData();
  };

  const handleRestartChallenge = async () => {
    await resetChallenge();
    setShowIncompleteModal(false);
    setIncompleteDay(null);
  };

  const handleKeepGoing = async () => {
    await handleMissedDay();
    setShowIncompleteModal(false);
    setIncompleteDay(null);
  };

  const fabTranslateY = fabOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  return (
    <Screen>
      {/* Subtle Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(30)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.patternDot,
              {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.15 + Math.random() * 0.1,
              },
            ]}
          />
        ))}
      </View>

      {/* Header */}
      <JournalHeader
        entryCount={entryCount}
        onHistoryPress={() => navigation.navigate('JournalHistory')}
      />

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Search Bar - Only show if entries exist */}
        {hasEntries && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Theme.colors.accentDark} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search in ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`}
              placeholderTextColor={Theme.colors.textTertiary}
              value={searchText}
              onChangeText={setSearchText}
              accessibilityLabel="Search journal entries"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                accessibilityLabel="Clear search"
                accessibilityRole="button"
              >
                <Ionicons name="close-circle" size={20} color={Theme.colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme.colors.accent} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Streak Tracker */}
        {!isLoading && (
          <UnifiedCard delay={0}>
            <View style={styles.streakHeader}>
              <Animated.View style={{ transform: [{ scale: streakScale }] }}>
                <View style={styles.streakNumberContainer}>
                  <Text style={styles.streakNumber}>{appState.currentStreak}</Text>
                </View>
              </Animated.View>
              <View style={styles.streakInfo}>
                <Text style={styles.streakLabel}>DAY STREAK</Text>
                <Text style={styles.streakSubtext}>Keep it going! 🔥</Text>
              </View>
            </View>

            <View style={styles.daysContainer}>
              {getDaysOfWeek.map((day, index) => (
                <View key={index} style={styles.dayItem}>
                  <View
                    style={[
                      styles.dayCircle,
                      day.isToday && styles.dayCircleToday,
                      day.completed && styles.dayCircleCompleted,
                    ]}
                  >
                    {day.completed && (
                      <Ionicons name="checkmark" size={14} color={Theme.colors.textInverse} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      day.isToday && styles.dayLabelToday,
                      day.completed && styles.dayLabelCompleted,
                    ]}
                  >
                    {day.label}
                  </Text>
                </View>
              ))}
            </View>
          </UnifiedCard>
        )}

        {/* Daily Prompt Card - Tappable with clear CTA */}
        <UnifiedCard
          onPress={handleWrite}
          delay={100}
          testID="prompt-card"
        >
          <View style={styles.promptHeader}>
            <View style={styles.promptBadge}>
              <Text style={styles.promptBadgeText}>TODAY</Text>
            </View>
            {hasTodayEntry ? (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={18} color={Theme.colors.success} />
              </View>
            ) : (
              <View style={styles.incompleteBadge}>
                <Ionicons name="ellipse-outline" size={18} color={Theme.colors.gold} />
              </View>
            )}
          </View>

          <Text style={styles.promptTitle}>
            {todayPrompt.emoji} {todayPrompt.text}
          </Text>

          {hasTodayEntry ? (
            <View style={styles.entryPreview}>
              <Text style={styles.entryPreviewLabel}>Your entry:</Text>
              <Text style={styles.promptEntry} numberOfLines={3}>
                {todayProgress.gratitudeEntry.split('|||')[0]}
              </Text>
              <TouchableOpacity
                style={styles.viewEntryButton}
                onPress={() => navigation.navigate('VoiceJournal')}
                accessibilityLabel="View full entry"
                accessibilityRole="button"
              >
                <Text style={styles.viewEntryText}>View full entry →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.promptCTA}>
              <Text style={styles.promptCTAText}>Start entry</Text>
              <Ionicons name="chevron-forward" size={18} color={Theme.colors.accent} />
            </View>
          )}
        </UnifiedCard>

        {/* Challenge Card - Secondary View button */}
        <UnifiedCard delay={200} style={styles.challengeCard}>
          <LinearGradient
            colors={['#8B7DD8', '#6B5DD8', '#5A4BC8']}
            style={styles.challengeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.challengeContent}>
              <View style={styles.challengeTextContainer}>
                <View style={styles.challengeTitleRow}>
                  <Text style={styles.challengeTitle}>LIVE FOR YOU NOW!</Text>
                  <Text style={styles.challengeEmoji}>👑</Text>
                </View>
                <Text style={styles.challengeSubtitle}>December Reflection Challenge</Text>
              </View>
              <TouchableOpacity
                style={styles.challengeViewButton}
                activeOpacity={0.7}
                accessibilityLabel="View challenge"
                accessibilityRole="button"
              >
                <Text style={styles.challengeViewButtonText}>View</Text>
                <Ionicons name="chevron-forward" size={16} color={Theme.colors.textInverse} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </UnifiedCard>

        {/* Entries List or Empty State */}
        {hasEntries ? (
          <JournalEntriesList
            entries={recentEntries}
            onEntryPress={handleEntryPress}
            searchText={searchText}
          />
        ) : (
          <JournalEmptyState
            onStartWriting={handleWrite}
            onPromptSelect={handlePromptSelect}
          />
        )}

        {/* Extra padding to prevent content from being hidden behind FAB */}
        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Floating Action Button - Primary CTA */}
      <JournalFAB
        onPress={handleWrite}
        opacity={fabOpacity}
        translateY={fabTranslateY}
        visible={showFAB}
        isScrolling={isScrolling}
      />

      {/* Incomplete Day Modal */}
      <IncompleteDayModal
        visible={showIncompleteModal}
        incompleteDay={incompleteDay}
        onMarkComplete={handleMarkYesterdayComplete}
        onRestartChallenge={handleRestartChallenge}
        onKeepGoing={handleKeepGoing}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  patternDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: Theme.colors.accent,
    borderRadius: 1.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    marginHorizontal: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.subtle,
  },
  searchInput: {
    flex: 1,
    marginLeft: Theme.spacing.md,
    color: Theme.colors.textPrimary,
    ...Theme.typography.body,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    gap: Theme.spacing.lg,
  },
  streakNumberContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Theme.colors.accent,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Theme.colors.accent,
  },
  streakInfo: {
    flex: 1,
  },
  streakLabel: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  streakSubtext: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayCircleToday: {
    backgroundColor: Theme.colors.accentSoft,
    borderColor: Theme.colors.accent,
  },
  dayCircleCompleted: {
    backgroundColor: Theme.colors.accent,
    borderColor: Theme.colors.accent,
  },
  dayLabel: {
    ...Theme.typography.small,
    color: Theme.colors.textTertiary,
    marginTop: Theme.spacing.xs,
  },
  dayLabelToday: {
    color: Theme.colors.accent,
    fontWeight: '700',
  },
  dayLabelCompleted: {
    color: Theme.colors.textSecondary,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  promptBadge: {
    backgroundColor: Theme.colors.accentSoft,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.sm,
  },
  promptBadgeText: {
    ...Theme.typography.small,
    color: Theme.colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  progressBadge: {
    backgroundColor: Theme.colors.surfaceSecondary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs / 2,
    borderRadius: Theme.radius.sm,
    marginLeft: Theme.spacing.sm,
  },
  progressBadgeText: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    fontWeight: '700',
  },
  completedBadge: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incompleteBadge: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.success + '15',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    marginTop: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  completeMessageText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.success,
    flex: 1,
  },
  progressMessage: {
    backgroundColor: Theme.colors.accentSoft,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    marginTop: Theme.spacing.md,
  },
  progressMessageText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  promptTitle: {
    ...Theme.typography.subtitle,
    color: Theme.colors.textPrimary,
    lineHeight: 28,
    marginBottom: Theme.spacing.lg,
  },
  entryPreview: {
    marginTop: Theme.spacing.sm,
  },
  entryPreviewLabel: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
    textTransform: 'uppercase',
  },
  promptEntry: {
    ...Theme.typography.body,
    color: Theme.colors.textTertiary,
    lineHeight: 24,
    marginBottom: Theme.spacing.md,
  },
  viewEntryButton: {
    alignSelf: 'flex-start',
    paddingVertical: Theme.spacing.sm,
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
  },
  viewEntryText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.accent,
  },
  promptCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  promptCTAText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.accent,
  },
  challengeCard: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 0,
    backgroundColor: 'transparent',
    ...Theme.shadow.large,
  },
  challengeGradient: {
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
  },
  challengeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeTextContainer: {
    flex: 1,
    marginRight: Theme.spacing.lg,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  challengeTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
    letterSpacing: 0.5,
    fontWeight: '800',
  },
  challengeEmoji: {
    fontSize: 18,
  },
  challengeSubtitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
    opacity: 0.95,
  },
  challengeViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    gap: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minHeight: TOUCH_TARGET_MIN,
  },
  challengeViewButtonText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
  },
});
