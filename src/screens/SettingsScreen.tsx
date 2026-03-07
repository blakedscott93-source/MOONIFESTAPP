import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import { Screen } from '../components/Screen';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../utils/themeColors';
import { openSupportEmail } from '../utils/contactSupport';
import { SettingsScreenProps } from '../types/navigation';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { PremiumGate } from '../components/PremiumGate';
import { isPremiumUser, restorePurchases } from '../utils/premium';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { SkeletonLoader, SkeletonCard } from '../components/SkeletonLoader';
import { useApp } from '../context/AppContext';

type SettingsItem =
  | {
    icon: string;
    label: string;
    type: 'navigate';
    onPress: () => void;
  }
  | {
    icon: string;
    label: string;
    type: 'custom';
    onPress: () => void;
    renderRight?: () => React.ReactNode;
  };

type SettingsSection = {
  title: string;
  items: SettingsItem[];
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  useScreenTracking('Settings');
  const { themeMode, setThemeMode, isDark } = useTheme();
  const { resetChallenge } = useApp();
  const colors = getColors(isDark);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);

  useFocusEffect(
    useCallback(() => {
      checkPremiumStatus();
    }, [])
  );

  const checkPremiumStatus = async () => {
    const premium = await isPremiumUser();
    setIsPremium(premium);
    setIsLoading(false);
  };

  const handleRestore = async () => {
    setIsLoading(true);
    const success = await restorePurchases();
    if (success) {
      setIsPremium(true);
      Alert.alert('Success', 'Premiums restored successfully!');
    } else {
      Alert.alert('Notice', 'No active subscriptions found to restore.');
    }
    setIsLoading(false);
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: 'sunny' },
    { value: 'dark' as const, label: 'Dark', icon: 'moon' },
    { value: 'auto' as const, label: 'Auto (System)', icon: 'phone-portrait' },
  ];

  const settingsSections: SettingsSection[] = [
    {
      title: 'Premium',
      items: [
        ...(isPremium ? [] : [{
          icon: 'sparkles',
          label: 'Unlock Premium',
          type: 'custom' as const,
          onPress: () => setShowPremiumGate(true),
          renderRight: () => (
            <View style={{ backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>UPGRADE</Text>
            </View>
          )
        }]),
        {
          icon: 'refresh',
          label: 'Restore Purchases',
          type: 'custom' as const,
          onPress: handleRestore,
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications',
          label: 'Notification Settings',
          type: 'navigate',
          onPress: () => navigation.navigate('MainTabs', { screen: '45 NOW', params: { screen: 'NotificationSettings' } }),
        },
      ],
    },
    {
      title: 'Progress & Achievements',
      items: [
        {
          icon: 'trophy',
          label: 'Achievements',
          type: 'navigate',
          onPress: () => navigation.navigate('AchievementsScreen'),
        },
        {
          icon: 'analytics',
          label: 'Mood & Progress Insights',
          type: 'navigate',
          onPress: () => navigation.navigate('MoodInsightsScreen'),
        },
      ],
    },
    {
      title: 'Content',
      items: [
        {
          icon: 'library',
          label: 'Affirmation Library',
          type: 'navigate',
          onPress: () => navigation.navigate('MainTabs', { screen: 'Affirmations', params: { screen: 'AffirmationLibrary' } }),
        },
        {
          icon: 'images',
          label: 'Vision Board',
          type: 'navigate',
          onPress: () => navigation.navigate('MainTabs', { screen: 'Vision' }),
        },
        {
          icon: 'bookmarks',
          label: 'Saved Affirmations',
          type: 'navigate',
          onPress: () => navigation.navigate('SavedAffirmationsScreen'),
        },
      ],
    },
    {
      title: 'Account & Data',
      items: [
        {
          icon: 'person-circle',
          label: 'Account & Cloud Sync',
          type: 'navigate',
          onPress: () => navigation.navigate('AuthScreen'),
        },
        {
          icon: 'download',
          label: 'Export My Data',
          type: 'navigate',
          onPress: async () => {
            try {
              const { shareExportedData, getDataSummary } = await import('../utils/dataExport');
              const summary = await getDataSummary();

              Alert.alert(
                'Export Your Data',
                `Export all your Vortex data including:\n\n- ${summary.streak} day streak\n- ${summary.totalDays} total days\n- ${summary.glowPoints} glow points\n- ${summary.moodEntries} mood entries\n- ${summary.gratitudeCheckIns} gratitude check-ins\n- ${summary.visionBoardItems} vision board items\n- ${summary.achievements} achievements\n\nYour data will be exported as a JSON file.`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Export',
                    onPress: async () => {
                      try {
                        const success = await shareExportedData();
                        if (success) {
                          Alert.alert('Success', 'Your data has been exported!');
                        } else {
                          Alert.alert('Export Complete', 'Your data file has been saved. You can share it from your device.');
                        }
                      } catch (error) {
                        Alert.alert('Error', 'Failed to export data. Please try again.');
                      }
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to load export options. Please try again.');
            }
          },
        },
        {
          icon: 'trash',
          label: 'Delete Account',
          type: 'custom' as const,
          onPress: () => navigation.navigate('AuthScreen'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle',
          label: 'Help & FAQ',
          type: 'navigate',
          onPress: () => navigation.navigate('HelpFAQScreen'),
        },
        {
          icon: 'mail',
          label: 'Contact Support',
          type: 'navigate',
          onPress: async () => {
            await openSupportEmail();
          },
        },
        {
          icon: 'star',
          label: 'Rate the App',
          type: 'navigate',
          onPress: async () => {
            try {
              const isAvailable = await StoreReview.isAvailableAsync();
              if (isAvailable) {
                await StoreReview.requestReview();
              } else {
                Alert.alert(
                  'Rate Vortex',
                  'Thank you for using Vortex! If you love the app, please leave us a review on the App Store or Play Store.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              Alert.alert(
                'Rate Vortex',
                'Thank you for using Vortex! Please leave us a review on the App Store or Play Store.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ],
    },
    {
      title: '45 NOW Challenge',
      items: [
        {
          icon: 'refresh-circle',
          label: 'Restart Challenge',
          type: 'custom' as const,
          onPress: () => {
            Alert.alert(
              'Restart 45 NOW Challenge?',
              'This will reset your streak, total days, and all daily progress. Your journal entries and vision board will be kept.\n\nAre you sure you want to start fresh?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Restart',
                  style: 'destructive',
                  onPress: async () => {
                    await resetChallenge();
                    Alert.alert('Challenge Reset', 'Your 45 NOW Challenge has been reset. Good luck on your new journey!');
                  },
                },
              ]
            );
          },
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          icon: 'document-text',
          label: 'Privacy Policy',
          type: 'navigate',
          onPress: () => navigation.navigate('PrivacyPolicyScreen'),
        },
        {
          icon: 'document-text',
          label: 'Terms of Service',
          type: 'navigate',
          onPress: () => navigation.navigate('TermsOfServiceScreen'),
        },
      ],
    },
  ];

  if (isLoading) {
    return (
      <Screen style={[styles.container, { backgroundColor: colors.bg }] as any}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={[]}
          renderItem={() => null}
          keyExtractor={(_, index) => `skeleton-${index}`}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <SkeletonLoader width={40} height={40} borderRadius={20} />
                <SkeletonLoader width={120} height={24} />
                <SkeletonLoader width={40} height={40} borderRadius={20} />
              </View>
              <SkeletonCard style={{ marginTop: 20 }} />
              <SkeletonCard style={{ marginTop: 20 }} />
              <SkeletonCard style={{ marginTop: 20 }} />
            </>
          }
        />
      </Screen>
    );
  }

  return (
    <Screen style={[styles.container, { backgroundColor: colors.bg }] as any}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={settingsSections}
        keyExtractor={(item) => item.title}
        renderItem={({ item: section, index: sectionIndex }) => (
          <View style={sectionIndex === 0 ? styles.firstSection : styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  {item.type === 'custom' ? (
                    <TouchableOpacity
                      style={styles.settingItem}
                      onPress={item.onPress}
                      activeOpacity={0.7}
                    >
                      <View style={styles.settingLeft}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
                          <Ionicons name={item.icon as any} size={20} color={colors.accent} />
                        </View>
                        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                          {item.label}
                        </Text>
                      </View>
                      {item.renderRight && item.renderRight()}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.settingItem}
                      onPress={item.onPress}
                      activeOpacity={0.7}
                    >
                      <View style={styles.settingLeft}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
                          <Ionicons name={item.icon as any} size={20} color={colors.accent} />
                        </View>
                        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                          {item.label}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                  {itemIndex < section.items.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
              <View style={{ width: TOUCH_TARGET_MIN }} />
            </View>
          </>
        }
        ListFooterComponent={
          <>
            {/* App Version */}
            <View style={styles.versionContainer}>
              <Text style={[styles.versionText, { color: colors.textTertiary }]}>
                Vortex v1.0.0
              </Text>
              <Text style={[styles.versionText, { color: colors.textTertiary }]}>
                Made with love for manifestation
              </Text>
            </View>

            <View style={{ height: 100 }} />
          </>
        }
      />
      <PremiumGate
        visible={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        onUpgrade={() => {
          checkPremiumStatus();
          setShowPremiumGate(false);
        }}
        featureName="Premium"
        featureDescription="Unlock all features and remove ads."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
  },
  backButton: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.radius.full,
  },
  headerTitle: {
    ...Theme.typography.h2,
  },
  section: {
    marginTop: Theme.spacing.xl,
  },
  firstSection: {
    marginTop: Theme.spacing.lg,
  },
  sectionTitle: {
    ...Theme.typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    ...Theme.shadow.subtle,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    minHeight: TOUCH_TARGET_MIN + Theme.spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  settingLabel: {
    ...Theme.typography.body,
    flex: 1,
  },
  divider: {
    height: 1,
    marginLeft: Theme.spacing.lg + 40 + Theme.spacing.md,
  },
  themeSelector: {
    flexDirection: 'row',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.xs,
    gap: Theme.spacing.xs,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.sm,
    gap: Theme.spacing.xs / 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    borderWidth: 1,
  },
  themeOptionText: {
    ...Theme.typography.small,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: Theme.spacing.xxxl,
    gap: Theme.spacing.xs,
  },
  versionText: {
    ...Theme.typography.small,
  },
});
