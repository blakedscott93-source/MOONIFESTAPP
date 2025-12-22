/**
 * Data Export Utility
 * Exports all user data from AsyncStorage to JSON
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { AppState } from '../types';

export interface ExportedData {
  version: string;
  exportDate: string;
  appState: AppState;
  glowPoints: number;
  glowPointsHistory: any[];
  moodEntries: any[];
  gratitudeCheckIns: any[];
  visionBoardItems: any[];
  communityPosts: any[];
  notificationSettings: any;
  onboardingData: any;
  unlockedAchievements: any[];
}

/**
 * Export all user data to JSON
 */
export async function exportAllData(): Promise<string | null> {
  try {
    const data: ExportedData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      appState: JSON.parse(await AsyncStorage.getItem('appState') || '{}'),
      glowPoints: JSON.parse(await AsyncStorage.getItem('@glow_points') || '0'),
      glowPointsHistory: JSON.parse(await AsyncStorage.getItem('@glow_points_history') || '[]'),
      moodEntries: JSON.parse(await AsyncStorage.getItem('@mood_entries') || '[]'),
      gratitudeCheckIns: JSON.parse(await AsyncStorage.getItem('@gratitude_checkins') || '[]'),
      visionBoardItems: JSON.parse(await AsyncStorage.getItem('@vision_board_items') || '[]'),
      communityPosts: JSON.parse(await AsyncStorage.getItem('@community_posts') || '[]'),
      notificationSettings: JSON.parse(await AsyncStorage.getItem('@notification_settings') || '{}'),
      onboardingData: JSON.parse(await AsyncStorage.getItem('@onboarding_data') || '{}'),
      unlockedAchievements: JSON.parse(await AsyncStorage.getItem('@unlocked_achievements') || '[]'),
    };

    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `moonifest-export-${new Date().toISOString().split('T')[0]}.json`;
    const documentDir = (FileSystem as any).documentDirectory || '';
    const fileUri = `${documentDir}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: ((FileSystem as any).EncodingType?.UTF8 || 'utf8') as any,
    });

    return fileUri;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

/**
 * Share exported data file
 */
export async function shareExportedData(): Promise<boolean> {
  try {
    const fileUri = await exportAllData();
    if (!fileUri) {
      return false;
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        dialogTitle: 'Export Moonifest Data',
        mimeType: 'application/json',
      });
      return true;
    } else {
      // Fallback: return file path for user to manually share
      console.log('Sharing not available. File saved at:', fileUri);
      return false;
    }
  } catch (error) {
    console.error('Error sharing exported data:', error);
    return false;
  }
}

/**
 * Get data summary for preview
 */
export async function getDataSummary(): Promise<{
  streak: number;
  totalDays: number;
  glowPoints: number;
  moodEntries: number;
  gratitudeCheckIns: number;
  visionBoardItems: number;
  achievements: number;
}> {
  try {
    const appState: AppState = JSON.parse(await AsyncStorage.getItem('appState') || '{}');
    const glowPoints = JSON.parse(await AsyncStorage.getItem('@glow_points') || '0');
    const moodEntries = JSON.parse(await AsyncStorage.getItem('@mood_entries') || '[]');
    const gratitudeCheckIns = JSON.parse(await AsyncStorage.getItem('@gratitude_checkins') || '[]');
    const visionBoardItems = JSON.parse(await AsyncStorage.getItem('@vision_board_items') || '[]');
    const unlockedAchievements = JSON.parse(await AsyncStorage.getItem('@unlocked_achievements') || '[]');

    return {
      streak: appState.currentStreak || 0,
      totalDays: appState.totalDays || 0,
      glowPoints,
      moodEntries: moodEntries.length,
      gratitudeCheckIns: gratitudeCheckIns.length,
      visionBoardItems: visionBoardItems.length,
      achievements: unlockedAchievements.length,
    };
  } catch (error) {
    console.error('Error getting data summary:', error);
    return {
      streak: 0,
      totalDays: 0,
      glowPoints: 0,
      moodEntries: 0,
      gratitudeCheckIns: 0,
      visionBoardItems: 0,
      achievements: 0,
    };
  }
}

