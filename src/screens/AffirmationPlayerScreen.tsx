import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { GUIDED_SESSIONS, AFFIRMATION_CATEGORIES } from '../data/guidedAffirmations';
import { useApp } from '../context/AppContext';
import { GuidedSession } from '../types';
import { useToast } from '../context/ToastContext';
import { successHaptic } from '../utils/haptics';
import { MAX_SESSIONS_PER_DAY, POINTS } from '../utils/constants';
import { saveAffirmation, isAffirmationSaved } from '../utils/savedAffirmations';

export default function AffirmationPlayerScreen({ route, navigation }: any) {
  const { sessionId } = route.params;
  const { updateGuidedSessions, getTodayProgress, addGlowPoints } = useApp();
  const { showSuccess, showPoints } = useToast();
  const session = GUIDED_SESSIONS.find(s => s.id === sessionId);
  const category = AFFIRMATION_CATEGORIES.find(c => c.id === session?.categoryId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedAffirmations, setSavedAffirmations] = useState<Set<string>>(new Set());
  const speechRef = useRef<{ isActive: boolean }>({ isActive: false });

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  // Load saved affirmations
  useEffect(() => {
    loadSavedAffirmations();
  }, []);

  // Clean up speech on unmount or navigation
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const loadSavedAffirmations = async () => {
    const saved = new Set<string>();
    for (const affirmation of session.affirmations) {
      const isSaved = await isAffirmationSaved(affirmation);
      if (isSaved) {
        saved.add(affirmation);
      }
    }
    setSavedAffirmations(saved);
  };

  const handleSaveAffirmation = async (affirmation: string) => {
    try {
      const isSaved = savedAffirmations.has(affirmation);
      if (isSaved) {
        // Already saved - could navigate to saved affirmations or show message
        showSuccess('Saved', 'This affirmation is already in your saved collection');
      } else {
        await saveAffirmation(affirmation, category?.name || 'Uncategorized', 'guided', session.id);
        setSavedAffirmations(new Set([...savedAffirmations, affirmation]));
        showSuccess('Saved!', 'Affirmation added to your collection');
        successHaptic();
      }
    } catch (error) {
      console.error('Error saving affirmation:', error);
    }
  };

  // Stop speech when navigating away
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
    });
    return unsubscribe;
  }, [navigation]);

  // Update progress based on current affirmation
  useEffect(() => {
    const newProgress = session.affirmations.length > 0
      ? ((currentAffirmation + 1) / session.affirmations.length) * 100
      : 0;
    setProgress(newProgress);
  }, [currentAffirmation, session.affirmations.length]);

  // Auto-scroll to current affirmation when it changes
  useEffect(() => {
    // This will be handled by the ScrollView ref if needed
  }, [currentAffirmation]);

  const stopSpeech = () => {
    if (speechRef.current.isActive) {
      Speech.stop();
      speechRef.current.isActive = false;
      setIsSpeaking(false);
      setIsPlaying(false);
    }
  };

  const speakAffirmation = async (index: number) => {
    if (!session || index < 0 || index >= session.affirmations.length) {
      return;
    }

    // Stop any current speech
    stopSpeech();

    const affirmation = session.affirmations[index];
    
    try {
      speechRef.current.isActive = true;
      setIsSpeaking(true);
      setIsPlaying(true);

      await Speech.speak(affirmation, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9, // Slightly slower for better comprehension
        onStart: () => {
          setIsSpeaking(true);
          setIsPlaying(true);
        },
        onDone: () => {
          speechRef.current.isActive = false;
          setIsSpeaking(false);
          
          // Auto-advance to next affirmation if not the last one
          if (index < session.affirmations.length - 1) {
            setTimeout(() => {
              speakAffirmation(index + 1);
              setCurrentAffirmation(index + 1);
            }, 500); // Small delay before next affirmation
          } else {
            // Last affirmation finished
            setIsPlaying(false);
          }
        },
        onStopped: () => {
          speechRef.current.isActive = false;
          setIsSpeaking(false);
          setIsPlaying(false);
        },
        onError: (error) => {
          console.error('Speech error:', error);
          speechRef.current.isActive = false;
          setIsSpeaking(false);
          setIsPlaying(false);
        },
      });
    } catch (error) {
      console.error('Error speaking affirmation:', error);
      speechRef.current.isActive = false;
      setIsSpeaking(false);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying && isSpeaking) {
      // Pause/Stop current speech
      stopSpeech();
    } else {
      // Start/Resume from current affirmation
      await speakAffirmation(currentAffirmation);
    }
  };

  const handlePrevious = () => {
    if (currentAffirmation > 0) {
      stopSpeech();
      const newIndex = currentAffirmation - 1;
      setCurrentAffirmation(newIndex);
      if (isPlaying) {
        speakAffirmation(newIndex);
      }
    }
  };

  const handleNext = () => {
    if (currentAffirmation < session.affirmations.length - 1) {
      stopSpeech();
      const newIndex = currentAffirmation + 1;
      setCurrentAffirmation(newIndex);
      if (isPlaying) {
        speakAffirmation(newIndex);
      }
    }
  };

  const handleComplete = async () => {
    if (isCompleting) return; // Prevent double submission
    
    try {
      setIsCompleting(true);
      
      // Get today's progress
      const todayProgress = getTodayProgress();
      const existingSessions = todayProgress.guidedSessions || [];
      
      // Check if session is already completed
      const alreadyCompleted = existingSessions.some(s => s.id === session.id);
      
      if (alreadyCompleted) {
        showSuccess('Already Complete', 'You already finished this session today!');
        navigation.goBack();
        return;
      }
      
      // Create GuidedSession object
      const completedSession: GuidedSession = {
        id: session.id,
        category: category?.name || session.categoryId,
        title: session.title,
        duration: session.duration,
        completedAt: new Date().toISOString(),
      };
      
      // Add to existing sessions (max sessions per day)
      const updatedSessions = [...existingSessions, completedSession].slice(0, MAX_SESSIONS_PER_DAY);
      
      // Update in context
      await updateGuidedSessions(updatedSessions);
      
      // Award glow points
      await addGlowPoints(POINTS.AFFIRMATION_SESSION, `Completed affirmation session: ${session.title}`);
      
      // Show success feedback
      showSuccess('Session Complete!', 'Great job completing this affirmation session.');
      showPoints(POINTS.AFFIRMATION_SESSION, 'Affirmation session completed');
      
      // Haptic feedback
      successHaptic();
      
      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Error completing session:', error);
      showSuccess('Error', 'Failed to save session. Please try again.');
    } finally {
      setIsCompleting(false);
    }
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
              {session.affirmations.map((affirmation, index) => {
                const isSaved = savedAffirmations.has(affirmation);
                return (
                  <View
                    key={index}
                    style={[
                      styles.affirmationItemContainer,
                      index === currentAffirmation && styles.affirmationItemActive,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.affirmationItem}
                      onPress={() => {
                        stopSpeech();
                        setCurrentAffirmation(index);
                        if (isPlaying) {
                          speakAffirmation(index);
                        }
                      }}
                      activeOpacity={0.7}
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
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => handleSaveAffirmation(affirmation)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={isSaved ? 'bookmark' : 'bookmark-outline'}
                        size={20}
                        color={isSaved ? '#FFD700' : '#999'}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
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
              onPress={handlePrevious}
              disabled={currentAffirmation === 0}
            >
              <Ionicons
                name="play-skip-back"
                size={32}
                color={currentAffirmation === 0 ? '#CCC' : '#333'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playButton, isSpeaking && styles.playButtonActive]}
              onPress={handlePlayPause}
            >
              {isSpeaking ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={48}
                  color="#FFF"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleNext}
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
            style={[styles.completeButton, isCompleting && styles.completeButtonDisabled]}
            onPress={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            )}
          </TouchableOpacity>

          {/* Audio Status Note */}
          {isSpeaking && (
            <View style={styles.statusNote}>
              <Ionicons name="volume-high" size={20} color="#4CAF50" />
              <Text style={styles.statusText}>
                Listening to affirmation {currentAffirmation + 1} of {session.affirmations.length}
              </Text>
            </View>
          )}
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
  affirmationItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  affirmationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
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
  saveButton: {
    padding: 8,
    marginLeft: 8,
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
  playButtonActive: {
    backgroundColor: '#4CAF50',
  },
  completeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 15,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    color: '#4CAF50',
    lineHeight: 18,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 100,
  },
});
