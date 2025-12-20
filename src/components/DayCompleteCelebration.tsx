/**
 * Day Complete Celebration Component
 * 
 * A stunning celebration animation shown when user completes all 45 NOW tasks
 * Features: confetti, particle effects, pulsing glow, animated text, and trophy
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { celebrationHaptic } from '../utils/haptics';
import { BurstConfetti } from './Confetti';
import { CHALLENGE_DURATION_DAYS } from '../utils/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DayCompleteCelebrationProps {
  visible: boolean;
  onClose: () => void;
  dayNumber: number;
  streakCount: number;
  glowPointsEarned?: number;
}

// Animated star particle
const StarParticle: React.FC<{
  delay: number;
  startX: number;
  startY: number;
  size: number;
  color: string;
}> = ({ delay, startX, startY, size, color }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.delay(1200),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [startY, startY - 150 - Math.random() * 100],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [startX, startX + (Math.random() - 0.5) * 100],
  });

  const scale = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.2, 0.8],
  });

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${180 + Math.random() * 180}deg`],
  });

  return (
    <Animated.View
      style={[
        styles.starParticle,
        {
          transform: [{ translateX }, { translateY }, { scale }, { rotate }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Ionicons name="star" size={size} color={color} />
    </Animated.View>
  );
};

// Animated ring pulse
const RingPulse: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 2,
            duration: 1500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.ringPulse,
        {
          borderColor: color,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

export const DayCompleteCelebration: React.FC<DayCompleteCelebrationProps> = ({
  visible,
  onClose,
  dayNumber,
  streakCount,
  glowPointsEarned = 50,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Animation values
  const containerScale = useRef(new Animated.Value(0)).current;
  const trophyRotate = useRef(new Animated.Value(0)).current;
  const trophyScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsTranslateY = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      startCelebration();
    } else {
      resetAnimations();
    }
  }, [visible]);

  const startCelebration = async () => {
    // Haptic feedback
    celebrationHaptic();
    
    // Reset all values
    containerScale.setValue(0);
    trophyScale.setValue(0);
    trophyRotate.setValue(0);
    glowOpacity.setValue(0);
    textOpacity.setValue(0);
    textTranslateY.setValue(30);
    statsOpacity.setValue(0);
    statsTranslateY.setValue(20);
    buttonOpacity.setValue(0);
    buttonTranslateY.setValue(20);

    // Start confetti immediately
    setShowConfetti(true);

    // Staggered entrance animations
    Animated.sequence([
      // Container scales in
      Animated.spring(containerScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Trophy animation (delayed slightly)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(trophyScale, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(trophyRotate, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Start continuous trophy wiggle
      startTrophyWiggle();
    }, 200);

    // Text animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(textTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // Stats animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(statsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(statsTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 600);

    // Button animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);
  };

  const startTrophyWiggle = () => {
    const wiggle = Animated.loop(
      Animated.sequence([
        Animated.timing(trophyRotate, {
          toValue: 1.05,
          duration: 150,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(trophyRotate, {
          toValue: 0.95,
          duration: 150,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(trophyRotate, {
          toValue: 1,
          duration: 150,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ])
    );
    wiggle.start();
  };

  const resetAnimations = () => {
    setShowConfetti(false);
    containerScale.setValue(0);
    trophyScale.setValue(0);
  };

  const handleClose = () => {
    // Exit animation
    Animated.parallel([
      Animated.timing(containerScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const trophyRotateInterpolate = trophyRotate.interpolate({
    inputRange: [0, 0.95, 1, 1.05],
    outputRange: ['0deg', '-3deg', '0deg', '3deg'],
  });

  // Generate star particles
  const starParticles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    delay: i * 200,
    startX: (SCREEN_WIDTH / 2) - 50 + (Math.random() * 100),
    startY: SCREEN_HEIGHT * 0.35,
    size: 12 + Math.random() * 10,
    color: ['#FFD700', '#FF6B9D', '#C77DFF', '#4ECDC4'][i % 4],
  }));

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Confetti */}
        <BurstConfetti
          active={showConfetti}
          origin={{ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT * 0.3 }}
          pieceCount={60}
          onComplete={() => {}}
        />

        {/* Star Particles */}
        {visible && starParticles.map((star) => (
          <StarParticle key={star.id} {...star} />
        ))}

        <Animated.View
          style={[
            styles.container,
            { transform: [{ scale: containerScale }] },
          ]}
        >
          {/* Pulsing rings */}
          <View style={styles.ringsContainer}>
            <RingPulse delay={0} color="#FFD700" />
            <RingPulse delay={500} color="#C77DFF" />
            <RingPulse delay={1000} color="#FF6B9D" />
          </View>

          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowEffect,
              { opacity: glowOpacity },
            ]}
          />

          {/* Trophy */}
          <Animated.View
            style={[
              styles.trophyContainer,
              {
                transform: [
                  { scale: trophyScale },
                  { rotate: trophyRotateInterpolate },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF8C00']}
              style={styles.trophyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="trophy" size={64} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* Main Text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            <Text style={styles.congratsText}>🎉 DAY COMPLETE! 🎉</Text>
            <Text style={styles.subtitleText}>
              You've crushed it today!
            </Text>
            <Text style={styles.motivationText}>
              Every day you're becoming the person you're meant to be.
            </Text>
          </Animated.View>

          {/* Stats Cards */}
          <Animated.View
            style={[
              styles.statsContainer,
              {
                opacity: statsOpacity,
                transform: [{ translateY: statsTranslateY }],
              },
            ]}
          >
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color={Theme.colors.accent} />
              <Text style={styles.statValue}>Day {dayNumber}</Text>
              <Text style={styles.statLabel}>of {CHALLENGE_DURATION_DAYS}</Text>
            </View>

            <View style={[styles.statCard, styles.statCardHighlight]}>
              <Ionicons name="flame" size={24} color="#FF6B35" />
              <Text style={[styles.statValue, { color: '#FF6B35' }]}>{streakCount}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="sparkles" size={24} color={Theme.colors.gold} />
              <Text style={[styles.statValue, { color: Theme.colors.gold }]}>+{glowPointsEarned}</Text>
              <Text style={styles.statLabel}>Glow Points</Text>
            </View>
          </Animated.View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((dayNumber / CHALLENGE_DURATION_DAYS) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((dayNumber / CHALLENGE_DURATION_DAYS) * 100)}% to completing 45 NOW
            </Text>
          </View>

          {/* Continue Button */}
          <Animated.View
            style={{
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
              width: '100%',
            }}
          >
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#C77DFF', '#9D4EDD']}
                style={styles.continueButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.continueButtonText}>Keep Going! 💪</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH - Theme.spacing.xl * 2,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    ...Theme.shadow.large,
    overflow: 'visible',
  },
  ringsContainer: {
    position: 'absolute',
    top: -40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPulse: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
  },
  glowEffect: {
    position: 'absolute',
    top: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  trophyContainer: {
    marginTop: -20,
    marginBottom: Theme.spacing.xl,
    ...Theme.shadow.fab,
  },
  trophyGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.gold,
    letterSpacing: 1,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  subtitleText: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  motivationText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  statCardHighlight: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  statValue: {
    ...Theme.typography.h3,
    color: Theme.colors.accent,
  },
  statLabel: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
  },
  progressContainer: {
    width: '100%',
    marginBottom: Theme.spacing.xl,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.gold,
    borderRadius: 4,
  },
  progressText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  continueButton: {
    width: '100%',
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadow.medium,
  },
  continueButtonGradient: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    ...Theme.typography.h3,
    color: Theme.colors.textInverse,
    fontWeight: '700',
  },
  starParticle: {
    position: 'absolute',
  },
});

export default DayCompleteCelebration;

