/**
 * Premium Gate Component
 * Shows premium upsell when user tries to access premium features
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';

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
  const premiumFeatures = [
    'Unlimited access to all features',
    'Community support & connections',
    'Advanced analytics & insights',
    'Priority customer support',
    'Early access to new features',
    'Ad-free experience',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#C77DFF', '#9D4EDD']}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="star" size={40} color="#FFF" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Unlock Premium</Text>
              <Text style={styles.subtitle}>
                {featureName} is a premium feature
              </Text>
            </View>

            {/* Feature Description */}
            {featureDescription && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>{featureDescription}</Text>
              </View>
            )}

            {/* Premium Features List */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What you'll get:</Text>
              {premiumFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Theme.colors.accent}
                  />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Pricing Info */}
            <View style={styles.pricingContainer}>
              <Text style={styles.pricingTitle}>Moonifest Premium</Text>
              <Text style={styles.pricingAmount}>$9.99/month</Text>
              <Text style={styles.pricingSubtext}>or $79.99/year (save 33%)</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={onUpgrade}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#C77DFF', '#9D4EDD']}
                  style={styles.upgradeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
  },
  iconContainer: {
    marginBottom: Theme.spacing.md,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  descriptionContainer: {
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
  },
  description: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  featuresTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  featureText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
  pricingContainer: {
    backgroundColor: Theme.colors.surfaceSecondary,
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.xl,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  pricingTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  pricingAmount: {
    ...Theme.typography.h2,
    color: Theme.colors.accent,
    marginBottom: Theme.spacing.xs,
  },
  pricingSubtext: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },
  actions: {
    padding: Theme.spacing.xl,
    paddingTop: 0,
    gap: Theme.spacing.md,
  },
  upgradeButton: {
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadow.medium,
  },
  upgradeGradient: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET_MIN,
  },
  upgradeButtonText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET_MIN,
  },
  cancelButtonText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
});



