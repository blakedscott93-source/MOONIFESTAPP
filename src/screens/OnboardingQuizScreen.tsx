import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../utils/theme';

const { width } = Dimensions.get('window');

interface OnboardingData {
  primaryGoal: string;
  lifeAreas: string[];
  experience: string;
  dailyTime: string;
  biggestObstacle: string;
  manifestationStyle: string;
  name?: string;
}

const QUESTIONS = [
  {
    id: 'welcome',
    type: 'intro',
    title: 'Welcome to 45 NOW! ✨',
    subtitle: 'Let\'s personalize your manifestation journey',
    description: 'Answer a few quick questions so we can tailor the perfect experience for you.',
  },
  {
    id: 'primaryGoal',
    type: 'choice',
    title: 'What do you want to manifest most?',
    subtitle: 'Choose your #1 focus',
    options: [
      { value: 'wealth', label: 'Financial Abundance', icon: 'cash', color: '#FFD700' },
      { value: 'love', label: 'Love & Relationships', icon: 'heart', color: '#FF6B9D' },
      { value: 'health', label: 'Health & Wellness', icon: 'fitness', color: '#4ECDC4' },
      { value: 'career', label: 'Career Success', icon: 'briefcase', color: '#C77DFF' },
      { value: 'confidence', label: 'Self-Love & Confidence', icon: 'sparkles', color: '#FFA500' },
      { value: 'peace', label: 'Inner Peace & Clarity', icon: 'leaf', color: '#00D9A3' },
    ],
  },
  {
    id: 'lifeAreas',
    type: 'multi-choice',
    title: 'Which life areas do you want to improve?',
    subtitle: 'Select all that apply',
    options: [
      { value: 'career', label: 'Career & Wealth', icon: 'trending-up' },
      { value: 'relationships', label: 'Love & Relationships', icon: 'people' },
      { value: 'health', label: 'Health & Fitness', icon: 'fitness' },
      { value: 'confidence', label: 'Self-Love & Confidence', icon: 'heart' },
      { value: 'spirituality', label: 'Spirituality & Growth', icon: 'star' },
      { value: 'peace', label: 'Peace & Mindfulness', icon: 'leaf' },
    ],
  },
  {
    id: 'experience',
    type: 'choice',
    title: 'Have you practiced manifestation before?',
    subtitle: 'This helps us match your experience level',
    options: [
      { value: 'beginner', label: 'I\'m brand new to this', icon: 'sparkles', color: '#C77DFF' },
      { value: 'dabbled', label: 'I\'ve tried it a few times', icon: 'flower', color: '#FF6B9D' },
      { value: 'experienced', label: 'I practice regularly', icon: 'trophy', color: '#FFD700' },
    ],
  },
  {
    id: 'dailyTime',
    type: 'choice',
    title: 'How much time can you commit daily?',
    subtitle: 'Be honest - consistency beats duration',
    options: [
      { value: '5', label: '5 minutes', subtitle: 'Quick & Focused', icon: 'flash', color: '#4ECDC4' },
      { value: '10', label: '10 minutes', subtitle: 'Balanced Routine', icon: 'time', color: '#C77DFF' },
      { value: '15', label: '15 minutes', subtitle: 'Deep Practice', icon: 'rocket', color: '#FFD700' },
      { value: '20', label: '20+ minutes', subtitle: 'Full Immersion', icon: 'flame', color: '#FF6B9D' },
    ],
  },
  {
    id: 'biggestObstacle',
    type: 'choice',
    title: 'What\'s your biggest challenge?',
    subtitle: 'We\'ll help you overcome it',
    options: [
      { value: 'doubt', label: 'Self-doubt & negative thoughts', icon: 'cloud', color: '#999' },
      { value: 'focus', label: 'Staying focused & consistent', icon: 'eye-off', color: '#C77DFF' },
      { value: 'belief', label: 'Truly believing it\'s possible', icon: 'help-circle', color: '#4ECDC4' },
      { value: 'patience', label: 'Being patient with results', icon: 'hourglass', color: '#FFA500' },
      { value: 'clarity', label: 'Getting clear on what I want', icon: 'compass', color: '#00D9A3' },
    ],
  },
  {
    id: 'manifestationStyle',
    type: 'choice',
    title: 'How do you prefer to be guided?',
    subtitle: 'Your vibe, your way',
    options: [
      { value: 'spiritual', label: 'Spiritual & Soulful', subtitle: 'Universe, energy, alignment', icon: 'moon', color: '#C77DFF' },
      { value: 'practical', label: 'Practical & Grounded', subtitle: 'Psychology, action steps', icon: 'construct', color: '#4ECDC4' },
      { value: 'balanced', label: 'Balanced Approach', subtitle: 'Mix of both worlds', icon: 'infinite', color: '#00D9A3' },
    ],
  },
  {
    id: 'name',
    type: 'text',
    title: 'What should we call you?',
    subtitle: 'Optional - makes your experience personal',
    placeholder: 'Enter your name or nickname',
    skipButton: 'Skip for now',
  },
];

export default function OnboardingQuizScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingData>>({
    lifeAreas: [],
  });
  const [textInput, setTextInput] = useState('');

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleChoice = (value: string) => {
    if (currentQuestion.type === 'multi-choice') {
      const current = answers.lifeAreas || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers({ ...answers, lifeAreas: updated });
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value });
      handleNext();
    }
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleTextSubmit = () => {
    setAnswers({ ...answers, [currentQuestion.id]: textInput });
    handleNext();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      await AsyncStorage.setItem('@onboarding_data', JSON.stringify(answers));

      // Navigate to main app
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const isMultiChoiceValid = () => {
    if (currentQuestion.type === 'multi-choice') {
      return (answers.lifeAreas?.length || 0) > 0;
    }
    return true;
  };

  const renderIntro = () => (
    <View style={styles.introContainer}>
      <View style={styles.logoContainer}>
        <LinearGradient
          colors={['#C77DFF', '#9D4EDD']}
          style={styles.logoGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="sparkles" size={60} color="#FFF" />
        </LinearGradient>
      </View>

      <Text style={styles.introTitle}>{currentQuestion.title}</Text>
      <Text style={styles.introSubtitle}>{currentQuestion.subtitle}</Text>
      <Text style={styles.introDescription}>{currentQuestion.description}</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.8}>
        <LinearGradient
          colors={['#C77DFF', '#9D4EDD']}
          style={styles.primaryButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.primaryButtonText}>Let's Begin</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.featuresList}>
        {[
          { icon: 'checkmark-circle', text: 'Takes less than 2 minutes' },
          { icon: 'lock-closed', text: 'Your answers are private' },
          { icon: 'sparkles', text: 'Unlock personalized content' },
        ].map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name={feature.icon as any} size={20} color="#4ECDC4" />
            <Text style={styles.featureText}>{feature.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderChoice = () => (
    <View style={styles.choiceContainer}>
      <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
      <Text style={styles.questionSubtitle}>{currentQuestion.subtitle}</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.optionsScroll}>
        {currentQuestion.options?.map((option) => {
          const isSelected = currentQuestion.type === 'multi-choice'
            ? answers.lifeAreas?.includes(option.value)
            : answers[currentQuestion.id as keyof OnboardingData] === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => handleChoice(option.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: ('color' in option && option.color) ? option.color + '20' : '#F0F0F0' }]}>
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={('color' in option && option.color) ? option.color : Theme.colors.accent}
                />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {option.label}
                </Text>
                {'subtitle' in option && option.subtitle && (
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                )}
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={Theme.colors.accent} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {currentQuestion.type === 'multi-choice' && (
        <TouchableOpacity
          style={[styles.continueButton, !isMultiChoiceValid() && styles.continueButtonDisabled]}
          onPress={handleNext}
          disabled={!isMultiChoiceValid()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isMultiChoiceValid() ? ['#C77DFF', '#9D4EDD'] : ['#CCC', '#AAA']}
            style={styles.continueButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.continueButtonText}>
              Continue ({answers.lifeAreas?.length || 0} selected)
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderText = () => (
    <View style={styles.textContainer}>
      <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
      <Text style={styles.questionSubtitle}>{currentQuestion.subtitle}</Text>

      <TextInput
        style={styles.textInput}
        placeholder={currentQuestion.placeholder}
        placeholderTextColor="#999"
        value={textInput}
        onChangeText={setTextInput}
        autoFocus
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleTextSubmit} activeOpacity={0.8}>
        <LinearGradient
          colors={['#C77DFF', '#9D4EDD']}
          style={styles.primaryButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.primaryButtonText}>
            {currentStep === QUESTIONS.length - 1 ? 'Complete Setup' : 'Continue'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {currentQuestion.skipButton && (
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>{currentQuestion.skipButton}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      {currentStep > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentStep} of {QUESTIONS.length - 1}
          </Text>
        </View>
      )}

      {/* Back Button */}
      {currentStep > 0 && (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={Theme.colors.accent} />
        </TouchableOpacity>
      )}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentQuestion.type === 'intro' && renderIntro()}
        {(currentQuestion.type === 'choice' || currentQuestion.type === 'multi-choice') && renderChoice()}
        {currentQuestion.type === 'text' && renderText()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  progressContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C77DFF',
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Intro styles
  introContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C77DFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  introTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3D1F5C',
    marginBottom: 12,
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C77DFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  introDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featuresList: {
    marginTop: 30,
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 15,
    color: '#666',
  },
  // Choice styles
  choiceContainer: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3D1F5C',
    marginBottom: 8,
  },
  questionSubtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  optionsScroll: {
    flex: 1,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: '#C77DFF',
    backgroundColor: '#F5F0FF',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D1F5C',
  },
  optionLabelSelected: {
    color: '#C77DFF',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  // Text input styles
  textContainer: {
    flex: 1,
    paddingTop: 20,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#3D1F5C',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 24,
  },
  // Button styles
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#C77DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'underline',
  },
});
