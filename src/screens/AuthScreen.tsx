import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import { PulseBackground } from '../components/onboarding/PulseBackground';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { StyledModal } from '../components/StyledModal';
import { getTokens } from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase';
import {
  signInWithAppleIdToken,
  signInWithEmailPassword,
  deleteSupabaseAccount,
  signOutFromSupabase,
  signUpWithEmail,
} from '../utils/supabaseAuth';
import { AuthScreenProps } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthMode = 'signin' | 'signup';

interface ModalState {
  visible: boolean;
  title: string;
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
  onClose?: () => void;
}

export default function AuthScreen({ navigation, route }: AuthScreenProps) {
  const { isDark } = useTheme();
  const tokens = useMemo(() => getTokens(isDark), [isDark]);
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [marketingTouched, setMarketingTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal state for styled alerts
  const [modal, setModal] = useState<ModalState>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const showModal = (title: string, message: string, type: ModalState['type'] = 'error', onClose?: () => void) => {
    setModal({ visible: true, title, message, type, onClose });
  };

  const hideModal = () => {
    const callback = modal.onClose;
    setModal(prev => ({ ...prev, visible: false }));
    callback?.();
  };

  const supabaseReady = isSupabaseConfigured;
  const marketingPreference = marketingTouched ? marketingOptIn : undefined;

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    let isActive = true;
    client.auth.getUser().then(({ data }) => {
      if (isActive) {
        setCurrentEmail(data.user?.email || null);
      }
    });

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      setCurrentEmail(session?.user?.email || null);
    });

    return () => {
      isActive = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleEmailAuth = async () => {
    if (!supabaseReady) {
      showModal('Configuration Error', 'Add your Supabase URL and anon key in .env first.', 'error');
      return;
    }

    if (!email.trim() || !password.trim()) {
      showModal('Missing Info', 'Please enter your email and password.', 'warning');
      return;
    }

    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    const result = mode === 'signup'
      ? await signUpWithEmail(
        normalizedEmail,
        password.trim(),
        fullName.trim() || undefined,
        marketingPreference
      )
      : await signInWithEmailPassword(normalizedEmail, password.trim(), marketingPreference);

    setIsLoading(false);

    if (!result.success) {
      showModal('Sign In Failed', result.error || 'Please try again.', 'error');
      return;
    }

    // Success!
    if (mode === 'signin') {
      const nextScreen = route.params?.nextScreen;
      if (nextScreen) {
        navigation.replace(nextScreen);
      } else {
        navigation.goBack();
      }
    } else {
      // For sign up, check if we're actually signed in (auto-confirm enabled)
      // If we have a currentEmail, the auth listener picked up a session
      if (currentEmail) {
        const nextScreen = route.params?.nextScreen;
        if (nextScreen) {
          navigation.replace(nextScreen);
        } else {
          navigation.goBack();
        }
      } else {
        showModal(
          'Check Your Email',
          'We sent a confirmation link. Please verify your email to finish signing up.',
          'success',
          () => navigation.goBack()
        );
      }
    }
  };

  const handleAppleSignIn = async () => {
    if (appleLoading) return;
    if (!supabaseReady) {
      showModal('Configuration Error', 'Add your Supabase URL and anon key in .env first.', 'error');
      return;
    }

    if (!appleAvailable) {
      showModal('Not Available', 'Apple Sign In is only available on iOS devices.', 'info');
      return;
    }

    setAppleLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      if (!credential.identityToken) {
        showModal('Apple Sign In Failed', 'Missing identity token.', 'error');
        return;
      }

      const nameParts = [
        credential.fullName?.givenName,
        credential.fullName?.familyName,
      ].filter(Boolean);
      const appleFullName = nameParts.length > 0 ? nameParts.join(' ') : undefined;

      const result = await signInWithAppleIdToken(credential.identityToken, {
        fullName: appleFullName,
        email: credential.email || undefined,
        marketingOptIn: marketingPreference,
      });

      if (!result.success) {
        showModal('Apple Sign In Failed', result.error || 'Please try again.', 'error');
      } else {
        const nextScreen = route.params?.nextScreen;
        if (nextScreen) {
          navigation.replace(nextScreen);
        } else {
          navigation.goBack();
        }
      }
    } catch (error: any) {
      if (error?.code !== 'ERR_CANCELED') {
        showModal('Apple Sign In Failed', 'Please try again.', 'error');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleSignOut = async () => {
    const result = await signOutFromSupabase();
    if (!result.success) {
      showModal('Sign Out Failed', result.error || 'Please try again.', 'error');
    }
  };

  const handleDeleteAccount = () => {
    if (isDeleting) return;
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and cloud data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const result = await deleteSupabaseAccount();
            setIsDeleting(false);

            if (!result.success) {
              showModal('Delete Failed', result.error || 'Please try again.', 'error');
              return;
            }

            try {
              await AsyncStorage.clear();
            } catch {
              // Ignore local cleanup errors
            }

            showModal(
              'Account Deleted',
              'Your account has been permanently deleted.',
              'success',
              () => navigation.goBack()
            );
          },
        },
      ]
    );
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.colors.bg,
    },
    content: {
      paddingHorizontal: tokens.spacing.xl,
      paddingBottom: insets.bottom + tokens.spacing.xl,
      paddingTop: insets.top + tokens.spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: tokens.spacing.xl,
    },
    backButton: {
      alignSelf: 'flex-start',
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      marginBottom: tokens.spacing.md,
    },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 18,
      marginBottom: tokens.spacing.md,
    },
    title: {
      ...tokens.typography.title,
      color: tokens.colors.textPrimary,
      textAlign: 'center',
    },
    subtitle: {
      ...tokens.typography.body,
      color: tokens.colors.textSecondary,
      textAlign: 'center',
      marginTop: tokens.spacing.sm,
    },
    modeSwitch: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      padding: 4,
      borderRadius: 999,
      marginBottom: tokens.spacing.md,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    modeButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 999,
      alignItems: 'center',
    },
    modeButtonActive: {
      backgroundColor: '#FFFFFF',
      ...tokens.shadows.subtle,
    },
    modeText: {
      ...tokens.typography.bodyMedium,
      color: tokens.colors.textSecondary,
    },
    modeTextActive: {
      color: tokens.colors.textPrimary,
      fontWeight: '700',
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      borderRadius: tokens.radii.lg,
      padding: tokens.spacing.lg,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.7)',
      ...tokens.shadows.card,
    },
    fieldLabel: {
      ...tokens.typography.captionBold,
      color: tokens.colors.textSecondary,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: tokens.colors.border,
      backgroundColor: '#FFFFFF',
      borderRadius: tokens.radii.md,
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: 12,
      color: tokens.colors.textPrimary,
      marginBottom: tokens.spacing.md,
      ...tokens.typography.body,
    },
    passwordRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    passwordInput: {
      flex: 1,
      marginBottom: 0,
    },
    passwordToggle: {
      marginLeft: tokens.spacing.sm,
      padding: 10,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderWidth: 1,
      borderColor: tokens.colors.border,
    },
    marketingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: tokens.spacing.sm,
      marginBottom: tokens.spacing.lg,
    },
    marketingText: {
      ...tokens.typography.small,
      color: tokens.colors.textSecondary,
      flex: 1,
      marginRight: tokens.spacing.md,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: tokens.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: tokens.colors.border,
    },
    dividerText: {
      marginHorizontal: tokens.spacing.sm,
      color: tokens.colors.textTertiary,
      ...tokens.typography.caption,
    },
    appleButton: {
      width: '100%',
      height: 48,
      marginBottom: tokens.spacing.md,
    },
    footerText: {
      ...tokens.typography.caption,
      color: tokens.colors.textSecondary,
      textAlign: 'center',
      marginTop: tokens.spacing.lg,
    },
    footerLink: {
      color: tokens.colors.accent,
      fontWeight: '600',
    },
    statusCard: {
      marginTop: tokens.spacing.lg,
      padding: tokens.spacing.md,
      borderRadius: tokens.radii.md,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    statusTitle: {
      ...tokens.typography.bodyBold,
      color: tokens.colors.textPrimary,
      marginBottom: 4,
    },
    statusSubtitle: {
      ...tokens.typography.caption,
      color: tokens.colors.textSecondary,
      marginBottom: tokens.spacing.md,
    },
    deleteHint: {
      ...tokens.typography.caption,
      color: tokens.colors.textSecondary,
      marginTop: tokens.spacing.md,
      marginBottom: tokens.spacing.sm,
      textAlign: 'center',
    },
    deleteButton: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: tokens.radii.md,
      borderWidth: 1,
      borderColor: 'rgba(220, 38, 38, 0.4)',
      backgroundColor: 'rgba(220, 38, 38, 0.08)',
    },
    deleteButtonDisabled: {
      opacity: 0.6,
    },
    deleteButtonText: {
      ...tokens.typography.bodyBold,
      color: '#DC2626',
      fontWeight: '600',
    },
    infoBanner: {
      marginTop: tokens.spacing.md,
      padding: tokens.spacing.md,
      borderRadius: tokens.radii.md,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    infoBannerText: {
      ...tokens.typography.caption,
      color: tokens.colors.textSecondary,
      textAlign: 'center',
    },
  }), [tokens, insets.bottom]);

  return (
    <View style={styles.container}>
      <PulseBackground />
      <LinearGradient
        colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.85)']}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={tokens.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Image source={require('../../assets/icon-square.png')} style={styles.logo} />
            <Text style={styles.title}>Your Journey Begins</Text>
            <Text style={styles.subtitle}>
              Congratulations on taking the first step. Create your profile to secure your personalized manifestation plan.
            </Text>
          </View>

          <View style={styles.modeSwitch}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'signin' && styles.modeButtonActive]}
              onPress={() => setMode('signin')}
            >
              <Text style={[styles.modeText, mode === 'signin' && styles.modeTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'signup' && styles.modeButtonActive]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.modeText, mode === 'signup' && styles.modeTextActive]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {appleAvailable && (
              <>
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={12}
                  style={styles.appleButton}
                  onPress={handleAppleSignIn}
                />
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or use email</Text>
                  <View style={styles.dividerLine} />
                </View>
              </>
            )}

            {mode === 'signup' && (
              <>
                <Text style={styles.fieldLabel}>Full name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={tokens.colors.textTertiary}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  textContentType="name"
                />
              </>
            )}

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={tokens.colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />

            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Minimum 6 characters"
                placeholderTextColor={tokens.colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                textContentType="password"
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={tokens.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.marketingRow}>
              <Text style={styles.marketingText}>
                Email me product updates and manifesting tips.
              </Text>
              <Switch
                value={marketingOptIn}
                onValueChange={(value) => {
                  setMarketingTouched(true);
                  setMarketingOptIn(value);
                }}
                trackColor={{ true: tokens.colors.accent, false: tokens.colors.border }}
                thumbColor="#FFFFFF"
              />
            </View>

            <PrimaryButton
              title={mode === 'signup' ? 'Create account' : 'Sign in'}
              onPress={handleEmailAuth}
              loading={isLoading}
              disabled={isLoading || appleLoading}
            />

            {mode === 'signup' && (
              <Text style={styles.footerText}>
                By continuing, you agree to our{' '}
                <Text style={styles.footerLink} onPress={() => navigation.navigate('TermsOfServiceScreen')}>
                  Terms
                </Text>{' '}
                and{' '}
                <Text style={styles.footerLink} onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
                  Privacy Policy
                </Text>
                .
              </Text>
            )}
          </View>

          {!supabaseReady && (
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerText}>
                Supabase is not configured yet. Add EXPO_PUBLIC_SUPABASE_URL and
                EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.
              </Text>
            </View>
          )}

          {currentEmail && (
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>Signed in</Text>
              <Text style={styles.statusSubtitle}>{currentEmail}</Text>
              <PrimaryButton
                title="Sign out"
                variant="secondary"
                onPress={handleSignOut}
              />
              <Text style={styles.deleteHint}>
                Delete your account to remove your cloud data from Vortex.
              </Text>
              <TouchableOpacity
                style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#DC2626" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete account</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Styled Modal for alerts */}
      <StyledModal
        visible={modal.visible}
        onClose={hideModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </View>
  );
}
