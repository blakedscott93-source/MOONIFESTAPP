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
import SecureStorageAdapter from '../utils/secureStorage';

// Optional Supabase import - only used if package is installed
let createClient: any = null;
let SupabaseClient: any = null;

try {
  const supabaseModule = require('@supabase/supabase-js');
  createClient = supabaseModule.createClient;
  SupabaseClient = supabaseModule.SupabaseClient;
} catch (error) {
  // Supabase package not installed - will gracefully handle this
}

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
export function createSupabaseClient(): any {
  if (!isSupabaseConfigured || !createClient) {
    if (!createClient) {
      console.warn('@supabase/supabase-js package not installed. Install it with: npm install @supabase/supabase-js');
    } else {
      console.warn('Supabase not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file');
    }
    return null;
  }

  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: SecureStorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });

    return client;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
}

// Export singleton client instance
let supabaseClient: any = null;

export function getSupabaseClient(): any {
  if (!supabaseClient && isSupabaseConfigured) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}

// Database schema types (to be defined based on your schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          marketing_opt_in?: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          marketing_opt_in?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          marketing_opt_in?: boolean | null;
          updated_at?: string;
        };
      };
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

