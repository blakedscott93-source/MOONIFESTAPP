import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { CHALLENGE_DURATION_DAYS, PROGRESS_MILESTONES } from '../utils/constants';

export default function ProgressScreen() {
  const { appState } = useApp();

  const iconMap: Record<number, string> = {
    7: 'trophy',
    14: 'medal',
    21: 'ribbon',
    30: 'star',
    45: 'checkmark-circle',
  };

  const milestones = PROGRESS_MILESTONES.map(milestone => ({
    day: milestone.day,
    title: milestone.title,
    icon: iconMap[milestone.day] || 'star',
    reached: appState.totalDays >= milestone.day,
  }));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your transformation</Text>
      </View>

      {/* Main Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={32} color="#FF6B35" />
          <Text style={styles.statNumber}>{appState.currentStreak}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="calendar" size={32} color="#8B7DD8" />
          <Text style={styles.statNumber}>{appState.totalDays}</Text>
          <Text style={styles.statLabel}>Total Days</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={32} color="#4ECDC4" />
          <Text style={styles.statNumber}>{Math.round((appState.totalDays / CHALLENGE_DURATION_DAYS) * 100)}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
      </View>

      {/* Milestones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Milestones</Text>
        {milestones.map((milestone) => (
          <View
            key={milestone.day}
            style={[
              styles.milestoneCard,
              milestone.reached && styles.milestoneReached,
            ]}
          >
            <View
              style={[
                styles.milestoneIcon,
                milestone.reached && styles.milestoneIconReached,
              ]}
            >
              <Ionicons
                name={milestone.icon as any}
                size={28}
                color={milestone.reached ? '#FFD700' : '#666'}
              />
            </View>
            <View style={styles.milestoneContent}>
              <Text
                style={[
                  styles.milestoneTitle,
                  milestone.reached && styles.milestoneTextReached,
                ]}
              >
                {milestone.title}
              </Text>
              <Text style={styles.milestoneDay}>Day {milestone.day}</Text>
            </View>
            {milestone.reached && (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            )}
          </View>
        ))}
      </View>

      {/* Motivational Message */}
      <View style={styles.motivationCard}>
        {appState.totalDays === 0 ? (
          <>
            <Ionicons name="rocket" size={32} color="#FFD700" />
            <Text style={styles.motivationText}>
              Your journey begins today! The first step is always the hardest, but you've got this.
            </Text>
          </>
        ) : appState.totalDays < CHALLENGE_DURATION_DAYS ? (
          <>
            <Ionicons name="sparkles" size={32} color="#FFD700" />
            <Text style={styles.motivationText}>
              You're doing amazing! Keep going - every day you're manifesting a better version of yourself.
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="trophy" size={32} color="#FFD700" />
            <Text style={styles.motivationText}>
              Congratulations! You've completed the 45 NOW Challenge. You're a manifestation master!
            </Text>
          </>
        )}
      </View>

      {/* Challenge Info */}
      {appState.startDate && (
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Challenge Started</Text>
          <Text style={styles.infoValue}>
            {new Date(appState.startDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      )}
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#8B7DD8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7DD8',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1F1B2F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1B2F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  milestoneReached: {
    borderColor: '#FFD700',
    backgroundColor: '#2A2340',
  },
  milestoneIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F0B1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  milestoneIconReached: {
    backgroundColor: '#3D3155',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AAA',
    marginBottom: 4,
  },
  milestoneTextReached: {
    color: '#FFF',
  },
  milestoneDay: {
    fontSize: 14,
    color: '#666',
  },
  motivationCard: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    backgroundColor: '#1F1B2F',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  motivationText: {
    fontSize: 15,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  infoCard: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#1F1B2F',
    borderRadius: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#8B7DD8',
    fontWeight: '600',
  },
});
