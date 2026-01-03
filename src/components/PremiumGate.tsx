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
  const [showPlans, setShowPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const pricing = getSubscriptionPricing();

  useEffect(() => {
    if (visible) {
      setShowPlans(false);
      setSelectedPlan('yearly');
    }
  }, [visible]);

  const premiumHighlights = [
    'Unlimited affirmations and meditations',
    'Daily gratitude check-ins + streak tracking',
    'Vision boards and manifestation goals',
    'Exclusive challenges and community access',
  ];

  const trialSteps = [
    {
      icon: 'lock-closed',
      title: 'Today: Get instant access',
      description: 'All premium features are available right away.',
    },
    {
      icon: 'notifications',
      title: `Day ${pricing.trialDays - 2}: Trial reminder`,
      description: 'We will send a reminder so you can cancel anytime.',
    },
    {
      icon: 'star',
      title: `Day ${pricing.trialDays}: Trial ends`,
      description: `Your subscription starts after the ${pricing.trialDays}-day trial.`,
    },
  ];

  const handlePurchase = async (plan: 'monthly' | 'yearly') => {
    setIsPurchasing(true);
    try {
      // For now, use RevenueCat default offering
      // In production, you'd pass the specific offering ID
      const success = await purchasePremiumRevenueCat(plan);
      
      if (success) {
        Alert.alert('Success!', 'Welcome to Moonifest Premium!', [
          { text: 'OK', onPress: () => {
            onUpgrade();
            onClose();
          }}
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
          { text: 'OK', onPress: () => {
            onUpgrade();
            onClose();
          }}
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

  const ctaLabel = `Start my ${pricing.trialDays}-day free trial`;

  const summaryLine = selectedPlan === 'yearly'
    ? `Unlimited free access for ${pricing.trialDays} days, then ${pricing.yearlyPrice} per year (${pricing.yearlyPerMonth}/month).`
    : `Unlimited free access for ${pricing.trialDays} days, then ${pricing.monthlyPrice} per month.`;
  const planFootnote = selectedPlan === 'yearly'
    ? `${pricing.trialDays} days free, then ${pricing.yearlyPrice}/year.`
    : `${pricing.trialDays} days free, then ${pricing.monthlyPrice}/month.`;
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

            <Text style={styles.title}>How your free trial works</Text>
            <View style={styles.timeline}>
              <View style={styles.timelineLine} />
              {trialSteps.map((step, index) => (
                <View key={index} style={styles.timelineRow}>
                  <View style={styles.timelineIcon}>
                    <Ionicons name={step.icon as any} size={16} color={Theme.colors.textPrimary} />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>{step.title}</Text>
                    <Text style={styles.timelineText}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.trialSummary}>{summaryLine}</Text>
            {!showPlans && (
              <TouchableOpacity
                onPress={() => setShowPlans(true)}
                style={styles.viewPlansButton}
                accessibilityRole="button"
                accessibilityLabel="View all plans"
              >
                <Text style={styles.viewPlansText}>View all plans</Text>
              </TouchableOpacity>
            )}

            {showPlans && (
              <>
                <View style={styles.unlockHeader}>
                  <Text style={styles.unlockTitle}>Unlock the full {featureName} experience</Text>
                  {featureDescription ? (
                    <Text style={styles.unlockSubtitle}>{featureDescription}</Text>
                  ) : null}
                </View>

                <View style={styles.featuresList}>
                  {premiumHighlights.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name="checkmark" size={18} color={Theme.colors.success} />
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
                        <Text style={styles.saveBadgeText}>Save {pricing.yearlySavingsPercent}%</Text>
                      </View>
                    </View>
                    <View style={styles.planRow}>
                      <View style={styles.planText}>
                        <Text style={styles.planTitle}>Annual Plan</Text>
                        <Text style={styles.planPrice}>
                          {pricing.yearlyPrice} per year ({pricing.yearlyPerMonth}/month)
                        </Text>
                        <Text style={styles.planTrial}>Includes {pricing.trialDays}-day free trial</Text>
                      </View>
                      <Ionicons
                        name={selectedPlan === 'yearly' ? 'checkmark-circle' : 'ellipse-outline'}
                        size={22}
                        color={Theme.colors.accent}
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
                        <Text style={styles.planPrice}>{pricing.monthlyPrice}/month</Text>
                      </View>
                      <Ionicons
                        name={selectedPlan === 'monthly' ? 'checkmark-circle' : 'ellipse-outline'}
                        size={22}
                        color={Theme.colors.accent}
                      />
                    </View>
                  </TouchableOpacity>

                  <Text style={styles.planFootnote}>{planFootnote}</Text>
                </View>
              </>
            )}

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
                <Text style={styles.ctaText}>{ctaLabel}</Text>
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
    paddingTop: Theme.spacing.lg,
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
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  timeline: {
    position: 'relative',
    paddingLeft: 26,
    marginBottom: Theme.spacing.lg,
  },
  timelineLine: {
    position: 'absolute',
    top: 6,
    left: 12,
    bottom: 8,
    width: 2,
    backgroundColor: Theme.colors.border,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  timelineIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    marginBottom: 2,
  },
  timelineText: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
  },
  trialSummary: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  viewPlansButton: {
    alignSelf: 'center',
    marginBottom: Theme.spacing.lg,
  },
  viewPlansText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.accent,
  },
  unlockHeader: {
    marginBottom: Theme.spacing.md,
  },
  unlockTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  unlockSubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  featuresList: {
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.sm,
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
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET_MIN,
    marginBottom: Theme.spacing.sm,
  },
  ctaText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
    fontSize: 16,
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
  },
});




