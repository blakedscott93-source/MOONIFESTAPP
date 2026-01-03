/**
 * Supabase Cloud Sync Utilities
 * 
 * Handles syncing app data to/from Supabase for cloud backup and multi-device sync
 */

import { getSupabaseClient, isSupabaseConfigured, Database } from '../config/supabase';
import { AppState } from '../types';
import { MoodEntry } from '../data/moodTracking';
import { GratitudeCheckIn } from '../utils/dayRollover';
import { Platform } from 'react-native';

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  
  try {
    const { data: { session } } = await client.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Get current user email (if signed in)
export async function getCurrentUserEmail(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: { user } } = await client.auth.getUser();
    return user?.email || null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

// Sign in via magic link (email OTP)
export async function signInWithEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not available' };
  }

  try {
    const options: { emailRedirectTo?: string } = {};
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
      options.emailRedirectTo = window.location.origin;
    }

    const { error } = await client.auth.signInWithOtp({
      email,
      options: Object.keys(options).length > 0 ? options : undefined,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error signing in with email:', error);
    return { success: false, error: 'Failed to send sign-in link' };
  }
}

export async function signOutFromSupabase(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
}

// Get current user ID
export async function getUserId(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    const { data: { user } } = await client.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

// Sync app state to Supabase
export async function syncAppStateToCloud(appState: AppState, glowPoints: number): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured, skipping sync');
    return false;
  }

  const client = getSupabaseClient();
  if (!client) return false;

  const userId = await getUserId();
  if (!userId) {
    console.warn('User not authenticated, cannot sync');
    return false;
  }

  try {
    const { error } = await client
      .from('user_data')
      .upsert({
        user_id: userId,
        app_state: appState,
        glow_points: glowPoints,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error syncing app state:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception syncing app state:', error);
    return false;
  }
}

// Load app state from Supabase
export async function loadAppStateFromCloud(): Promise<{
  appState: AppState | null;
  glowPoints: number;
} | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) return null;

  const userId = await getUserId();
  if (!userId) {
    return null;
  }

  try {
    const { data, error } = await client
      .from('user_data')
      .select('app_state, glow_points')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error loading app state:', error);
      return null;
    }

    return {
      appState: data?.app_state || null,
      glowPoints: data?.glow_points || 0,
    };
  } catch (error) {
    console.error('Exception loading app state:', error);
    return null;
  }
}

// Sync mood entries
export async function syncMoodEntriesToCloud(entries: MoodEntry[]): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const client = getSupabaseClient();
  if (!client) return false;

  const userId = await getUserId();
  if (!userId) return false;

  try {
    // Delete existing entries for this user
    await client
      .from('mood_entries')
      .delete()
      .eq('user_id', userId);

    // Insert new entries
    const entriesToSync = entries.map(entry => ({
      user_id: userId,
      mood: entry.mood,
      energy: entry.energy,
      note: entry.note,
      date: entry.date,
    }));

    if (entriesToSync.length > 0) {
      const { error } = await client
        .from('mood_entries')
        .insert(entriesToSync);

      if (error) {
        console.error('Error syncing mood entries:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Exception syncing mood entries:', error);
    return false;
  }
}

// Sync gratitude check-ins
export async function syncGratitudeCheckInsToCloud(checkIns: GratitudeCheckIn[]): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const client = getSupabaseClient();
  if (!client) return false;

  const userId = await getUserId();
  if (!userId) return false;

  try {
    // Delete existing check-ins for this user
    await client
      .from('gratitude_checkins')
      .delete()
      .eq('user_id', userId);

    // Insert new check-ins
    const checkInsToSync = checkIns.map(checkIn => ({
      user_id: userId,
      text: checkIn.text,
      date: checkIn.localDayKey, // Use localDayKey as date (YYYY-MM-DD format)
    }));

    if (checkInsToSync.length > 0) {
      const { error } = await client
        .from('gratitude_checkins')
        .insert(checkInsToSync);

      if (error) {
        console.error('Error syncing gratitude check-ins:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Exception syncing gratitude check-ins:', error);
    return false;
  }
}

// Full sync - sync all data to cloud
export async function syncAllDataToCloud(data: {
  appState: AppState;
  glowPoints: number;
  moodEntries: MoodEntry[];
  gratitudeCheckIns: GratitudeCheckIn[];
}): Promise<boolean> {
  try {
    const results = await Promise.allSettled([
      syncAppStateToCloud(data.appState, data.glowPoints),
      syncMoodEntriesToCloud(data.moodEntries),
      syncGratitudeCheckInsToCloud(data.gratitudeCheckIns),
    ]);

    const allSuccessful = results.every(result => 
      result.status === 'fulfilled' && result.value === true
    );

    if (allSuccessful) {
    } else {
      console.warn('Some data sync operations failed');
    }

    return allSuccessful;
  } catch (error) {
    console.error('Exception during full sync:', error);
    return false;
  }
}

