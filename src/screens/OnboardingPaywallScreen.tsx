/**
 * Onboarding Paywall Screen
 * Shown to first-time users after initial app launch
 * This is the PRIMARY conversion point with highest ROI
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    Dimensions,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TOUCH_TARGET_MIN } from '../utils/theme';
import {
    purchasePremiumRevenueCat,
    restorePurchases,
    getSubscriptionPricing,
    isPremiumConfigured,
    usePremiumOfferings,
    findPackage,
    getTrialInfoForPackage,
} from '../utils/premium';
import { scheduleTrialNotifications } from '../utils/trialNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PurchasesPackage = any;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingPaywallScreenProps {
    navigation: any;
    route?: any;
}

export default function OnboardingPaywallScreen({ navigation, route }: OnboardingPaywallScreenProps) {
    const insets = useSafeAreaInsets();
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

    const isModal = route?.params?.fromSettings || false;

    const {
        packages,
        isConfigured,
        loading: offeringsLoading,
        hasOfferings,
        reload: reloadOfferings,
    } = usePremiumOfferings();
    const defaultPricing = getSubscriptionPricing();

    const getPackage = (type: 'ANNUAL' | 'MONTHLY') => {
        return findPackage(packages, type);
    };

    const annualPkg = getPackage('ANNUAL');
    const monthlyPkg = getPackage('MONTHLY');
    const annualTrialInfo = getTrialInfoForPackage(annualPkg);
    const monthlyTrialInfo = getTrialInfoForPackage(monthlyPkg);
    const selectedTrialInfo = selectedPlan === 'yearly' ? annualTrialInfo : monthlyTrialInfo;
    // Default to 7 days if trial info not available (matches Apple Connect configuration)
    const hasFreeTrial = selectedTrialInfo.hasFreeTrial || (!offeringsLoading && hasOfferings);
    const trialDays = selectedTrialInfo.trialDays > 0 ? selectedTrialInfo.trialDays : (hasFreeTrial ? 7 : 0);

    const yearlyPrice = annualPkg?.product.priceString || defaultPricing.yearlyPrice;
    const monthlyPrice = monthlyPkg?.product.priceString || defaultPricing.monthlyPrice;
    const annualMonthlyPrice = annualPkg
        ? (annualPkg.product.price / 12).toFixed(2)
        : defaultPricing.yearlyPerMonth;
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

    const markOnboardingComplete = async () => {
        await AsyncStorage.setItem('@hasSeenOnboardingPaywall', 'true');
    };

    const handlePurchase = async () => {
        setIsPurchasing(true);
        try {
            const success = await purchasePremiumRevenueCat(selectedPlan);

            if (success) {
                await markOnboardingComplete();
                // Schedule trial notifications immediately after successful trial start
                await scheduleTrialNotifications();

                Alert.alert('Welcome to Vortex Premium! 🌪️', 'Your journey begins now!', [
                    {
                        text: 'Let\'s Go!',
                        onPress: () => {
                            if (isModal) {
                                navigation.goBack();
                            } else {
                                navigation.replace('MainTabs', { showTutorial: true });
                            }
                        }
                    }
                ]);
            } else {
                // If cancelled or failed but no error thrown
                setIsPurchasing(false);
            }
        } catch (error: any) {
            if (error.userCancelled) {
                // Do nothing on cancel
            } else {
                Alert.alert('Purchase Failed', error.message || 'Please try again.', [{ text: 'OK' }]);
            }
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setIsRestoring(true);
        try {
            const restored = await restorePurchases();
            await markOnboardingComplete();

            if (restored) {
                Alert.alert('Welcome Back! 🌪️', 'Your premium access has been restored!', [
                    {
                        text: 'Continue',
                        onPress: () => {
                            if (isModal) {
                                navigation.goBack();
                            } else {
                                navigation.replace('MainTabs', { showTutorial: true });
                            }
                        }
                    }
                ]);
            } else {
                Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases.');
            }
        } catch {
            Alert.alert('Error', 'Failed to restore. Please try again.');
        } finally {
            setIsRestoring(false);
        }
    };

    const handleSkip = async () => {
        if (isModal) {
            navigation.goBack();
            return;
        }
        await markOnboardingComplete();
        navigation.replace('MainTabs', { showTutorial: true });
    };

    const storeLabel = Platform.OS === 'ios' ? 'App Store' : 'Play Store';
    const accountLabel = Platform.OS === 'ios' ? 'Apple ID' : 'Google Play account';
    const manageSubscriptionsUrl = Platform.OS === 'ios'
        ? 'https://apps.apple.com/account/subscriptions'
        : 'https://play.google.com/store/account/subscriptions';
    const standardEulaUrl = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

    const benefits = [
        { icon: 'sparkles', text: 'All affirmation & meditation sessions' },
        { icon: 'images', text: 'Unlimited vision board images' },
        { icon: 'checkmark-done-circle', text: 'Full 45 NOW challenge program' },
        { icon: 'analytics', text: 'Advanced mood & progress insights' },
        { icon: 'notifications-off', text: 'Ad-free experience' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient
                colors={['#7C3AED', '#9333EA', '#A855F7']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Close/Skip Button */}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    {isModal ? (
                        <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.8)" />
                    ) : (
                        <Text style={styles.skipText}>Skip</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.heroSection}>
                    <Text style={styles.emoji}>✨</Text>
                    <Text style={styles.title}>Unlock Your Full{'\n'}Manifestation Potential</Text>
                    <Text style={styles.subtitle}>
                        {hasFreeTrial
                            ? `Start your ${trialDays}-day free trial and transform your mindset`
                            : 'Transform your mindset with Vortex Premium'}
                    </Text>
                </View>

                {/* Benefits */}
                <View style={styles.benefitsCard}>
                    <Text style={styles.benefitsTitle}>Everything you need to manifest:</Text>
                    {benefits.map((benefit, index) => (
                        <View key={index} style={styles.benefitRow}>
                            <View style={styles.checkCircle}>
                                <Ionicons name="checkmark" size={14} color="#7C3AED" />
                            </View>
                            <Text style={styles.benefitText}>{benefit.text}</Text>
                        </View>
                    ))}
                </View>

                {/* Plan Selection */}
                <View style={styles.plansSection}>
                    {/* Yearly Plan - Recommended */}
                    <TouchableOpacity
                        style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}
                        onPress={() => setSelectedPlan('yearly')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.recommendedBadge}>
                            <Text style={styles.recommendedText}>BEST VALUE</Text>
                        </View>
                        <View style={styles.planContent}>
                            <View style={styles.planText}>
                                <Text style={[styles.planTitle, selectedPlan === 'yearly' ? styles.textDark : styles.textLight]}>
                                    Vortex Premium Annual
                                </Text>
                                <Text style={[styles.planPrice, selectedPlan === 'yearly' ? styles.textDarkSecondary : styles.textLightSecondary]}>{yearlyPrice}/year</Text>
                                <Text style={[styles.planMeta, selectedPlan === 'yearly' ? styles.textDarkSecondary : styles.textLightSecondary]}>
                                    12 months
                                </Text>
                                <Text style={styles.planSavings}>
                                    Just {annualMonthlyPriceLabel}/month. Save {savings}%.
                                </Text>
                            </View>
                            <Ionicons
                                name={selectedPlan === 'yearly' ? 'checkmark-circle' : 'ellipse-outline'}
                                size={24}
                                color={selectedPlan === 'yearly' ? '#7C3AED' : '#CBD5E1'}
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Monthly Plan */}
                    <TouchableOpacity
                        style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
                        onPress={() => setSelectedPlan('monthly')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.planContent}>
                            <View style={styles.planText}>
                                <Text style={[styles.planTitle, selectedPlan === 'monthly' ? styles.textDark : styles.textLight]}>
                                    Vortex Premium Monthly
                                </Text>
                                <Text style={[styles.planPrice, selectedPlan === 'monthly' ? styles.textDarkSecondary : styles.textLightSecondary]}>{monthlyPrice}/month</Text>
                                <Text style={[styles.planMeta, selectedPlan === 'monthly' ? styles.textDarkSecondary : styles.textLightSecondary]}>
                                    1 month
                                </Text>
                            </View>
                            <Ionicons
                                name={selectedPlan === 'monthly' ? 'checkmark-circle' : 'ellipse-outline'}
                                size={24}
                                color={selectedPlan === 'monthly' ? '#7C3AED' : '#CBD5E1'}
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Offerings Status */}
                {(offeringsLoading || offeringsMessage) && (
                    <View style={styles.offeringsStatus}>
                        {offeringsLoading ? (
                            <>
                                <ActivityIndicator color="#FFFFFF" />
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

                {/* CTA Button */}
                <TouchableOpacity
                    style={[styles.ctaButton, !canPurchase && styles.ctaButtonDisabled]}
                    onPress={handlePurchase}
                    disabled={!canPurchase}
                    activeOpacity={0.9}
                >
                    {isPurchasing ? (
                        <ActivityIndicator color="#7C3AED" />
                    ) : (
                        <>
                            <Text style={styles.ctaText}>
                                {hasFreeTrial
                                    ? `Start ${trialDays}-Day Free Trial`
                                    : 'Subscribe Now'}
                            </Text>
                            <Text style={styles.ctaSubtext}>
                                {hasFreeTrial
                                    ? `Then ${selectedPlan === 'yearly' ? yearlyPrice + '/year' : monthlyPrice + '/month'}`
                                    : selectedPlan === 'yearly' ? yearlyPrice + '/year' : monthlyPrice + '/month'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Trial Info */}
                <View style={styles.trialInfo}>
                    <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.trialInfoText}>
                        Cancel anytime. Secure with {storeLabel}.
                    </Text>
                </View>

                {/* Restore */}
                <TouchableOpacity
                    style={styles.restoreButton}
                    onPress={handleRestore}
                    disabled={isPurchasing || isRestoring}
                >
                    {isRestoring ? (
                        <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                    ) : (
                        <Text style={styles.restoreText}>Restore Purchase</Text>
                    )}
                </TouchableOpacity>

                {/* Subscription Details */}
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

                {/* Social Proof */}
                <Text style={styles.socialProof}>
                    Join 10,000+ people transforming their lives.
                </Text>

                {/* Legal Links - Required for App Store Guideline 3.1.2 */}
                <View style={styles.legalLinks}>
                    <TouchableOpacity onPress={() => { void Linking.openURL(standardEulaUrl); }} accessibilityRole="link">
                        <Text style={styles.legalLinkText}>Standard EULA</Text>
                    </TouchableOpacity>
                    <Text style={styles.legalSeparator}>|</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicyScreen')} accessibilityRole="link">
                        <Text style={styles.legalLinkText}>Privacy Policy</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    textDark: {
        color: '#1C1B22',
    },
    textLight: {
        color: '#FFFFFF',
    },
    textDarkSecondary: {
        color: '#4B5563',
    },
    textLightSecondary: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    skipButton: {
        alignSelf: 'flex-end',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginTop: 8,
    },
    skipText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontWeight: '500',
    },
    heroSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 32,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 24,
    },
    benefitsCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        marginBottom: 24,
    },
    benefitsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1B22',
        marginBottom: 16,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F3E8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    benefitText: {
        fontSize: 15,
        color: '#374151',
        flex: 1,
    },
    plansSection: {
        width: '100%',
        gap: 12,
        marginBottom: 24,
    },
    planCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    planCardSelected: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#7C3AED',
    },
    recommendedBadge: {
        backgroundColor: '#7C3AED',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    recommendedText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    planContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    planText: {
        flex: 1,
    },
    planTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 2,
    },
    planPrice: {
        fontSize: 16,
        marginBottom: 2,
    },
    planMeta: {
        fontSize: 12,
        marginBottom: 2,
    },
    planSavings: {
        fontSize: 13,
        color: '#059669',
        fontWeight: '500',
    },
    offeringsStatus: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    offeringsStatusText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    ctaButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 32,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
        minHeight: TOUCH_TARGET_MIN + 20,
    },
    ctaButtonDisabled: {
        opacity: 0.6,
    },
    ctaText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#7C3AED',
    },
    ctaSubtext: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
    },
    trialInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    trialInfoText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
    },
    restoreButton: {
        paddingVertical: 12,
        marginBottom: 16,
    },
    restoreText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    subscriptionDetails: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    subscriptionTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    subscriptionText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 6,
    },
    manageLink: {
        color: '#FFFFFF',
        fontSize: 12,
        textDecorationLine: 'underline',
        marginTop: 4,
    },
    socialProof: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    legalLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    legalLinkText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    legalSeparator: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
});
