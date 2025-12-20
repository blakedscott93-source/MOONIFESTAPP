import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { UnifiedCard } from '../components/UnifiedCard';
import { Theme } from '../utils/theme';

export default function TermsOfServiceScreen({ navigation }: any) {
  return (
    <Screen>
      <AppHeader
        title="Terms of Service"
        subtitle="Terms and conditions"
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
        <UnifiedCard>
          <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionText}>
            By accessing and using Moonifest, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our app.
          </Text>

          <Text style={styles.sectionTitle}>2. Use License</Text>
          <Text style={styles.sectionText}>
            Permission is granted to temporarily use Moonifest for personal, non-commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
          </Text>
          <Text style={styles.bulletPoint}>• Modify or copy the app</Text>
          <Text style={styles.bulletPoint}>• Use the app for any commercial purpose</Text>
          <Text style={styles.bulletPoint}>• Attempt to reverse engineer the app</Text>
          <Text style={styles.bulletPoint}>• Remove any copyright or proprietary notations</Text>

          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.sectionText}>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </Text>

          <Text style={styles.sectionTitle}>4. User Content</Text>
          <Text style={styles.sectionText}>
            You retain ownership of all content you create within Moonifest, including journal entries, affirmations, and other personal data. By using the app, you grant us a license to store this data locally on your device.
          </Text>

          <Text style={styles.sectionTitle}>5. Prohibited Uses</Text>
          <Text style={styles.sectionText}>
            You may not use Moonifest:
          </Text>
          <Text style={styles.bulletPoint}>• In any way that violates any applicable law or regulation</Text>
          <Text style={styles.bulletPoint}>• To transmit any malicious code or viruses</Text>
          <Text style={styles.bulletPoint}>• To harass, abuse, or harm other users</Text>
          <Text style={styles.bulletPoint}>• To impersonate or attempt to impersonate others</Text>

          <Text style={styles.sectionTitle}>6. Premium Features</Text>
          <Text style={styles.sectionText}>
            Some features may require a premium subscription. Premium subscriptions are billed in advance and will automatically renew unless cancelled. You may cancel your subscription at any time through your device's subscription settings.
          </Text>

          <Text style={styles.sectionTitle}>7. Disclaimer</Text>
          <Text style={styles.sectionText}>
            Moonifest is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the app will be available at all times or that it will be error-free.
          </Text>

          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            In no event shall Moonifest or its developers be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or other intangible losses, resulting from your use of the app.
          </Text>

          <Text style={styles.sectionTitle}>9. Indemnification</Text>
          <Text style={styles.sectionText}>
            You agree to indemnify and hold harmless Moonifest and its developers from any claims, damages, losses, liabilities, and expenses arising out of your use of the app or violation of these Terms.
          </Text>

          <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
          <Text style={styles.sectionText}>
            We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by updating the "Last Updated" date. Your continued use of the app after such modifications constitutes acceptance of the updated terms.
          </Text>

          <Text style={styles.sectionTitle}>11. Termination</Text>
          <Text style={styles.sectionText}>
            We may terminate or suspend your access to Moonifest immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the app will cease immediately.
          </Text>

          <Text style={styles.sectionTitle}>12. Contact Information</Text>
          <Text style={styles.sectionText}>
            If you have any questions about these Terms of Service, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: support@moonifest.app</Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By using Moonifest, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </Text>
          </View>
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

