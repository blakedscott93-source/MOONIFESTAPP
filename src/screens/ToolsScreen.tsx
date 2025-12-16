import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ToolsScreen({ navigation }: any) {
  const tools = [
    {
      title: 'Manifestation Guide',
      description: 'Chat with your AI guide',
      icon: 'chatbubbles',
      color: '#FFD700',
      screen: 'ChatbotScreen',
    },
    {
      title: 'Vision Board',
      description: 'Create your digital vision board',
      icon: 'images',
      color: '#FF6B9D',
      screen: null, // Coming soon
    },
    {
      title: 'Meditation Library',
      description: 'Guided meditations & frequencies',
      icon: 'headset',
      color: '#8B7DD8',
      screen: null,
    },
    {
      title: 'Affirmation Templates',
      description: 'Pre-written powerful affirmations',
      icon: 'text',
      color: '#4ECDC4',
      screen: null,
    },
    {
      title: 'Manifestation Tracker',
      description: 'Track your manifestations',
      icon: 'sparkles',
      color: '#FFD700',
      screen: null,
    },
    {
      title: 'Community',
      description: 'Connect with fellow manifestors',
      icon: 'people',
      color: '#FF6B35',
      screen: null,
    },
    {
      title: 'Settings',
      description: 'Customize your experience',
      icon: 'settings',
      color: '#AAA',
      screen: null,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Moonifest Tools</Text>
        <Text style={styles.subtitle}>Everything you need to manifest</Text>
      </View>

      <View style={styles.toolsGrid}>
        {tools.map((tool, index) => (
          <TouchableOpacity
            key={index}
            style={styles.toolCard}
            onPress={() => {
              if (tool.screen) {
                navigation.navigate(tool.screen);
              } else {
                // Coming soon
              }
            }}
          >
            <View style={[styles.toolIcon, { backgroundColor: tool.color + '20' }]}>
              <Ionicons name={tool.icon as any} size={32} color={tool.color} />
            </View>
            <Text style={styles.toolTitle}>{tool.title}</Text>
            <Text style={styles.toolDescription}>{tool.description}</Text>
            {!tool.screen && (
              <Text style={styles.comingSoon}>Coming Soon</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color="#8B7DD8" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Premium Features</Text>
          <Text style={styles.infoText}>
            Unlock unlimited meditations, vision boards, and community access with Moonifest Premium
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0B1F',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#8B7DD8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7DD8',
  },
  toolsGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  toolCard: {
    width: '47%',
    backgroundColor: '#1F1B2F',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 180,
  },
  toolIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  toolDescription: {
    fontSize: 12,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 18,
  },
  comingSoon: {
    fontSize: 10,
    color: '#FFD700',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#1F1B2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8B7DD8',
    flexDirection: 'row',
    gap: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#AAA',
    lineHeight: 20,
  },
});
