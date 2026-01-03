import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Pressable,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { REQUIRED_DAILY_GRATITUDE_CHECKINS } from '../utils/constants';
import {
  startRecording,
  stopRecording,
  cancelRecording,
  requestMicrophonePermission,
  formatDuration,
  getRecordingDuration,
} from '../utils/voiceRecording';
import { transcribeAudio, isTranscriptionAvailable } from '../utils/voiceTranscription';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoiceJournalScreenProps } from '../types/navigation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Daily prompts that rotate
const MANIFESTATION_PROMPTS = [
  "What are you manifesting today?",
  "What abundance are you calling in?",
  "What dream are you bringing to life?",
  "What miracle are you ready to receive?",
  "What does your ideal life look like?",
  "What are you grateful for manifesting?",
  "What powerful belief are you affirming?",
  "What transformation are you experiencing?",
];

// Personalized prompts based on user's primary goal
const PERSONALIZED_PROMPTS: Record<string, string[]> = {
  wealth: [
    "What financial abundance are you manifesting?",
    "What wealth opportunities are you attracting?",
    "How does financial freedom feel for you?",
    "What prosperous thoughts are you affirming?",
    "What money beliefs are you transforming?",
  ],
  love: [
    "What loving relationship are you calling in?",
    "How does your ideal partner make you feel?",
    "What qualities are you attracting in love?",
    "What self-love practices are transforming you?",
    "What connection are you manifesting?",
  ],
  health: [
    "What vibrant health are you manifesting?",
    "How does your ideal wellness feel?",
    "What healthy habits are you affirming?",
    "What healing are you experiencing?",
    "What vitality are you calling in?",
  ],
  career: [
    "What career success are you manifesting?",
    "What professional growth are you experiencing?",
    "How does your dream job feel?",
    "What opportunities are you attracting?",
    "What impact are you creating in your work?",
  ],
  happiness: [
    "What joy are you manifesting today?",
    "What brings you pure happiness?",
    "What moments of bliss are you attracting?",
    "How does your happiest self feel?",
    "What gratitude fills your heart?",
  ],
  spirituality: [
    "What spiritual growth are you experiencing?",
    "How are you deepening your connection?",
    "What divine guidance are you receiving?",
    "What spiritual gifts are you discovering?",
    "What higher wisdom are you manifesting?",
  ],
};

// Sidebar items - only show relevant ones while recording
const RECORDING_SIDEBAR_ITEMS = [
  { icon: 'close', label: 'Cancel', action: 'cancel' },
  { icon: 'arrow-back', label: 'Undo', action: 'undo' },
];

const IDLE_SIDEBAR_ITEMS = [
  { icon: 'create-outline', label: 'Type', action: 'type' },
];

export default function VoiceJournalScreen({ navigation }: VoiceJournalScreenProps) {
  const {
    getTodayCheckIns,
    getTodayCheckInCount,
    isTodayGratitudeComplete,
    addGratitudeCheckIn,
    appState,
    glowPoints,
  } = useApp();
  const { showSuccess, showError, showPoints, showInfo } = useToast();

  const [isRecording, setIsRecording] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [textEntry, setTextEntry] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [checkInCount, setCheckInCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [userGoal, setUserGoal] = useState<string>('');
  const [activePrompts, setActivePrompts] = useState<string[]>(MANIFESTATION_PROMPTS);
  const checkInLabel = REQUIRED_DAILY_GRATITUDE_CHECKINS === 1 ? 'check-in' : 'check-ins';

  // Entrance animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const promptOpacity = useRef(new Animated.Value(0)).current;
  const promptTranslateY = useRef(new Animated.Value(20)).current;
  const micButtonOpacity = useRef(new Animated.Value(0)).current;
  const micButtonScale = useRef(new Animated.Value(0.8)).current;
  const textInputOpacity = useRef(new Animated.Value(0)).current;
  const textInputTranslateY = useRef(new Animated.Value(30)).current;

  // Voice button animations
  const micButtonPressScale = useRef(new Animated.Value(1)).current;
  const glowRingOpacity = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const promptCardOpacity = useRef(new Animated.Value(1)).current;
  const textInputHeight = useRef(new Animated.Value(120)).current;

  // Waveform animation bars
  const waveformBars = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0.2))
  ).current;

  // Ref to store the recording duration interval ID
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);

  // Sidebar animations
  const sidebarItems = isPressing ? RECORDING_SIDEBAR_ITEMS : IDLE_SIDEBAR_ITEMS;
  const sidebarScales = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(1))
  ).current;

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      if (isRecordingRef.current) {
        cancelRecording().catch(() => null);
      }
    };
  }, []);

  useEffect(() => {
    // Auto-expand text input based on content
    const lines = textEntry.split('\n').length;
    const minHeight = 120;
    const maxHeight = 300;
    const newHeight = Math.min(Math.max(minHeight, lines * 28 + 40), maxHeight);
    
    Animated.spring(textInputHeight, {
      toValue: newHeight,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [textEntry]);

  const loadTodayData = useCallback(async () => {
    const count = await getTodayCheckInCount();
    const complete = await isTodayGratitudeComplete();
    setCheckInCount(count);
    setIsComplete(complete);

    // Load personalized prompts based on user's goal
    try {
      const data = await AsyncStorage.getItem('@onboarding_data');
      if (data) {
        const parsed = JSON.parse(data);
        const goal = parsed.primaryGoal || '';
        setUserGoal(goal);

        // Use personalized prompts if available, otherwise use default
        if (goal && PERSONALIZED_PROMPTS[goal]) {
          setActivePrompts(PERSONALIZED_PROMPTS[goal]);
        }
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    }
  }, [getTodayCheckInCount, isTodayGratitudeComplete]);

  // Entrance animations - fade up for all components
  const startEntranceAnimations = useCallback(() => {
    // Header
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Prompt card
    Animated.parallel([
      Animated.timing(promptOpacity, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(promptTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Mic button
    Animated.parallel([
      Animated.timing(micButtonOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(micButtonScale, {
        toValue: 1,
        tension: 40,
        friction: 6,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Text input
    Animated.parallel([
      Animated.timing(textInputOpacity, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(textInputTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    headerOpacity,
    headerTranslateY,
    micButtonOpacity,
    micButtonScale,
    promptOpacity,
    promptTranslateY,
    textInputOpacity,
    textInputTranslateY,
  ]);

  // Subtle idle animations
  const startIdleAnimations = useCallback(() => {
    // Gentle pulse on mic button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle glow ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowRingOpacity, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowRingOpacity, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowRingOpacity, pulseAnim]);

  useEffect(() => {
    loadTodayData();
    startEntranceAnimations();
    startIdleAnimations();
  }, [loadTodayData, startEntranceAnimations, startIdleAnimations]);


  // Waveform animation
  const startWaveformAnimation = () => {
    const animations = waveformBars.map((bar, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: Math.random() * 0.8 + 0.5,
            duration: 80 + Math.random() * 120,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 0.2 + Math.random() * 0.2,
            duration: 80 + Math.random() * 120,
            useNativeDriver: true,
          }),
        ])
      )
    );
    Animated.stagger(20, animations).start();
  };

  const stopWaveformAnimation = () => {
    waveformBars.forEach((bar) => {
      bar.stopAnimation();
      Animated.timing(bar, {
        toValue: 0.2,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // Handle press in (start recording)
  const handlePressIn = () => {
    
    // Start animations IMMEDIATELY (before async permission check)
    setIsPressing(true);
    setIsRecording(true);

    // Scale up button with spring
    Animated.spring(micButtonPressScale, {
      toValue: 1.15,
      tension: 100,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Soft glow animation
    Animated.timing(glowRingOpacity, {
      toValue: 0.25,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Gentle pulse (less intense)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    startWaveformAnimation();

    // Now do async permission check and recording start
    (async () => {
      try {
        // Request permission first
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          console.warn('Microphone permission denied');
          Alert.alert(
            'Microphone Permission',
            Platform.OS === 'web' 
              ? 'Please allow microphone access in your browser settings and refresh the page.'
              : 'Moonifest needs microphone access to record voice journals. Please enable it in your device settings.',
            [{ 
              text: 'OK',
              onPress: () => {
                // Reset state if permission denied
                setIsPressing(false);
                setIsRecording(false);
                Animated.spring(micButtonPressScale, {
                  toValue: 1,
                  tension: 100,
                  friction: 7,
                  useNativeDriver: true,
                }).start();
                pulseAnim.stopAnimation();
                stopWaveformAnimation();
                startIdleAnimations();
              }
            }]
          );
          return;
        }

        // Start actual voice recording
        await startRecording();

        // Update recording duration every 100ms
        const durationInterval = setInterval(async () => {
          try {
            const duration = await getRecordingDuration();
            setRecordingDuration(duration);
          } catch (durationError) {
            console.warn('Error getting recording duration:', durationError);
          }
        }, 500);

        // Store interval ID in ref to clear it later
        durationIntervalRef.current = durationInterval;
      } catch (error) {
        console.error('Failed to start recording:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Reset state on error
        setIsPressing(false);
        setIsRecording(false);
        
        // Reset animations
        Animated.spring(micButtonPressScale, {
          toValue: 1,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }).start();
        
        pulseAnim.stopAnimation();
        stopWaveformAnimation();
        startIdleAnimations();
        
        // Show user-friendly error message
        const errorAlert = Platform.OS === 'web'
          ? 'Voice recording on web requires HTTPS or localhost. Please:\n\n1. Use Chrome or Edge browser\n2. Allow microphone permissions\n3. Or test on iOS/Android for full functionality'
          : `Failed to start recording: ${errorMessage}\n\nPlease check:\n- Microphone permissions\n- Microphone is not being used by another app\n- Try restarting the app`;
        
        Alert.alert('Recording Error', errorAlert, [{ text: 'OK' }]);
        showError('Recording Error', 'Failed to start recording. Check console for details.');
      }
    })();
  };

  // Handle press out (stop recording)
  const handlePressOut = async () => {
    try {
      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      setIsPressing(false);
      setIsRecording(false);

      // Reset button scale
      Animated.spring(micButtonPressScale, {
        toValue: 1,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Reset soft glow
      Animated.timing(glowRingOpacity, {
        toValue: 0.3,
        duration: 400,
        useNativeDriver: true,
      }).start();

      pulseAnim.stopAnimation();
      stopWaveformAnimation();
      startIdleAnimations();

      // Stop recording and get URI
      const uri = await stopRecording();

      if (uri) {
        setRecordingUri(uri);
        const duration = formatDuration(recordingDuration);

        if (!isTranscriptionAvailable()) {
          setIsTranscribing(false);
          Alert.alert(
            'Transcription Unavailable',
            'Voice-only entries are supported right now. Would you like to save this as a voice entry?',
            [
              {
                text: 'Save Voice Entry',
                onPress: async () => {
                  const voiceOnlyText = `Voice journal entry (${duration})`;
                  await saveEntry(voiceOnlyText);
                  setRecordingUri(null);
                  setRecordingDuration(0);
                },
              },
              {
                text: 'Re-record',
                onPress: () => {
                  setRecordingUri(null);
                  setRecordingDuration(0);
                },
                style: 'cancel',
              },
            ]
          );
          return;
        }

        // Start transcribing
        setIsTranscribing(true);
        showInfo('Transcribing', 'Converting your voice to text...');

        try {
          // Transcribe audio to text
          const transcriptionResult = await transcribeAudio(uri, {
            language: 'en-US',
            hints: ['gratitude', 'manifestation', 'abundance', 'grateful'],
          });
          
          setIsTranscribing(false);

          if (transcriptionResult.error) {
            // Transcription failed - offer to save voice-only
            showError('Transcription Error', `Could not transcribe audio: ${transcriptionResult.error}`);
            Alert.alert(
              'Transcription Error',
              `Could not transcribe audio: ${transcriptionResult.error}\n\nWould you like to save as voice-only entry?`,
              [
                {
                  text: 'Save Voice Entry',
                  onPress: async () => {
                    const voiceOnlyText = `Voice journal entry (${duration})`;
                    await saveEntry(voiceOnlyText);
                    setRecordingUri(null);
                    setRecordingDuration(0);
                  },
                },
                {
                  text: 'Re-record',
                  onPress: () => {
                    setRecordingUri(null);
                    setRecordingDuration(0);
                  },
                  style: 'cancel',
                },
              ]
            );
          } else {
            // Transcription successful - show preview
            const transcribedText = transcriptionResult.text;
            const confidence = transcriptionResult.confidence ? ` (${Math.round(transcriptionResult.confidence * 100)}% confidence)` : '';

            Alert.alert(
              'Transcription Complete',
              `"${transcribedText}"\n\n${duration} recording${confidence}`,
              [
                {
                  text: 'Save',
                  onPress: async () => {
                    await saveEntry(transcribedText);
                    setRecordingUri(null);
                    setRecordingDuration(0);
                  },
                },
                {
                  text: 'Edit',
                  onPress: () => {
                    // Pre-fill text input with transcribed text
                    setTextEntry(transcribedText);
                    setShowTextInput(true);
                    setRecordingUri(null);
                    setRecordingDuration(0);
                  },
                },
                {
                  text: 'Re-record',
                  onPress: () => {
                    setRecordingUri(null);
                    setRecordingDuration(0);
                  },
                  style: 'cancel',
                },
              ]
            );
          }
        } catch (error) {
          setIsTranscribing(false);
          console.error('Error during transcription:', error);
          showError('Error', 'Failed to transcribe audio. Please try again.');
        }
      } else {
        // Recording was too short or failed
        showError('Recording Too Short', 'Please hold the button longer to record.');
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      showError('Recording Error', 'Failed to save recording. Please try again.');
      setIsPressing(false);
      setIsRecording(false);
    }
  };

  const handleChangePrompt = () => {
    // Animate prompt change
    Animated.sequence([
      Animated.timing(promptCardOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(promptCardOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    const nextIndex = (currentPromptIndex + 1) % activePrompts.length;
    setCurrentPromptIndex(nextIndex);
  };

  const handleSaveText = async () => {
    if (!textEntry.trim()) {
      showError('Empty Entry', 'Please write something before saving.');
      return;
    }

    await saveEntry(textEntry);
    setTextEntry('');
    setShowTextInput(false);
  };

  const saveEntry = async (content: string) => {
    if (isComplete) {
      showInfo('Day Complete', `You've already completed ${REQUIRED_DAILY_GRATITUDE_CHECKINS} ${checkInLabel} today. Keep going!`);
      // Still proceed with save
      await proceedWithSave(content);
      return;
    }

    await proceedWithSave(content);
  };

  const proceedWithSave = async (content: string) => {
    setIsSaving(true);
    try {
      await addGratitudeCheckIn(content);
      await loadTodayData();

      // Show success feedback with points
      const count = await getTodayCheckInCount();
      showSuccess('Saved!', 'Your manifestation has been recorded.');
      showPoints(10, 'Gratitude journal entry');
    } catch (error) {
      showError('Error', 'Failed to save entry. Please try again.');
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSidebarPress = async (index: number, action: string) => {
    // Animate sidebar button press
    Animated.sequence([
      Animated.timing(sidebarScales[index], {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sidebarScales[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Handle actions
    if (action === 'cancel') {
      // Cancel recording without saving
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      await cancelRecording();
      setIsPressing(false);
      setIsRecording(false);
      setRecordingUri(null);
      setRecordingDuration(0);

      // Reset animations
      Animated.spring(micButtonPressScale, {
        toValue: 1,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }).start();

      Animated.timing(glowRingOpacity, {
        toValue: 0.3,
        duration: 400,
        useNativeDriver: true,
      }).start();

      pulseAnim.stopAnimation();
      stopWaveformAnimation();
      startIdleAnimations();

    } else if (action === 'undo') {
      // Undo functionality - could implement later
    } else if (action === 'type') {
      setShowTextInput(true);
    }
  };


  return (
    <Screen>
      {/* Soft gradient background - pastel pink to lavender */}
      <LinearGradient
        colors={['#FFF5F7', '#F8F4FF', '#F0F9FF']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          style={styles.scrollView}
          data={[]}
          renderItem={() => null}
          keyExtractor={(_, index) => `voice-journal-${index}`}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
          {/* Header Section */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible={true}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={24} color={Theme.colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Manifestation Journal</Text>
              <View style={styles.progressBadge}>
                <Ionicons name="flame" size={12} color="#FF6B35" />
                <Text style={styles.progressText}>{appState.currentStreak} day streak</Text>
                <View style={styles.progressDivider} />
                <Text style={styles.progressText}>{checkInCount}/{REQUIRED_DAILY_GRATITUDE_CHECKINS} today</Text>
              </View>
            </View>

            <View style={styles.glowBadge}>
              <Ionicons name="sparkles" size={14} color="#FFD700" />
              <Text style={styles.glowText}>{glowPoints}</Text>
            </View>
          </Animated.View>

          {/* Prompt Card Section - Enhanced Visual Presence */}
          <Animated.View
            style={[
              styles.promptSection,
              {
                opacity: Animated.multiply(promptOpacity, promptCardOpacity),
                transform: [{ translateY: promptTranslateY }],
              },
            ]}
          >
            <Pressable
              onPress={handleChangePrompt}
              style={styles.promptCard}
              accessible={true}
              accessibilityLabel={`Current prompt: ${activePrompts[currentPromptIndex]}. Double tap to change prompt.`}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={styles.promptGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.promptText}>
                  {activePrompts[currentPromptIndex]}
                </Text>
                <TouchableOpacity
                  onPress={handleChangePrompt}
                  style={styles.changePromptButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessible={true}
                  accessibilityLabel="Change prompt"
                  accessibilityRole="button"
                >
                  <Text style={styles.changePromptText}>Change Prompt</Text>
                  <Ionicons name="refresh" size={14} color={Theme.colors.accent} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Main Content Area - Centered Voice Button */}
          <View style={styles.mainContent}>
            {/* Left Sidebar - Frosted Glass Icons (only show when relevant) */}
            {sidebarItems.length > 0 && (
              <Animated.View style={styles.sidebar}>
                {sidebarItems.map((item, index) => (
                  <Animated.View
                    key={index}
                    style={{ transform: [{ scale: sidebarScales[index] }] }}
                  >
                    <TouchableOpacity
                      onPress={() => handleSidebarPress(index, item.action)}
                      style={styles.sidebarButton}
                      activeOpacity={0.7}
                      accessible={true}
                      accessibilityLabel={item.label}
                      accessibilityRole="button"
                    >
                      <View style={styles.sidebarIconContainer}>
                        <Ionicons
                          name={item.icon as any}
                          size={22}
                          color={Theme.colors.textSecondary}
                        />
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </Animated.View>
            )}

            {/* Center - Voice Button (The Star) */}
            <Animated.View
              style={[
                styles.voiceButtonContainer,
                {
                  opacity: micButtonOpacity,
                  transform: [{ scale: micButtonScale }],
                },
              ]}
            >
              {/* Subtle soft glow when recording */}
              {isPressing && (
                <Animated.View
                  style={[
                    styles.softGlow,
                    {
                      opacity: glowRingOpacity.interpolate({
                        inputRange: [0.3, 0.8],
                        outputRange: [0.15, 0.25],
                      }),
                    },
                  ]}
                >
                  <View style={styles.softGlowInner} />
                </Animated.View>
              )}

              {/* Main mic button */}
              <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isSaving || isTranscribing}
                style={[
                  styles.micButtonPressable,
                  (isSaving || isTranscribing) && styles.micButtonDisabled,
                ]}
                accessible={true}
                accessibilityLabel={isPressing ? "Recording. Release to save" : "Hold to record"}
                accessibilityRole="button"
                accessibilityState={{ disabled: isSaving || isTranscribing }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Animated.View
                  style={[
                    styles.micButton,
                    {
                      transform: [
                        { scale: Animated.multiply(micButtonPressScale, pulseAnim) },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isPressing
                        ? ['#FF6B9D', '#C77DFF', '#8B7DD8']
                        : ['#FFB6D9', '#E9D5FF', '#D4C5FF']
                    }
                    style={styles.micButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {/* Inner highlight for depth */}
                    <View style={styles.micButtonInner}>
                      <Ionicons 
                        name="mic" 
                        size={52} 
                        color={isPressing ? "rgba(255, 255, 255, 0.9)" : "#FFFFFF"} 
                      />
                      {isPressing && (
                        <View style={styles.recordingIndicator}>
                          <View style={styles.recordingDot} />
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </Animated.View>
              </Pressable>

              {/* Instruction label - "Hold to Record" */}
              <Text style={styles.instructionLabel}>
                {isPressing ? 'Release to save' : 'Hold to Record'}
              </Text>

              {/* Waveform visualization - Organic, warm bars */}
              {isPressing && (
                <Animated.View
                  style={[
                    styles.waveformWrapper,
                    {
                      opacity: pulseAnim.interpolate({
                        inputRange: [1, 1.08],
                        outputRange: [0.95, 1],
                      }),
                    },
                  ]}
                >
                  <View style={styles.waveformContainer}>
                    {waveformBars.map((bar, index) => {
                      // Warm, organic colors - softer and more natural
                      const barColors = [
                        '#E9D5FF', // Soft lavender
                        '#F0E8FF', // Very light purple
                        '#E9D5FF', // Soft lavender
                        '#F5F0FF', // Almost white purple
                        '#E9D5FF', // Soft lavender
                      ];
                      const colorIndex = index % barColors.length;
                      
                      return (
                        <Animated.View
                          key={index}
                          style={[
                            styles.waveformBar,
                            {
                              transform: [{ scaleY: bar }],
                              backgroundColor: barColors[colorIndex],
                            },
                          ]}
                        />
                      );
                    })}
                  </View>
                </Animated.View>
              )}
            </Animated.View>
          </View>

          {/* Modern Floating Text Input - Elevated Design */}
          {showTextInput && (
            <Animated.View
              style={[
                styles.textInputWrapper,
                {
                  opacity: textInputOpacity,
                  transform: [{ translateY: textInputTranslateY }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 0.95)']}
                style={styles.textInputCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animated.View style={[styles.textInputContainer, { height: textInputHeight }]}>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    placeholder="Type your manifestation here..."
                    placeholderTextColor={Theme.colors.textTertiary}
                    value={textEntry}
                    onChangeText={setTextEntry}
                    textAlignVertical="top"
                    onFocus={() => setIsKeyboardVisible(true)}
                    onBlur={() => setIsKeyboardVisible(false)}
                    accessible={true}
                    accessibilityLabel="Text input for manifestation entry"
                    accessibilityHint="Enter your manifestation text here"
                  />
                  <View style={styles.textInputActions}>
                    <TouchableOpacity
                      onPress={() => {
                        setShowTextInput(false);
                        setTextEntry('');
                      }}
                      style={styles.cancelButton}
                      activeOpacity={0.7}
                      accessible={true}
                      accessibilityLabel="Cancel"
                      accessibilityRole="button"
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    {textEntry.trim().length > 0 && (
                      <TouchableOpacity
                        onPress={handleSaveText}
                        style={styles.sendButton}
                        activeOpacity={0.7}
                        accessible={true}
                        accessibilityLabel="Save entry"
                        accessibilityRole="button"
                      >
                        <LinearGradient
                          colors={[Theme.colors.accent, Theme.colors.accentDark]}
                          style={styles.sendButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Text Input Trigger (when not showing input) */}
          {!showTextInput && (
            <Animated.View
              style={[
                styles.textInputTriggerWrapper,
                {
                  opacity: textInputOpacity,
                  transform: [{ translateY: textInputTranslateY }],
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => setShowTextInput(true)}
                style={styles.textInputTrigger}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="Tap to type your manifestation"
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                  style={styles.textInputTriggerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="create-outline" size={24} color={Theme.colors.accent} />
                  <Text style={styles.textInputTriggerText}>Type your manifestation here...</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
            </>
          }
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 180,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
  },
  backButton: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.radius.full,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Theme.typography.title,
    fontSize: 22,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    gap: Theme.spacing.xs,
    ...Theme.shadow.subtle,
  },
  progressText: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
  },
  progressDivider: {
    width: 1,
    height: 14,
    backgroundColor: Theme.colors.border,
    marginHorizontal: Theme.spacing.xs / 2,
  },
  glowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    gap: Theme.spacing.xs,
    ...Theme.shadow.subtle,
  },
  glowText: {
    ...Theme.typography.small,
    fontWeight: '700',
    color: Theme.colors.gold,
  },
  promptSection: {
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xxl,
  },
  promptCard: {
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
    ...Theme.shadow.large,
  },
  promptGradient: {
    padding: Theme.spacing.xxl,
    paddingVertical: Theme.spacing.xxxl,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 28,
    fontWeight: '400',
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: Theme.spacing.lg,
    letterSpacing: -0.8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  changePromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    backgroundColor: 'rgba(199, 125, 255, 0.1)',
  },
  changePromptText: {
    ...Theme.typography.bodyBold,
    fontSize: 15,
    color: Theme.colors.accent,
    letterSpacing: 0.3,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xl,
    minHeight: 280,
  },
  sidebar: {
    position: 'absolute',
    left: Theme.spacing.lg,
    alignItems: 'center',
    gap: Theme.spacing.md,
    zIndex: 10,
  },
  sidebarButton: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(199, 125, 255, 0.15)',
    ...Theme.shadow.medium,
  },
  voiceButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  softGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(199, 125, 255, 0.1)',
  },
  softGlowInner: {
    flex: 1,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  micButtonPressable: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonDisabled: {
    opacity: 0.5,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    ...Theme.shadow.fab,
  },
  micButtonGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  micButtonInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  instructionLabel: {
    ...Theme.typography.subtitle,
    fontSize: 17,
    fontWeight: '500',
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xxl,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  waveformWrapper: {
    marginTop: Theme.spacing.xxl,
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(233, 213, 255, 0.4)',
    ...Theme.shadow.subtle,
    minWidth: SCREEN_WIDTH * 0.65,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    gap: 5,
  },
  waveformBar: {
    width: 5,
    height: 70,
    borderRadius: 2.5,
  },
  textInputWrapper: {
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
  },
  textInputCard: {
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
    ...Theme.shadow.large,
  },
  textInputContainer: {
    padding: Theme.spacing.lg,
  },
  textInput: {
    color: Theme.colors.textPrimary,
    ...Theme.typography.body,
    fontSize: 17,
    lineHeight: 26,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: Theme.spacing.md,
  },
  textInputActions: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.surfaceSecondary,
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textSecondary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...Theme.shadow.medium,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputTriggerWrapper: {
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xxl,
  },
  textInputTrigger: {
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
    ...Theme.shadow.medium,
  },
  textInputTriggerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  textInputTriggerText: {
    ...Theme.typography.bodyBold,
    fontSize: 17,
    color: Theme.colors.accent,
    letterSpacing: 0.2,
  },
});
