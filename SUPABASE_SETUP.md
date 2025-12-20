# Supabase Setup Guide

## Overview

Supabase is now configured for cloud backup and sync. The configuration files are in place, but you'll need to complete the setup steps below.

## Setup Steps

### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project (or use your existing one)
3. Note your project URL and anon key from Settings > API

### 3. Set Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**: Add `.env` to `.gitignore` if not already there!

### 4. Database Schema

Run this SQL in your Supabase SQL editor:

```sql
-- User data table (stores app state and glow points)
CREATE TABLE IF NOT EXISTS user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  app_state JSONB NOT NULL DEFAULT '{}',
  glow_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood entries table
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

-- Gratitude check-ins table
CREATE TABLE IF NOT EXISTS gratitude_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gratitude_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own data)
CREATE POLICY "Users can view own data" ON user_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON user_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mood entries" ON mood_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries" ON mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries" ON mood_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries" ON mood_entries
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own gratitude checkins" ON gratitude_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gratitude checkins" ON gratitude_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gratitude checkins" ON gratitude_checkins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gratitude checkins" ON gratitude_checkins
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. Enable Authentication (Optional)

If you want users to sign in for multi-device sync:

1. Go to Authentication > Providers in Supabase
2. Enable email/password or social providers
3. Update `src/config/supabase.ts` to handle sign in/sign up

### 6. Test the Setup

The app will automatically detect if Supabase is configured. Check the console for:
- ✅ "Supabase client created successfully" - Setup is working
- ⚠️ "Supabase not configured" - Add your env variables

## Usage

### Sync Data to Cloud

```typescript
import { syncAllDataToCloud } from '../utils/supabaseSync';

await syncAllDataToCloud({
  appState,
  glowPoints,
  moodEntries,
  gratitudeCheckIns,
});
```

### Check if Configured

```typescript
import { isSupabaseConfigured } from '../config/supabase';

if (isSupabaseConfigured) {
  // Supabase is ready to use
}
```

## Next Steps

1. ✅ Configuration files created
2. ⏳ Install @supabase/supabase-js package
3. ⏳ Add environment variables
4. ⏳ Create database tables
5. ⏳ Integrate sync into Settings screen
6. ⏳ Add authentication UI (optional)

## Notes

- Data sync is currently **optional** - the app works fine without it
- All data is stored locally in AsyncStorage regardless of Supabase setup
- Supabase sync is for cloud backup and multi-device sync only
- Users can export their data manually anytime

