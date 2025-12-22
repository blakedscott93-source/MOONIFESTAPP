import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function TasksScreen({ navigation }: any) {
  const { getTodayProgress } = useApp();
  const todayProgress = useMemo(() => getTodayProgress(), [getTodayProgress]);

  const mustDoTasks = todayProgress.tasks.filter((t) => t.isMustDo);
  const completedMustDos = mustDoTasks.filter((t) => t.completed).length;
  // TODO: Implement affirmations tracking when DayProgress is updated
  const affirmationsComplete = false; // Placeholder

  const getCurrentPeriod = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18) return 'evening';
    return 'morning';
  };

  const currentPeriod = getCurrentPeriod();
  const nextAffirmation = 'morning'; // Placeholder - will be determined by actual affirmation state

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>What's your focus today?</Text>
        <Text style={styles.title}>Your Tasks</Text>
      </View>

      {/* Quick Start Section */}
      <View style={styles.quickStartSection}>
        <Text style={styles.sectionTitle}>⚡ Start Here</Text>

        {/* Must-Do Tasks Card */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('45 NOW')}
        >
          <View style={styles.actionHeader}>
            <View style={styles.actionIcon}>
              <Ionicons name="star" size={28} color="#FFD700" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>3 Must-Do Tasks</Text>
              <Text style={styles.actionSubtitle}>
                {completedMustDos === 3 ? '✓ All complete!' : `${completedMustDos}/3 completed`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </View>
          {completedMustDos < 3 && (
            <View style={styles.actionDescription}>
              <Text style={styles.descriptionText}>
                Complete your 3 most important tasks of the day
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 369 Affirmations Card */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            if (nextAffirmation) {
              navigation.navigate('45 NOW');
            }
          }}
        >
          <View style={styles.actionHeader}>
            <View style={[styles.actionIcon, { backgroundColor: '#8B7DD820' }]}>
              <Ionicons name="repeat" size={28} color="#8B7DD8" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>369 Affirmations</Text>
              <Text style={styles.actionSubtitle}>
                {affirmationsComplete
                  ? '✓ All 3 sessions complete!'
                  : nextAffirmation
                  ? `Next: ${nextAffirmation.charAt(0).toUpperCase() + nextAffirmation.slice(1)}`
                  : 'All done!'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </View>
          {!affirmationsComplete && (
            <View style={styles.actionDescription}>
              <Text style={styles.descriptionText}>
                Write and speak your affirmations 3, 6, and 9 times
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Meditation Card */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('45 NOW')}
        >
          <View style={styles.actionHeader}>
            <View style={[styles.actionIcon, { backgroundColor: '#FF6B9D20' }]}>
              <Ionicons name="flower" size={28} color="#FF6B9D" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Guided Meditation</Text>
              <Text style={styles.actionSubtitle}>
                {todayProgress.meditationCompleted ? '✓ Complete!' : '5-10 minutes'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </View>
          {!todayProgress.meditationCompleted && (
            <View style={styles.actionDescription}>
              <Text style={styles.descriptionText}>
                Ground yourself with a peaceful meditation
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Journal Card */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Journal')}
        >
          <View style={styles.actionHeader}>
            <View style={[styles.actionIcon, { backgroundColor: '#4ECDC420' }]}>
              <Ionicons name="book" size={28} color="#4ECDC4" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Gratitude Journal</Text>
              <Text style={styles.actionSubtitle}>
                {todayProgress.gratitudeEntry.trim() ? '✓ Entry saved!' : 'Write your blessings'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </View>
          {!todayProgress.gratitudeEntry.trim() && (
            <View style={styles.actionDescription}>
              <Text style={styles.descriptionText}>
                Express gratitude to attract more abundance
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Daily Intention */}
      <View style={styles.intentionSection}>
        <View style={styles.intentionHeader}>
          <Ionicons name="bulb" size={24} color="#FFD700" />
          <Text style={styles.intentionTitle}>Today's Focus</Text>
        </View>
        <Text style={styles.intentionText}>
          What you focus on expands. Choose to see abundance, joy, and possibility in everything today.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0B1F',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 14,
    color: '#8B7DD8',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  quickStartSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: '#1F1B2F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD70020',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#8B7DD8',
  },
  actionDescription: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  descriptionText: {
    fontSize: 13,
    color: '#AAA',
    lineHeight: 18,
  },
  intentionSection: {
    margin: 20,
    marginTop: 10,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  intentionText: {
    fontSize: 15,
    color: '#FFF',
    lineHeight: 22,
  },
});
