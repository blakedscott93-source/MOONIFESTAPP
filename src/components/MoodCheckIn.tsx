import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import {
  MOOD_OPTIONS,
  ENERGY_OPTIONS,
  MoodType,
  EnergyLevel,
  MoodOption,
  EnergyOption,
} from '../data/moodTracking';
import { LinearGradient } from 'expo-linear-gradient';

interface MoodCheckInProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (mood: MoodType, energy: EnergyLevel, note?: string) => void;
}

export const MoodCheckIn: React.FC<MoodCheckInProps> = ({ visible, onClose, onSubmit }) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | null>(null);
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'mood' | 'energy' | 'note'>('mood');

  const handleSubmit = () => {
    if (selectedMood && selectedEnergy) {
      onSubmit(selectedMood, selectedEnergy, note.trim() || undefined);
      // Reset state
      setSelectedMood(null);
      setSelectedEnergy(null);
      setNote('');
      setStep('mood');
      onClose();
    }
  };

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    setStep('energy');
  };

  const handleEnergySelect = (energy: EnergyLevel) => {
    setSelectedEnergy(energy);
    setStep('note');
  };

  const handleBack = () => {
    if (step === 'energy') {
      setStep('mood');
      setSelectedMood(null);
    } else if (step === 'note') {
      setStep('energy');
      setSelectedEnergy(null);
    }
  };

  const handleSkipNote = () => {
    handleSubmit();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            {step !== 'mood' && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={Theme.colors.textPrimary} />
              </TouchableOpacity>
            )}
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                {step === 'mood' && 'How are you feeling?'}
                {step === 'energy' && 'What\'s your energy level?'}
                {step === 'note' && 'Add a note (optional)'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {step === 'mood' && 'Select your current mood'}
                {step === 'energy' && 'How energized do you feel?'}
                {step === 'note' && 'Capture what\'s on your mind'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Step 1: Mood Selection */}
            {step === 'mood' && (
              <View style={styles.optionsGrid}>
                {MOOD_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.type}
                    style={[
                      styles.moodOption,
                      selectedMood === option.type && styles.moodOptionSelected,
                    ]}
                    onPress={() => handleMoodSelect(option.type)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[option.color + '20', option.color + '10']}
                      style={styles.moodGradient}
                    >
                      <Text style={styles.moodEmoji}>{option.emoji}</Text>
                      <Text style={[styles.moodLabel, { color: option.color }]}>
                        {option.label}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Step 2: Energy Selection */}
            {step === 'energy' && (
              <View style={styles.optionsGrid}>
                {ENERGY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.level}
                    style={[
                      styles.energyOption,
                      selectedEnergy === option.level && styles.energyOptionSelected,
                    ]}
                    onPress={() => handleEnergySelect(option.level)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[option.color + '20', option.color + '10']}
                      style={styles.energyGradient}
                    >
                      <Text style={styles.energyEmoji}>{option.emoji}</Text>
                      <Text style={[styles.energyLabel, { color: option.color }]}>
                        {option.label}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Step 3: Optional Note */}
            {step === 'note' && (
              <View style={styles.noteContainer}>
                <View style={styles.selectedSummary}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Mood:</Text>
                    <Text style={styles.summaryValue}>
                      {MOOD_OPTIONS.find(m => m.type === selectedMood)?.emoji}{' '}
                      {MOOD_OPTIONS.find(m => m.type === selectedMood)?.label}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Energy:</Text>
                    <Text style={styles.summaryValue}>
                      {ENERGY_OPTIONS.find(e => e.level === selectedEnergy)?.emoji}{' '}
                      {ENERGY_OPTIONS.find(e => e.level === selectedEnergy)?.label}
                    </Text>
                  </View>
                </View>

                <TextInput
                  style={styles.noteInput}
                  placeholder="What's on your mind? (optional)"
                  placeholderTextColor={Theme.colors.textTertiary}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <View style={styles.noteActions}>
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkipNote}
                  >
                    <Text style={styles.skipButtonText}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                  >
                    <LinearGradient
                      colors={['#C77DFF', '#9D4EDD']}
                      style={styles.submitGradient}
                    >
                      <Text style={styles.submitButtonText}>Save Mood Check-In</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.bg,
    borderTopLeftRadius: Theme.radius.xl,
    borderTopRightRadius: Theme.radius.xl,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxxl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  closeButton: {
    padding: Theme.spacing.sm,
  },
  headerTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  headerSubtitle: {
    ...Theme.typography.body,
    fontFamily: 'Sora_400Regular',
    color: Theme.colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    justifyContent: 'center',
  },
  moodOption: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadow.medium,
  },
  moodOptionSelected: {
    transform: [{ scale: 1.05 }],
    ...Theme.shadow.large,
  },
  moodGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  moodLabel: {
    ...Theme.typography.bodyBold,
    fontSize: 16,
  },
  energyOption: {
    width: '100%',
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
    ...Theme.shadow.medium,
  },
  energyOptionSelected: {
    transform: [{ scale: 1.02 }],
    ...Theme.shadow.large,
  },
  energyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  energyEmoji: {
    fontSize: 32,
  },
  energyLabel: {
    ...Theme.typography.h3,
    flex: 1,
  },
  noteContainer: {
    gap: Theme.spacing.lg,
  },
  selectedSummary: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.sm,
    ...Theme.shadow.subtle,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  summaryLabel: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textSecondary,
  },
  summaryValue: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
  },
  noteInput: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    minHeight: 120,
    ...Theme.shadow.subtle,
  },
  noteActions: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  skipButton: {
    flex: 1,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  skipButtonText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textSecondary,
  },
  submitButton: {
    flex: 2,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadow.medium,
  },
  submitGradient: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
  submitButtonText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
  },
});
