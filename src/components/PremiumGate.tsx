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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import {
  purchasePremiumRevenueCat,
  restorePurchases,
  getSubscriptionPricing,
  usePremiumOfferings,
  findPackage,
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
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');

  const { packages, isConfigured } = usePremiumOfferings();

  // Default fallbacks while loading
  const defaultPricing = getSubscriptionPricing();

  const getPackage = (type: 'ANNUAL' | 'MONTHLY' | 'LIFETIME') => {
    return findPackage(packages, type);
  };

  const annualPkg = getPackage('ANNUAL');
  const monthlyPkg = getPackage('MONTHLY');
  const lifetimePkg = getPackage('LIFETIME');

  // Use real data if available, otherwise fallback
  const yearlyPrice = annualPkg?.product.priceString || defaultPricing.yearlyPrice;
  const monthlyPrice = monthlyPkg?.product.priceString || defaultPricing.monthlyPrice;
  const lifetimePrice = lifetimePkg?.product.priceString || "$299.99"; // Fallback

  // Calculate savings
  const annualMonthlyPrice = annualPkg ? (annualPkg.product.price / 12).toFixed(2) : defaultPricing.yearlyPerMonth;
  const savings = annualPkg && monthlyPkg
    ? Math.round((1 - (annualPkg.product.price / (monthlyPkg.product.price * 12))) * 100)
    : defaultPricing.yearlySavingsPercent;

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

  const trialSteps = [
    {
      icon: 'lock-closed',
      title: 'Today: Get instant access',
      description: 'Unlock everything immediately.',
    },
    {
      icon: 'star',
      title: 'Premium for life',
      description: 'Choose the plan that fits your journey.',
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
    ? `Unlimited access for ${yearlyPrice} per year (just ${annualPkg?.product.currencyCode || '$'}${annualMonthlyPrice}/mo).`
    : selectedPlan === 'monthly'
      ? `Unlimited access for ${monthlyPrice} per month.`
      : `One-time payment of ${lifetimePrice} for lifetime access.`;

  const planFootnote = selectedPlan === 'yearly'
    ? `Billed annually at ${yearlyPrice}. Cancel anytime.`
    : selectedPlan === 'monthly'
      ? `Billed monthly at ${monthlyPrice}. Cancel anytime.`
      : `One-time payment. No recurring fees.`;

  const storeLabel = Platform.OS === 'ios' ? 'App Store' : 'Play Store';

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
            <Text style={styles.subtitle}>Start your 7-day free trial today</Text>

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
                    <Text style={styles.planTitle}>Annual Plan</Text>
                    <Text style={styles.planPrice}>
                      {yearlyPrice} per year
                    </Text>
                    <Text style={styles.planTrial}>Just {annualPkg?.product.currencyCode || '$'}${annualMonthlyPrice}/mo · Save {savings}%</Text>
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
                    <Text style={styles.planTitle}>Monthly Plan</Text>
                    <Text style={styles.planPrice}>{monthlyPrice}/month</Text>
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

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => handlePurchase(selectedPlan)}
              disabled={isPurchasing || isRestoring}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color={Theme.colors.textInverse} />
              ) : (
                <Text style={styles.ctaText}>
                  {selectedPlan === 'yearly' 
                    ? `Start 7-Day Free Trial - ${yearlyPrice}/year`
                    : selectedPlan === 'monthly'
                    ? `Start 7-Day Free Trial - ${monthlyPrice}/month`
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
  footerNote: {
    ...Theme.typography.small,
    color: Theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
});




