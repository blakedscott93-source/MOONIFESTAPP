import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GUIDED_SESSIONS, AFFIRMATION_CATEGORIES } from '../data/guidedAffirmations';

export default function AffirmationPlayerScreen({ route, navigation }: any) {
  const { sessionId } = route.params;
  const session = GUIDED_SESSIONS.find(s => s.id === sessionId);
  const category = AFFIRMATION_CATEGORIES.find(c => c.id === session?.categoryId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [progress, setProgress] = useState(0);

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual audio playback
    // This is where we'll add audio player logic later
  };

  const handleComplete = () => {
    // TODO: Mark session as completed in context
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={category?.gradient || ['#E0E0E0', '#F5F5F5']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{session.title}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Session Info */}
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>{session.title}</Text>
            <Text style={styles.sessionSubtitle}>
              {session.affirmationCount} affirmations · {Math.floor(session.duration / 60)} mins
            </Text>
          </View>

          {/* Affirmation Display */}
          <ScrollView
            style={styles.affirmationScroll}
            contentContainerStyle={styles.affirmationContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.affirmationCard}>
              <Text style={styles.affirmationNumber}>
                {currentAffirmation + 1} / {session.affirmations.length}
              </Text>
              <Text style={styles.affirmationText}>
                {session.affirmations[currentAffirmation]}
              </Text>
            </View>

            {/* All Affirmations List */}
            <View style={styles.affirmationsList}>
              <Text style={styles.listTitle}>All Affirmations</Text>
              {session.affirmations.map((affirmation, index) => (
                <View
                  key={index}
                  style={[
                    styles.affirmationItem,
                    index === currentAffirmation && styles.affirmationItemActive,
                  ]}
                >
                  <View style={styles.affirmationItemNumber}>
                    <Text style={styles.affirmationItemNumberText}>{index + 1}</Text>
                  </View>
                  <Text
                    style={[
                      styles.affirmationItemText,
                      index === currentAffirmation && styles.affirmationItemTextActive,
                    ]}
                  >
                    {affirmation}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>0:00</Text>
              <Text style={styles.timeText}>
                {Math.floor(session.duration / 60)}:{(session.duration % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setCurrentAffirmation(Math.max(0, currentAffirmation - 1))}
              disabled={currentAffirmation === 0}
            >
              <Ionicons
                name="play-skip-back"
                size={32}
                color={currentAffirmation === 0 ? '#CCC' : '#333'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={48}
                color="#FFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() =>
                setCurrentAffirmation(Math.min(session.affirmations.length - 1, currentAffirmation + 1))
              }
              disabled={currentAffirmation === session.affirmations.length - 1}
            >
              <Ionicons
                name="play-skip-forward"
                size={32}
                color={currentAffirmation === session.affirmations.length - 1 ? '#CCC' : '#333'}
              />
            </TouchableOpacity>
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
          >
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
          </TouchableOpacity>

          {/* Audio Placeholder Note */}
          <View style={styles.placeholderNote}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.placeholderText}>
              Audio voiceover will be added here. For now, read each affirmation aloud.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sessionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  affirmationScroll: {
    flex: 1,
  },
  affirmationContent: {
    paddingBottom: 20,
  },
  affirmationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  affirmationNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontWeight: '600',
  },
  affirmationText: {
    fontSize: 22,
    lineHeight: 34,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  affirmationsList: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  affirmationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  affirmationItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  affirmationItemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  affirmationItemNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  affirmationItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  affirmationItemTextActive: {
    color: '#333',
    fontWeight: '500',
  },
  progressSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#333',
    borderRadius: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    marginBottom: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  completeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 15,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  placeholderNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  placeholderText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 100,
  },
});
