import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { ToolsScreenProps } from '../types/navigation';

type ToolItem = {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress?: () => void;
};

export default function ToolsScreen({ navigation }: ToolsScreenProps) {
  const tools: ToolItem[] = [
    {
      title: 'Manifestation Guide',
      description: 'Chat with your AI guide',
      icon: 'chatbubbles',
      color: '#FFD700',
      onPress: () => navigation.navigate('ChatbotScreen'),
    },
    {
      title: 'Vision Board',
      description: 'Create your digital vision board',
      icon: 'images',
      color: '#FF6B9D',
      onPress: () => navigation.navigate('MainTabs', { screen: 'Vision' }),
    },
    {
      title: 'Meditation Library',
      description: 'Guided meditations & frequencies',
      icon: 'headset',
      color: '#8B7DD8',
    },
    {
      title: 'Affirmation Templates',
      description: 'Pre-written powerful affirmations',
      icon: 'text',
      color: '#4ECDC4',
    },
    {
      title: 'Manifestation Tracker',
      description: 'Track your manifestations',
      icon: 'sparkles',
      color: '#FFD700',
    },
    {
      title: 'Community',
      description: 'Connect with fellow manifestors',
      icon: 'people',
      color: '#FF6B35',
      onPress: () => navigation.navigate('CommunityScreen'),
    },
    {
      title: 'Settings',
      description: 'Customize your experience',
      icon: 'settings',
      color: '#AAA',
      onPress: () => navigation.navigate('SettingsScreen'),
    },
  ];

  return (
    <Screen style={styles.container}>
      <AppHeader
        title="Tools"
        subtitle="Everything you need to manifest"
        leftIcon={{
          name: 'chevron-back',
          onPress: () => navigation.goBack(),
          accessibilityLabel: 'Go back',
        }}
      />
      <FlatList
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        data={tools}
        numColumns={2}
        keyExtractor={(item) => item.title}
        columnWrapperStyle={styles.toolsRow}
        contentContainerStyle={styles.toolsGrid}
        renderItem={({ item: tool }) => (
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => {
              tool.onPress?.();
            }}
          >
            <View style={[styles.toolIcon, { backgroundColor: tool.color + '20' }]}>
              <Ionicons name={tool.icon as any} size={32} color={tool.color} />
            </View>
            <Text style={styles.toolTitle}>{tool.title}</Text>
            <Text style={styles.toolDescription}>{tool.description}</Text>
            {!tool.onPress && (
              <Text style={styles.comingSoon}>Coming Soon</Text>
            )}
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#8B7DD8" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Premium Features</Text>
              <Text style={styles.infoText}>
                Unlock unlimited meditations, vision boards, and community access with Moonifest Premium
              </Text>
            </View>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  toolsGrid: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  toolsRow: {
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
  },
  toolCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    minHeight: 180,
    ...Theme.shadow.medium,
  },
  toolIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  toolTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  toolDescription: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  comingSoon: {
    ...Theme.typography.small,
    color: Theme.colors.gold,
    marginTop: Theme.spacing.xs,
    fontStyle: 'italic',
  },
  infoCard: {
    margin: Theme.spacing.lg,
    marginTop: 0,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.accent + '40',
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  infoText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
});
