import React, { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { ThemeProvider as OldThemeProvider, useTheme as useOldTheme } from './src/context/ThemeContext';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { ToastProvider } from './src/context/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';
import { getColors } from './src/utils/themeColors';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { WebPhoneWrapper } from './src/components/WebPhoneWrapper';
import { trackAppSession } from './src/utils/appRating';
import { initializePremium } from './src/utils/premium';
import { useFonts, Sora_400Regular, Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';
import { AnimatedSplashScreen } from './src/components/AnimatedSplashScreen';

// Sentry import - do NOT call initSentry at module level
let initSentry: (() => void) | null = null;
try {
  // Only import Sentry on native platforms
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    const sentryModule = require('./src/utils/sentry');
    initSentry = sentryModule.initSentry;
  }
} catch (e) {
  // Sentry module failed to load - continue without it
  console.warn('Sentry module not available:', e);
}

function AppContent() {
  // Hooks must be called unconditionally at the top level
  const theme = useOldTheme();
  const isDark = theme.isDark;
  const colors = getColors(isDark);

  // Track app session for rating prompts
  useEffect(() => {
    try {
      trackAppSession();
    } catch (error) {
      console.error('Error in trackAppSession:', error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await initializePremium();
      } catch (error) {
        console.error('Error initializing premium:', error);
      }
    })();
  }, []);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.accent,
      background: colors.bg,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  const [showSplash, setShowSplash] = useState(true);
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  // Initialize Sentry AFTER React Native boots - inside useEffect
  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Initialize Sentry safely after app has started rendering
        if (initSentry && (Platform.OS === 'ios' || Platform.OS === 'android')) {
          initSentry();
        }
      } catch (error) {
        console.warn('Failed to initialize Sentry:', error);
      } finally {
        setIsBootstrapped(true);
      }
    };
    bootstrap();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  try {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <OldThemeProvider>
            <ThemeProvider>
              <ToastProvider>
                <AppProvider>
                  <WebPhoneWrapper>
                    {showSplash ? (
                      <AnimatedSplashScreen onAnimationFinish={() => setShowSplash(false)} />
                    ) : (
                      <AppContent />
                    )}
                  </WebPhoneWrapper>
                </AppProvider>
              </ToastProvider>
            </ThemeProvider>
          </OldThemeProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('❌ CRITICAL ERROR in App.tsx:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6F5FB' }}>
        <Text style={{ color: '#EF4444', fontSize: 18 }}>App failed to load. Check console.</Text>
      </View>
    );
  }
}
