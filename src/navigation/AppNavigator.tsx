import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import AffirmationsScreen from '../screens/AffirmationsScreen';
import AffirmationPlayerScreen from '../screens/AffirmationPlayerScreen';
import AffirmationLibraryScreen from '../screens/AffirmationLibraryScreen';
import GratitudeJournalScreen from '../screens/GratitudeJournalScreen';
import JournalScreen from '../screens/JournalScreen';
import VoiceJournalScreen from '../screens/VoiceJournalScreen';
import JournalHistoryScreen from '../screens/JournalHistoryScreen';
import FortyFiveHardScreen from '../screens/FortyFiveHardScreen';
import AffirmationEntryScreen from '../screens/AffirmationEntryScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MeditationScreen from '../screens/MeditationScreen';
import VisionBoardScreen from '../screens/VisionBoardScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ToolsScreen from '../screens/ToolsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import SavedAffirmationsScreen from '../screens/SavedAffirmationsScreen';
import HelpFAQScreen from '../screens/HelpFAQScreen';
import MoodInsightsScreen from '../screens/MoodInsightsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for Affirmations and its player screen
function AffirmationsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="AffirmationsMain"
        component={AffirmationsScreen}
      />
      <Stack.Screen
        name="AffirmationPlayer"
        component={AffirmationPlayerScreen}
      />
      <Stack.Screen
        name="AffirmationLibrary"
        component={AffirmationLibraryScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Stack navigator for Journal and its entry screen
function JournalStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FAF8FF',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#C77DFF',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="JournalMain"
        component={GratitudeJournalScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          title: 'Write Entry',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="VoiceJournal"
        component={VoiceJournalScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="JournalHistory"
        component={JournalHistoryScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Stack navigator for 45 NOW and its sub-screens
function FortyFiveHardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FAF8FF',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#C77DFF',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="FortyFiveHardMain"
        component={FortyFiveHardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AffirmationEntry"
        component={AffirmationEntryScreen as any}
        options={{
          title: '369 Method',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'web' ? 10 : Math.max(insets.bottom, 8),
          paddingTop: Platform.OS === 'web' ? 10 : 8,
          height: Platform.OS === 'ios' 
            ? 88 
            : Platform.OS === 'web' 
            ? 70 
            : 60 + Math.max(insets.bottom, 8),
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
          // iOS blur effect simulation
          ...(Platform.OS === 'ios' && {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }),
          ...(Platform.OS === 'web' && {
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.05)',
          }),
        },
        tabBarActiveTintColor: '#C77DFF',
        tabBarInactiveTintColor: '#999',
        headerStyle: {
          backgroundColor: '#FAF8FF',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: Platform.OS === 'web' ? 0 : 2,
          marginBottom: Platform.OS === 'web' ? 0 : 0,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'web' ? 0 : 4,
          marginBottom: 0,
        },
        headerTintColor: '#3D1F5C',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Affirmations"
        component={AffirmationsStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "sparkles" : "sparkles-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "book" : "book-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="45 NOW"
        component={FortyFiveHardStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "checkmark-done-circle" : "checkmark-done-circle-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Vision"
        component={VisionBoardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "images" : "images-outline"}
              size={focused ? size + 2 : size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator - wraps tabs and allows modal screens
export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
      />
      <Stack.Screen
        name="ChatbotScreen"
        component={ChatbotScreen}
        options={{
          presentation: 'modal',
          headerShown: false, // ChatbotScreen has its own custom header
        }}
      />
      <Stack.Screen
        name="AchievementsScreen"
        component={AchievementsScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MeditationScreen"
        component={MeditationScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProgressScreen"
        component={ProgressScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ToolsScreen"
        component={ToolsScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CommunityScreen"
        component={CommunityScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SavedAffirmationsScreen"
        component={SavedAffirmationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HelpFAQScreen"
        component={HelpFAQScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MoodInsightsScreen"
        component={MoodInsightsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicyScreen"
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TermsOfServiceScreen"
        component={TermsOfServiceScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
