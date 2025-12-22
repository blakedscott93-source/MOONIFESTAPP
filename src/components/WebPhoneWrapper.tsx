/**
 * Web Phone Wrapper
 * Constrains the app to phone dimensions when running on web
 * Makes it look like a native mobile app
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface WebPhoneWrapperProps {
  children: React.ReactNode;
}

export const WebPhoneWrapper: React.FC<WebPhoneWrapperProps> = ({ children }) => {
  // Only apply phone wrapper on web
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  useEffect(() => {
    // Inject styles to make it look more mobile-native
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        // Remove default margins/padding
        if (document.body) {
          document.body.style.margin = '0';
          document.body.style.padding = '0';
          document.body.style.overflow = 'hidden';
          document.body.style.backgroundColor = '#000000';
        }
        
        // Make html full height
        const html = document.documentElement;
        if (html) {
          html.style.height = '100%';
          html.style.width = '100%';
          html.style.margin = '0';
          html.style.padding = '0';
          html.style.overflow = 'hidden';
          html.style.overflowX = 'hidden';
          html.style.overflowY = 'hidden';
        }
      } catch (error) {
        console.warn('Error setting up web styles:', error);
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.phoneFrame}>
        <View style={styles.appContent}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...(Platform.select({
      web: {
        flex: 1,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      default: {
        flex: 1,
        width: '100%',
        height: '100%',
      },
    }) as any),
  },
  phoneFrame: {
    ...(Platform.select({
      web: {
        width: 375,
        minWidth: 320,
        maxWidth: '100vw',
        height: '100vh',
        maxHeight: 812,
        backgroundColor: '#000000',
        borderRadius: 0,
        overflow: 'hidden',
        position: 'relative',
      },
      default: {
        flex: 1,
        width: '100%',
        height: '100%',
      },
    }) as any),
  },
  appContent: {
    ...Platform.select({
      web: {
        width: '100%',
        height: '100%',
        backgroundColor: '#121212',
        overflow: 'hidden',
        position: 'relative',
      },
      default: {
        flex: 1,
        width: '100%',
        height: '100%',
      },
    }),
  },
});

