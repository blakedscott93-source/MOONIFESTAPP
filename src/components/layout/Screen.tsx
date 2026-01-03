/**
 * Screen Layout Component
 * Apple-clean screen wrapper with optional header and scroll
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/tokens';
import { IconButton } from '../ui/IconButton';
import { StarfieldBackground } from '../StarfieldBackground';

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
  refreshControl?: React.ReactElement<any>;
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
  const { theme, isDark } = useTheme();
  const paddingHorizontal = theme?.spacing?.lg ?? tokens.spacing.lg;
  const bgColor = theme?.colors?.bg ?? tokens.colors.bg;
  const textPrimary = theme?.colors?.textPrimary ?? tokens.colors.textPrimary;
  const textSecondary = theme?.colors?.textSecondary ?? tokens.colors.textSecondary;

  const content = (
    <View style={[styles.content, { paddingHorizontal }, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: bgColor }]}
      edges={['top', 'bottom']}
    >
      {/* Starfield background - adapts to light/dark mode */}
      <StarfieldBackground />
      {/* Optional Header */}
      {title && (
        <View style={headerStyle === 'compact' ? styles.compactHeader : styles.defaultHeader}>
          <View style={[styles.headerContent, headerStyle === 'compact' && { paddingHorizontal }]}>
            <View style={styles.headerTextBlock}>
              <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
              {subtitle && (
                <Text style={[styles.subtitle, { color: textSecondary }]}>
                  {subtitle}
                </Text>
              )}
            </View>
            {rightAction && (
              <IconButton
                icon={rightAction.icon as any}
                onPress={rightAction.onPress}
                accessibilityLabel={rightAction.label || 'Action'}
                variant="glass"
                iconSize={22}
              />
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
    backgroundColor: tokens.colors.bg,
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
  headerTextBlock: {
    flex: 1,
    flexShrink: 1,
    paddingRight: tokens.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: tokens.typography.title.fontFamily,
    letterSpacing: -0.3,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Sora_400Regular',
    letterSpacing: 0.1,
    lineHeight: 18,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 24,
  },
});

