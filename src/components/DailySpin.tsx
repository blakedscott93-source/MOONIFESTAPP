/**
 * Daily Spin Wheel Component
 * 
 * Slot-machine style daily reward that creates anticipation and engagement
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import {
  canSpinToday,
  performDailySpin,
  getTimeUntilNextSpin,
  DailySpinReward,
  getRarityColor,
  getRarityGlow,
} from '../utils/rewards';
import { celebrationHaptic, spinningHaptic, successHaptic } from '../utils/haptics';
import { BurstConfetti } from './Confetti';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DailySpinProps {
  visible: boolean;
  onClose: () => void;
  onRewardClaimed: (reward: DailySpinReward) => void;
}

export const DailySpin: React.FC<DailySpinProps> = ({
  visible,
  onClose,
  onRewardClaimed,
}) => {
  const [canSpin, setCanSpin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<DailySpinReward | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeUntilSpin, setTimeUntilSpin] = useState<{ hours: number; minutes: number } | null>(null);

  // Animations
  const spinRotation = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.5)).current;
  const rewardScale = useRef(new Animated.Value(0)).current;
  const rewardOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      checkSpinStatus();
      startGlowAnimation();
    }
  }, [visible]);

  const checkSpinStatus = async () => {
    const available = await canSpinToday();
    setCanSpin(available);

    if (!available) {
      const time = await getTimeUntilNextSpin();
      setTimeUntilSpin(time);
    }
  };

  const startGlowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.5,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Start spinning animation
    const spinDuration = 3000;
    const rotations = 5 + Math.random() * 3; // Random number of spins

    // Haptic feedback during spin
    spinningHaptic(15);

    Animated.timing(spinRotation, {
      toValue: rotations,
      duration: spinDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      // Get the reward
      const spinReward = await performDailySpin();
      
      if (spinReward) {
        setReward(spinReward);
        setCanSpin(false);
        
        // Show reward with animation
        Animated.parallel([
          Animated.spring(rewardScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(rewardOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        // Haptic and confetti for rare+ rewards
        if (spinReward.rarity === 'rare' || spinReward.rarity === 'legendary') {
          celebrationHaptic();
          setShowConfetti(true);
        } else {
          successHaptic();
        }
      }

      setIsSpinning(false);
    });
  };

  const handleClaimReward = () => {
    if (reward) {
      onRewardClaimed(reward);
    }
    handleClose();
  };

  const handleClose = () => {
    // Reset animations
    spinRotation.setValue(0);
    rewardScale.setValue(0);
    rewardOpacity.setValue(0);
    setReward(null);
    setShowConfetti(false);
    onClose();
  };

  const spinRotationDeg = spinRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Daily Spin</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Spin Wheel Area */}
          <View style={styles.wheelContainer}>
            {/* Glow effect */}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  opacity: glowPulse,
                  transform: [{ scale: glowPulse.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [1, 1.1],
                  })}],
                },
              ]}
            />

            {/* Main wheel */}
            <Animated.View
              style={[
                styles.wheel,
                { transform: [{ rotate: spinRotationDeg }] },
              ]}
            >
              <LinearGradient
                colors={['#FFD700', '#FF6B9D', '#C77DFF', '#4ECDC4', '#FFD700']}
                style={styles.wheelGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.wheelCenter}>
                  <Ionicons name="gift" size={48} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Pointer */}
            <View style={styles.pointer}>
              <View style={styles.pointerTriangle} />
            </View>
          </View>

          {/* Reward Display */}
          {reward && (
            <Animated.View
              style={[
                styles.rewardContainer,
                {
                  transform: [{ scale: rewardScale }],
                  opacity: rewardOpacity,
                },
              ]}
            >
              <View
                style={[
                  styles.rewardCard,
                  { 
                    borderColor: getRarityColor(reward.rarity),
                    shadowColor: getRarityColor(reward.rarity),
                  },
                ]}
              >
                <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
                <Text style={[styles.rewardLabel, { color: getRarityColor(reward.rarity) }]}>
                  {reward.label}
                </Text>
                <Text style={styles.rewardRarity}>
                  {reward.rarity.toUpperCase()}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Spin Button or Claim Button */}
          {!reward ? (
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.spinButton,
                  (!canSpin || isSpinning) && styles.spinButtonDisabled,
                ]}
                onPress={handleSpin}
                disabled={!canSpin || isSpinning}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={canSpin ? ['#FFD700', '#FFA500'] : ['#888', '#666']}
                  style={styles.spinButtonGradient}
                >
                  {isSpinning ? (
                    <Text style={styles.spinButtonText}>Spinning...</Text>
                  ) : canSpin ? (
                    <>
                      <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                      <Text style={styles.spinButtonText}>SPIN!</Text>
                    </>
                  ) : (
                    <Text style={styles.spinButtonText}>
                      {timeUntilSpin
                        ? `Next spin in ${timeUntilSpin.hours}h ${timeUntilSpin.minutes}m`
                        : 'Come back tomorrow!'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={handleClaimReward}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[getRarityColor(reward.rarity), Theme.colors.accentDark]}
                style={styles.claimButtonGradient}
              >
                <Text style={styles.claimButtonText}>CLAIM REWARD</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Info text */}
          <Text style={styles.infoText}>
            Spin once daily for bonus rewards!
          </Text>
        </View>

        {/* Confetti */}
        <BurstConfetti
          active={showConfetti}
          origin={{ x: SCREEN_WIDTH / 2, y: 300 }}
          pieceCount={40}
          onComplete={() => setShowConfetti(false)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
  },
  closeButton: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xl,
  },
  glowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: Theme.colors.accent,
  },
  wheel: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    ...Theme.shadow.large,
  },
  wheelGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  pointer: {
    position: 'absolute',
    top: -10,
    alignItems: 'center',
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Theme.colors.accent,
  },
  rewardContainer: {
    marginBottom: Theme.spacing.xl,
  },
  rewardCard: {
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  rewardEmoji: {
    fontSize: 64,
    marginBottom: Theme.spacing.md,
  },
  rewardLabel: {
    ...Theme.typography.h2,
    marginBottom: Theme.spacing.xs,
  },
  rewardRarity: {
    ...Theme.typography.chip,
    color: Theme.colors.textSecondary,
    letterSpacing: 2,
  },
  spinButton: {
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    marginBottom: Theme.spacing.lg,
    ...Theme.shadow.large,
  },
  spinButtonDisabled: {
    opacity: 0.7,
  },
  spinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xxxl,
    gap: Theme.spacing.sm,
  },
  spinButtonText: {
    ...Theme.typography.h3,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  claimButton: {
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    marginBottom: Theme.spacing.lg,
    ...Theme.shadow.large,
  },
  claimButtonGradient: {
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xxxl,
    alignItems: 'center',
  },
  claimButtonText: {
    ...Theme.typography.h3,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  infoText: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    textAlign: 'center',
  },
});

// Small button component to trigger the spin modal
interface DailySpinButtonProps {
  onPress: () => void;
  hasSpun?: boolean;
}

export const DailySpinButton: React.FC<DailySpinButtonProps> = ({
  onPress,
  hasSpun = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!hasSpun) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [hasSpun]);

  return (
    <Animated.View 
      style={[
        { transform: [{ scale: pulseAnim }] },
        styles2.container,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles2.button,
          hasSpun && styles2.buttonSpun,
        ]}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={hasSpun ? ['#888', '#666'] : ['#FFD700', '#FF6B9D']}
          style={styles2.buttonGradient}
        >
          <Ionicons
            name="gift"
            size={20}
            color="#FFFFFF"
          />
        </LinearGradient>
      </TouchableOpacity>
      {!hasSpun && (
        <View style={styles2.badge}>
          <Text style={styles2.badgeText}>!</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles2 = StyleSheet.create({
  container: {
    position: 'relative',
    width: 50,
    height: 50,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    ...Theme.shadow.medium,
  },
  buttonSpun: {
    opacity: 0.7,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    zIndex: 10,
    ...Theme.shadow.medium,
    elevation: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});


