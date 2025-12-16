import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

const QUOTES = [
  "Your thoughts create your reality. Choose them wisely.",
  "What you seek is seeking you.",
  "The universe is always conspiring in your favor.",
  "You are the creator of your own destiny.",
  "Believe in the magic within you.",
  "Every moment is a fresh beginning.",
  "Your vibe attracts your tribe.",
  "Dream it. Believe it. Achieve it.",
  "Energy flows where attention goes.",
  "You are worthy of all your desires.",
];

export default function TodayScreen({ navigation }: any) {
  const { getTodayProgress, appState } = useApp();
  const todayProgress = getTodayProgress();
  const [dailyQuote, setDailyQuote] = useState('');

  useEffect(() => {
    // Set a random quote for the day
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setDailyQuote(randomQuote);
  }, []);

  const mustDoTasks = todayProgress.tasks.filter((t) => t.isMustDo);
  const completedMustDos = mustDoTasks.filter((t) => t.completed).length;
  const affirmationsComplete =
    todayProgress.affirmations.morning &&
    todayProgress.affirmations.afternoon &&
    todayProgress.affirmations.evening;

  const totalTasksCompleted =
    completedMustDos +
    (affirmationsComplete ? 1 : 0) +
    (todayProgress.meditationCompleted ? 1 : 0) +
    (todayProgress.gratitudeEntry.trim() ? 1 : 0);

  const totalTasks = 6; // 3 must-dos + affirmations + meditation + journal
  const progressPercentage = (totalTasksCompleted / totalTasks) * 100;

  const daysRemaining = 45 - appState.totalDays;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
        <Text style={styles.title}>Moonifest</Text>
        <Text style={styles.subtitle}>Transform Your Reality</Text>
      </View>

      {/* Hero Card - Main Focus */}
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text style={styles.heroLabel}>Your Journey</Text>
          <Text style={styles.heroNumber}>Day {appState.totalDays}</Text>
          <Text style={styles.heroSubtext}>
            {daysRemaining > 0 ? `${daysRemaining} days to freedom` : 'Beyond the challenge!'}
          </Text>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name="rocket-outline" size={60} color="#FFD700" />
        </View>
      </View>

      {/* Today's Completion Circle */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Today's Focus</Text>
        <View style={styles.circleProgressContainer}>
          <View style={styles.circleProgress}>
            <Text style={styles.circlePercentage}>{Math.round(progressPercentage)}%</Text>
            <Text style={styles.circleLabel}>Complete</Text>
          </View>
        </View>
        <View style={styles.progressStats}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.statText}>{totalTasksCompleted} Done</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="ellipse-outline" size={20} color="#666" />
            <Text style={styles.statText}>{totalTasks - totalTasksCompleted} Remaining</Text>
          </View>
        </View>
      </View>

      {/* Streak Tracker */}
      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Ionicons name="flame" size={32} color="#FF6B35" />
          <Text style={styles.streakTitle}>Your Streak</Text>
        </View>
        <View style={styles.streakStats}>
          <View style={styles.streakStat}>
            <Text style={styles.streakNumber}>{appState.currentStreak}</Text>
            <Text style={styles.streakLabel}>Days</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakStat}>
            <Text style={styles.streakNumber}>{appState.totalDays}</Text>
            <Text style={styles.streakLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Quick Access Buttons */}
      <View style={styles.quickAccess}>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => navigation.navigate('45 NOW')}
        >
          <Ionicons name="list-circle" size={32} color="#FFD700" />
          <Text style={styles.quickButtonText}>Daily Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => navigation.navigate('Journal')}
        >
          <Ionicons name="book" size={32} color="#4ECDC4" />
          <Text style={styles.quickButtonText}>Journal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => navigation.navigate('Progress')}
        >
          <Ionicons name="stats-chart" size={32} color="#8B7DD8" />
          <Text style={styles.quickButtonText}>Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Intention/Quote */}
      <View style={styles.intentionCard}>
        <View style={styles.intentionHeader}>
          <Ionicons name="sparkles" size={20} color="#FFD700" />
          <Text style={styles.intentionTitle}>Today's Intention</Text>
        </View>
        <Text style={styles.intentionText}>{dailyQuote}</Text>
      </View>

      {/* Energy Check-in */}
      <View style={styles.energyCard}>
        <Text style={styles.energyTitle}>How are you feeling?</Text>
        <View style={styles.energyOptions}>
          <TouchableOpacity style={styles.energyButton}>
            <Text style={styles.energyEmoji}>🔥</Text>
            <Text style={styles.energyLabel}>Energized</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.energyButton}>
            <Text style={styles.energyEmoji}>😊</Text>
            <Text style={styles.energyLabel}>Good</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.energyButton}>
            <Text style={styles.energyEmoji}>😌</Text>
            <Text style={styles.energyLabel}>Calm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.energyButton}>
            <Text style={styles.energyEmoji}>😴</Text>
            <Text style={styles.energyLabel}>Tired</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Affirmation of the Day */}
      <View style={styles.affirmationCard}>
        <Text style={styles.affirmationTitle}>Repeat After Me:</Text>
        <Text style={styles.affirmationText}>
          "I am worthy of abundance. I attract success effortlessly. My dreams are becoming my reality."
        </Text>
      </View>
    </ScrollView>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0B1F',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#8B7DD8',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#AAA',
    fontStyle: 'italic',
  },
  heroCard: {
    margin: 20,
    marginTop: 10,
    padding: 30,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#8B7DD8',
  },
  heroContent: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  heroNumber: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  heroSubtext: {
    fontSize: 14,
    color: '#8B7DD8',
  },
  heroIcon: {
    marginLeft: 20,
  },
  progressCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#1F1B2F',
    borderRadius: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  circleProgressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  circleProgress: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: '#8B7DD8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0B1F',
  },
  circlePercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  circleLabel: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 5,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    color: '#AAA',
    fontSize: 14,
  },
  streakCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#1F1B2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakStat: {
    flex: 1,
    alignItems: 'center',
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  streakLabel: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 5,
  },
  quickAccess: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#1F1B2F',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  intentionCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1F1B2F',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  intentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  intentionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  intentionText: {
    fontSize: 15,
    color: '#FFD700',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  energyCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#1F1B2F',
    borderRadius: 16,
  },
  energyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  energyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  energyButton: {
    alignItems: 'center',
    padding: 10,
  },
  energyEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  energyLabel: {
    fontSize: 11,
    color: '#AAA',
  },
  affirmationCard: {
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#1F1B2F',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#8B7DD8',
  },
  affirmationTitle: {
    fontSize: 14,
    color: '#8B7DD8',
    marginBottom: 10,
    textAlign: 'center',
  },
  affirmationText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
});
