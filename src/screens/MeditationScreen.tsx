import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AVPlaybackStatus } from 'expo-av';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { Theme } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { AudioPlayer, MEDITATION_AUDIO, MeditationAudioId } from '../utils/audioPlayer';
import { MEDITATION_SESSIONS } from '../data/meditations';
import { MeditationScreenProps } from '../types/navigation';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { trackEvent } from '../utils/analytics';
import { useTabBarInset } from '../hooks/useTabBarInset';

export default function MeditationScreen({ navigation, route }: MeditationScreenProps) {
  useScreenTracking('Meditation', { meditation_id: route.params?.meditation?.id });
  const { completeMeditation, addGlowPoints } = useApp();
  const tabBarInset = useTabBarInset();

  // Get current time period
  const getCurrentPeriod = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'midday';
    return 'sleep';
  };

  const currentPeriod = getCurrentPeriod();
  const defaultCategory = currentPeriod;

  const isMeditationAudioId = (id: unknown): id is MeditationAudioId => {
    return typeof id === 'string' && Object.prototype.hasOwnProperty.call(MEDITATION_AUDIO, id);
  };

  const requestedSessionId = route.params?.meditation?.id;
  const requestedCategory = route.params?.meditation?.category;
  const resolvedRequestedSession = isMeditationAudioId(requestedSessionId) ? requestedSessionId : undefined;
  const resolvedRequestedCategory =
    requestedCategory === 'morning' || requestedCategory === 'midday' || requestedCategory === 'sleep'
      ? requestedCategory
      : undefined;

  const initialCategory =
    resolvedRequestedCategory ||
    (resolvedRequestedSession
      ? (MEDITATION_SESSIONS.find((s) => s.id === resolvedRequestedSession)?.type ?? defaultCategory)
      : defaultCategory);

  const availableSessions = MEDITATION_SESSIONS.filter((session) => session.type === initialCategory);
  const defaultSessionId = (availableSessions[0]?.id as MeditationAudioId | undefined) || ('morning-1' as MeditationAudioId);
  const sessionId = resolvedRequestedSession || defaultSessionId;

  const [selectedSession, setSelectedSession] = useState<MeditationAudioId>(sessionId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const audioPlayerRef = useRef(new AudioPlayer());
  const selectedSessionRef = useRef<MeditationAudioId>(selectedSession);
  const breathAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  const handleComplete = useCallback(async (finalDurationMillis?: number) => {
    setIsPlaying(false);
    setIsPaused(false);
    await audioPlayerRef.current.stop();
    await completeMeditation();
    await addGlowPoints(30, 'Completed meditation session');
    const completedSessionId = selectedSessionRef.current;
    const completedCategory =
      MEDITATION_SESSIONS.find((s) => s.id === completedSessionId)?.type ?? initialCategory;
    trackEvent('meditation_completed', { 
      meditation_id: completedSessionId,
      category: completedCategory,
      duration_seconds: Math.floor((finalDurationMillis ?? 0) / 1000),
    });
    // Show completion message
    navigation.goBack();
  }, [addGlowPoints, completeMeditation, initialCategory, navigation]);

  // Load audio when component mounts or session changes
  useEffect(() => {
    const audioPlayer = audioPlayerRef.current;
    let isActive = true;

    const loadAudio = async () => {
      try {
        const audioPath = MEDITATION_AUDIO[selectedSession];
        setCurrentPosition(0);
        setDuration(0);
        await audioPlayer.loadAudio(audioPath);

        if (!isActive) {
          return;
        }

        // Set up playback status update listener
        audioPlayer.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (status.isLoaded) {
            setCurrentPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);

            // Handle completion
            if (status.didJustFinish) {
              handleComplete(status.durationMillis || 0);
            }
          }
        });
      } catch (error) {
        console.error('Error loading meditation audio:', error);
      }
    };

    loadAudio();

    return () => {
      isActive = false;
      audioPlayer.unloadAudio();
    };
  }, [handleComplete, selectedSession]);

  // Handle animations when playing/paused
  useEffect(() => {
    if (isPlaying && !isPaused) {
      const breathLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathAnimation, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(breathAnimation, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      );
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      );
      breathLoop.start();
      pulseLoop.start();
      return () => {
        breathLoop.stop();
        pulseLoop.stop();
      };
    } else {
      breathAnimation.stopAnimation();
      pulseAnimation.stopAnimation();
    }
  }, [breathAnimation, isPaused, isPlaying, pulseAnimation]);

  const handleStart = async () => {
    try {
      await audioPlayerRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Error starting meditation:', error);
    }
  };

  const handlePause = async () => {
    try {
      if (isPaused) {
        await audioPlayerRef.current.play();
      } else {
        await audioPlayerRef.current.pause();
      }
      setIsPaused(!isPaused);
    } catch (error) {
      console.error('Error pausing meditation:', error);
    }
  };

  const handleStop = async () => {
    try {
      await audioPlayerRef.current.stop();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentPosition(0);
    } catch (error) {
      console.error('Error stopping meditation:', error);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? currentPosition / duration : 0;
  const breathScale = breathAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const getBreathText = () => {
    const cyclePosition = ((currentPosition / 1000) % 8) / 8;
    if (cyclePosition < 0.5) return 'Breathe In...';
    return 'Breathe Out...';
  };

  return (
    <Screen style={styles.container}>
      <AppHeader
        title="Meditation"
        subtitle="Find your inner peace"
        leftIcon={{
          name: 'chevron-back',
          onPress: () => navigation.goBack(),
          accessibilityLabel: 'Go back',
        }}
        rightIcon={{
          name: 'home-outline',
          onPress: () => navigation.navigate('MainTabs', { screen: 'Today' }),
          accessibilityLabel: 'Back to Today',
        }}
      />

      <View style={[styles.content, { paddingBottom: tabBarInset }]}>
        {!isPlaying ? (
          <>
            {/* Session Selection */}
            <View style={styles.durationContainer}>
              <Text style={styles.sectionTitle}>
                {initialCategory === 'morning' && 'Morning Meditations'}
                {initialCategory === 'midday' && 'Midday Meditations'}
                {initialCategory === 'sleep' && 'Evening Meditations'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                Perfect for {initialCategory === 'morning' ? 'starting your day' : initialCategory === 'midday' ? 'a refreshing break' : 'winding down'}
              </Text>
              <View style={styles.sessionGrid}>
                {availableSessions.map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    style={[
                      styles.durationButton,
                      selectedSession === session.id && styles.durationButtonActive,
                    ]}
                    onPress={() => setSelectedSession(session.id as MeditationAudioId)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.durationText,
                        selectedSession === session.id && styles.durationTextActive,
                      ]}
                    >
                      {session.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Center Circle */}
            <View style={styles.circleContainer}>
              <LinearGradient
                colors={['#C77DFF', '#9D4EDD']}
                style={styles.circleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="leaf" size={80} color={Theme.colors.textInverse} />
              </LinearGradient>
            </View>

            {/* Start Button */}
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.startGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="play" size={32} color={Theme.colors.textInverse} />
                <Text style={styles.startButtonText}>Begin Meditation</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Benefits List */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Benefits</Text>
              {[
                'Reduce stress and anxiety',
                'Improve focus and clarity',
                'Enhance emotional well-being',
                'Better sleep quality',
              ].map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color={Theme.colors.success} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Active Meditation View */}
            <View style={styles.activeContainer}>
              {/* Breathing Circle */}
              <View style={styles.breathingContainer}>
                <Animated.View
                  style={[
                    styles.breathingCircle,
                    {
                      transform: [{ scale: pulseAnimation }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#4ECDC4', '#44A08D']}
                    style={styles.breathingGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Animated.View
                      style={{
                        transform: [{ scale: breathScale }],
                      }}
                    >
                      <Ionicons name="leaf" size={60} color={Theme.colors.textInverse} />
                    </Animated.View>
                  </LinearGradient>
                </Animated.View>

                {/* Progress Ring */}
                <View style={styles.progressRing}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        transform: [{ rotate: `${progress * 360}deg` }],
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Timer Display */}
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatTime(currentPosition)}</Text>
                <Text style={styles.totalDurationText}>of {formatTime(duration)}</Text>
                <Text style={styles.breathText}>{isPaused ? 'Paused' : getBreathText()}</Text>
              </View>

              {/* Control Buttons */}
              <View style={styles.controls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handlePause}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isPaused ? 'play' : 'pause'}
                    size={32}
                    color={Theme.colors.accent}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handleStop}
                  activeOpacity={0.7}
                >
                  <Ionicons name="stop" size={32} color={Theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  content: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  durationContainer: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  sectionSubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
  },
  sessionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  durationButton: {
    flex: 1,
    minWidth: '30%',
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
  },
  durationButtonActive: {
    borderColor: Theme.colors.accent,
    backgroundColor: Theme.colors.accentSoft,
  },
  durationText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textSecondary,
  },
  durationTextActive: {
    color: Theme.colors.accent,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Theme.spacing.xxxl,
  },
  circleGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.large,
  },
  startButton: {
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    marginBottom: Theme.spacing.xl,
    ...Theme.shadow.medium,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  startButtonText: {
    ...Theme.typography.h3,
    color: Theme.colors.textInverse,
  },
  benefitsContainer: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    ...Theme.shadow.subtle,
  },
  benefitsTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  benefitText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
  activeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xxxl,
  },
  breathingCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  breathingGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 125,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.large,
  },
  progressRing: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 4,
    borderColor: Theme.colors.accentSoft,
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 135,
    borderWidth: 4,
    borderColor: Theme.colors.accent,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timerContainer: {
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xxxl,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: -2,
  },
  totalDurationText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    fontSize: 18,
  },
  breathText: {
    ...Theme.typography.h3,
    color: Theme.colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    gap: Theme.spacing.xl,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.medium,
  },
});
