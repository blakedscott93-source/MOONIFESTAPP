import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import {
  getNotificationSettings,
  saveNotificationSettings,
  NotificationSettings,
  scheduleNotifications,
  cancelAllNotifications,
  areNotificationsSupported,
} from '../utils/notifications';

export default function NotificationSettingsScreen({ navigation }: any) {
  const notificationsSupported = areNotificationsSupported();
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    morningTime: '09:00',
    afternoonTime: '14:00',
    eveningTime: '20:00',
    affirmationFrequency: 3,
  });

  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showAfternoonPicker, setShowAfternoonPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await getNotificationSettings();
    setSettings(saved);
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
    console.log('✅ Notification settings saved');
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      // Re-enable notifications
      await saveSettings({ ...settings, enabled: true });
      Alert.alert(
        '🔔 Notifications Enabled',
        `You'll receive 3 daily journal reminders + ${settings.affirmationFrequency} affirmations to help you stay on track with your manifestation journey!`
      );
    } else {
      // Disable notifications
      await cancelAllNotifications();
      await saveSettings({ ...settings, enabled: false });
      Alert.alert(
        '🔕 Notifications Disabled',
        'You won\'t receive daily reminders. You can re-enable them anytime.'
      );
    }
  };

  const parseTime = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatTimeDisplay = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleTimeChange = (
    event: any,
    selectedDate: Date | undefined,
    type: 'morning' | 'afternoon' | 'evening'
  ) => {
    if (Platform.OS === 'android') {
      setShowMorningPicker(false);
      setShowAfternoonPicker(false);
      setShowEveningPicker(false);
    }

    if (selectedDate) {
      const timeStr = formatTime(selectedDate);
      const newSettings = {
        ...settings,
        [`${type}Time`]: timeStr,
      };
      saveSettings(newSettings as NotificationSettings);
    }
  };

  const renderTimePicker = (
    label: string,
    value: string,
    showPicker: boolean,
    setShowPicker: (show: boolean) => void,
    type: 'morning' | 'afternoon' | 'evening',
    icon: string,
    color: string
  ) => {
    return (
      <View style={styles.timePickerContainer}>
        <View style={styles.timePickerHeader}>
          <View style={styles.timePickerLabelContainer}>
            <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon as any} size={20} color={color} />
            </View>
            <View>
              <Text style={styles.timePickerLabel}>{label}</Text>
              <Text style={styles.timePickerSubtext}>Daily reminder</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.timeButton, !settings.enabled && styles.timeButtonDisabled]}
            onPress={() => settings.enabled && setShowPicker(true)}
            disabled={!settings.enabled}
            accessible={true}
            accessibilityLabel={`Change ${label} time`}
            accessibilityRole="button"
          >
            <Text style={[styles.timeButtonText, !settings.enabled && styles.timeButtonTextDisabled]}>
              {formatTimeDisplay(value)}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={settings.enabled ? Theme.colors.textSecondary : Theme.colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={parseTime(value)}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => handleTimeChange(event, date, type)}
          />
        )}
      </View>
    );
  };

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <View style={{ width: TOUCH_TARGET_MIN }} />
        </View>

        {/* Expo Go Warning Banner */}
        {!notificationsSupported && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#FF9500" />
            <View style={styles.warningBannerContent}>
              <Text style={styles.warningBannerTitle}>Notifications Unavailable</Text>
              <Text style={styles.warningBannerText}>
                Push notifications are not supported in Expo Go on Android. Create a development build to enable notifications.
              </Text>
            </View>
          </View>
        )}

        {/* Main Toggle Card */}
        <View style={[styles.card, !notificationsSupported && styles.cardDisabled]}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleLeft}>
              <View style={[styles.iconCircle, { backgroundColor: Theme.colors.accent + '20' }]}>
                <Ionicons name="notifications" size={24} color={notificationsSupported ? Theme.colors.accent : Theme.colors.textTertiary} />
              </View>
              <View>
                <Text style={[styles.toggleLabel, !notificationsSupported && styles.textDisabled]}>Daily Reminders</Text>
                <Text style={styles.toggleSubtext}>
                  {!notificationsSupported ? 'Not available in Expo Go' : settings.enabled ? '3 reminders per day' : 'Currently disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.enabled && notificationsSupported}
              onValueChange={toggleNotifications}
              trackColor={{ false: Theme.colors.border, true: Theme.colors.accent + '40' }}
              thumbColor={settings.enabled && notificationsSupported ? Theme.colors.accent : Theme.colors.surfaceSecondary}
              ios_backgroundColor={Theme.colors.border}
              disabled={!notificationsSupported}
            />
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={Theme.colors.accent} />
          <Text style={styles.infoBannerText}>
            Daily reminders help you stay consistent with your gratitude practice and build a lasting manifestation habit.
          </Text>
        </View>

        {/* Affirmation Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Affirmations</Text>
          <View style={styles.card}>
            <View style={styles.frequencyHeader}>
              <View style={styles.frequencyHeaderLeft}>
                <View style={[styles.iconCircle, { backgroundColor: Theme.colors.accent + '20' }]}>
                  <Ionicons name="sparkles" size={22} color={Theme.colors.accent} />
                </View>
                <View>
                  <Text style={styles.toggleLabel}>Affirmation Frequency</Text>
                  <Text style={styles.toggleSubtext}>Silent relaxation reminders</Text>
                </View>
              </View>
            </View>

            <View style={styles.frequencyOptions}>
              <TouchableOpacity
                style={[
                  styles.frequencyOption,
                  settings.affirmationFrequency === 3 && styles.frequencyOptionActive,
                  !settings.enabled && styles.frequencyOptionDisabled,
                ]}
                onPress={() => settings.enabled && saveSettings({ ...settings, affirmationFrequency: 3 })}
                disabled={!settings.enabled}
                accessible={true}
                accessibilityLabel="3 daily affirmations"
                accessibilityRole="button"
              >
                <Text style={[
                  styles.frequencyOptionNumber,
                  settings.affirmationFrequency === 3 && styles.frequencyOptionNumberActive,
                  !settings.enabled && styles.frequencyOptionTextDisabled,
                ]}>
                  3
                </Text>
                <Text style={[
                  styles.frequencyOptionLabel,
                  settings.affirmationFrequency === 3 && styles.frequencyOptionLabelActive,
                  !settings.enabled && styles.frequencyOptionTextDisabled,
                ]}>
                  Gentle
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.frequencyOption,
                  settings.affirmationFrequency === 6 && styles.frequencyOptionActive,
                  !settings.enabled && styles.frequencyOptionDisabled,
                ]}
                onPress={() => settings.enabled && saveSettings({ ...settings, affirmationFrequency: 6 })}
                disabled={!settings.enabled}
                accessible={true}
                accessibilityLabel="6 daily affirmations"
                accessibilityRole="button"
              >
                <Text style={[
                  styles.frequencyOptionNumber,
                  settings.affirmationFrequency === 6 && styles.frequencyOptionNumberActive,
                  !settings.enabled && styles.frequencyOptionTextDisabled,
                ]}>
                  6
                </Text>
                <Text style={[
                  styles.frequencyOptionLabel,
                  settings.affirmationFrequency === 6 && styles.frequencyOptionLabelActive,
                  !settings.enabled && styles.frequencyOptionTextDisabled,
                ]}>
                  Balanced
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.frequencyOption,
                  settings.affirmationFrequency === 9 && styles.frequencyOptionActive,
                  !settings.enabled && styles.frequencyOptionDisabled,
                ]}
                onPress={() => settings.enabled && saveSettings({ ...settings, affirmationFrequency: 9 })}
                disabled={!settings.enabled}
                accessible={true}
                accessibilityLabel="9 daily affirmations"
                accessibilityRole="button"
              >
                <Text style={[
                  styles.frequencyOptionNumber,
                  settings.affirmationFrequency === 9 && styles.frequencyOptionNumberActive,
                  !settings.enabled && styles.frequencyOptionTextDisabled,
                ]}>
                  9
                </Text>
                <Text style={[
                  styles.frequencyOptionLabel,
                  settings.affirmationFrequency === 9 && styles.frequencyOptionLabelActive,
                  !settings.enabled && styles.frequencyOptionTextDisabled,
                ]}>
                  Immersive
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.frequencyInfo, { marginTop: Theme.spacing.md }]}>
              <Text style={styles.frequencyInfoText}>
                {settings.affirmationFrequency === 3 && '✨ 3 peaceful affirmations spread throughout the day'}
                {settings.affirmationFrequency === 6 && '✨ 6 uplifting affirmations for consistent inspiration'}
                {settings.affirmationFrequency === 9 && '✨ 9 powerful affirmations for deep immersion'}
              </Text>
            </View>
          </View>
        </View>

        {/* Time Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Times</Text>
          <View style={styles.card}>
            {renderTimePicker(
              'Morning',
              settings.morningTime,
              showMorningPicker,
              setShowMorningPicker,
              'morning',
              'sunny',
              '#FFB800'
            )}
            <View style={styles.divider} />
            {renderTimePicker(
              'Afternoon',
              settings.afternoonTime,
              showAfternoonPicker,
              setShowAfternoonPicker,
              'afternoon',
              'partly-sunny',
              '#FF8C00'
            )}
            <View style={styles.divider} />
            {renderTimePicker(
              'Evening',
              settings.eveningTime,
              showEveningPicker,
              setShowEveningPicker,
              'evening',
              'moon',
              '#8B7DD8'
            )}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Success</Text>
          <View style={styles.card}>
            <View style={styles.tipItem}>
              <View style={[styles.tipDot, { backgroundColor: '#7FFF00' }]} />
              <Text style={styles.tipText}>
                Choose times when you're typically available and reflective
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={[styles.tipDot, { backgroundColor: '#00D9A3' }]} />
              <Text style={styles.tipText}>
                Morning reminders are great for setting daily intentions
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={[styles.tipDot, { backgroundColor: '#C77DFF' }]} />
              <Text style={styles.tipText}>
                Evening reflections help you appreciate the day's blessings
              </Text>
            </View>
          </View>
        </View>

        {/* Test Notification Button */}
        {settings.enabled && (
          <TouchableOpacity
            style={styles.testButton}
            onPress={async () => {
              await scheduleNotifications(settings);
              Alert.alert(
                '✅ Notifications Scheduled',
                `Your daily reminders are set for:\n\n🌅 Morning: ${formatTimeDisplay(settings.morningTime)}\n☀️ Afternoon: ${formatTimeDisplay(settings.afternoonTime)}\n🌙 Evening: ${formatTimeDisplay(settings.eveningTime)}\n\n✨ Plus ${settings.affirmationFrequency} daily affirmations throughout the day`
              );
            }}
            accessible={true}
            accessibilityLabel="Test notification settings"
            accessibilityRole="button"
          >
            <Ionicons name="checkmark-circle" size={20} color={Theme.colors.accent} />
            <Text style={styles.testButtonText}>Save & Apply Settings</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
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
    color: Theme.colors.textPrimary,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
    backgroundColor: '#FF950015',
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: '#FF950030',
  },
  warningBannerContent: {
    flex: 1,
  },
  warningBannerTitle: {
    ...Theme.typography.bodyBold,
    color: '#FF9500',
    marginBottom: Theme.spacing.xs,
  },
  warningBannerText: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  textDisabled: {
    color: Theme.colors.textTertiary,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.lg,
    ...Theme.shadow.medium,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs / 2,
  },
  toggleSubtext: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.accent + '10',
    padding: Theme.spacing.md,
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    borderRadius: Theme.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.accent,
  },
  infoBannerText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  section: {
    marginTop: Theme.spacing.xl,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  timePickerContainer: {
    paddingVertical: Theme.spacing.xs,
  },
  timePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timePickerLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    flex: 1,
  },
  timePickerLabel: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs / 2,
  },
  timePickerSubtext: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.md,
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
  },
  timeButtonDisabled: {
    opacity: 0.5,
  },
  timeButtonText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    fontSize: 16,
  },
  timeButtonTextDisabled: {
    color: Theme.colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  tipText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.accent + '15',
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.xl,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.accent + '30',
    minHeight: TOUCH_TARGET_MIN,
  },
  testButtonText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.accent,
    fontSize: 16,
  },
  frequencyHeader: {
    marginBottom: Theme.spacing.lg,
  },
  frequencyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  frequencyOption: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  frequencyOptionActive: {
    backgroundColor: Theme.colors.accent + '15',
    borderColor: Theme.colors.accent,
  },
  frequencyOptionDisabled: {
    opacity: 0.5,
  },
  frequencyOptionNumber: {
    ...Theme.typography.title,
    color: Theme.colors.textSecondary,
    fontSize: 32,
    marginBottom: Theme.spacing.xs,
  },
  frequencyOptionNumberActive: {
    color: Theme.colors.accent,
  },
  frequencyOptionLabel: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  frequencyOptionLabelActive: {
    color: Theme.colors.accent,
  },
  frequencyOptionTextDisabled: {
    color: Theme.colors.textTertiary,
  },
  frequencyInfo: {
    backgroundColor: Theme.colors.surfaceSecondary,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
  },
  frequencyInfoText: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
