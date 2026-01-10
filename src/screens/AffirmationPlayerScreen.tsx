import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  StatusBar,
  Dimensions,
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
import { Theme } from '../utils/theme';
import { AudioPlayer, AFFIRMATION_AUDIO, AffirmationAudioId, getDefaultBackgroundMusic } from '../utils/audioPlayer';
import { AffirmationPlayerScreenProps } from '../types/navigation';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { trackEvent } from '../utils/analytics';
import { useTabBarInset } from '../hooks/useTabBarInset';

const { width } = Dimensions.get('window');

// --- CONSTANTS ---
const INHALE_COLORS = ['#FFDAB9', '#FFE4B5', '#FFF0E0'] as const; // Soft Peach + Warm Yellow
const EXHALE_COLORS = ['#E6E6FA', '#B0E0E6', '#F0F8FF'] as const; // Lavender + Pale Sky Blue

const BREATH_DURATION = 8000; // 4s in, 4s out

export default function AffirmationPlayerScreen({ route, navigation }: AffirmationPlayerScreenProps) {
  useScreenTracking('AffirmationPlayer', { session_id: route.params?.session?.id });
  const session = route.params?.session;
  const { updateGuidedSessions, getTodayProgress, addGlowPoints } = useApp();
  const { showSuccess, showPoints } = useToast();
  const category = AFFIRMATION_CATEGORIES.find(c => c.id === session?.categoryId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const tabBarInset = useTabBarInset();
  const audioPlayerRef = useRef<AudioPlayer>(new AudioPlayer());

  // Animation Refs
  const breathAnim = useRef(new Animated.Value(0)).current;
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const playPulse = useRef(new Animated.Value(1)).current;

  // --- AUDIO LOGIC ---

  useEffect(() => {
    if (!session) return;
    loadAudio();
    startBreathing();

    return () => {
      stopAudio();
      audioPlayerRef.current.unloadAudio();
    };
  }, []);

  // Stop audio when ensuring navigation away (double check)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => stopAudio());
    return unsubscribe;
  }, [navigation]);

  // Breathing Animation Loop
  const startBreathing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: BREATH_DURATION / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: BREATH_DURATION / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Play Button Pulse (when playing)
  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation;
    if (isPlaying) {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(playPulse, {
            toValue: 1.2,
            duration: 1500,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(playPulse, {
            toValue: 1,
            duration: 1500,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
    } else {
      playPulse.setValue(1);
    }
    return () => pulseLoop?.stop();
  }, [isPlaying]);

  const loadAudio = async () => {
    if (!session) return;
    try {
      const audioId = session.id as AffirmationAudioId;
      const audioSource = AFFIRMATION_AUDIO[audioId];
      if (audioSource) {
        await audioPlayerRef.current.loadAudio(audioSource, getDefaultBackgroundMusic());
        audioPlayerRef.current.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (status.isLoaded) {
            setDuration(status.durationMillis || 1);
            setPosition(status.positionMillis || 0);
            setIsPlaying(status.isPlaying);
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
      setIsPlaying(false);
      setPosition(0);
    } catch (error) { console.error(error); }
  };

  const handlePlayPause = async () => {
    lightHaptic();
    // Press animation
    Animated.sequence([
      Animated.timing(playButtonScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(playButtonScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    if (isPlaying) {
      await audioPlayerRef.current.pause();
    } else {
      await audioPlayerRef.current.play();
    }
  };

  const handleComplete = async () => {
    if (isCompleting) return;
    try {
      setIsCompleting(true);
      trackEvent('affirmation_session_completed', {
        session_id: session.id,
        duration_seconds: Math.floor(duration / 1000)
      });

      const todayProgress = getTodayProgress();
      const existingSessions = todayProgress.guidedSessions || [];
      const alreadyCompleted = existingSessions.some(s => s.id === session.id);

      if (alreadyCompleted) {
        showSuccess('Done', 'Session already completed today.');
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

      await updateGuidedSessions([...existingSessions, completedSession].slice(0, MAX_SESSIONS_PER_DAY));
      await addGlowPoints(POINTS.AFFIRMATION_SESSION, `Completed: ${session.title}`);

      showSuccess('Session Complete', 'You found a moment of peace.');
      successHaptic();
      navigation.goBack();
    } catch (error) {
      console.error(error);
    } finally {
      setIsCompleting(false);
    }
  };

  if (!session) return <View style={styles.container} />;

  // --- RENDER ---
  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 1000 / 60);
    const secs = Math.floor((ms / 1000) % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* BREATHING BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
        {/* Layer 1: Inhale (Bottom) */}
        <LinearGradient
          colors={INHALE_COLORS}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Layer 2: Exhale (Top, varying opacity) */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: breathAnim }]}>
          <LinearGradient
            colors={EXHALE_COLORS}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      </View>

      {/* HEADER (Minimal) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="chevron-down" size={32} color={Theme.colors.textPrimary} style={{ opacity: 0.6 }} />
        </TouchableOpacity>
      </View>

      {/* CENTER: PLAY BUTTON */}
      <View style={styles.centerContent}>
        <TouchableOpacity
          onPress={handlePlayPause}
          activeOpacity={1}
          style={styles.playTouchArea}
        >
          {/* Pulsing Ring (Only when playing) */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: playPulse }],
                opacity: isPlaying ? 0.3 : 0,
              },
            ]}
          />

          {/* Main Button */}
          <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
            <BlurView intensity={30} tint="light" style={styles.playButtonGlass}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={48}
                color={Theme.colors.textPrimary}
                style={{ marginLeft: isPlaying ? 0 : 4 }} // visual centering for play icon
              />
            </BlurView>
          </Animated.View>
        </TouchableOpacity>

        {/* Title (Subtle) */}
        <Text style={styles.titleText}>{session.title}</Text>
        <Text style={styles.categoryText}>{category?.name}</Text>
      </View>

      {/* BOTTOM: PROGRESS & COMPLETE */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(tabBarInset, 20) }]}>

        {/* Progress Bar */}
        <View style={styles.progressRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        {/* Mark as Complete (Floating) */}
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
          disabled={isCompleting}
        >
          <BlurView intensity={50} tint="default" style={styles.completeBlur}>
            {isCompleting ? (
              <Ionicons name="checkmark" size={24} color="#FFF" />
            ) : (
              <Text style={styles.completeText}>Mark as Complete</Text>
            )}
          </BlurView>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -60, // Compensate for header to visually center
  },
  playTouchArea: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  playButtonGlass: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  titleText: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    color: '#4A4A4A',
    marginBottom: 8,
    opacity: 0.9,
    textAlign: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    opacity: 0.8,
    fontVariant: ['tabular-nums'],
    width: 35,
    textAlign: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B8B8B', // Soft gray fill
    borderRadius: 1,
  },
  completeButton: {
    marginBottom: 10,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  completeBlur: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  completeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A4A4A',
    letterSpacing: 0.5,
  },
});
