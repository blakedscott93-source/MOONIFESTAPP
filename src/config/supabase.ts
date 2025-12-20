/**
 * Supabase Configuration
 * 
 * This file sets up Supabase client for cloud backup, sync, and authentication.
 * 
 * To set up:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Get your project URL and anon key from Settings > API
 * 3. Add to your .env file:
 *    EXPO_PUBLIC_SUPABASE_URL=your-project-url
 *    EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 * 4. Install: npm install @supabase/supabase-js
 */

import { Platform } from 'react-native';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = !!(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('http')
);

/**
 * Create Supabase client
 * Uses AsyncStorage for session persistence on React Native
 */
export function createSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file');
    return null;
  }

  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });

    console.log('✅ Supabase client created successfully');
    return client;
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    return null;
  }
}

// Export singleton client instance
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseClient && isSupabaseConfigured) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}

// Database schema types (to be defined based on your schema)
export interface Database {
  public: {
    Tables: {
      user_data: {
        Row: {
          id: string;
          user_id: string;
          app_state: any;
          glow_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          app_state?: any;
          glow_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          app_state?: any;
          glow_points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      mood_entries: {
        Row: {
          id: string;
          user_id: string;
          mood: string;
          energy: string;
          note?: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood: string;
          energy: string;
          note?: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          mood?: string;
          energy?: string;
          note?: string;
          date?: string;
        };
      };
      gratitude_checkins: {
        Row: {
          id: string;
          user_id: string;
          text: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          text: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
        };
      };
    };
  };
}

