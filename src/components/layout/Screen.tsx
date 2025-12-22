/**
 * Screen Layout Component
 * Apple-clean screen wrapper with optional header and scroll
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

interface ScreenProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  rightAction?: {
    icon: string;
    onPress: () => void;
    label?: string;
  };
  scroll?: boolean;
  style?: ViewStyle;
  headerStyle?: 'default' | 'compact';
  refreshControl?: React.ReactElement<typeof RefreshControl>;
  contentContainerStyle?: ViewStyle;
}

/**
 * Screen component with optional header and scroll
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  title,
  subtitle,
  rightAction,
  scroll = false,
  style,
  headerStyle = 'compact',
  refreshControl,
  contentContainerStyle,
}) => {
  const { theme } = useTheme();

  const content = (
    <View style={[styles.content, { paddingHorizontal: theme.spacing[16] }, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
    >
      {/* Optional Header */}
      {title && (
        <View style={headerStyle === 'compact' ? styles.compactHeader : styles.defaultHeader}>
          <View style={[styles.headerContent, headerStyle === 'compact' && { paddingHorizontal: theme.spacing[16] }]}>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
              {subtitle && (
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  {subtitle}
                </Text>
              )}
            </View>
            {rightAction && (
              <TouchableOpacity
                onPress={rightAction.onPress}
                accessibilityLabel={rightAction.label || 'Action'}
                style={styles.rightAction}
              >
                <Ionicons name={rightAction.icon as any} size={22} color={theme.colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Content */}
      {scroll ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  compactHeader: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  defaultHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.65,
  },
  rightAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});

