import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
  Animated as RNAnimated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  DimensionValue,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/layout/Screen';
import { JournalHeader } from '../components/JournalHeader';
import { GlassCard, SectionCard, PrimaryButton } from '../components/ui';
import { UnifiedCard } from '../components/UnifiedCard';
import { JournalEmptyState } from '../components/JournalEmptyState';
import { JournalEntriesList } from '../components/JournalEntriesList';
import { JournalFAB } from '../components/JournalFAB';
import { IncompleteDayModal } from '../components/IncompleteDayModal';
import { SkeletonLoader, SkeletonCard } from '../components/SkeletonLoader';
import { tokens } from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';
import { useTabBarInset, TAB_BAR_SPACE } from '../hooks/useTabBarInset';
import { GratitudeCheckIn } from '../utils/dayRollover';
import { IncompleteDayInfo } from '../utils/dayRolloverManager';
import { successHaptic, lightHaptic } from '../utils/haptics';
import { JournalMainScreenProps } from '../types/navigation';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { trackEvent } from '../utils/analytics';

const TOUCH_TARGET_MIN = 44; // Minimum touch target size for accessibility
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const DAILY_PROMPTS = [
  'What is one thing you are grateful for today?',
  'Who helped you today, and what did they do?',
  'What simple pleasure are you grateful for right now?',
  'What is something about your body or health you appreciate?',
  'What is a small win you are grateful for today?',
  'What part of your day felt peaceful or calming?',
  'What are you grateful to look forward to tomorrow?',
];

export default function GratitudeJournalScreen({ navigation }: JournalMainScreenProps) {
  useScreenTracking('GratitudeJournal');
  const { theme, isDark } = useTheme();
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
    addGratitudeCheckIn,
  } = useApp();
  const tabBarInset = useTabBarInset();
  // Memoize todayProgress
  const todayProgress = useMemo(() => getTodayProgress(), [getTodayProgress]);

  const todayPromptIndex = new Date().getDay();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(todayPromptIndex);
  const todayPrompt = DAILY_PROMPTS[currentPromptIndex];
  const [searchText, setSearchText] = useState('');
  const [showFAB, setShowFAB] = useState(false);
  const [checkInCount, setCheckInCount] = useState(0);
  const [isTodayComplete, setIsTodayComplete] = useState(false);
  const [todayCheckIns, setTodayCheckIns] = useState<GratitudeCheckIn[]>([]);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteDay, setIncompleteDay] = useState<IncompleteDayInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textEntry, setTextEntry] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fabOpacity = useRef(new Animated.Value(0)).current;
  const streakScale = useRef(new Animated.Value(0.95)).current;
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textInputRef = useRef<TextInput>(null);
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const recordButtonScale = useRef(new RNAnimated.Value(1)).current;
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);
  const isRecordingRef = useRef(false);
  const MIN_RECORDING_DURATION = 30000; // 30 seconds minimum

  const checkDayRollover = useCallback(async () => {
    const result = await checkForDayRollover();
    if (result.hasRollover && result.incompleteDay) {
      setIncompleteDay(result.incompleteDay);
      setShowIncompleteModal(true);
    }
  }, [checkForDayRollover]);

  const loadTodayData = useCallback(async () => {
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
  }, [getTodayCheckInCount, getTodayCheckIns, isTodayGratitudeComplete]);

  // Check for day rollover on mount
  useEffect(() => {
    checkDayRollover();
  }, [checkDayRollover]);

  // Load today's check-in data
  useEffect(() => {
    loadTodayData();
  }, [loadTodayData]);

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
        if (offsetY > 180 && !showFAB) {
          setShowFAB(true);
          Animated.timing(fabOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else if (offsetY <= 180 && showFAB) {
          setShowFAB(false);
          Animated.timing(fabOpacity, {
            toValue: 0,
            duration: 200,
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
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      pulseAnim.stopAnimation();
      recordButtonScale.stopAnimation();
      pulseAnim.setValue(1);
      recordButtonScale.setValue(1);
      if (isRecordingRef.current) {
        import('../utils/voiceRecording')
          .then(({ cancelRecording }) => cancelRecording())
          .catch(() => null);
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


  const patternDots = useMemo(
    () =>
      [...Array(20)].map((_, index) => ({
        key: `dot-${index}`,
        top: Math.random() * 100,
        left: Math.random() * 100,
        opacity: 0.08 + Math.random() * 0.08,
      })),
    []
  );

  const handleStartRecording = async () => {
    try {
      const { startRecording: startRec, requestMicrophonePermission } = await import('../utils/voiceRecording');

      const hasPermission = await requestMicrophonePermission();

      if (!hasPermission) {
        Alert.alert('Microphone Access', 'Please enable microphone access to record voice journal entries.');
        return;
      }

      await startRec();

      setIsRecording(true);
      recordingStartTime.current = Date.now();
      setRecordingDuration(0);

      // Start pulsing animation for REC indicator
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          RNAnimated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Update duration every 500ms
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime.current;
        setRecordingDuration(elapsed);
      }, 500);

      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(recordButtonScale, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          RNAnimated.timing(recordButtonScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    try {
      // Check minimum duration
      const elapsed = Date.now() - recordingStartTime.current;
      if (elapsed < MIN_RECORDING_DURATION) {
        const remaining = Math.ceil((MIN_RECORDING_DURATION - elapsed) / 1000);
        Alert.alert(
          'Recording Too Short',
          `Please record for at least 30 seconds. ${remaining} more seconds needed.`
        );
        return;
      }

      // Clear the timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      const { stopRecording } = await import('../utils/voiceRecording');
      const uri = await stopRecording();
      setIsRecording(false);
      setRecordingDuration(0);
      recordButtonScale.stopAnimation();
      recordButtonScale.setValue(1);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);

      if (uri) {
        await handleSaveRecording(uri);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      setRecordingDuration(0);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const handleSaveRecording = async (uri: string) => {
    try {
      const duration = Math.floor(recordingDuration / 1000);
      const text = `Voice journal (${duration}s): ${todayPrompt}`;

      // Save the journal entry
      await addGratitudeCheckIn(text);
      trackEvent('gratitude_check_in_completed', { 
        method: 'voice', 
        duration_seconds: duration,
        check_in_count: checkInCount + 1 
      });

      // Reload data to show the new entry
      await loadTodayData();

      // Show success feedback
      successHaptic();
      Alert.alert('Saved!', 'Your voice journal has been saved successfully.');
    } catch (error) {
      console.error('Error saving recording:', error);
      Alert.alert('Error', 'Failed to save your journal entry. Please try again.');
    }
  };

  const handleTextSubmit = async () => {
    if (!textEntry.trim()) return;

    try {
      // Save the journal entry
      await addGratitudeCheckIn(textEntry.trim());
      trackEvent('gratitude_check_in_completed', { 
        method: 'text', 
        check_in_count: checkInCount + 1,
        text_length: textEntry.trim().length 
      });

      // Reload data to show the new entry
      await loadTodayData();
      setTextEntry('');
      setShowTextInput(false);

      // Show success feedback
      successHaptic();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save your journal entry. Please try again.');
    }
  };

  const handleWrite = () => {
    setShowTextInput(true);
    // Focus input after a short delay to ensure it's rendered
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }
    focusTimeoutRef.current = setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  };

  // Keyboard listeners for better UX
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: e.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handlePromptSelect = (promptType: string) => {
    setShowTextInput(true);
  };

  const handleChangePrompt = () => {
    lightHaptic();
    // Cycle through all prompts
    const nextIndex = (currentPromptIndex + 1) % DAILY_PROMPTS.length;
    setCurrentPromptIndex(nextIndex);
  };

  const handleEntryPress = (date: string) => {
    // Could open a modal to view/edit entry
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
    <Screen
      rightAction={{
        icon: 'home-outline',
        onPress: () => navigation.getParent()?.navigate('Today' as never),
        label: 'Back to Today',
      }}
    >
      {/* Subtle Background Pattern */}
      <View style={styles.backgroundPattern}>
        {patternDots.map(dot => (
          <View
            key={dot.key}
            style={[
              styles.patternDot,
              {
                top: `${dot.top}%` as DimensionValue,
                left: `${dot.left}%` as DimensionValue,
                opacity: dot.opacity,
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

      <AnimatedFlatList
        style={styles.scrollView}
        data={[]}
        renderItem={() => null}
        keyExtractor={(_, index) => `gratitude-journal-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarInset }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <SkeletonCard style={{ marginBottom: tokens.spacing.lg }} />
            <SkeletonCard style={{ marginBottom: tokens.spacing.lg }} />
            <SkeletonLoader width="100%" height={200} borderRadius={tokens.radii.lg} />
          </View>
        )}

        {!isLoading && (
          <>
            {/* PRIMARY CTA - Modern, Focused Journal Interface */}
            <GlassCard style={styles.primaryCTACard}>
              {/* Header with prompt */}
              <View style={styles.promptHeader}>
                <View style={styles.promptTopRow}>
                  <View style={styles.promptEmojiContainer}>
                    <Ionicons name="sparkles" size={22} color={tokens.colors.accent} />
                  </View>
                  <TouchableOpacity
                    onPress={handleChangePrompt}
                    style={styles.changePromptLink}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Change prompt"
                    accessibilityRole="button"
                  >
                    <Ionicons name="sync" size={16} color={tokens.colors.accent} />
                    <Text style={[styles.changePromptText, { color: tokens.colors.accent }]}>
                      Change prompt
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.promptCtaCard}>
                  <Text style={[styles.primaryCTAPrompt, { color: tokens.colors.textPrimary }]}>
                    {todayPrompt}
                  </Text>
                  <Text style={[styles.promptSubtext, { color: tokens.colors.textSecondary }]}>
                    Share what you are grateful for and why it matters today.
                  </Text>
                </View>
                {isTodayComplete && (
                  <View style={styles.completeCheckBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={tokens.colors.success} />
                    <Text style={[styles.completeCheckText, { color: tokens.colors.success }]}>
                      Done for today
                    </Text>
                  </View>
                )}
              </View>

              {/* Voice Recording Interface - Simplified, Bigger Hit Target */}
              {!showTextInput && (
                <View style={styles.recordingInterface}>
                  {/* Recording Indicator */}
                  {isRecording && (
                    <RNAnimated.View style={[styles.recIndicator, { opacity: pulseAnim }]}>
                      <View style={styles.recDot} />
                      <Text style={styles.recText}>Recording</Text>
                    </RNAnimated.View>
                  )}
                  <TouchableOpacity
                    onPress={isRecording ? handleStopRecording : handleStartRecording}
                    onPressIn={() => {
                      RNAnimated.spring(recordButtonScale, {
                        toValue: 0.95,
                        useNativeDriver: true,
                      }).start();
                    }}
                    onPressOut={() => {
                      if (!isRecording) {
                        RNAnimated.spring(recordButtonScale, {
                          toValue: 1,
                          useNativeDriver: true,
                        }).start();
                      }
                    }}
                    style={styles.recordButton}
                    activeOpacity={0.9}
                  >
                    <RNAnimated.View
                      style={[
                        styles.recordButtonInner,
                        {
                          backgroundColor: isRecording ? tokens.colors.error : tokens.colors.accent,
                          transform: [{ scale: recordButtonScale }],
                        },
                      ]}
                    >
                      <Ionicons
                        name={isRecording ? 'stop' : 'mic'}
                        size={36}
                        color="#FFFFFF"
                      />
                    </RNAnimated.View>
                  </TouchableOpacity>
                  <Text style={[styles.recordButtonLabel, { color: tokens.colors.textPrimary }]}>
                    {isRecording
                      ? `Recording - ${Math.floor(recordingDuration / 1000)}s`
                      : 'Tap to record'}
                  </Text>
                  <Text style={[styles.recordButtonHint, { color: tokens.colors.textSecondary }]}>
                    {isRecording
                      ? 'Minimum 30 seconds'
                      : 'Voice note - 30s minimum'}
                  </Text>

                  {/* Divider */}
                  <View style={styles.modeDivider}>
                    <View style={[styles.modeDividerLine, { backgroundColor: tokens.colors.border }]} />
                    <Text style={[styles.modeDividerText, { color: tokens.colors.textSecondary }]}>or</Text>
                    <View style={[styles.modeDividerLine, { backgroundColor: tokens.colors.border }]} />
                  </View>

                  {/* Type Instead Button - More Prominent */}
                  <TouchableOpacity
                    onPress={() => setShowTextInput(true)}
                    style={[
                      styles.textModeButton,
                      {
                        borderColor: tokens.colors.border,
                        backgroundColor: `${tokens.colors.accent}08`,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={20} color={tokens.colors.accent} />
                    <Text style={[styles.textModeButtonText, { color: tokens.colors.textPrimary }]}>
                      Type instead
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Text Input Interface - Premium, Elevated Design */}
              {showTextInput && (
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                  <View style={styles.textInputInterface}>
                    {/* Enhanced Text Input Container */}
                    <View style={[
                      styles.textInputContainer,
                      {
                        backgroundColor: tokens.colors.surface,
                        borderColor: isKeyboardVisible 
                          ? tokens.colors.accent 
                          : tokens.colors.borderSubtle,
                      },
                    ]}>
                      <TextInput
                        ref={textInputRef}
                        style={[
                          styles.textInput,
                          Platform.OS === 'web' && styles.textInputWeb,
                          {
                            color: tokens.colors.textPrimary,
                          },
                        ]}
                        placeholder="Write your thoughts here..."
                        placeholderTextColor={tokens.colors.textTertiary}
                        value={textEntry}
                        onChangeText={setTextEntry}
                        multiline
                        autoFocus
                        autoCorrect={Platform.OS !== 'web'}
                        spellCheck={Platform.OS !== 'web'}
                        textAlignVertical="top"
                        onFocus={() => setIsKeyboardVisible(true)}
                        onBlur={() => setIsKeyboardVisible(false)}
                        returnKeyType="default"
                        blurOnSubmit={false}
                      />
                      {/* Character count badge */}
                      {textEntry.length > 0 && (
                        <View style={[
                          styles.characterCountBadge,
                          { backgroundColor: `${tokens.colors.accent}15` },
                        ]}>
                          <Text style={[styles.characterCountText, { color: tokens.colors.accent }]}>
                            {textEntry.length}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Action Buttons - Premium Layout */}
                    <View style={styles.textInputActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setShowTextInput(false);
                          setTextEntry('');
                          Keyboard.dismiss();
                        }}
                        style={[
                          styles.textInputCancelButton,
                          { borderColor: tokens.colors.border },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.textInputCancelText, { color: tokens.colors.textSecondary }]}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          if (textEntry.trim()) {
                            handleTextSubmit();
                            Keyboard.dismiss();
                          }
                        }}
                        disabled={!textEntry.trim()}
                        activeOpacity={0.7}
                        style={[
                          styles.textInputSaveButton,
                          { borderColor: !textEntry.trim() ? tokens.colors.border : tokens.colors.accent },
                          !textEntry.trim() && styles.textInputSaveButtonDisabled,
                        ]}
                      >
                        <LinearGradient
                          colors={
                            !textEntry.trim()
                              ? ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)']
                              : ['rgba(139, 125, 216, 1)', 'rgba(199, 125, 255, 1)']
                          }
                          style={styles.textInputSaveButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={[
                            styles.textInputSaveButtonText,
                            { color: !textEntry.trim() ? tokens.colors.textTertiary : '#FFFFFF' }
                          ]}>
                            {isTodayComplete ? "Add Another" : "Save Entry"}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              )}
            </GlassCard>

            {/* Streak / Calendar (SECONDARY - Reduced height ~25%) */}
            <SectionCard style={styles.streakCard}>
              <View style={styles.streakHeaderCompact}>
                <Animated.View style={{ transform: [{ scale: streakScale }] }}>
                  <View style={styles.streakNumberContainerCompact}>
                    <Text style={[styles.streakNumberCompact, { color: tokens.colors.accent }]}>
                      {appState.currentStreak}
                    </Text>
                  </View>
                </Animated.View>
                <View style={styles.streakInfoCompact}>
                  <Text style={[styles.streakLabelCompact, { color: tokens.colors.textSecondary }]}>
                    Day streak
                  </Text>
                </View>
              </View>
              <View style={styles.daysContainerCompact}>
                {getDaysOfWeek.map((day, index) => (
                  <View key={index} style={styles.dayItemCompact}>
                    <View
                      style={[
                        styles.dayCircleCompact,
                        day.isToday && { backgroundColor: `${tokens.colors.primary}20` },
                        day.completed && { backgroundColor: tokens.colors.primary },
                      ]}
                    >
                      {day.completed && (
                        <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.dayLabelCompact,
                        { color: tokens.colors.textSecondary },
                        day.isToday && { color: tokens.colors.primary, fontWeight: '600' },
                      ]}
                    >
                      {day.label}
                    </Text>
                  </View>
                ))}
              </View>
            </SectionCard>

            {/* Search Bar - Only show if entries exist */}
            {hasEntries && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color={tokens.colors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: tokens.colors.textPrimary }]}
                  placeholder={`Search in ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`}
                  placeholderTextColor={tokens.colors.textSecondary}
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
                    <Ionicons name="close-circle" size={18} color={tokens.colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            )}

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
          </>
        )}
          </>
        }
      />

      {/* Floating Action Button - Primary CTA */}
      <JournalFAB
        onPress={handleWrite}
        opacity={fabOpacity}
        translateY={fabTranslateY}
        visible={showFAB && !showTextInput && !isRecording}
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
    width: 2,
    height: 2,
    backgroundColor: tokens.colors.accent,
    borderRadius: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: tokens.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface,
    marginHorizontal: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    marginBottom: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    ...tokens.shadows.subtle,
  },
  searchInput: {
    flex: 1,
    marginLeft: tokens.spacing.md,
    color: tokens.colors.textPrimary,
    ...tokens.typography.body,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
    gap: tokens.spacing.lg,
  },
  streakNumberContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: tokens.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: tokens.colors.accent,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: tokens.colors.accent,
  },
  streakInfo: {
    flex: 1,
  },
  streakLabel: {
    ...tokens.typography.small,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  streakSubtext: {
    ...tokens.typography.caption,
    color: tokens.colors.textTertiary,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayCircleToday: {
    backgroundColor: tokens.colors.accentSoft,
    borderColor: tokens.colors.accent,
  },
  dayCircleCompleted: {
    backgroundColor: tokens.colors.accent,
    borderColor: tokens.colors.accent,
  },
  dayLabel: {
    ...tokens.typography.small,
    color: tokens.colors.textTertiary,
    marginTop: tokens.spacing.xs,
  },
  dayLabelToday: {
    color: tokens.colors.accent,
    fontWeight: '700',
  },
  dayLabelCompleted: {
    color: tokens.colors.textSecondary,
  },
  promptHeaderLegacy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  promptBadge: {
    backgroundColor: tokens.colors.accentSoft,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.sm,
  },
  promptBadgeText: {
    ...tokens.typography.small,
    color: tokens.colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  progressBadge: {
    backgroundColor: tokens.colors.surfaceSecondary,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs / 2,
    borderRadius: tokens.radii.sm,
    marginLeft: tokens.spacing.sm,
  },
  progressBadgeText: {
    ...tokens.typography.small,
    color: tokens.colors.textSecondary,
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
    backgroundColor: tokens.colors.success + '15',
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    marginTop: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  completeMessageText: {
    ...tokens.typography.bodyBold,
    color: tokens.colors.success,
    flex: 1,
  },
  progressMessage: {
    backgroundColor: tokens.colors.accentSoft,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    marginTop: tokens.spacing.md,
  },
  progressMessageText: {
    ...tokens.typography.body,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
  },
  promptTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.textPrimary,
    lineHeight: 28,
    marginBottom: tokens.spacing.lg,
  },
  entryPreview: {
    marginTop: tokens.spacing.sm,
  },
  entryPreviewLabel: {
    ...tokens.typography.small,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.sm,
    textTransform: 'uppercase',
  },
  promptEntry: {
    ...tokens.typography.body,
    color: tokens.colors.textTertiary,
    lineHeight: 24,
    marginBottom: tokens.spacing.md,
  },
  viewEntryButton: {
    alignSelf: 'flex-start',
    paddingVertical: tokens.spacing.sm,
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
  },
  viewEntryText: {
    ...tokens.typography.bodyBold,
    color: tokens.colors.accent,
  },
  promptCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.sm,
    paddingTop: tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
  },
  promptCTAText: {
    ...tokens.typography.bodyBold,
    color: tokens.colors.accent,
  },
  // Legacy styles (kept for compatibility)
  challengeCard: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 0,
    backgroundColor: 'transparent',
    ...tokens.shadows.card,
  },
  challengeGradient: {
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.xl,
  },
  challengeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeTextContainer: {
    flex: 1,
    marginRight: tokens.spacing.lg,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.xs,
  },
  challengeTitle: {
    ...tokens.typography.bodyBold,
    color: tokens.colors.textInverse,
    letterSpacing: 0.5,
    fontWeight: '800',
  },
  challengeEmoji: {
    fontSize: 18,
  },
  challengeSubtitle: {
    ...tokens.typography.bodyBold,
    color: tokens.colors.textInverse,
    opacity: 0.95,
  },
  challengeViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    gap: tokens.spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minHeight: TOUCH_TARGET_MIN,
  },
  challengeViewButtonText: {
    ...tokens.typography.bodyBold,
    color: tokens.colors.textInverse,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.xl,
  },
  loadingText: {
    ...tokens.typography.body,
    color: tokens.colors.textSecondary,
    marginTop: tokens.spacing.md,
  },
  // New styles for refactored flow - Modern, Clean UI
  primaryCTACard: {
    marginBottom: tokens.spacing.md,
    paddingVertical: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.lg,
  },
  promptHeader: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
  },
  promptTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promptEmojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${tokens.colors.accent}15`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  promptEmoji: {
    fontSize: 24,
  },
  primaryCTAPrompt: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  promptCtaCard: {
    width: '100%',
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radii.lg,
    backgroundColor: `${tokens.colors.accent}0F`,
    borderWidth: 1,
    borderColor: `${tokens.colors.accent}25`,
    gap: tokens.spacing.xs,
    ...tokens.shadows.subtle,
  },
  promptSubtext: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 280,
  },
  completeCheckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
    marginTop: tokens.spacing.xs,
  },
  completeCheckText: {
    fontSize: 13,
    fontWeight: '600',
  },
  changePromptLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: tokens.radii.full,
    backgroundColor: `${tokens.colors.accent}12`,
  },
  changePromptText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Recording Interface Styles - Improved
  recordingInterface: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  recIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
  },
  recDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30', // iOS red - always visible
  },
  recText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30', // iOS red - always visible
    letterSpacing: 0.6,
  },
  recordButton: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: tokens.spacing.md,
    ...tokens.shadows.subtle,
  },
  recordButtonInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.card,
  },
  recordButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recordButtonHint: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  modeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    marginVertical: tokens.spacing.lg,
    width: '100%',
  },
  modeDividerLine: {
    flex: 1,
    height: 1,
  },
  modeDividerText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radii.md,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'center',
  },
  textModeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Text Input Interface Styles - Premium, Elevated
  textInputInterface: {
    gap: tokens.spacing.lg,
    marginTop: tokens.spacing.sm,
  },
  textInputContainer: {
    borderRadius: tokens.radii.xl,
    borderWidth: 1,
    padding: tokens.spacing.md,
    overflow: 'hidden',
    backgroundColor: tokens.colors.surface,
    ...tokens.shadows.subtle,
    position: 'relative',
  },
  textInput: {
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xxl,
    fontSize: 17,
    lineHeight: 28,
    minHeight: 260,
    maxHeight: 300,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: 0.2,
    backgroundColor: 'transparent',
  },
  textInputWeb: {
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    boxShadow: 'none',
  } as any,
  characterCountBadge: {
    position: 'absolute',
    bottom: tokens.spacing.md,
    right: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radii.sm,
    ...tokens.shadows.subtle,
  },
  characterCountText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textInputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.md,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderSubtle,
  },
  textInputCancelButton: {
    flex: 1,
    minWidth: 0,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radii.lg,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputCancelText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textInputSaveButton: {
    flex: 1,
    minWidth: 0,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radii.lg,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  textInputSaveButtonDisabled: {
    opacity: 0.5,
    backgroundColor: tokens.colors.surfaceSecondary,
    borderColor: tokens.colors.borderSubtle,
  },
  textInputSaveButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    zIndex: 1,
  },
  streakCard: {
    marginBottom: tokens.spacing.md,
  },
  streakHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  streakNumberContainerCompact: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: `${tokens.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumberCompact: {
    ...tokens.typography.h2,
    fontWeight: '700',
  },
  streakInfoCompact: {
    flex: 1,
  },
  streakLabelCompact: {
    ...tokens.typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  daysContainerCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItemCompact: {
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  dayCircleCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: tokens.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
  },
  dayLabelCompact: {
    ...tokens.typography.small,
    fontSize: 10,
  },
});


