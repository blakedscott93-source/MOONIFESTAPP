import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { Theme } from '../utils/theme';
import { useApp } from '../context/AppContext';

const MEDITATION_DURATIONS = [
  { label: '5 min', value: 5 * 60 },
  { label: '10 min', value: 10 * 60 },
  { label: '15 min', value: 15 * 60 },
  { label: '20 min', value: 20 * 60 },
];

export default function MeditationScreen({ navigation }: any) {
  const { completeMeditation, addGlowPoints } = useApp();
  const [selectedDuration, setSelectedDuration] = useState(MEDITATION_DURATIONS[1].value);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(selectedDuration);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying && !isPaused) {
      startBreathingAnimation();
      startPulseAnimation();
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      breathAnimation.stopAnimation();
      pulseAnimation.stopAnimation();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, isPaused]);

  useEffect(() => {
    if (!isPlaying) {
      setTimeRemaining(selectedDuration);
    }
  }, [selectedDuration]);

  const startBreathingAnimation = () => {
    Animated.loop(
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
    ).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
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
    ).start();
  };

  const handleComplete = async () => {
    setIsPlaying(false);
    setIsPaused(false);
    setTimeRemaining(selectedDuration);
    await completeMeditation();
    await addGlowPoints(30, 'Completed meditation session');
    // Show completion message
    navigation.goBack();
  };

  const handleStart = () => {
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setTimeRemaining(selectedDuration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - timeRemaining / selectedDuration;
  const breathScale = breathAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const getBreathText = () => {
    const cyclePosition = (timeRemaining % 8) / 8;
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
      />

      <View style={styles.content}>
        {!isPlaying ? (
          <>
            {/* Duration Selection */}
            <View style={styles.durationContainer}>
              <Text style={styles.sectionTitle}>Select Duration</Text>
              <View style={styles.durationGrid}>
                {MEDITATION_DURATIONS.map((duration) => (
                  <TouchableOpacity
                    key={duration.value}
                    style={[
                      styles.durationButton,
                      selectedDuration === duration.value && styles.durationButtonActive,
                    ]}
                    onPress={() => setSelectedDuration(duration.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.durationText,
                        selectedDuration === duration.value && styles.durationTextActive,
                      ]}
                    >
                      {duration.label}
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
                <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
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
    marginBottom: Theme.spacing.md,
  },
  durationGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  durationButton: {
    flex: 1,
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
