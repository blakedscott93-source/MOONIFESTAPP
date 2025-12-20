# Smart App Rating Implementation Guide

## Overview

The app now includes a smart rating prompt system that follows best practices to maximize positive reviews by asking users at optimal moments.

## How It Works

### Trigger Moments

The app will prompt for a rating at these key moments:

1. **First Day Complete** (Priority 1)
   - After user completes their first full day
   - 2-second delay after celebration animation

2. **First Achievement Unlocked** (Priority 2)
   - When user unlocks their first achievement
   - 2-second delay after achievement animation

3. **Streak Milestones** (Priority 3)
   - At 7, 14, 21, 30, and 45-day streaks
   - Maximum 2 prompts total for streak milestones
   - 3-second delay to avoid interrupting flow

4. **45-Day Challenge Complete** (Priority 4)
   - When user completes the full 45-day challenge
   - Maximum 3 prompts total overall

### Smart Constraints

Before prompting, the system checks:

✅ **Minimum Requirements:**
- At least 3 days since app install
- At least 3 app sessions
- User hasn't already rated
- At least 30 days since last prompt (iOS/Android also rate-limit)

⏰ **Optimal Timing:**
- Preferred hours: 2-3 PM and 6-7 PM (based on research)
- Will still prompt at other times, but logs preference

🚫 **Never Prompts:**
- During onboarding
- After errors or crashes
- During negative experiences
- More than once per 30 days

## Implementation Details

### Files Modified

1. **`src/utils/appRating.ts`** - Core rating system logic
2. **`App.tsx`** - Tracks app sessions on launch
3. **`src/screens/FortyFiveHardScreen.tsx`** - Prompts on day completion
4. **`src/screens/HomeScreen.tsx`** - Prompts on streak milestones
5. **`src/screens/AchievementsScreen.tsx`** - Prompts on first achievement
6. **`src/screens/SettingsScreen.tsx`** - Manual rate button (always available)

### Usage Examples

```typescript
// Prompt after a positive moment
import { promptForRating } from '../utils/appRating';

await promptForRating({
  streak: 7,
  totalDays: 10,
  achievementUnlocked: true,
  dayCompleted: true,
  isFirstDayComplete: false,
});

// Track app session (called automatically in App.tsx)
import { trackAppSession } from '../utils/appRating';
trackAppSession();

// Mark user as rated (if they explicitly rate)
import { markUserRated } from '../utils/appRating';
markUserRated();
```

## Best Practices Followed

✅ **Ask After Positive Experiences**
- Day completions, achievements, milestones

✅ **Wait for Adequate Usage**
- 3+ days since install
- 3+ app sessions

✅ **Limit Frequency**
- 30 days between prompts
- Maximum prompts per trigger type

✅ **Optimal Times**
- Preferred: 2-3 PM and 6-7 PM
- Still prompts at other times if needed

✅ **Respect User Choice**
- Never prompts if user already rated
- Can still rate manually from Settings

✅ **Non-Intrusive**
- Delays after celebrations (2-3 seconds)
- Doesn't interrupt critical user flows

## Testing

To test the rating system:

1. **Reset rating data** (development only):
```typescript
import { resetRatingData } from '../utils/appRating';
await resetRatingData();
```

2. **Test first day complete:**
   - Complete a full day for the first time
   - Rating prompt should appear after celebration

3. **Test streak milestones:**
   - Reach 7-day streak
   - Rating prompt should appear

4. **Test achievements:**
   - Unlock your first achievement
   - Rating prompt should appear

## Monitoring

The system logs to console:
- When prompts are shown
- When prompts are skipped (with reasons)
- Optimal timing checks

## Future Enhancements

Potential improvements:
- Track prompt acceptance/rejection rates
- A/B test different timing strategies
- Add analytics integration
- Customize messages based on user behavior

