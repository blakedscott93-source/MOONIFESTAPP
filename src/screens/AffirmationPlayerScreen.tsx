import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AVPlaybackStatus } from 'expo-av';
import { AFFIRMATION_CATEGORIES } from '../data/guidedAffirmations';
import { useApp } from '../context/AppContext';
import { GuidedSession } from '../types';
import { useToast } from '../context/ToastContext';
import { successHaptic, lightHaptic } from '../utils/haptics';
import { MAX_SESSIONS_PER_DAY, POINTS } from '../utils/constants';
import { saveAffirmation, isAffirmationSaved } from '../utils/savedAffirmations';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { AudioPlayer, AFFIRMATION_AUDIO, AffirmationAudioId } from '../utils/audioPlayer';
import { AffirmationPlayerScreenProps } from '../types/navigation';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { trackEvent } from '../utils/analytics';
import { useTabBarInset } from '../hooks/useTabBarInset';

export default function AffirmationPlayerScreen({ route, navigation }: AffirmationPlayerScreenProps) {
  useScreenTracking('AffirmationPlayer', { session_id: route.params?.session?.id });
  const session = route.params?.session;
  const { updateGuidedSessions, getTodayProgress, addGlowPoints } = useApp();
  const { showSuccess, showPoints } = useToast();
  const category = AFFIRMATION_CATEGORIES.find(c => c.id === session?.categoryId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressWidth, setProgressWidth] = useState('0%');
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedAffirmations, setSavedAffirmations] = useState<Set<string>>(new Set());
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const tabBarInset = useTabBarInset();
  const audioPlayerRef = useRef<AudioPlayer>(new AudioPlayer());
  const speakingAnimationsRef = useRef<Animated.CompositeAnimation[]>([]);

  const stopSpeakingAnimations = () => {
    speakingAnimationsRef.current.forEach(animation => animation.stop());
    speakingAnimationsRef.current = [];
  };
  
  // Animation values (only transform and opacity for native driver)
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const playButtonRotation = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const pulseDot1 = useRef(new Animated.Value(1)).current;
  const pulseDot2 = useRef(new Animated.Value(1)).current;
  const pulseDot3 = useRef(new Animated.Value(1)).current;

  // Load saved affirmations and audio
  useEffect(() => {
    if (!session) {
      return;
    }
    loadSavedAffirmations();
    loadAudio();
  }, []);

  // Clean up audio on unmount or navigation
  useEffect(() => {
    return () => {
      stopAudio();
      audioPlayerRef.current.unloadAudio();
      stopSpeakingAnimations();
    };
  }, []);


  // Animate play button when speaking
  useEffect(() => {
    if (isSpeaking) {
      stopSpeakingAnimations();
      // Continuous subtle pulse
      const scaleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(playButtonScale, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(playButtonScale, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      scaleLoop.start();
      
      // Subtle rotation
      const rotationLoop = Animated.loop(
        Animated.timing(playButtonRotation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotationLoop.start();

      // Pulse dots animation (staggered)
      const createPulse = (dot: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1.8,
              duration: 400,
              easing: Easing.out(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              easing: Easing.in(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
      };

      const pulse1 = createPulse(pulseDot1, 0);
      const pulse2 = createPulse(pulseDot2, 200);
      const pulse3 = createPulse(pulseDot3, 400);
      pulse1.start();
      pulse2.start();
      pulse3.start();

      speakingAnimationsRef.current = [scaleLoop, rotationLoop, pulse1, pulse2, pulse3];
    } else {
      stopSpeakingAnimations();
      playButtonScale.setValue(1);
      playButtonRotation.setValue(0);
      pulseDot1.setValue(1);
      pulseDot2.setValue(1);
      pulseDot3.setValue(1);
    }
  }, [isSpeaking]);

  const loadSavedAffirmations = async () => {
    if (!session) {
      return;
    }
    const saved = new Set<string>();
    for (const affirmation of session.affirmations) {
      const isSaved = await isAffirmationSaved(affirmation);
      if (isSaved) {
        saved.add(affirmation);
      }
    }
    setSavedAffirmations(saved);
  };

  const handleSaveAffirmation = async (affirmation: string) => {
    try {
      const isSaved = savedAffirmations.has(affirmation);
      if (isSaved) {
        showSuccess('Saved', 'This affirmation is already in your saved collection');
      } else {
        await saveAffirmation(affirmation, category?.name || 'Uncategorized', 'guided', session.id);
        setSavedAffirmations(new Set([...savedAffirmations, affirmation]));
        showSuccess('Saved!', 'Affirmation added to your collection');
        successHaptic();
      }
    } catch (error) {
      console.error('Error saving affirmation:', error);
    }
  };

  // Stop audio when navigating away
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopAudio();
    });
    return unsubscribe;
  }, [navigation]);

  const loadAudio = async () => {
    if (!session) return;

    try {
      const audioId = session.id as AffirmationAudioId;
      const audioSource = AFFIRMATION_AUDIO[audioId];

      if (audioSource) {
        await audioPlayerRef.current.loadAudio(audioSource);

        // Set up playback status update
        audioPlayerRef.current.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (status.isLoaded) {
            setDuration(status.durationMillis || 0);
            setPosition(status.positionMillis || 0);
            setProgress((status.positionMillis || 0) / (status.durationMillis || 1));
            setProgressWidth(`${((status.positionMillis || 0) / (status.durationMillis || 1)) * 100}%`);

            if (status.isPlaying) {
              setIsSpeaking(true);
              setIsPlaying(true);
            } else {
              setIsSpeaking(false);
            }

            // Handle completion
            if (status.didJustFinish && !status.isLooping) {
              handleComplete();
            }
          }
        });
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const stopAudio = async () => {
    try {
      await audioPlayerRef.current.stop();
      setIsSpeaking(false);
      setIsPlaying(false);
      setPosition(0);
      setProgress(0);
      setProgressWidth('0%');
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const playAudio = async () => {
    try {
      await audioPlayerRef.current.play();
      setIsSpeaking(true);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const pauseAudio = async () => {
    try {
      await audioPlayerRef.current.pause();
      setIsSpeaking(false);
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const handlePlayPause = async () => {
    lightHaptic();

    // Button press animation
    Animated.sequence([
      Animated.timing(playButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(playButtonScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    if (isPlaying && isSpeaking) {
      await pauseAudio();
    } else {
      await playAudio();
    }
  };

  const handlePrevious = async () => {
    lightHaptic();
    // Seek backward by 10 seconds
    if (!audioPlayerRef.current || !audioPlayerRef.current.getIsLoaded()) {
      return;
    }
    const newPosition = Math.max(0, position - 10000);
    try {
      await audioPlayerRef.current.seek(newPosition);
      setPosition(newPosition);
    } catch (error) {
      console.error('Error seeking backward:', error);
    }
  };

  const handleNext = async () => {
    lightHaptic();
    // Seek forward by 10 seconds
    if (!audioPlayerRef.current || !audioPlayerRef.current.getIsLoaded()) {
      return;
    }
    const newPosition = Math.min(duration, position + 10000);
    try {
      await audioPlayerRef.current.seek(newPosition);
      setPosition(newPosition);
    } catch (error) {
      console.error('Error seeking forward:', error);
    }
  };

  const handleComplete = async () => {
    if (isCompleting) return;
    
    try {
      setIsCompleting(true);
      trackEvent('affirmation_session_completed', { 
        session_id: session.id,
        session_title: session?.title,
        category: session?.categoryId,
        duration_seconds: Math.floor(duration / 1000)
      });
      
      const todayProgress = getTodayProgress();
      const existingSessions = todayProgress.guidedSessions || [];
      
      const alreadyCompleted = existingSessions.some(s => s.id === session.id);
      
      if (alreadyCompleted) {
        showSuccess('Already Complete', 'You already finished this session today!');
        navigation.goBack();
        return;
      }
      
      const completedSession: GuidedSession = {
        id: session.id,
        category: category?.name || session.categoryId,
        title: session.title,
        duration: session.duration,
        completedAt: new Date().toISOString(),
      };
      
      const updatedSessions = [...existingSessions, completedSession].slice(0, MAX_SESSIONS_PER_DAY);
      
      await updateGuidedSessions(updatedSessions);
      await addGlowPoints(POINTS.AFFIRMATION_SESSION, `Completed affirmation session: ${session.title}`);
      
      showSuccess('Session Complete!', 'Great job completing this affirmation session.');
      showPoints(POINTS.AFFIRMATION_SESSION, 'Affirmation session completed');
      successHaptic();
      
      navigation.goBack();
    } catch (error) {
      console.error('Error completing session:', error);
      showSuccess('Error', 'Failed to save session. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAffirmationPress = async (index: number) => {
    lightHaptic();
    // For audio affirmations, seeking to specific affirmations isn't supported
    // The audio plays continuously through all affirmations
    // This function can be removed or disabled in the UI
  };

  const playButtonRotationDeg = playButtonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Update progress width with smooth state transition
  useEffect(() => {
    if (!session) {
      return;
    }
    const newProgress = session.affirmations.length > 0
      ? ((currentAffirmation + 1) / session.affirmations.length) * 100
      : 0;
    setProgress(newProgress);
    
    // Smooth width transition using state (avoiding native driver issues with width)
    const timeout = setTimeout(() => {
      setProgressWidth(`${newProgress}%`);
    }, 50); // Small delay for smooth visual transition
    
    return () => clearTimeout(timeout);
  }, [currentAffirmation, session?.affirmations.length]);

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={(category?.gradient || ['#E8D5FF', '#F0E6FF', '#FFFFFF']) as any}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <BlurView intensity={80} style={styles.backButtonBlur}>
              <Ionicons name="chevron-back" size={24} color={Theme.colors.textPrimary} />
            </BlurView>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>{session.title}</Text>
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.getParent()?.navigate('Today' as never)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <BlurView intensity={80} style={styles.backButtonBlur}>
              <Ionicons name="home-outline" size={24} color={Theme.colors.textPrimary} />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Session Info */}
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>{session.title}</Text>
            <View style={styles.sessionMeta}>
              <View style={styles.metaBadge}>
                <Ionicons name="chatbubbles" size={14} color={Theme.colors.accent} />
                <Text style={styles.metaText}>{session.affirmations.length} affirmations</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaBadge}>
                <Ionicons name="time" size={14} color={Theme.colors.accent} />
                <Text style={styles.metaText}>{Math.floor(session.duration / 60)} mins</Text>
              </View>
            </View>
          </View>

          {/* Current Affirmation Display */}
          <Animated.View 
            style={[
              styles.affirmationCardWrapper,
              { transform: [{ scale: cardScale }] }
            ]}
          >
            <BlurView intensity={100} tint="light" style={styles.affirmationCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)', 'rgba(248, 245, 255, 0.9)']}
                style={styles.affirmationCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.affirmationCardContent}>
                  <View style={styles.affirmationNumberBadge}>
                    <Text style={styles.affirmationNumber}>
                      {currentAffirmation + 1}
                    </Text>
                    <View style={styles.affirmationNumberDivider} />
                    <Text style={styles.affirmationNumberTotal}>
                      {session.affirmations.length}
                    </Text>
                  </View>
                  <Text style={styles.affirmationText}>
                    {session.affirmations[currentAffirmation]}
                  </Text>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* ScrollView for All Affirmations */}
          <FlatList
            style={styles.affirmationScroll}
            contentContainerStyle={styles.affirmationContent}
            showsVerticalScrollIndicator={false}
            data={session.affirmations}
            keyExtractor={(item, index) => `${item}-${index}`}
            ListHeaderComponent={<Text style={styles.listTitle}>All Affirmations</Text>}
            ListFooterComponent={<View style={{ height: Theme.spacing.xl }} />}
            renderItem={({ item, index }) => {
              const isSaved = savedAffirmations.has(item);
              const isActive = index === currentAffirmation;
              return (
                <TouchableOpacity
                  style={[
                    styles.affirmationItemContainer,
                    isActive && styles.affirmationItemActive,
                  ]}
                  onPress={() => handleAffirmationPress(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.affirmationItem}>
                    <View style={[
                      styles.affirmationItemNumber,
                      isActive && styles.affirmationItemNumberActive
                    ]}>
                      <Text style={[
                        styles.affirmationItemNumberText,
                        isActive && styles.affirmationItemNumberTextActive
                      ]}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.affirmationItemText,
                        isActive && styles.affirmationItemTextActive,
                      ]}
                      numberOfLines={2}
                    >
                      {item}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => handleSaveAffirmation(item)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons
                      name={isSaved ? 'bookmark' : 'bookmark-outline'}
                      size={20}
                      color={isSaved ? Theme.colors.gold : Theme.colors.textTertiary}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />

          {/* Fixed Bottom Controls */}
          <View style={[styles.bottomControls, { paddingBottom: tabBarInset }]}>
            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: progressWidth as any }
                    ]} 
                  />
                </View>
              </View>
              <View style={styles.timeInfo}>
                <Text style={styles.timeText}>
                  {Math.floor(position / 1000 / 60)}:{Math.floor((position / 1000) % 60).toString().padStart(2, '0')}
                </Text>
                <Text style={styles.timeText}>
                  {duration > 0
                    ? `${Math.floor(duration / 1000 / 60)}:${Math.floor((duration / 1000) % 60).toString().padStart(2, '0')}`
                    : `${Math.floor(session.duration / 60)}:${(session.duration % 60).toString().padStart(2, '0')}`
                  }
                </Text>
              </View>
            </View>

            {/* Play Controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  position === 0 && styles.controlButtonDisabled
                ]}
                onPress={handlePrevious}
                disabled={position === 0}
              >
                <BlurView
                  intensity={position === 0 ? 40 : 60}
                  tint="light"
                  style={styles.controlButtonBlur}
                >
                  <Ionicons
                    name="play-skip-back"
                    size={24}
                    color={position === 0 ? Theme.colors.textTertiary : Theme.colors.textPrimary}
                  />
                </BlurView>
              </TouchableOpacity>

              {/* Glass Play Button */}
              <TouchableOpacity
                style={styles.playButtonContainer}
                onPress={handlePlayPause}
                activeOpacity={0.9}
              >
                <Animated.View
                  style={[
                    styles.playButton,
                    {
                      transform: [
                        { scale: playButtonScale },
                        { rotate: playButtonRotationDeg }
                      ]
                    }
                  ]}
                >
                  <BlurView intensity={100} tint="light" style={styles.playButtonBlur}>
                    <LinearGradient
                      colors={
                        isSpeaking 
                          ? ['rgba(139, 125, 216, 0.3)', 'rgba(199, 125, 255, 0.4)'] as const
                          : ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.35)'] as const
                      }
                      style={styles.playButtonGradient}
                    >
                      <View style={styles.playButtonInner}>
                        {isSpeaking ? (
                          <View style={styles.pulseIndicator}>
                            <Animated.View 
                              style={[
                                styles.pulseDot, 
                                {
                                  transform: [{ scale: pulseDot1 }],
                                  opacity: pulseDot1,
                                }
                              ]} 
                            />
                            <Animated.View 
                              style={[
                                styles.pulseDot, 
                                {
                                  transform: [{ scale: pulseDot2 }],
                                  opacity: pulseDot2,
                                }
                              ]} 
                            />
                            <Animated.View 
                              style={[
                                styles.pulseDot, 
                                {
                                  transform: [{ scale: pulseDot3 }],
                                  opacity: pulseDot3,
                                }
                              ]} 
                            />
                          </View>
                        ) : (
                          <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={40}
                            color={Theme.colors.accent}
                          />
                        )}
                      </View>
                    </LinearGradient>
                  </BlurView>
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.controlButton,
                  position >= duration && styles.controlButtonDisabled
                ]}
                onPress={handleNext}
                disabled={position >= duration}
              >
                <BlurView
                  intensity={position >= duration ? 40 : 60} 
                  tint="light" 
                  style={styles.controlButtonBlur}
                >
                  <Ionicons
                    name="play-skip-forward"
                    size={24}
                    color={position >= duration ? Theme.colors.textTertiary : Theme.colors.textPrimary}
                  />
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Complete Button */}
            <TouchableOpacity
              style={[styles.completeButton, isCompleting && styles.completeButtonDisabled]}
              onPress={handleComplete}
              disabled={isCompleting}
              activeOpacity={0.8}
            >
              <BlurView intensity={80} tint="light" style={styles.completeButtonBlur}>
                <LinearGradient
                  colors={['rgba(139, 125, 216, 0.9)', 'rgba(199, 125, 255, 0.9)']}
                  style={styles.completeButtonGradient}
                >
                  {isCompleting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.completeButtonText}>Mark as Complete</Text>
                  )}
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>

            {/* Audio Status Note */}
            {isSpeaking && (
              <View style={styles.statusNote}>
                <View style={styles.statusIndicator} />
                <Ionicons name="volume-high" size={16} color={Theme.colors.success} />
                <Text style={styles.statusText}>
                  Listening to affirmation {currentAffirmation + 1} of {session.affirmations.length}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Theme.spacing.lg,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
  },
  headerTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  sessionTitle: {
    ...Theme.typography.title,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
  },
  metaText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: Theme.colors.border,
  },
  affirmationCardWrapper: {
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.radius.xl,
    shadowColor: '#8B7DD8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  affirmationCard: {
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
    borderWidth: 0,
  },
  affirmationCardGradient: {
    width: '100%',
    height: '100%',
  },
  affirmationCardContent: {
    padding: Theme.spacing.xl,
    minHeight: 150,
    justifyContent: 'center',
  },
  affirmationNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.xs,
  },
  affirmationNumber: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.accent,
  },
  affirmationNumberDivider: {
    width: 1,
    height: 16,
    backgroundColor: Theme.colors.border,
  },
  affirmationNumberTotal: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  affirmationText: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  affirmationScroll: {
    flex: 1,
  },
  affirmationContent: {
    paddingBottom: Theme.spacing.md,
  },
  listTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  affirmationItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  affirmationItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: Theme.colors.accent,
    ...Theme.shadow.medium,
  },
  affirmationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: Theme.spacing.sm,
  },
  affirmationItemNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 125, 216, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 125, 216, 0.2)',
  },
  affirmationItemNumberActive: {
    backgroundColor: Theme.colors.accent,
    borderColor: Theme.colors.accent,
  },
  affirmationItemNumberText: {
    ...Theme.typography.captionBold,
    color: Theme.colors.accent,
  },
  affirmationItemNumberTextActive: {
    color: '#FFFFFF',
  },
  affirmationItemText: {
    flex: 1,
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
  },
  affirmationItemTextActive: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
  },
  saveButton: {
    padding: Theme.spacing.sm,
    marginLeft: Theme.spacing.xs,
  },
  bottomControls: {
    paddingTop: Theme.spacing.md,
  },
  progressSection: {
    marginBottom: Theme.spacing.lg,
  },
  progressBarContainer: {
    marginBottom: Theme.spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.accent,
    borderRadius: 3,
    shadowColor: Theme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.xs,
  },
  timeText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  controlButtonBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  playButtonContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    ...Theme.shadow.fab,
  },
  playButton: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  playButtonBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.accent,
  },
  completeButton: {
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
    ...Theme.shadow.medium,
  },
  completeButtonBlur: {
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    ...Theme.typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statusNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.success,
  },
  statusText: {
    flex: 1,
    ...Theme.typography.caption,
    color: Theme.colors.success,
    fontWeight: '600',
  },
  errorText: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: 100,
  },
});
