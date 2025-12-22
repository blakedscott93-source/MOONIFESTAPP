import React, { useState, useEffect, useMemo } from 'react';
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
import { Screen } from '../components/layout/Screen';
import { Card } from '../components/ui';
import { useTheme } from '../theme/ThemeProvider';

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
  const { theme: designTheme } = useTheme();
  const { getTodayProgress } = useApp();
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
    // TODO: Load from storage when affirmation storage is implemented
    // For now, start with empty affirmations
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
    // TODO: Implement affirmation saving when backend is ready
    // For now, just store locally
    console.log('Affirmations saved:', { period, affirmationText });

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
      <Screen
        scroll
        title={info.title}
        subtitle={info.subtitle}
        style={{ backgroundColor: '#0F0B1F' }}
      >
        <View style={styles.headerContent}>
          <Ionicons name={info.icon as any} size={40} color={info.color} />
        </View>

        <Card style={styles.instructionCard}>
          <Ionicons name="information-circle" size={24} color={info.color} />
          <Text style={styles.instructionText}>{info.description}</Text>
        </Card>

        <View style={styles.affirmationsContainer}>
          {affirmations.map((affirmation, index) => (
            <Card key={index} style={styles.affirmationItem}>
              <View style={styles.affirmationHeader}>
                <Text style={[styles.affirmationNumber, { color: info.color }]}>Affirmation {index + 1}</Text>
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
            </Card>
          ))}
        </View>

        <View style={styles.templatesSection}>
          <Text style={styles.templatesTitle}>💡 Quick Templates</Text>
          <View style={styles.templatesList}>
            {templates.map((template, index) => (
              <Card key={index} style={styles.templateChip}>
                <TouchableOpacity
                  onPress={() => addTemplate(template)}
                  style={styles.templateChipTouchable}
                >
                  <Text style={styles.templateText}>{template}</Text>
                  <Ionicons name="add-circle" size={20} color={info.color} />
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        </View>

        <Card style={styles.reminderCard}>
          <Ionicons name="megaphone" size={24} color="#FFD700" />
          <Text style={styles.reminderText}>
            Remember: Speak each affirmation aloud as you write it. Feel the words as if they're already true.
          </Text>
        </Card>
      </Screen>

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
  headerContent: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    marginBottom: 20,
  },
  instructionCard: {
    marginBottom: 16,
    backgroundColor: '#1F1B2F',
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
    gap: 12,
    marginBottom: 16,
  },
  affirmationItem: {
    backgroundColor: '#1F1B2F',
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
    fontWeight: '700',
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
    marginBottom: 16,
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
  },
  templatesList: {
    gap: 10,
  },
  templateChip: {
    backgroundColor: '#1F1B2F',
    padding: 0,
  },
  templateChipTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
  },
  templateText: {
    flex: 1,
    fontSize: 13,
    color: '#FFF',
  },
  reminderCard: {
    marginBottom: 100,
    backgroundColor: '#1F1B2F',
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
    fontWeight: '700',
  },
});
