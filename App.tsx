import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
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

// Initialize Sentry error tracking (wrapped in try-catch to prevent crashes)
try {
  initSentry();
} catch (error) {
  console.warn('Failed to initialize Sentry:', error);
}

function AppContent() {
  if (__DEV__) {
    console.log('✅ AppContent component starting...');
  }
  
  // Hooks must be called unconditionally at the top level
  const theme = useOldTheme();
  const isDark = theme.isDark;
  const colors = getColors(isDark);
  
  if (__DEV__) {
    console.log('✅ AppContent theme loaded, isDark:', isDark);
  }
  
  // Track app session for rating prompts
  useEffect(() => {
    if (__DEV__) {
      console.log('✅ AppContent useEffect running...');
    }
    try {
      trackAppSession();
    } catch (error) {
      console.error('Error in trackAppSession:', error);
    }
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
      <OfflineIndicator />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  if (__DEV__) {
    console.log('✅ App component rendering...');
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
                    <AppContent />
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
