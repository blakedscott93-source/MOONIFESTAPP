import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { ThemeProvider as OldThemeProvider, useTheme as useOldTheme } from './src/context/ThemeContext';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { ToastProvider } from './src/context/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';
import { getColors } from './src/utils/themeColors';
import { OfflineIndicator } from './src/components/OfflineIndicator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { WebPhoneWrapper } from './src/components/WebPhoneWrapper';
import { trackAppSession } from './src/utils/appRating';
import { initSentry } from './src/utils/sentry';

// Initialize Sentry error tracking
initSentry();

function AppContent() {
  // Track app session for rating prompts
  useEffect(() => {
    trackAppSession();
  }, []);
  const { isDark } = useOldTheme();
  const colors = getColors(isDark);

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
      <OfflineIndicator />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <OldThemeProvider>
          <ThemeProvider>
            <ToastProvider>
              <AppProvider>
                <WebPhoneWrapper>
                  <AppContent />
                </WebPhoneWrapper>
              </AppProvider>
            </ToastProvider>
          </ThemeProvider>
        </OldThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
