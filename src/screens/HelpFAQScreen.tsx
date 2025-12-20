import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { UnifiedCard } from '../components/UnifiedCard';
import { Theme } from '../utils/theme';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'features' | 'troubleshooting' | 'premium';
}

const FAQ_DATA: FAQItem[] = [
  // General
  {
    question: 'What is Moonifest?',
    answer: 'Moonifest is a comprehensive manifestation app that helps you practice gratitude, set goals, build positive habits, and manifest your dreams through daily affirmations, journaling, meditation, and structured challenges.',
    category: 'general',
  },
  {
    question: 'How does the 45 NOW Challenge work?',
    answer: 'The 45 NOW Challenge is a structured 45-day program where you complete 3 must-do tasks, 3 guided affirmation sessions, 1 meditation, and 3 gratitude check-ins every day. Completing all daily practices maintains your streak and helps build lasting positive habits.',
    category: 'general',
  },
  {
    question: 'What are Glow Points?',
    answer: 'Glow Points are rewards you earn by completing daily practices. You earn points for gratitude check-ins, affirmation sessions, meditations, and completing your daily goals. Accumulate points to unlock achievements and track your progress!',
    category: 'general',
  },
  // Features
  {
    question: 'How do I save affirmations?',
    answer: 'You can save affirmations from the Affirmation Library by tapping the bookmark icon on any affirmation. Your saved affirmations will appear in Settings > Saved Affirmations, where you can view, share, or remove them.',
    category: 'features',
  },
  {
    question: 'Can I record voice journals?',
    answer: 'Yes! Navigate to Journal > Voice Journal to record your thoughts. Hold the microphone button to record, and your voice will be transcribed to text automatically. You can edit the transcription before saving.',
    category: 'features',
  },
  {
    question: 'How do I track my mood?',
    answer: 'On the Today tab, tap the "How are you feeling?" card. Select your mood and energy level, and optionally add a note. Your mood history helps you see patterns and emotional trends over time.',
    category: 'features',
  },
  {
    question: 'What is the Daily Spin?',
    answer: 'The Daily Spin is a fun reward system where you can spin once per day to earn Glow Points, bonus rewards, or special surprises. It\'s located in the streak card on the Today tab.',
    category: 'features',
  },
  {
    question: 'How do I complete my daily practices?',
    answer: 'Your 4 daily practices are: 3 Must-Do Tasks (45 NOW tab), 3 Guided Affirmations (Affirmations tab), 1 Meditation (45 NOW tab), and 3 Gratitude Check-ins (Journal tab). Complete all 4 to finish your day and maintain your streak!',
    category: 'features',
  },
  // Troubleshooting
  {
    question: 'My streak reset incorrectly',
    answer: 'Streaks reset at midnight in your local timezone. If your streak reset unexpectedly, check that your device timezone is correct. You can also check your progress in the Achievements screen to see your completed days.',
    category: 'troubleshooting',
  },
  {
    question: 'How do I export my data?',
    answer: 'Go to Settings > Account & Data > Export My Data. This will create a JSON file with all your entries, progress, achievements, and settings. You can save this file for backup or transfer to another device.',
    category: 'troubleshooting',
  },
  {
    question: 'I\'m not receiving notifications',
    answer: 'Make sure notifications are enabled in your device settings and in the app (Settings > Notification Settings). Check that your notification times are set correctly and that your device is not in Do Not Disturb mode.',
    category: 'troubleshooting',
  },
  // Premium
  {
    question: 'What is Premium?',
    answer: 'Premium unlocks advanced features including the Community feature where you can share your journey, celebrate milestones, and support others. Premium also includes exclusive content and priority support.',
    category: 'premium',
  },
  {
    question: 'How do I upgrade to Premium?',
    answer: 'Premium features can be unlocked from the Community screen or when accessing premium content. Follow the prompts to upgrade. (Note: Premium subscription will be available in a future update)',
    category: 'premium',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'general', label: 'General', icon: 'information-circle' },
  { id: 'features', label: 'Features', icon: 'sparkles' },
  { id: 'troubleshooting', label: 'Help', icon: 'help-circle' },
  { id: 'premium', label: 'Premium', icon: 'star' },
] as const;

export default function HelpFAQScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = selectedCategory === 'all'
    ? FAQ_DATA
    : FAQ_DATA.filter(faq => faq.category === selectedCategory);

  const toggleExpand = (question: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(question)) {
      newExpanded.delete(question);
    } else {
      newExpanded.add(question);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <Screen>
      <AppHeader
        title="Help & FAQ"
        subtitle="Get answers to your questions"
        leftIcon={{
          name: 'chevron-back',
          onPress: () => navigation.goBack(),
        }}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={
                  selectedCategory === category.id
                    ? Theme.colors.accent
                    : Theme.colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ Items */}
        {filteredFAQs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="help-circle-outline" size={60} color={Theme.colors.textTertiary} />
            <Text style={styles.emptyText}>No FAQs found in this category</Text>
          </View>
        ) : (
          filteredFAQs.map((faq, index) => {
            const isExpanded = expandedItems.has(faq.question);
            return (
              <UnifiedCard key={index} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleExpand(faq.question)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestionContainer}>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={Theme.colors.accent}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </UnifiedCard>
            );
          })
        )}

        {/* Contact Support */}
        <UnifiedCard style={styles.contactCard}>
          <Ionicons name="mail-outline" size={32} color={Theme.colors.accent} />
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>
            Can't find what you're looking for? Contact our support team and we'll get back to you as soon as possible.
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => {
              // Navigate to contact or open email
              Alert.alert(
                'Contact Support',
                'For support, please email us at support@moonifest.app or use the Contact Support option in Settings.',
                [{ text: 'OK' }]
              );
            }}
          >
            <LinearGradient
              colors={[Theme.colors.accent, Theme.colors.accentDark]}
              style={styles.contactButtonGradient}
            >
              <Ionicons name="mail" size={20} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </LinearGradient>
          </TouchableOpacity>
        </UnifiedCard>

        <View style={{ height: Theme.spacing.xxxl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: Theme.spacing.xxxl,
  },
  categoryContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: Theme.spacing.xs,
    marginRight: Theme.spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: Theme.colors.accentSoft,
    borderColor: Theme.colors.accent,
  },
  categoryChipText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: Theme.colors.accent,
  },
  faqCard: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  faqQuestionContainer: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  faqQuestion: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    fontSize: 16,
  },
  faqAnswerContainer: {
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  faqAnswer: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xxxl * 2,
  },
  emptyText: {
    ...Theme.typography.body,
    color: Theme.colors.textTertiary,
    marginTop: Theme.spacing.md,
  },
  contactCard: {
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.xl,
    alignItems: 'center',
  },
  contactTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  contactText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Theme.spacing.lg,
  },
  contactButton: {
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    width: '100%',
    ...Theme.shadow.medium,
  },
  contactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  contactButtonText: {
    ...Theme.typography.bodyBold,
    color: '#FFFFFF',
  },
});

