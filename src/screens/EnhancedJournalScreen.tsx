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
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

const DAILY_PROMPTS = [
  "What made you smile today?",
  "Who are you grateful for and why?",
  "What's a small win you experienced today?",
  "What brought you joy today?",
  "What challenged you and how did you grow?",
  "What are you looking forward to tomorrow?",
  "What's something beautiful you noticed today?",
];

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Happy', color: '#FFD700' },
  { emoji: '🙏', label: 'Grateful', color: '#4ECDC4' },
  { emoji: '💪', label: 'Motivated', color: '#FF6B35' },
  { emoji: '😌', label: 'Peaceful', color: '#8B7DD8' },
  { emoji: '😴', label: 'Tired', color: '#666' },
];

export default function EnhancedJournalScreen() {
  const { getTodayProgress, updateGratitudeEntry, appState } = useApp();
  const todayProgress = useMemo(() => getTodayProgress(), [getTodayProgress]);

  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [additionalThoughts, setAdditionalThoughts] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const todayPrompt = DAILY_PROMPTS[new Date().getDay()];

  useEffect(() => {
    // Load existing entry if available
    if (todayProgress.gratitudeEntry) {
      const parts = todayProgress.gratitudeEntry.split('|||');
      if (parts.length >= 3) {
        setGratitude1(parts[0] || '');
        setGratitude2(parts[1] || '');
        setGratitude3(parts[2] || '');
        setAdditionalThoughts(parts[3] || '');
        setSelectedMood(parts[4] || null);
      }
    }
  }, []);

  const handleSave = () => {
    const entry = [gratitude1, gratitude2, gratitude3, additionalThoughts, selectedMood].join('|||');
    updateGratitudeEntry(entry);
  };

  const isSaved =
    todayProgress.gratitudeEntry ===
    [gratitude1, gratitude2, gratitude3, additionalThoughts, selectedMood].join('|||');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header with Streak */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>✨ Daily Gratitude</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={24} color="#FF6B35" />
            <Text style={styles.streakNumber}>{appState.currentStreak}</Text>
          </View>
        </View>

        {/* Daily Prompt */}
        <View style={styles.promptCard}>
          <View style={styles.promptHeader}>
            <Ionicons name="help-circle" size={20} color="#FFD700" />
            <Text style={styles.promptTitle}>Today's Prompt</Text>
          </View>
          <Text style={styles.promptText}>{todayPrompt}</Text>
        </View>

        {/* Mood Selector */}
        <View style={styles.moodSection}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <View style={styles.moodOptions}>
            {MOOD_OPTIONS.map((mood) => (
              <TouchableOpacity
                key={mood.label}
                style={[
                  styles.moodButton,
                  selectedMood === mood.label && styles.moodButtonSelected,
                  { borderColor: mood.color },
                ]}
                onPress={() => setSelectedMood(mood.label)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3 Gratitudes */}
        <View style={styles.gratitudesSection}>
          <View style={styles.gratitudesHeader}>
            <Text style={styles.sectionTitle}>3 Things I'm Grateful For</Text>
            <TouchableOpacity onPress={() => setShowInstructions(!showInstructions)}>
              <Ionicons
                name={showInstructions ? 'chevron-up' : 'information-circle-outline'}
                size={24}
                color="#8B7DD8"
              />
            </TouchableOpacity>
          </View>

          {showInstructions && (
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsText}>
                💡 Tips for powerful gratitude:{'\n'}
                • Be specific - instead of "my family", say "the way my mom made me laugh today"{'\n'}
                • Focus on feelings - how did it make you feel?{'\n'}
                • Notice the small things - a warm cup of coffee, a kind smile{'\n'}
                • Write as if you're reliving the moment
              </Text>
            </View>
          )}

          <View style={styles.gratitudeItem}>
            <View style={styles.gratitudeNumber}>
              <Text style={styles.numberText}>1</Text>
            </View>
            <TextInput
              style={styles.gratitudeInput}
              placeholder="I am grateful for..."
              placeholderTextColor="#666"
              value={gratitude1}
              onChangeText={setGratitude1}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onBlur={handleSave}
            />
          </View>

          <View style={styles.gratitudeItem}>
            <View style={styles.gratitudeNumber}>
              <Text style={styles.numberText}>2</Text>
            </View>
            <TextInput
              style={styles.gratitudeInput}
              placeholder="I am grateful for..."
              placeholderTextColor="#666"
              value={gratitude2}
              onChangeText={setGratitude2}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onBlur={handleSave}
            />
          </View>

          <View style={styles.gratitudeItem}>
            <View style={styles.gratitudeNumber}>
              <Text style={styles.numberText}>3</Text>
            </View>
            <TextInput
              style={styles.gratitudeInput}
              placeholder="I am grateful for..."
              placeholderTextColor="#666"
              value={gratitude3}
              onChangeText={setGratitude3}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onBlur={handleSave}
            />
          </View>
        </View>

        {/* Additional Thoughts */}
        <View style={styles.additionalSection}>
          <Text style={styles.sectionTitle}>Additional Thoughts (Optional)</Text>
          <TextInput
            style={styles.additionalInput}
            placeholder="Reflect on your day, set intentions, or write freely..."
            placeholderTextColor="#666"
            value={additionalThoughts}
            onChangeText={setAdditionalThoughts}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            onBlur={handleSave}
          />
        </View>

        {/* Inspirational Quote */}
        <View style={styles.quoteCard}>
          <Ionicons name="sparkles" size={20} color="#FFD700" />
          <Text style={styles.quoteText}>
            "Gratitude turns what we have into enough, and more. It turns denial into acceptance, chaos into order, confusion into clarity... it makes sense of our past, brings peace for today, and creates a vision for tomorrow."
          </Text>
        </View>

        {/* Save Status */}
        {!isSaved && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </TouchableOpacity>
        )}

        {isSaved && (gratitude1 || gratitude2 || gratitude3) && (
          <View style={styles.savedIndicator}>
            <Ionicons name="cloud-done" size={20} color="#4CAF50" />
            <Text style={styles.savedText}>All changes saved ✓</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0B1F',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#8B7DD8',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1B2F',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  promptCard: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    backgroundColor: '#1F1B2F',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  promptText: {
    fontSize: 16,
    color: '#FFF',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  moodSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  moodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodButton: {
    alignItems: 'center',
    backgroundColor: '#1F1B2F',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 70,
  },
  moodButtonSelected: {
    backgroundColor: '#2A2340',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 5,
  },
  moodLabel: {
    fontSize: 11,
    color: '#AAA',
  },
  gratitudesSection: {
    padding: 20,
    paddingTop: 10,
  },
  gratitudesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  instructionsBox: {
    backgroundColor: '#1F1B2F',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#8B7DD8',
  },
  instructionsText: {
    fontSize: 13,
    color: '#AAA',
    lineHeight: 20,
  },
  gratitudeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 12,
  },
  gratitudeNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD70020',
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  numberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  gratitudeInput: {
    flex: 1,
    backgroundColor: '#1F1B2F',
    borderRadius: 12,
    padding: 15,
    color: '#FFF',
    fontSize: 15,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#333',
    lineHeight: 22,
  },
  additionalSection: {
    padding: 20,
    paddingTop: 10,
  },
  additionalInput: {
    backgroundColor: '#1F1B2F',
    borderRadius: 12,
    padding: 15,
    color: '#FFF',
    fontSize: 15,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#333',
    lineHeight: 22,
  },
  quoteCard: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    backgroundColor: '#1F1B2F',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 15,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  quoteText: {
    flex: 1,
    fontSize: 13,
    color: '#FFD700',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  saveButton: {
    margin: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B7DD8',
    padding: 18,
    borderRadius: 12,
    gap: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savedIndicator: {
    margin: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  savedText: {
    color: '#4CAF50',
    fontSize: 14,
  },
});
