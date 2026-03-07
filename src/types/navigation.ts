import { NavigatorScreenParams } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';

/**
 * Navigation Type Definitions
 *
 * This file defines all navigation types for the app.
 * Use these types instead of 'any' for better type safety.
 */

// ============================================================================
// Tab Navigator Params
// ============================================================================

export type MainTabParamList = {
  Today: { fromDailyVisionImage?: boolean; showTutorial?: boolean } | undefined;
  Affirmations: NavigatorScreenParams<AffirmationsStackParamList> | undefined;
  Journal: NavigatorScreenParams<JournalStackParamList> | undefined;
  '45 NOW': NavigatorScreenParams<FortyFiveHardStackParamList> | undefined;
  Vision: { fromDailyVisionImage?: boolean } | undefined;
};

// ============================================================================
// Stack Navigator Params
// ============================================================================

export type AffirmationsStackParamList = {
  AffirmationsMain: undefined;
  AffirmationPlayer: {
    session: {
      id: string;
      categoryId: string;
      title: string;
      subtitle?: string;
      duration: number;
      affirmations: string[];
    };
  };
  AffirmationLibrary: undefined;
};

export type JournalStackParamList = {
  JournalMain: undefined;
  Journal: undefined;
  VoiceJournal: undefined;
  JournalHistory: undefined;
};

export type FortyFiveHardStackParamList = {
  FortyFiveHardMain: undefined;
  AffirmationEntry: {
    period: 'morning' | 'afternoon' | 'evening';
  };
  NotificationSettings: undefined;
};

export type RootStackParamList = {
  OnboardingQuiz: undefined;
  OnboardingPaywall: { answers?: any; archetype?: string; userGenerated?: boolean } | undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ChatbotScreen: undefined;
  AchievementsScreen: undefined;
  SettingsScreen: undefined;
  AuthScreen: { nextScreen?: keyof RootStackParamList } | undefined;
  MeditationScreen: {
    meditation?: {
      id: string;
      title: string;
      description: string;
      duration: number;
      category: string;
      audioUrl?: string;
    };
  };
  TasksScreen: undefined;
  ProgressScreen: undefined;
  ToolsScreen: undefined;
  CommunityScreen: undefined;
  SavedAffirmationsScreen: undefined;
  HelpFAQScreen: undefined;
  MoodInsightsScreen: undefined;
  PrivacyPolicyScreen: undefined;
  TermsOfServiceScreen: undefined;
};

// ============================================================================
// Screen Props Types
// ============================================================================

// Main Tabs
export type TodayScreenProps = BottomTabScreenProps<MainTabParamList, 'Today'>;
export type AffirmationsTabProps = BottomTabScreenProps<MainTabParamList, 'Affirmations'>;
export type JournalTabProps = BottomTabScreenProps<MainTabParamList, 'Journal'>;
export type FortyFiveHardTabProps = BottomTabScreenProps<MainTabParamList, '45 NOW'>;
export type VisionTabProps = BottomTabScreenProps<MainTabParamList, 'Vision'>;

// Affirmations Stack
export type AffirmationsMainScreenProps = StackScreenProps<AffirmationsStackParamList, 'AffirmationsMain'>;
export type AffirmationPlayerScreenProps = StackScreenProps<AffirmationsStackParamList, 'AffirmationPlayer'>;
export type AffirmationLibraryScreenProps = StackScreenProps<AffirmationsStackParamList, 'AffirmationLibrary'>;

// Journal Stack
export type JournalMainScreenProps = StackScreenProps<JournalStackParamList, 'JournalMain'>;
export type JournalScreenProps = StackScreenProps<JournalStackParamList, 'Journal'>;
export type VoiceJournalScreenProps = StackScreenProps<JournalStackParamList, 'VoiceJournal'>;
export type JournalHistoryScreenProps = StackScreenProps<JournalStackParamList, 'JournalHistory'>;

// 45 NOW Stack
export type FortyFiveHardMainScreenProps = StackScreenProps<FortyFiveHardStackParamList, 'FortyFiveHardMain'>;
export type AffirmationEntryScreenProps = StackScreenProps<FortyFiveHardStackParamList, 'AffirmationEntry'>;
export type NotificationSettingsScreenProps = StackScreenProps<FortyFiveHardStackParamList, 'NotificationSettings'>;

// Root Stack (Modal Screens)
export type ChatbotScreenProps = StackScreenProps<RootStackParamList, 'ChatbotScreen'>;
export type AchievementsScreenProps = StackScreenProps<RootStackParamList, 'AchievementsScreen'>;
export type SettingsScreenProps = StackScreenProps<RootStackParamList, 'SettingsScreen'>;
export type AuthScreenProps = StackScreenProps<RootStackParamList, 'AuthScreen'>;
export type MeditationScreenProps = StackScreenProps<RootStackParamList, 'MeditationScreen'>;
export type TasksScreenProps = StackScreenProps<RootStackParamList, 'TasksScreen'>;
export type ProgressScreenProps = StackScreenProps<RootStackParamList, 'ProgressScreen'>;
export type ToolsScreenProps = StackScreenProps<RootStackParamList, 'ToolsScreen'>;
export type CommunityScreenProps = StackScreenProps<RootStackParamList, 'CommunityScreen'>;
export type SavedAffirmationsScreenProps = StackScreenProps<RootStackParamList, 'SavedAffirmationsScreen'>;
export type HelpFAQScreenProps = StackScreenProps<RootStackParamList, 'HelpFAQScreen'>;
export type MoodInsightsScreenProps = StackScreenProps<RootStackParamList, 'MoodInsightsScreen'>;
export type PrivacyPolicyScreenProps = StackScreenProps<RootStackParamList, 'PrivacyPolicyScreen'>;
export type TermsOfServiceScreenProps = StackScreenProps<RootStackParamList, 'TermsOfServiceScreen'>;

// ============================================================================
// Declare global types for useNavigation hook
// ============================================================================

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

