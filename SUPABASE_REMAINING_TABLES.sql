-- =====================================================
-- Supabase Database Schema - Remaining Tables
-- =====================================================
-- 
-- RUN THIS SQL IN YOUR SUPABASE SQL EDITOR
-- Dashboard: https://supabase.com/dashboard/project/yaasdwhgeppqceewgdiq
-- Go to: SQL Editor > New Query > Paste this script > Run
--
-- Note: The 'profiles' table has already been created
-- =====================================================

-- =====================================================
-- 1. User Data Table
-- Stores app state and glow points for each user
-- =====================================================
CREATE TABLE IF NOT EXISTS user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  app_state JSONB NOT NULL DEFAULT '{}',
  glow_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own data)
CREATE POLICY "Users can view own data" ON user_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON user_data
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 2. Mood Entries Table
-- Stores daily mood and energy tracking data
-- =====================================================
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood TEXT NOT NULL,
  energy TEXT NOT NULL,
  note TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security (RLS)
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own mood entries)
CREATE POLICY "Users can view own mood entries" ON mood_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries" ON mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries" ON mood_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries" ON mood_entries
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. Gratitude Check-ins Table
-- Stores daily gratitude journal entries
-- =====================================================
CREATE TABLE IF NOT EXISTS gratitude_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE gratitude_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own gratitude check-ins)
CREATE POLICY "Users can view own gratitude checkins" ON gratitude_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gratitude checkins" ON gratitude_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gratitude checkins" ON gratitude_checkins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gratitude checkins" ON gratitude_checkins
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify your tables were created correctly
-- =====================================================

-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'user_data', 'mood_entries', 'gratitude_checkins')
ORDER BY table_name;

-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'user_data', 'mood_entries', 'gratitude_checkins');

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'user_data', 'mood_entries', 'gratitude_checkins')
ORDER BY tablename, policyname;
