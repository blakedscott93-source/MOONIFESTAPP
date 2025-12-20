import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import { Screen } from '../components/Screen';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../utils/themeColors';
import { openSupportEmail } from '../utils/contactSupport';

export default function SettingsScreen({ navigation }: any) {
  const { themeMode, setThemeMode, isDark } = useTheme();
  const colors = getColors(isDark);

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: 'sunny' },
    { value: 'dark' as const, label: 'Dark', icon: 'moon' },
    { value: 'auto' as const, label: 'Auto (System)', icon: 'phone-portrait' },
  ];

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: 'color-palette',
          label: 'Theme',
          type: 'custom' as const,
          renderRight: () => (
            <View style={[styles.themeSelector, { backgroundColor: colors.surfaceSecondary }]}>
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.themeOption,
                    themeMode === option.value && [
                      styles.themeOptionActive,
                      { backgroundColor: colors.accent + '20', borderColor: colors.accent },
                    ],
                  ]}
                  onPress={() => setThemeMode(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={themeMode === option.value ? colors.accent : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.themeOptionText,
                      { color: themeMode === option.value ? colors.accent : colors.textSecondary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications',
          label: 'Notification Settings',
          type: 'navigate' as const,
          onPress: () => navigation.navigate('NotificationSettings'),
        },
      ],
    },
    {
      title: 'Progress & Achievements',
      items: [
        {
          icon: 'trophy',
          label: 'Achievements',
          type: 'navigate' as const,
          onPress: () => navigation.navigate('AchievementsScreen'),
        },
        {
          icon: 'analytics',
          label: 'Mood & Progress Insights',
          type: 'navigate' as const,
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
          type: 'navigate' as const,
          onPress: () => navigation.navigate('AffirmationLibrary'),
        },
        {
          icon: 'images',
          label: 'Vision Board',
          type: 'navigate' as const,
          onPress: () => navigation.navigate('VisionBoardScreen'),
        },
        {
          icon: 'bookmarks',
          label: 'Saved Affirmations',
          type: 'navigate' as const,
          onPress: () => navigation.navigate('SavedAffirmationsScreen'),
        },
      ],
    },
    {
      title: 'Account & Data',
      items: [
        {
          icon: 'cloud-upload',
          label: 'Backup & Sync',
          type: 'navigate' as const,
          onPress: () => {
            Alert.alert(
              'Backup & Sync',
              'Cloud backup and sync is coming soon! For now, you can export your data using the "Export My Data" option below.\n\nYour data is currently stored securely on your device.',
              [{ text: 'OK' }]
            );
          },
        },
        {
          icon: 'download',
          label: 'Export My Data',
          type: 'navigate' as const,
          onPress: async () => {
            try {
              const { shareExportedData, getDataSummary } = await import('../utils/dataExport');
              const summary = await getDataSummary();
              
              Alert.alert(
                'Export Your Data',
                `Export all your Moonifest data including:\n\n• ${summary.streak} day streak\n• ${summary.totalDays} total days\n• ${summary.glowPoints} glow points\n• ${summary.moodEntries} mood entries\n• ${summary.gratitudeCheckIns} gratitude check-ins\n• ${summary.visionBoardItems} vision board items\n• ${summary.achievements} achievements\n\nYour data will be exported as a JSON file.`,
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
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle',
          label: 'Help & FAQ',
          type: 'navigate' as const,
          onPress: () => navigation.navigate('HelpFAQScreen'),
        },
        {
          icon: 'mail',
          label: 'Contact Support',
          type: 'navigate' as const,
          onPress: async () => {
            await openSupportEmail();
          },
        },
        {
          icon: 'star',
          label: 'Rate the App',
          type: 'navigate' as const,
          onPress: async () => {
            try {
              const isAvailable = await StoreReview.isAvailableAsync();
              if (isAvailable) {
                await StoreReview.requestReview();
              } else {
                Alert.alert(
                  'Rate Moonifest',
                  'Thank you for using Moonifest! If you love the app, please leave us a review on the App Store or Play Store.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              Alert.alert(
                'Rate Moonifest',
                'Thank you for using Moonifest! Please leave us a review on the App Store or Play Store.',
                [{ text: 'OK' }]
              );
            }
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
          type: 'navigate' as const,
          onPress: () => navigation.navigate('PrivacyPolicyScreen'),
        },
        {
          icon: 'document-text',
          label: 'Terms of Service',
          type: 'navigate' as const,
          onPress: () => navigation.navigate('TermsOfServiceScreen'),
        },
      ],
    },
  ];

  return (
    <Screen style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
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

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  {item.type === 'custom' ? (
                    <View style={styles.settingItem}>
                      <View style={styles.settingLeft}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
                          <Ionicons name={item.icon as any} size={20} color={colors.accent} />
                        </View>
                        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                          {item.label}
                        </Text>
                      </View>
                      {item.renderRight && item.renderRight()}
                    </View>
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
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textTertiary }]}>
            Moonifest v1.0.0
          </Text>
          <Text style={[styles.versionText, { color: colors.textTertiary }]}>
            Made with love for manifestation
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  sectionTitle: {
    ...Theme.typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
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
