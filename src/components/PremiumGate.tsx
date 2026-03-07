/**
 * Premium Gate Component
 * Shows premium upsell when user tries to access premium features
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import {
  purchasePremiumRevenueCat,
  restorePurchases,
  getSubscriptionPricing,
  usePremiumOfferings,
  findPackage,
  getTrialInfoForPackage,
} from '../utils/premium';

interface PremiumGateProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  featureName: string;
  featureDescription?: string;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  visible,
  onClose,
  onUpgrade,
  featureName,
  featureDescription,
}) => {
  const navigation = useNavigation<any>();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');

  const {
    packages,
    isConfigured,
    loading: offeringsLoading,
    hasOfferings,
    reload: reloadOfferings,
  } = usePremiumOfferings();

  // Default fallbacks while loading
  const defaultPricing = getSubscriptionPricing();

  const getPackage = (type: 'ANNUAL' | 'MONTHLY' | 'LIFETIME') => {
    return findPackage(packages, type);
  };

  const annualPkg = getPackage('ANNUAL');
  const monthlyPkg = getPackage('MONTHLY');
  const lifetimePkg = getPackage('LIFETIME');
  const annualTrialInfo = getTrialInfoForPackage(annualPkg);
  const monthlyTrialInfo = getTrialInfoForPackage(monthlyPkg);
  const selectedTrialInfo = selectedPlan === 'yearly'
    ? annualTrialInfo
    : selectedPlan === 'monthly'
      ? monthlyTrialInfo
      : { hasFreeTrial: false, trialDays: 0 };
  // Default to 7 days if trial info not available (matches Apple Connect configuration)
  const hasFreeTrial = selectedTrialInfo.hasFreeTrial || (!offeringsLoading && hasOfferings);
  const trialDays = selectedTrialInfo.trialDays > 0 ? selectedTrialInfo.trialDays : (hasFreeTrial ? 7 : 0);

  // Use real data if available, otherwise fallback
  const yearlyPrice = annualPkg?.product.priceString || defaultPricing.yearlyPrice;
  const monthlyPrice = monthlyPkg?.product.priceString || defaultPricing.monthlyPrice;
  const lifetimePrice = lifetimePkg?.product.priceString || "$299.99"; // Fallback

  // Calculate savings
  const annualMonthlyPrice = annualPkg ? (annualPkg.product.price / 12).toFixed(2) : defaultPricing.yearlyPerMonth;
  const annualMonthlyPriceLabel = annualPkg
    ? `${annualPkg.product.currencyCode ? `${annualPkg.product.currencyCode} ` : '$'}${annualMonthlyPrice}`
    : defaultPricing.yearlyPerMonth;
  const savings = annualPkg && monthlyPkg
    ? Math.round((1 - (annualPkg.product.price / (monthlyPkg.product.price * 12))) * 100)
    : defaultPricing.yearlySavingsPercent;
  const canPurchase = !isPurchasing && !isRestoring && !offeringsLoading && hasOfferings;
  const offeringsMessage = !hasOfferings
    ? (isConfigured
      ? 'Subscriptions are not available right now. Please try again.'
      : 'Purchases are not configured yet. Please try again later.')
    : null;

  useEffect(() => {
    if (visible) {
      setSelectedPlan('yearly');
    }
  }, [visible]);

  const premiumHighlights = [
    'Unlimited affirmations and meditations',
    'Daily gratitude check-ins + streak tracking',
    'Vision boards and manifestation goals',
    'Exclusive challenges and community access',
    'Remove all limits',
  ];

  const storeLabel = Platform.OS === 'ios' ? 'App Store' : 'Play Store';
  const accountLabel = Platform.OS === 'ios' ? 'Apple ID' : 'Google Play account';
  const manageSubscriptionsUrl = Platform.OS === 'ios'
    ? 'https://apps.apple.com/account/subscriptions'
    : 'https://play.google.com/store/account/subscriptions';

  const trialSteps = hasFreeTrial
    ? [
      {
        icon: 'lock-closed',
        title: `Today: Start your ${trialDays}-day free trial`,
        description: 'Unlock everything immediately.',
      },
      {
        icon: 'star',
        title: 'Cancel anytime',
        description: `Manage your subscription in the ${storeLabel}.`,
      },
    ]
    : [
      {
        icon: 'lock-closed',
        title: 'Get instant access',
        description: 'Unlock everything immediately.',
      },
      {
        icon: 'star',
        title: 'Cancel anytime',
        description: `Manage your subscription in the ${storeLabel}.`,
      },
    ];

  const handlePurchase = async (plan: 'monthly' | 'yearly' | 'lifetime') => {
    setIsPurchasing(true);
    try {
      // For now, use RevenueCat default offering
      // In production, you'd pass the specific offering ID
      const success = await purchasePremiumRevenueCat(plan);

      if (success) {
        Alert.alert('Success!', 'Welcome to Vortex Premium!', [
          {
            text: 'OK', onPress: () => {
              onUpgrade();
              onClose();
            }
          }
        ]);
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert(
          'Purchase Failed',
          error.message || 'Unable to complete purchase. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert('Success', 'Your purchases have been restored!', [
          {
            text: 'OK', onPress: () => {
              onUpgrade();
              onClose();
            }
          }
        ]);
      } else {
        Alert.alert('No Purchases Found', 'We couldn\'t find any purchases to restore.');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const ctaLabel = `Start Premium Journey`;

  const summaryLine = selectedPlan === 'yearly'
    ? `Unlimited access for ${yearlyPrice} per year (just ${annualMonthlyPriceLabel}/month).`
    : selectedPlan === 'monthly'
      ? `Unlimited access for ${monthlyPrice} per month.`
      : `One-time payment of ${lifetimePrice} for lifetime access.`;

  const planFootnote = selectedPlan === 'yearly'
    ? `Billed annually at ${yearlyPrice}. Cancel anytime.`
    : selectedPlan === 'monthly'
      ? `Billed monthly at ${monthlyPrice}. Cancel anytime.`
      : `One-time payment. No recurring fees.`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.closeRow}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Close premium"
              >
                <Ionicons name="close" size={18} color={Theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>Unlock Premium</Text>
            <Text style={styles.subtitle}>
              {hasFreeTrial
                ? `Start your ${trialDays}-day free trial today`
                : 'Get unlimited access to premium features'}
            </Text>

            <View style={styles.highlightsContainer}>
              {trialSteps.map((step, index) => (
                <View key={index} style={styles.highlightItem}>
                  <View style={styles.highlightIcon}>
                    <Ionicons name={step.icon as any} size={20} color={Theme.colors.accent} />
                  </View>
                  <View style={styles.highlightContent}>
                    <Text style={styles.highlightTitle}>{step.title}</Text>
                    <Text style={styles.highlightText}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.featuresList}>
              {premiumHighlights.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={18} color={Theme.colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.planStack}>
              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === 'yearly' && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan('yearly')}
                activeOpacity={0.8}
              >
                <View style={styles.planBadges}>
                  <Text style={styles.planBadgeText}>RECOMMENDED</Text>
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>Save {savings}%</Text>
                  </View>
                </View>
                <View style={styles.planRow}>
                  <View style={styles.planText}>
                    <Text style={styles.planTitle}>Vortex Premium Annual</Text>
                    <Text style={styles.planPrice}>
                      {yearlyPrice} per year
                    </Text>
                    <Text style={styles.planMeta}>12 months</Text>
                    <Text style={styles.planTrial}>Just {annualMonthlyPriceLabel}/month. Save {savings}%.</Text>
                  </View>
                  <Ionicons
                    name={selectedPlan === 'yearly' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={selectedPlan === 'yearly' ? Theme.colors.accent : Theme.colors.border}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === 'monthly' && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan('monthly')}
                activeOpacity={0.8}
              >
                <View style={styles.planRow}>
                  <View style={styles.planText}>
                    <Text style={styles.planTitle}>Vortex Premium Monthly</Text>
                    <Text style={styles.planPrice}>{monthlyPrice}/month</Text>
                    <Text style={styles.planMeta}>1 month</Text>
                  </View>
                  <Ionicons
                    name={selectedPlan === 'monthly' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={selectedPlan === 'monthly' ? Theme.colors.accent : Theme.colors.border}
                  />
                </View>
              </TouchableOpacity>

              <Text style={styles.planFootnote}>{planFootnote}</Text>
            </View>

            {(offeringsLoading || offeringsMessage) && (
              <View style={styles.offeringsStatus}>
                {offeringsLoading ? (
                  <>
                    <ActivityIndicator size="small" color={Theme.colors.textSecondary} />
                    <Text style={styles.offeringsStatusText}>Loading subscription options...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.offeringsStatusText}>{offeringsMessage}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={reloadOfferings}
                      disabled={isPurchasing || isRestoring}
                      accessibilityRole="button"
                      accessibilityLabel="Retry loading subscriptions"
                    >
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.ctaButton, !canPurchase && styles.ctaButtonDisabled]}
              onPress={() => handlePurchase(selectedPlan)}
              disabled={!canPurchase}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color={Theme.colors.textInverse} />
              ) : (
                <Text style={styles.ctaText}>
                  {selectedPlan === 'yearly'
                    ? (hasFreeTrial
                      ? `Start ${trialDays}-Day Free Trial - ${yearlyPrice}/year`
                      : `Subscribe - ${yearlyPrice}/year`)
                    : selectedPlan === 'monthly'
                      ? (hasFreeTrial
                        ? `Start ${trialDays}-Day Free Trial - ${monthlyPrice}/month`
                        : `Subscribe - ${monthlyPrice}/month`)
                      : `Get Lifetime Access - ${lifetimePrice}`}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.ctaSubtext}>
              Cancel anytime. Secure with {storeLabel}.
            </Text>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={isPurchasing || isRestoring}
              activeOpacity={0.7}
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color={Theme.colors.textSecondary} />
              ) : (
                <Text style={styles.restoreButtonText}>Restore purchase</Text>
              )}
            </TouchableOpacity>

            <View style={styles.subscriptionDetails}>
              <Text style={styles.subscriptionTitle}>Subscription details</Text>
              <Text style={styles.subscriptionText}>
                Vortex Premium is an auto-renewing subscription.
              </Text>
              <Text style={styles.subscriptionText}>
                Annual (12 months): {yearlyPrice}/year. Equivalent to {annualMonthlyPriceLabel}/month.
              </Text>
              <Text style={styles.subscriptionText}>
                Monthly (1 month): {monthlyPrice}/month.
              </Text>
              <Text style={styles.subscriptionText}>
                Payment will be charged to your {accountLabel} at confirmation of purchase.
              </Text>
              <Text style={styles.subscriptionText}>
                Subscription auto-renews unless canceled at least 24 hours before the end of the current period.
              </Text>
              <Text style={styles.subscriptionText}>
                Account will be charged for renewal within 24 hours prior to the end of the current period.
              </Text>
              {hasFreeTrial && trialDays > 0 && (
                <Text style={styles.subscriptionText}>
                  Free trial: {trialDays} days for eligible users. Unused portion is forfeited when you purchase.
                </Text>
              )}
              <TouchableOpacity onPress={() => { void Linking.openURL(manageSubscriptionsUrl); }} accessibilityRole="link">
                <Text style={styles.manageLink}>Manage subscription</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.legalLinks}>
              <TouchableOpacity onPress={() => navigation.navigate('TermsOfServiceScreen')} accessibilityRole="link">
                <Text style={styles.legalLinkText}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}>|</Text>
              <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicyScreen')} accessibilityRole="link">
                <Text style={styles.legalLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerNote}>
              Your subscription supports a small team empowering millions of people.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.xl,
    maxWidth: 400,
    width: '100%',
    maxHeight: '90%',
    ...Theme.shadow.large,
  },
  scrollContent: {
    padding: Theme.spacing.xl,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  closeRow: {
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.surfaceSecondary,
  },
  title: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 24,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    fontSize: 15,
  },
  highlightsContainer: {
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Theme.colors.accent}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: `${Theme.colors.accent}30`,
  },
  highlightContent: {
    flex: 1,
    paddingTop: 2,
  },
  highlightTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    marginBottom: 4,
    fontSize: 15,
    fontWeight: '600',
  },
  highlightText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  featuresList: {
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  featureText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
  planStack: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  planCard: {
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surfaceSecondary,
  },
  planCardSelected: {
    borderColor: Theme.colors.accent,
    backgroundColor: '#FFF3F8',
  },
  planBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  planBadgeText: {
    ...Theme.typography.caption,
    color: Theme.colors.textInverse,
    backgroundColor: Theme.colors.accent,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs / 2,
    borderRadius: Theme.radius.sm,
    overflow: 'hidden',
    letterSpacing: 0.4,
  },
  saveBadge: {
    backgroundColor: Theme.colors.success,
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs / 2,
  },
  saveBadgeText: {
    ...Theme.typography.small,
    color: Theme.colors.textInverse,
    fontWeight: '700',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
  },
  planText: {
    flex: 1,
  },
  planTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
  },
  planPrice: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  planMeta: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  planTrial: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    marginTop: 4,
  },
  planFootnote: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  offeringsStatus: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.md,
  },
  offeringsStatusText: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  retryButtonText: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: Theme.colors.success,
    borderRadius: Theme.radius.lg,
    paddingVertical: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET_MIN + 8,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
    ...Theme.shadow.medium,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  ctaSubtext: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  restoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  restoreButtonText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
  subscriptionDetails: {
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  subscriptionTitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  subscriptionText: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: Theme.spacing.xs,
  },
  manageLink: {
    ...Theme.typography.small,
    color: Theme.colors.accent,
    textDecorationLine: 'underline',
    marginTop: Theme.spacing.xs,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.md,
  },
  legalLinkText: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    ...Theme.typography.small,
    color: Theme.colors.textTertiary,
  },
  footerNote: {
    ...Theme.typography.small,
    color: Theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
});
