/**
 * Variable Rewards System
 * 
 * Implements psychological hooks for engagement:
 * - Random point multipliers (slot machine psychology)
 * - Streak bonuses
 * - Daily spin rewards
 * - Mystery boxes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const DAILY_SPIN_KEY = '@daily_spin_last';
const MYSTERY_BOX_KEY = '@mystery_box_inventory';

// Types
export interface RewardMultiplier {
  multiplier: number;
  label: string;
  emoji: string;
  color: string;
  isRare: boolean;
}

export interface DailySpinReward {
  type: 'points' | 'multiplier' | 'unlock' | 'badge';
  value: number;
  label: string;
  emoji: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface StreakBonus {
  streakLength: number;
  bonusPoints: number;
  message: string;
  emoji: string;
}

// Reward multipliers with weighted probabilities
const MULTIPLIER_POOL: Array<RewardMultiplier & { weight: number }> = [
  { multiplier: 1, label: 'Standard', emoji: '✨', color: '#8B7DD8', isRare: false, weight: 60 },
  { multiplier: 1.5, label: 'Nice!', emoji: '⭐', color: '#FFD700', isRare: false, weight: 20 },
  { multiplier: 2, label: 'Double!', emoji: '🌟', color: '#FF6B9D', isRare: false, weight: 12 },
  { multiplier: 3, label: 'TRIPLE!', emoji: '🔥', color: '#FF4444', isRare: true, weight: 5 },
  { multiplier: 5, label: 'JACKPOT!', emoji: '💎', color: '#9D4EDD', isRare: true, weight: 2 },
  { multiplier: 10, label: 'LEGENDARY!', emoji: '👑', color: '#FFD700', isRare: true, weight: 1 },
];

// Daily spin rewards pool
const DAILY_SPIN_POOL: Array<DailySpinReward & { weight: number }> = [
  // Common (60% total)
  { type: 'points', value: 10, label: '+10 Glow', emoji: '✨', color: '#8B7DD8', rarity: 'common', weight: 25 },
  { type: 'points', value: 15, label: '+15 Glow', emoji: '✨', color: '#8B7DD8', rarity: 'common', weight: 20 },
  { type: 'points', value: 25, label: '+25 Glow', emoji: '⭐', color: '#FFD700', rarity: 'common', weight: 15 },
  
  // Uncommon (25% total)
  { type: 'points', value: 50, label: '+50 Glow', emoji: '🌟', color: '#FF6B9D', rarity: 'uncommon', weight: 12 },
  { type: 'multiplier', value: 2, label: '2x Next Reward', emoji: '🎯', color: '#4ECDC4', rarity: 'uncommon', weight: 8 },
  { type: 'points', value: 75, label: '+75 Glow', emoji: '💫', color: '#FF6B9D', rarity: 'uncommon', weight: 5 },
  
  // Rare (12% total)
  { type: 'points', value: 100, label: '+100 Glow', emoji: '🔥', color: '#FF4444', rarity: 'rare', weight: 6 },
  { type: 'multiplier', value: 3, label: '3x Next Reward', emoji: '🎲', color: '#9D4EDD', rarity: 'rare', weight: 4 },
  { type: 'badge', value: 1, label: 'Lucky Badge', emoji: '🍀', color: '#4CAF50', rarity: 'rare', weight: 2 },
  
  // Legendary (3% total)
  { type: 'points', value: 250, label: '+250 Glow', emoji: '💎', color: '#00BCD4', rarity: 'legendary', weight: 2 },
  { type: 'points', value: 500, label: 'JACKPOT!', emoji: '👑', color: '#FFD700', rarity: 'legendary', weight: 1 },
];

// Streak milestone bonuses
const STREAK_BONUSES: StreakBonus[] = [
  { streakLength: 3, bonusPoints: 25, message: 'Great start!', emoji: '🌱' },
  { streakLength: 7, bonusPoints: 75, message: 'Week warrior!', emoji: '🔥' },
  { streakLength: 14, bonusPoints: 150, message: 'Two weeks strong!', emoji: '💪' },
  { streakLength: 21, bonusPoints: 300, message: 'Habit formed!', emoji: '🧠' },
  { streakLength: 30, bonusPoints: 500, message: 'Monthly master!', emoji: '🏆' },
  { streakLength: 45, bonusPoints: 1000, message: '45 NOW CHAMPION!', emoji: '👑' },
  { streakLength: 60, bonusPoints: 1500, message: 'Unstoppable!', emoji: '⚡' },
  { streakLength: 90, bonusPoints: 2500, message: 'Quarter legend!', emoji: '💎' },
  { streakLength: 100, bonusPoints: 5000, message: 'CENTURION!', emoji: '🦁' },
];

/**
 * Weighted random selection
 */
function weightedRandom<T extends { weight: number }>(pool: T[]): T {
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of pool) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }
  
  return pool[pool.length - 1];
}

/**
 * Get a random point multiplier
 * Uses weighted probability for psychological engagement
 */
export function getRandomMultiplier(): RewardMultiplier {
  const selected = weightedRandom(MULTIPLIER_POOL);
  return {
    multiplier: selected.multiplier,
    label: selected.label,
    emoji: selected.emoji,
    color: selected.color,
    isRare: selected.isRare,
  };
}

/**
 * Calculate points with potential multiplier
 */
export function calculateRewardPoints(
  basePoints: number,
  applyMultiplier: boolean = true
): { points: number; multiplier: RewardMultiplier | null } {
  if (!applyMultiplier) {
    return { points: basePoints, multiplier: null };
  }
  
  const multiplier = getRandomMultiplier();
  const points = Math.round(basePoints * multiplier.multiplier);
  
  return { points, multiplier };
}

/**
 * Check if user can spin today
 */
export async function canSpinToday(): Promise<boolean> {
  try {
    const lastSpin = await AsyncStorage.getItem(DAILY_SPIN_KEY);
    if (!lastSpin) return true;
    
    const lastSpinDate = new Date(lastSpin);
    const today = new Date();
    
    // Check if it's a new day
    return (
      lastSpinDate.getFullYear() !== today.getFullYear() ||
      lastSpinDate.getMonth() !== today.getMonth() ||
      lastSpinDate.getDate() !== today.getDate()
    );
  } catch (error) {
    console.error('Error checking spin status:', error);
    return false;
  }
}

/**
 * Perform daily spin and get reward
 */
export async function performDailySpin(): Promise<DailySpinReward | null> {
  try {
    const canSpin = await canSpinToday();
    if (!canSpin) {
      return null;
    }
    
    // Record the spin
    await AsyncStorage.setItem(DAILY_SPIN_KEY, new Date().toISOString());
    
    // Get random reward
    const selected = weightedRandom(DAILY_SPIN_POOL);
    return {
      type: selected.type,
      value: selected.value,
      label: selected.label,
      emoji: selected.emoji,
      color: selected.color,
      rarity: selected.rarity,
    };
  } catch (error) {
    console.error('Error performing spin:', error);
    return null;
  }
}

/**
 * Get time until next spin is available
 */
export async function getTimeUntilNextSpin(): Promise<{ hours: number; minutes: number } | null> {
  try {
    const canSpin = await canSpinToday();
    if (canSpin) return null;
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  } catch (error) {
    console.error('Error calculating next spin time:', error);
    return null;
  }
}

/**
 * Check for streak milestone bonus
 */
export function getStreakBonus(currentStreak: number, previousStreak: number): StreakBonus | null {
  // Find any milestone crossed between previous and current streak
  for (const bonus of STREAK_BONUSES) {
    if (currentStreak >= bonus.streakLength && previousStreak < bonus.streakLength) {
      return bonus;
    }
  }
  return null;
}

/**
 * Get the next streak milestone
 */
export function getNextStreakMilestone(currentStreak: number): StreakBonus | null {
  for (const bonus of STREAK_BONUSES) {
    if (currentStreak < bonus.streakLength) {
      return bonus;
    }
  }
  return null;
}

/**
 * Get days until next milestone
 */
export function getDaysUntilMilestone(currentStreak: number): number | null {
  const nextMilestone = getNextStreakMilestone(currentStreak);
  if (!nextMilestone) return null;
  return nextMilestone.streakLength - currentStreak;
}

/**
 * Get rarity color for UI
 */
export function getRarityColor(rarity: DailySpinReward['rarity']): string {
  switch (rarity) {
    case 'common': return '#8B7DD8';
    case 'uncommon': return '#4CAF50';
    case 'rare': return '#FF6B9D';
    case 'legendary': return '#FFD700';
    default: return '#8B7DD8';
  }
}

/**
 * Get rarity glow effect
 */
export function getRarityGlow(rarity: DailySpinReward['rarity']): string {
  switch (rarity) {
    case 'common': return 'rgba(139, 125, 216, 0.3)';
    case 'uncommon': return 'rgba(76, 175, 80, 0.4)';
    case 'rare': return 'rgba(255, 107, 157, 0.5)';
    case 'legendary': return 'rgba(255, 215, 0, 0.6)';
    default: return 'rgba(139, 125, 216, 0.3)';
  }
}


