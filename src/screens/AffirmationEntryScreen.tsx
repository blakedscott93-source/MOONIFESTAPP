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

interface AffirmationEntryScreenProps {
  route: {
    params: {
      period: 'morning' | 'afternoon' | 'evening';
    };
  };
  navigation: any;
}

export default function AffirmationEntryScreen({ route, navigation }: AffirmationEntryScreenProps) {
  const { period } = route.params;
  const { getTodayProgress, updateAffirmations } = useApp();
  const todayProgress = useMemo(() => getTodayProgress(), [getTodayProgress]);

  const affirmationCounts = {
    morning: 3,
    afternoon: 6,
    evening: 9,
  };

  const periodInfo = {
    morning: {
      title: 'Morning Affirmations',
      subtitle: 'Write 3 affirmations',
      icon: 'sunny',
      color: '#FFD700',
      description: 'Set your intentions for the day. Write each affirmation 3 times as you speak them aloud.',
    },
    afternoon: {
      title: 'Afternoon Affirmations',
      subtitle: 'Write 6 affirmations',
      icon: 'partly-sunny',
      color: '#FF6B35',
      description: 'Reinforce your intentions. Write each affirmation 6 times as you speak them aloud.',
    },
    evening: {
      title: 'Evening Affirmations',
      subtitle: 'Write 9 affirmations',
      icon: 'moon',
      color: '#8B7DD8',
      description: 'Seal your manifestations. Write each affirmation 9 times as you speak them aloud.',
    },
  };

  const count = affirmationCounts[period];
  const info = periodInfo[period];

  // Initialize affirmations array
  const [affirmations, setAffirmations] = useState<string[]>(
    Array(count).fill('')
  );

  useEffect(() => {
    // Load existing affirmations if available
    const existing = todayProgress.affirmations.affirmationText;
    if (existing) {
      const parsed = existing.split('|||');
      if (parsed.length === count) {
        setAffirmations(parsed);
      }
    }
  }, []);

  const updateAffirmation = (index: number, text: string) => {
    const updated = [...affirmations];
    updated[index] = text;
    setAffirmations(updated);
  };

  const handleComplete = () => {
    // Check if all affirmations are filled
    const allFilled = affirmations.every((aff) => aff.trim().length > 0);

    if (!allFilled) {
      Alert.alert(
        'Incomplete',
        `Please write all ${count} affirmations before completing.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Save affirmations
    const affirmationText = affirmations.join('|||');
    const updated = {
      ...todayProgress.affirmations,
      [period]: true,
      affirmationText,
    };

    updateAffirmations(updated);

    Alert.alert(
      'Complete! ✨',
      'Your affirmations have been saved. Remember to read them aloud!',
      [
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const templates = [
    'I am worthy of abundance and success',
    'I attract positive energy and opportunities',
    'My dreams are manifesting into reality',
    'I am grateful for all that I have',
    'I am confident and capable',
    'Money flows to me effortlessly',
    'I am healthy, happy, and whole',
    'The universe supports my goals',
  ];

  const addTemplate = (template: string) => {
    const firstEmpty = affirmations.findIndex((aff) => !aff.trim());
    if (firstEmpty !== -1) {
      updateAffirmation(firstEmpty, template);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={styles.scrollView}>
        <View style={[styles.header, { borderBottomColor: info.color }]}>
          <Ionicons name={info.icon as any} size={40} color={info.color} />
          <Text style={styles.title}>{info.title}</Text>
          <Text style={styles.subtitle}>{info.subtitle}</Text>
        </View>

        <View style={styles.instructionCard}>
          <Ionicons name="information-circle" size={24} color={info.color} />
          <Text style={styles.instructionText}>{info.description}</Text>
        </View>

        <View style={styles.affirmationsContainer}>
          {affirmations.map((affirmation, index) => (
            <View key={index} style={styles.affirmationItem}>
              <View style={styles.affirmationHeader}>
                <Text style={styles.affirmationNumber}>Affirmation {index + 1}</Text>
                <Text style={styles.repeatText}>Repeat {count}x</Text>
              </View>
              <TextInput
                style={styles.affirmationInput}
                placeholder={`I am...`}
                placeholderTextColor="#666"
                value={affirmation}
                onChangeText={(text) => updateAffirmation(index, text)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          ))}
        </View>

        <View style={styles.templatesSection}>
          <Text style={styles.templatesTitle}>💡 Quick Templates</Text>
          <View style={styles.templatesList}>
            {templates.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={styles.templateChip}
                onPress={() => addTemplate(template)}
              >
                <Text style={styles.templateText}>{template}</Text>
                <Ionicons name="add-circle" size={20} color={info.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.reminderCard}>
          <Ionicons name="megaphone" size={24} color="#FFD700" />
          <Text style={styles.reminderText}>
            Remember: Speak each affirmation aloud as you write it. Feel the words as if they're already true.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: info.color }]}
          onPress={handleComplete}
        >
          <Ionicons name="checkmark-circle" size={24} color="#FFF" />
          <Text style={styles.completeButtonText}>Complete {period.charAt(0).toUpperCase() + period.slice(1)} Session</Text>
        </TouchableOpacity>
      </View>
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
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 15,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA',
  },
  instructionCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1F1B2F',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
  },
  affirmationsContainer: {
    padding: 20,
    paddingTop: 0,
    gap: 15,
  },
  affirmationItem: {
    backgroundColor: '#1F1B2F',
    borderRadius: 12,
    padding: 15,
  },
  affirmationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  affirmationNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  repeatText: {
    fontSize: 12,
    color: '#8B7DD8',
  },
  affirmationInput: {
    backgroundColor: '#0F0B1F',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 15,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#333',
  },
  templatesSection: {
    padding: 20,
    paddingTop: 0,
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  templatesList: {
    gap: 10,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F1B2F',
    borderRadius: 20,
    padding: 12,
    paddingHorizontal: 16,
  },
  templateText: {
    flex: 1,
    fontSize: 13,
    color: '#FFF',
  },
  reminderCard: {
    margin: 20,
    marginTop: 0,
    marginBottom: 100,
    padding: 20,
    backgroundColor: '#1F1B2F',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  reminderText: {
    flex: 1,
    fontSize: 13,
    color: '#FFD700',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#0F0B1F',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 10,
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
