import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { GratitudeHelperSection } from '../components/GratitudeHelperSection';
import { GratitudeCheckInCard } from '../components/GratitudeCheckInCard';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { GratitudeCheckIn } from '../utils/dayRollover';
import { getLocalDayKey } from '../utils/dayRollover';

export default function JournalScreen() {
  const { 
    getTodayCheckIns, 
    getTodayCheckInCount, 
    isTodayGratitudeComplete,
    addGratitudeCheckIn,
  } = useApp();
  
  const [entry, setEntry] = useState('');
  const [checkIns, setCheckIns] = useState<GratitudeCheckIn[]>([]);
  const [checkInCount, setCheckInCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    const todayCheckIns = await getTodayCheckIns();
    const count = await getTodayCheckInCount();
    const complete = await isTodayGratitudeComplete();
    
    setCheckIns(todayCheckIns);
    setCheckInCount(count);
    setIsComplete(complete);
  };

  const handleSave = async () => {
    if (!entry.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    if (isComplete) {
      Alert.alert(
        'Day Complete',
        'You\'ve already completed 3 check-ins today. You can still add more entries, but they won\'t count toward completion.',
        [{ text: 'OK', onPress: () => saveCheckIn() }]
      );
      return;
    }

    await saveCheckIn();
  };

  const saveCheckIn = async () => {
    setIsSaving(true);
    try {
      await addGratitudeCheckIn(entry);
      setEntry('');
      await loadTodayData(); // Reload to get updated count and check-ins
    } catch (error) {
      Alert.alert('Error', 'Failed to save check-in. Please try again.');
      console.error('Error saving check-in:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>✨ Gratitude Journal</Text>
              <Text style={styles.subtitle}>Manifest through appreciation</Text>
            </View>
          </View>

          {/* Helper Section */}
          <GratitudeHelperSection />

          {/* Date Row with Progress */}
          <View style={styles.dateRow}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar" size={20} color={Theme.colors.accent} />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateText}>{formatDate()}</Text>
              </View>
            </View>
            <View style={[styles.progressPill, isComplete && styles.progressPillComplete]}>
              <Text style={[styles.progressText, isComplete && styles.progressTextComplete]}>
                {checkInCount}/3
              </Text>
            </View>
          </View>

          {/* Completion Message */}
          {isComplete && (
            <View style={styles.completeMessage}>
              <Ionicons name="checkmark-circle" size={24} color={Theme.colors.success} />
              <Text style={styles.completeMessageText}>
                ✅ Gratitude complete for today
              </Text>
            </View>
          )}

          {/* Entry Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={8}
              placeholder="I am so grateful for..."
              placeholderTextColor={Theme.colors.textTertiary}
              value={entry}
              onChangeText={setEntry}
              textAlignVertical="top"
              editable={!isSaving}
            />
            {entry.length > 0 && (
              <View style={styles.characterCount}>
                <Text style={styles.characterCountText}>
                  {entry.length} characters
                </Text>
              </View>
            )}
          </View>

          {/* Save Button */}
          <PrimaryButton
            title={isComplete ? "Save Extra Entry" : "Save Check-in"}
            icon="save"
            onPress={handleSave}
            disabled={!entry.trim() || isSaving}
            style={styles.saveButton}
            accessibilityLabel={isComplete ? "Save extra entry" : "Save check-in"}
          />

          {/* Saved Check-ins */}
          {checkIns.length > 0 && (
            <View style={styles.checkInsSection}>
              <Text style={styles.checkInsTitle}>Today's Check-ins</Text>
              {checkIns.map((checkIn) => (
                <GratitudeCheckInCard key={checkIn.id} checkIn={checkIn} />
              ))}
            </View>
          )}

          {/* Inspiration Quote */}
          <View style={styles.affirmationBox}>
            <Ionicons name="sparkles" size={20} color={Theme.colors.accent} />
            <Text style={styles.affirmationText}>
              "What you appreciate, appreciates. Gratitude is the gateway to abundance."
            </Text>
          </View>

          <View style={{ height: Theme.spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.xl,
  },
  header: {
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
  },
  title: {
    ...Theme.typography.title,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
  },
  progressPill: {
    backgroundColor: Theme.colors.surfaceSecondary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  progressPillComplete: {
    backgroundColor: Theme.colors.success + '20',
    borderColor: Theme.colors.success,
  },
  progressText: {
    ...Theme.typography.captionBold,
    color: Theme.colors.textSecondary,
  },
  progressTextComplete: {
    color: Theme.colors.success,
  },
  completeMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.success + '15',
    padding: Theme.spacing.md,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    gap: Theme.spacing.sm,
  },
  completeMessageText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.success,
  },
  inputContainer: {
    position: 'relative',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  textInput: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    color: Theme.colors.textPrimary,
    ...Theme.typography.body,
    minHeight: 200,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.subtle,
  },
  characterCount: {
    position: 'absolute',
    bottom: Theme.spacing.md,
    right: Theme.spacing.lg + Theme.spacing.md,
    backgroundColor: Theme.colors.bg,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs / 2,
    borderRadius: Theme.radius.sm,
  },
  characterCountText: {
    ...Theme.typography.small,
    color: Theme.colors.textTertiary,
  },
  saveButton: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  checkInsSection: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  checkInsTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  affirmationBox: {
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.gold + '40',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.sm,
    ...Theme.shadow.subtle,
  },
  affirmationText: {
    flex: 1,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: Theme.typography.body.lineHeight,
  },
});
