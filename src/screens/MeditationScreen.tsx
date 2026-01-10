import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AVPlaybackStatus } from 'expo-av';
import { Screen } from '../components/layout/Screen';
import { Theme } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { AudioPlayer, MEDITATION_AUDIO, MeditationAudioId, getDefaultBackgroundMusic } from '../utils/audioPlayer';
import { MEDITATION_SESSIONS } from '../data/meditations';
import { MeditationScreenProps } from '../types/navigation';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { trackEvent } from '../utils/analytics';
import { useTabBarInset } from '../hooks/useTabBarInset';
import { tokens, fonts } from '../theme/tokens';

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
};

const { width, height } = Dimensions.get('window');

// --- CONSTANTS ---
// Calm, deep gradients for meditation (Deep Indigo / Twilight / Soft Purple)
const INHALE_COLORS = ['#4A00E0', '#8E2DE2', '#C471ED'] as const; // Deep Purple -> Violet
const EXHALE_COLORS = ['#8A2387', '#E94057', '#F27121'] as const; // Sunset Vibes (or stick to cool tones?)
// Let's use a cooler, more "night/calm" palette for meditation to differentiate from Affirmations
const MEDITATION_INHALE = ['#240b36', '#c31432'] as const; // Deep Red/Purple
const MEDITATION_EXHALE = ['#0f0c29', '#302b63', '#24243e'] as const; // Deep Blue/Night
// Actually, let's stick to the user's requested "Calm" aesthetic - Soft Blues/Cyans/Purples
const CALM_INHALE = ['#a18cd1', '#fbc2eb'] as const; // Soft Purple/Pink
const CALM_EXHALE = ['#a6c0fe', '#f68084'] as const; // Soft Blue/Salmon

const BREATH_DURATION = 10000; // Slower breath for meditation (5s in, 5s out)

export default function MeditationScreen({ navigation, route }: MeditationScreenProps) {
  const { completeMeditation, addGlowPoints } = useApp();
  const tabBarInset = useTabBarInset();
  useScreenTracking('Meditation');

  // --- STATE ---
  const [activeSessionId, setActiveSessionId] = useState<MeditationAudioId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(1);
  const [position, setPosition] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // --- REFS ---
  const audioPlayerRef = useRef(new AudioPlayer());
  const breathAnim = useRef(new Animated.Value(0)).current;
  const playPulse = useRef(new Animated.Value(1)).current;
  const playButtonScale = useRef(new Animated.Value(1)).current;

  // --- INIT ---
  // Determine time of day for default selection
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 18 ? 'midday' : 'sleep';

  // Helper to get sessions by category
  const getSessions = (category: 'morning' | 'midday' | 'sleep') =>
    MEDITATION_SESSIONS.filter(s => s.type === category);

  // Initialize with passed param or null (selection mode)
  useEffect(() => {
    if (route.params?.meditation?.id) {
      // If passed a specific ID, verify it exists and set it
      const exists = MEDITATION_SESSIONS.find(s => s.id === route.params!.meditation!.id);
      if (exists) {
        // Auto-start playback
        loadAndPlay(exists.id as MeditationAudioId);
      }
    }
  }, [route.params]);

  // --- AUDIO LOGIC ---
  const loadAndPlay = async (sessionId: MeditationAudioId) => {
    try {
      const audioSource = MEDITATION_AUDIO[sessionId];
      if (!audioSource) {
        Alert.alert("Content Unavailable", "This session is currently being updated. Please try again later.");
        return;
      }

      // Stop any current
      await audioPlayerRef.current.stop();

      console.log('[Meditation] Loading new audio...');
      // Load new
      await audioPlayerRef.current.loadAudio(audioSource, getDefaultBackgroundMusic());

      // Set listener
      audioPlayerRef.current.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
          setDuration(status.durationMillis || 1);
          setPosition(status.positionMillis || 0);
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish && !status.isLooping) {
            handlePlaybackComplete(sessionId);
          }
        }
      });

      console.log('[Meditation] Playing...');
      // Play
      await audioPlayerRef.current.play();
      setIsPlaying(true);
      setActiveSessionId(sessionId);
    } catch (err) {
      console.error("Failed to load meditation:", err);
      Alert.alert("Error", "Could not load this meditation session. Check console.");
    }
  };

  const handleTogglePlay = async () => {
    // Pulse animation
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

  const handleStop = async () => {
    await audioPlayerRef.current.stop();
    setActiveSessionId(null);
    setIsPlaying(false);
    setPosition(0);
  };

  const handlePlaybackComplete = async (sessionId: string) => {
    setIsPlaying(false);
    setIsCompleted(true);
    await completeMeditation();
    await addGlowPoints(30, 'Completed meditation');
    trackEvent('meditation_completed', { id: sessionId });
  };

  const handleMarkComplete = async () => {
    if (activeSessionId) {
      handlePlaybackComplete(activeSessionId);
      Alert.alert("Namaste", "Session marked as complete.");
      navigation.goBack();
    }
  };

  // Cleanup
  useEffect(() => {
    const player = audioPlayerRef.current;
    return () => {
      player.stop().then(() => player.unloadAudio());
    };
  }, []);

  // --- ANIMATIONS ---
  // 1. Breathing Background Loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: BREATH_DURATION / 2,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: BREATH_DURATION / 2,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // 2. Play Button Pulse
  useEffect(() => {
    if (isPlaying) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(playPulse, {
            toValue: 1.2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(playPulse, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      playPulse.setValue(1);
    }
  }, [isPlaying]);

  // --- UI HELPERS ---
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeSessionData = activeSessionId
    ? MEDITATION_SESSIONS.find(s => s.id === activeSessionId)
    : null;

  // --- RENDER ---
  return (
    <View style={styles.container}>
      {/* 1. LAYERED BREATHING BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={CALM_INHALE} // Inhale
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: breathAnim }]}>
          <LinearGradient
            colors={CALM_EXHALE} // Exhale
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      </View>

      {/* 2. HEADER */}
      <View style={[styles.header, { paddingTop: tokens.spacing.xl + 20 }]}>
        <TouchableOpacity
          onPress={() => {
            if (activeSessionId) {
              handleStop(); // If playing, stop and go back to list
            } else {
              navigation.goBack(); // If listing, go back to App
            }
          }}
          style={styles.backButton}
        >
          <BlurView intensity={20} tint="light" style={styles.backButtonBlur}>
            <Ionicons name={activeSessionId ? "chevron-down" : "chevron-back"} size={24} color="#FFF" />
          </BlurView>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {activeSessionData ? "Now Playing" : "Meditation"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 3. CONTENT AREA */}
      {!activeSessionId ? (
        // --- SELECTION MODE ---
        <ScrollView
          contentContainerStyle={[
            styles.selectionContent,
            { paddingBottom: tabBarInset + 100 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingTitle}>Find your peace.</Text>
            <Text style={styles.greetingSubtitle}>Choose a session to begin.</Text>
          </View>

          {/* Morning Section */}
          <Text style={styles.sectionHeader}>Morning Clarity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {getSessions('morning').map((session) => (
              <TouchableOpacity
                key={session.id}
                onPress={() => loadAndPlay(session.id as MeditationAudioId)}
                activeOpacity={0.9}
              >
                <BlurView intensity={30} tint="light" style={styles.sessionCard} pointerEvents="none">
                  <Ionicons name={session.icon as any} size={32} color="#FFF" style={{ marginBottom: 12 }} />
                  <Text style={styles.cardTitle}>{session.title}</Text>
                  <Text style={styles.cardSubtitle}>{formatDuration(session.duration)}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Midday Section */}
          <Text style={styles.sectionHeader}>Midday Reset</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {getSessions('midday').map((session) => (
              <TouchableOpacity
                key={session.id}
                onPress={() => loadAndPlay(session.id as MeditationAudioId)}
                activeOpacity={0.9}
              >
                <BlurView intensity={30} tint="light" style={styles.sessionCard} pointerEvents="none">
                  <Ionicons name="sunny" size={32} color="#FFF" style={{ marginBottom: 12 }} />
                  <Text style={styles.cardTitle}>{session.title}</Text>
                  <Text style={styles.cardSubtitle}>{formatDuration(session.duration)}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sleep Section */}
          <Text style={styles.sectionHeader}>Deep Sleep</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {getSessions('sleep').map((session) => (
              <TouchableOpacity
                key={session.id}
                onPress={() => loadAndPlay(session.id as MeditationAudioId)}
                activeOpacity={0.9}
              >
                <BlurView intensity={30} tint="light" style={styles.sessionCard} pointerEvents="none">
                  <Ionicons name="moon" size={32} color="#FFF" style={{ marginBottom: 12 }} />
                  <Text style={styles.cardTitle}>{session.title}</Text>
                  <Text style={styles.cardSubtitle}>{formatDuration(session.duration)}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </ScrollView>
      ) : (
        // --- PLAYER MODE ---
        <View style={styles.playerContainer}>
          {/* Visual Anchor - Breathing Circle */}
          <View style={styles.visualContainer}>
            <Animated.View style={[
              styles.breathingCircle,
              {
                transform: [
                  { scale: 1 }
                ],
                opacity: breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] })
              }
            ]}
            />
            <BlurView intensity={30} tint="light" style={styles.iconContainer}>
              <Ionicons name={activeSessionData?.icon as any || "leaf"} size={64} color="#FFF" />
            </BlurView>

            <Text style={styles.playerTitle}>{activeSessionData?.title}</Text>
            <Text style={styles.playerSubtitle}>{activeSessionData?.subtitle}</Text>
          </View>

          {/* Controls */}
          <View style={[styles.controlsContainer, { paddingBottom: tabBarInset + 40 }]}>
            {/* Progress */}
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${(position / duration) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            {/* Play/Pause */}
            <TouchableOpacity onPress={handleTogglePlay} activeOpacity={0.8}>
              <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
                <BlurView intensity={40} tint="light" style={styles.playButton}>
                  {isPlaying && (
                    <Animated.View style={[styles.playButtonPulse, { transform: [{ scale: playPulse }] }]} />
                  )}
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={48}
                    color="#FFF"
                    style={{ marginLeft: isPlaying ? 0 : 4 }} // visual centering
                  />
                </BlurView>
              </Animated.View>
            </TouchableOpacity>

            {/* Mark Complete */}
            <TouchableOpacity
              onPress={handleMarkComplete}
              style={styles.checkButton}
            >
              <BlurView intensity={20} tint="light" style={styles.checkButtonBlur}>
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.checkButtonText}>Mark Complete</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    opacity: 0.9,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },

  // Selection Styles
  selectionContent: {
    paddingTop: 20,
    paddingHorizontal: 0,
  },
  greetingContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 10,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    fontFamily: fonts.headingBold,
  },
  greetingSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',

  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 24,
    marginBottom: 16,
    marginTop: 8,
    opacity: 0.9,
  },
  horizontalScroll: {
    paddingLeft: 24,
    paddingRight: 10,
    marginBottom: 32,
  },
  sessionCard: {
    width: 160,
    height: 140,
    borderRadius: 24,
    padding: 20,
    marginRight: 16,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },

  // Player Styles
  playerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  visualContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  breathingCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  playerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    fontFamily: fonts.headingBold,
    textAlign: 'center',
  },
  playerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',

  },
  controlsContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    width: 35,
    textAlign: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginHorizontal: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginBottom: 32,
  },
  playButtonPulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  checkButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  checkButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  checkButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});



