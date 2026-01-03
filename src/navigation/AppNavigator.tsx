import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { FloatingTabBar } from '../components/navigation/FloatingTabBar';
import { tokens } from '../theme/tokens';
import {
  MainTabParamList,
  RootStackParamList,
  AffirmationsStackParamList,
  JournalStackParamList,
  FortyFiveHardStackParamList,
} from '../types/navigation';

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
import TasksScreen from '../screens/TasksScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ToolsScreen from '../screens/ToolsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import SavedAffirmationsScreen from '../screens/SavedAffirmationsScreen';
import HelpFAQScreen from '../screens/HelpFAQScreen';
import MoodInsightsScreen from '../screens/MoodInsightsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createStackNavigator<RootStackParamList>();
const AffirmationsStackNav = createStackNavigator<AffirmationsStackParamList>();
const JournalStackNav = createStackNavigator<JournalStackParamList>();
const FortyFiveHardStackNav = createStackNavigator<FortyFiveHardStackParamList>();

// Stack navigator for Affirmations and its player screen
function AffirmationsStack() {
  return (
    <AffirmationsStackNav.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AffirmationsStackNav.Screen
        name="AffirmationsMain"
        component={AffirmationsScreen}
      />
      <AffirmationsStackNav.Screen
        name="AffirmationPlayer"
        component={AffirmationPlayerScreen}
      />
      <AffirmationsStackNav.Screen
        name="AffirmationLibrary"
        component={AffirmationLibraryScreen}
        options={{ headerShown: false }}
      />
    </AffirmationsStackNav.Navigator>
  );
}

// Stack navigator for Journal and its entry screen
function JournalStack() {
  return (
    <JournalStackNav.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: tokens.colors.bg,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: tokens.colors.primary,
        headerTitleStyle: {
          ...tokens.typography.h3,
          fontWeight: '600',
        },
        // Smooth transitions - fade + translate for premium feel
        transitionSpec: {
          open: {
            animation: 'spring',
            config: {
              stiffness: 1000,
              damping: 500,
              mass: 3,
              overshootClamping: true,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
            },
          },
          close: {
            animation: 'spring',
            config: {
              stiffness: 1000,
              damping: 500,
              mass: 3,
              overshootClamping: true,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
            },
          },
        },
        cardStyleInterpolator: ({ current, next, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.height * 0.1, 0],
                  }),
                },
                {
                  scale: next
                    ? next.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.95],
                      })
                    : 1,
                },
              ],
              opacity: current.progress.interpolate({
                inputRange: [0, 0.5, 0.9, 1],
                outputRange: [0, 0.25, 0.7, 1],
              }),
            },
            overlayStyle: {
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          };
        },
      }}
    >
      <JournalStackNav.Screen
        name="JournalMain"
        component={GratitudeJournalScreen}
        options={{ headerShown: false }}
      />
      <JournalStackNav.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          title: 'Write Entry',
          headerBackTitle: 'Back',
        }}
      />
      <JournalStackNav.Screen
        name="VoiceJournal"
        component={VoiceJournalScreen}
        options={{ 
          headerShown: false,
          presentation: 'modal', // Modal presentation for voice entry
        }}
      />
      <JournalStackNav.Screen
        name="JournalHistory"
        component={JournalHistoryScreen}
        options={{ headerShown: false }}
      />
    </JournalStackNav.Navigator>
  );
}

// Stack navigator for 45 NOW and its sub-screens
function FortyFiveHardStack() {
  return (
    <FortyFiveHardStackNav.Navigator
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
          fontFamily: tokens.typography.h3.fontFamily,
        },
      }}
    >
      <FortyFiveHardStackNav.Screen
        name="FortyFiveHardMain"
        component={FortyFiveHardScreen}
        options={{ headerShown: false }}
      />
      <FortyFiveHardStackNav.Screen
        name="AffirmationEntry"
        component={AffirmationEntryScreen}
        options={{
          title: '369 Method',
          headerBackTitle: 'Back',
        }}
      />
      <FortyFiveHardStackNav.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ headerShown: false }}
      />
    </FortyFiveHardStackNav.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: tokens.colors.bg,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: tokens.colors.textPrimary,
        headerTitleStyle: {
          ...tokens.typography.headline,
        },
        // Remove square background from tab bar - completely transparent
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 0,
          position: 'absolute',
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          // Ensure no visible container
          opacity: 1, // Keep visible for custom tab bar to render
        },
        tabBarBackground: () => null, // No background component
        tabBarItemStyle: {
          backgroundColor: 'transparent',
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
              size={size} 
              color={color} 
            />
          ),
          tabBarLabel: 'Today',
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
              size={size} 
              color={color} 
            />
          ),
          tabBarLabel: 'Affirm', // Shorter label for better spacing
          tabBarAccessibilityLabel: 'Affirmations', // Full label for screen readers
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
              size={size}
              color={color}
            />
          ),
          tabBarLabel: '45 NOW',
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
              size={size} 
              color={color} 
            />
          ),
          tabBarLabel: 'Journal',
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
              size={size}
              color={color}
            />
          ),
          tabBarLabel: 'Vision',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator - wraps tabs and allows modal screens
export default function AppNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen
        name="MainTabs"
        component={MainTabs}
      />
      <RootStack.Screen
        name="ChatbotScreen"
        component={ChatbotScreen}
        options={{
          presentation: 'modal',
          headerShown: false, // ChatbotScreen has its own custom header
        }}
      />
      <RootStack.Screen
        name="AchievementsScreen"
        component={AchievementsScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="MeditationScreen"
        component={MeditationScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name="TasksScreen"
        component={TasksScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name="ProgressScreen"
        component={ProgressScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name="ToolsScreen"
        component={ToolsScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name="CommunityScreen"
        component={CommunityScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name="SavedAffirmationsScreen"
        component={SavedAffirmationsScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="HelpFAQScreen"
        component={HelpFAQScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="MoodInsightsScreen"
        component={MoodInsightsScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="PrivacyPolicyScreen"
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="TermsOfServiceScreen"
        component={TermsOfServiceScreen}
        options={{ headerShown: false }}
      />
    </RootStack.Navigator>
  );
}
