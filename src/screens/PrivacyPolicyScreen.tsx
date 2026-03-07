import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { UnifiedCard } from '../components/UnifiedCard';
import { Theme } from '../utils/theme';
import { PrivacyPolicyScreenProps } from '../types/navigation';

export default function PrivacyPolicyScreen({ navigation }: PrivacyPolicyScreenProps) {
  return (
    <Screen>
      <AppHeader
        title="Privacy Policy"
        subtitle="How we protect your data"
        leftIcon={{
          name: 'chevron-back',
          onPress: () => navigation.goBack(),
        }}
      />
      <FlatList
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            <UnifiedCard>
              <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>

              <Text style={styles.sectionTitle}>1. Introduction</Text>
              <Text style={styles.sectionText}>
                Vortex ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
              </Text>

              <Text style={styles.sectionTitle}>2. Information We Collect</Text>
              <Text style={styles.sectionText}>
                We collect information that you provide directly to us, including:
              </Text>
              <Text style={styles.bulletPoint}>- Journal entries and gratitude check-ins</Text>
              <Text style={styles.bulletPoint}>- Mood tracking data</Text>
              <Text style={styles.bulletPoint}>- Affirmations and goals</Text>
              <Text style={styles.bulletPoint}>- Progress and achievement data</Text>
              <Text style={styles.bulletPoint}>- Vision board images</Text>
              <Text style={styles.sectionText}>
                All data is stored locally on your device using secure storage methods.
              </Text>

              <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
              <Text style={styles.sectionText}>
                We use the information we collect to:
              </Text>
              <Text style={styles.bulletPoint}>- Provide and maintain our services</Text>
              <Text style={styles.bulletPoint}>- Track your progress and streaks</Text>
              <Text style={styles.bulletPoint}>- Personalize your experience</Text>
              <Text style={styles.bulletPoint}>- Send you notifications (with your permission)</Text>
              <Text style={styles.bulletPoint}>- Improve our app and develop new features</Text>

              <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
              <Text style={styles.sectionText}>
                Your data is stored locally on your device using secure, encrypted storage. We do not transmit your personal journal entries, affirmations, or other sensitive data to external servers without your explicit consent.
              </Text>
              <Text style={styles.sectionText}>
                If you choose to use cloud backup features (when available), your data will be encrypted before transmission and stored securely.
              </Text>

              <Text style={styles.sectionTitle}>5. Data Sharing & Third-Party Services</Text>
              <Text style={styles.sectionText}>
                We do not sell your personal data. However, we use trusted third-party services to operate technical aspects of the app:
              </Text>
              <Text style={styles.bulletPoint}>- <Text style={{ fontWeight: 'bold' }}>RevenueCat:</Text> Used to process and manage subscriptions. They handle purchase history securely but do not have access to your journal entries.</Text>
              <Text style={styles.bulletPoint}>- <Text style={{ fontWeight: 'bold' }}>Sentry:</Text> Used for error tracking and crash reporting to verify app stability. This data is technical (stack traces, device type) and anonymized.</Text>
              <Text style={styles.sectionText}>
                We may disclose data if required by law or to protect our rights.
              </Text>

              <Text style={styles.sectionTitle}>6. Your Rights</Text>
              <Text style={styles.sectionText}>
                You have the right to:
              </Text>
              <Text style={styles.bulletPoint}>- Access your data at any time</Text>
              <Text style={styles.bulletPoint}>- Export your data (available in Settings)</Text>
              <Text style={styles.bulletPoint}>- Delete your account from Settings &gt; Account &amp; Data</Text>
              <Text style={styles.bulletPoint}>- Delete your data by uninstalling the app</Text>
              <Text style={styles.bulletPoint}>- Opt out of notifications</Text>

              <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
              <Text style={styles.sectionText}>
                Our app is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
              </Text>

              <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
              <Text style={styles.sectionText}>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </Text>

              <Text style={styles.sectionTitle}>9. Contact Us</Text>
              <Text style={styles.sectionText}>
                If you have any questions about this Privacy Policy, please contact us at:
              </Text>
              <Text style={styles.contactInfo}>Email: support@moonifest.app</Text>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  By using Vortex, you agree to the collection and use of information in accordance with this policy.
                </Text>
              </View>
            </UnifiedCard>

            <View style={{ height: Theme.spacing.xxxl }} />
          </>
        }
      />
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
  lastUpdated: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    marginBottom: Theme.spacing.lg,
    fontStyle: 'italic',
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.md,
  },
  sectionText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: Theme.spacing.sm,
  },
  bulletPoint: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
    marginLeft: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
  },
  contactInfo: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.accent,
    marginTop: Theme.spacing.sm,
  },
  footer: {
    marginTop: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  footerText: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});


