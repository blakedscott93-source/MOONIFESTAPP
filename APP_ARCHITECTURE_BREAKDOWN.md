# App Architecture Breakdown - Moonifest Mobile

**Generated:** For 7-day shipping sprint  
**Purpose:** Complete understanding of codebase structure, navigation, data models, and design system

---

## 1. APP ARCHITECTURE

### Framework & Core Stack
- **Framework:** React Native + Expo (~54.0.29)
- **React:** 19.1.0
- **Navigation:** 
  - `@react-navigation/bottom-tabs` (v7.8.12) - Bottom tab navigation
  - `@react-navigation/stack` (v7.6.12) - Stack navigation for modals/screens
  - `@react-navigation/native` (v7.1.25) - Core navigation
- **State Management:** React Context API
  - `AppContext` - Main app state (challenge progress, streaks, daily progress)
  - `ThemeContext` - Theme management (light/dark/auto)
  - `ToastContext` - Toast notifications
- **Styling:** StyleSheet (React Native) + Design tokens system
- **Animations:** 
  - `react-native-reanimated` (v4.2.1) - Advanced animations
  - `react-native` Animated API - Basic animations
- **Storage:** 
  - `@react-native-async-storage/async-storage` (v2.2.0) - Local persistence
  - Supabase (optional cloud sync) - Configured but optional

### Key Dependencies
- `expo-blur` - Glassmorphism effects (BlurView)
- `expo-linear-gradient` - Gradient backgrounds
- `react-native-safe-area-context` - Safe area handling
- `@expo/vector-icons` (Ionicons) - Icon library
- `expo-haptics` - Haptic feedback
- `@sentry/react-native` - Error tracking

---

## 2. TAB SCREEN LOCATIONS & NAVIGATION

### Tab Structure (Bottom Navigation)
**File:** `src/navigation/AppNavigator.tsx`

**Tabs (in order):**
1. **Today** → `HomeScreen` (`src/screens/HomeScreen.tsx`)
2. **Affirmations** → `AffirmationsStack` → `AffirmationsScreen` (`src/screens/AffirmationsScreen.tsx`)
3. **45 NOW** → `FortyFiveHardStack` → `FortyFiveHardScreen` (`src/screens/FortyFiveHardScreen.tsx`)
4. **Journal** → `JournalStack` → `GratitudeJournalScreen` (`src/screens/GratitudeJournalScreen.tsx`)
5. **Vision** → `VisionBoardScreen` (`src/screens/VisionBoardScreen.tsx`)

### Stack Navigators

**JournalStack** (`src/navigation/AppNavigator.tsx:62-104`)
- `JournalMain` → `GratitudeJournalScreen` (main list view)
- `Journal` → `JournalScreen` (write entry screen)
- `VoiceJournal` → `VoiceJournalScreen` (voice entry)
- `JournalHistory` → `JournalHistoryScreen` (history view)

**AffirmationsStack** (`src/navigation/AppNavigator.tsx:38-59`)
- `AffirmationsMain` → `AffirmationsScreen`
- `AffirmationPlayer` → `AffirmationPlayerScreen`
- `AffirmationLibrary` → `AffirmationLibraryScreen`

**FortyFiveHardStack** (`src/navigation/AppNavigator.tsx:107-144`)
- `FortyFiveHardMain` → `FortyFiveHardScreen`
- `AffirmationEntry` → `AffirmationEntryScreen`
- `NotificationSettings` → `NotificationSettingsScreen`

### Root Navigator
**File:** `src/navigation/AppNavigator.tsx:266-357`
- Wraps `MainTabs` with modal screens (Chatbot, Achievements, Settings, Meditation, Progress, Tools, Community, etc.)
- Uses `presentation: 'modal'` for some screens

---

## 3. CUSTOM FOOTER/TAB BAR IMPLEMENTATION

### Component Location
**File:** `src/components/navigation/FloatingTabBar.tsx`

### Key Features
- **Glass Pill Design:** Floating pill-shaped tab bar with frosted glass effect
- **Rainbow Border Ring:** Static rainbow gradient border (2.2px thickness)
- **Rotating Glass Beam:** Animated reflective beam that travels around border (2.4s rotation)
- **Arc Raiders Inspiration:** Premium glass aesthetic with rotating highlight

### Implementation Details
- **Blur Effect:** `BlurView` from `expo-blur` (intensity: 45)
- **Border Ring:** Layered approach:
  - `borderBaseLayer` - Static rainbow gradient
  - `borderBeamLayer` - Rotating beam (AnimatedView from Reanimated)
  - `borderMask` - Cuts out center to create ring (zIndex: 100)
  - `borderGlow` - Soft outer glow
- **Positioning:** 
  - `position: 'absolute'` at bottom
  - Uses `useSafeAreaInsets()` for iOS home indicator
  - `bottomOffset: 14px` from screen edge
  - `height: 64px` (pill) + border frame padding
- **Animation:** 
  - Beam rotation uses `react-native-reanimated` (`useSharedValue`, `withRepeat`, `withTiming`)
  - Respects `AccessibilityInfo.isReduceMotionEnabled()`
  - Duration: 2400ms (2.4s per full rotation)

### Styling Constants
- `PILL_HEIGHT: 64`
- `BORDER_RING_THICKNESS: 2.2px`
- `BEAM_ROTATION_DURATION: 2400ms`
- `GLASS_BLUR_INTENSITY: 45`
- `GLASS_BG_OPACITY_LIGHT: 0.72`
- `GLASS_BG_OPACITY_DARK: 0.65`

### Tab Bar Configuration
**File:** `src/navigation/AppNavigator.tsx:150-184`
- `tabBar={(props) => <FloatingTabBar {...props} />}` - Custom tab bar
- `tabBarStyle` - Transparent, `position: 'absolute'`, `height: 0` (hidden default)
- `tabBarBackground: () => null` - No default background

---

## 4. JOURNAL DATA MODEL

### Storage
- **Primary:** `AsyncStorage` (local device storage)
- **Optional:** Supabase cloud sync (configured but optional)

### Data Structures

**Gratitude Check-ins** (`src/utils/dayRollover.ts`)
```typescript
interface GratitudeCheckIn {
  id: string;
  text: string;
  date: string; // ISO date (YYYY-MM-DD)
  timestamp: string; // ISO timestamp
  dayKey?: string; // Local day key for rollover
}
```

**Storage Keys:**
- `@gratitude_checkins` - Array of GratitudeCheckIn objects
- `@app_state` - Full app state (includes `dailyProgress`)

**Daily Progress** (`src/types/index.ts`)
```typescript
interface DayProgress {
  date: string;
  tasks: Task[];
  guidedSessions: GuidedSession[];
  meditationCompleted: boolean;
  gratitudeEntry: string; // Legacy format (string)
  visionImageAddedToday?: boolean;
  isComplete: boolean;
  moodEntryId?: string;
}
```

### Data Flow
1. **Create Entry:** `addGratitudeCheckIn(text)` in `AppContext`
2. **Storage:** Saved to `AsyncStorage` under `@gratitude_checkins`
3. **Retrieval:** `getTodayCheckIns()`, `getTodayCheckInCount()` in `AppContext`
4. **Day Rollover:** `checkForDayRollover()` handles timezone-aware day changes

### Journal Entry Creation Flow
**Current Implementation:**
- `GratitudeJournalScreen` → FAB button → `navigation.navigate('VoiceJournal')`
- `VoiceJournalScreen` handles voice recording + transcription
- `JournalScreen` (legacy) handles text-only entry
- Both save via `addGratitudeCheckIn()` in `AppContext`

---

## 5. DESIGN SYSTEM TOKENS

### Location
**File:** `src/theme/tokens.ts`

### Spacing System (8pt grid)
```typescript
spacing: {
  xs: 6,   // Extra tight
  sm: 10,  // Small
  md: 12,  // Medium
  lg: 16,  // Large (default card padding, screen edges)
  xl: 24,  // Extra large (section spacing)
  xxl: 32, // Extra extra large (buttons, hero sections)
}
```

### Border Radius
```typescript
radii: {
  sm: 12,  // Small elements, chips
  md: 18,  // Standard cards
  lg: 22,  // Large cards, hero sections, tab bar pill
  xl: 28,  // Extra large, floating elements
  full: 999, // Pill shape, circular
}
```

### Typography
```typescript
typography: {
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '700', letterSpacing: -0.2 },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' },
}
```

### Colors
```typescript
colors: {
  background: '#F6F5FB', // Soft neutral
  surface: '#FFFFFF', // White cards
  textPrimary: '#1C1B22', // Deep, calm
  textSecondary: 'rgba(28, 27, 34, 0.6)',
  primary: '#7C3AED', // Purple accent
  accent: '#7C3AED', // Alias
  success: '#4CAF50',
  error: '#EF4444',
}
```

### Shadows
- `subtle` - Very light (elevation: 1)
- `card` - Standard cards (elevation: 2)
- `floating` - Floating elements (elevation: 8)
- `elevated` - Elevated surfaces (elevation: 4)

### Glass Effects
```typescript
glass: {
  bgAlpha: 0.7,
  borderAlpha: 0.4,
  blurIntensity: 20,
}
```

### Tab Bar Constants
```typescript
tabBar: {
  height: 72,
  bottomOffset: 14,
  horizontalPadding: 16,
  borderRadius: 28,
  blurIntensity: 45,
  TAB_BAR_SPACE: 100, // Space to reserve (height + offset + breathing room)
}
```

### Consolidation Needs
- Some screens use legacy `Theme` object from `src/utils/theme.ts`
- Migrate to `tokens` system for consistency
- `JournalFAB` uses `Theme` instead of `tokens`

---

## 6. CURRENT UI BUGS & RISKS

### Critical Issues

1. **Journal FAB Hidden Behind Footer**
   - **Location:** `src/components/JournalFAB.tsx`
   - **Issue:** FAB positioned at `bottom: BOTTOM_TAB_HEIGHT + insets.bottom` but footer is taller
   - **Risk:** FAB not accessible, poor UX
   - **Fix Needed:** Calculate proper position above footer (use `useTabBarInset()` + additional spacing)

2. **FAB Z-Index Conflict**
   - **Location:** `src/components/JournalFAB.tsx:207` - `zIndex: 1000`
   - **Issue:** Footer has `zIndex: 1000` in `FloatingTabBar.tsx`
   - **Risk:** FAB may appear behind footer on some devices
   - **Fix Needed:** Ensure FAB has higher z-index than footer

3. **Safe Area Handling**
   - **Location:** Multiple screens
   - **Issue:** Some screens don't use `useTabBarInset()` for bottom padding
   - **Risk:** Content overlaps footer on small devices
   - **Fix Needed:** Ensure all scrollable screens use `useTabBarInset()`

4. **Keyboard Avoidance**
   - **Location:** `JournalScreen.tsx` (write entry screen)
   - **Issue:** `KeyboardAvoidingView` with `keyboardVerticalOffset={90}` may not account for footer
   - **Risk:** Input field hidden behind keyboard on small devices
   - **Fix Needed:** Adjust offset to account for footer + safe area

### Medium Priority Issues

5. **Inconsistent Design System Usage**
   - **Location:** Multiple components
   - **Issue:** `JournalFAB` uses `Theme` instead of `tokens`
   - **Risk:** Inconsistent styling, harder to maintain
   - **Fix Needed:** Migrate to `tokens` system

6. **FAB Glass Treatment Missing**
   - **Location:** `src/components/JournalFAB.tsx`
   - **Issue:** FAB uses gradient, not glass effect matching footer
   - **Risk:** Inconsistent design language
   - **Fix Needed:** Add `BlurView` + glass styling to match footer

7. **Screen Transition Animations**
   - **Location:** `JournalStack` navigation
   - **Issue:** Default stack transitions may feel janky
   - **Risk:** Poor UX, doesn't feel premium
   - **Fix Needed:** Add custom transition animations (fade + translate)

8. **Empty State Clarity**
   - **Location:** `GratitudeJournalScreen`
   - **Issue:** Empty state may not clearly guide users
   - **Risk:** Users don't know how to start
   - **Fix Needed:** Improve empty state with clear CTAs and prompts

### Low Priority / Polish

9. **Scroll Performance**
   - **Location:** `GratitudeJournalScreen` with many entries
   - **Issue:** No virtualization for long lists
   - **Risk:** Performance degradation with 100+ entries
   - **Fix Needed:** Use `FlatList` with `getItemLayout` for optimization

10. **Touch Target Sizes**
    - **Location:** Various components
    - **Issue:** Some buttons may be < 44px
    - **Risk:** Accessibility issues
    - **Fix Needed:** Audit and ensure all targets ≥ 44px

---

## 7. UNKNOWNS & ASSUMPTIONS

### Unknowns
1. **Supabase Sync Status:** Is cloud sync actively used or just configured?
2. **Voice Journal Transcription:** What API is used? (OpenAI Whisper mentioned in docs)
3. **45 NOW Challenge Logic:** Full requirements and validation logic not fully reviewed
4. **Performance Metrics:** No performance benchmarks found (FPS, render times)

### Assumptions Made
1. **FAB Position:** Assumes footer height is ~72px + 14px offset + safe area
2. **Design Language:** Assumes glass treatment should match footer (BlurView + subtle border)
3. **Navigation Flow:** Assumes Journal → VoiceJournal is primary entry path
4. **Safe Area:** Assumes all iOS devices need safe area handling (home indicator)

---

## 8. PRIORITIZED FIX LIST (Post-Journal)

### High Priority (Blocking)
1. ✅ **Journal FAB Fix** (in progress)
2. **45 NOW Tab Integration** - Ensure all 5 requirements are linked
3. **Safe Area Audit** - Verify all screens respect footer + safe area

### Medium Priority (Polish)
4. **Today Tab Streamlining** - Reduce overlap with 45 NOW
5. **Affirmations Audio** - Ensure audio playback works
6. **Vision Board Daily Requirement** - Link to 45 NOW completion

### Low Priority (Nice to Have)
7. **Performance Optimization** - Virtualize long lists
8. **Accessibility Audit** - Screen reader support
9. **Onboarding Flow** - First-time user tutorial

---

## 9. FILE STRUCTURE REFERENCE

### Key Directories
```
src/
├── components/
│   ├── navigation/
│   │   └── FloatingTabBar.tsx (custom footer)
│   ├── ui/
│   │   ├── GlassCard.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── SectionCard.tsx
│   │   └── SectionHeader.tsx
│   ├── JournalFAB.tsx (needs fix)
│   └── layout/
│       └── Screen.tsx (reusable screen wrapper)
├── screens/
│   ├── GratitudeJournalScreen.tsx (main journal list)
│   ├── JournalScreen.tsx (write entry - legacy)
│   ├── VoiceJournalScreen.tsx (voice entry)
│   └── JournalHistoryScreen.tsx (history)
├── navigation/
│   └── AppNavigator.tsx (navigation config)
├── theme/
│   └── tokens.ts (design system)
├── hooks/
│   └── useTabBarInset.ts (footer spacing hook)
├── context/
│   ├── AppContext.tsx (app state)
│   ├── ThemeContext.tsx (theme)
│   └── ToastContext.tsx (toasts)
└── utils/
    ├── dayRollover.ts (day rollover logic)
    └── theme.ts (legacy theme - migrate to tokens)
```

---

**END OF BREAKDOWN**



