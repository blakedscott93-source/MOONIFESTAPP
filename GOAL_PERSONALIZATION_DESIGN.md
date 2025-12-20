# Goal-Based Personalization System 🎯

## Overview

Transform Moonifest into a **personalized manifestation journey** where every feature (journal, tasks, meditations, affirmations) aligns with the user's **3 main manifestation goals**.

---

## 🎯 Core Concept

**User Flow**:
1. During onboarding → User selects/defines **3 main manifestation goals**
2. Throughout app → All content is **filtered and personalized** based on these goals
3. Progress tracking → See how daily actions **contribute to each goal**
4. Goal alignment → Visual indicators show which goal each activity supports

---

## 📋 Implementation Plan

### Phase 1: Goal Categories & Structure

**Predefined Goal Categories** (User picks 3):
1. **Wealth & Abundance** 💰
   - Financial freedom
   - Career success
   - Business growth
   - Passive income

2. **Love & Relationships** ❤️
   - Finding love
   - Improving relationship
   - Self-love
   - Family harmony

3. **Health & Wellness** 🌿
   - Physical health
   - Mental wellness
   - Energy & vitality
   - Healing

4. **Career & Purpose** 💼
   - Dream job
   - Promotion
   - Career change
   - Finding purpose

5. **Personal Growth** 🌱
   - Confidence
   - Spiritual growth
   - Breaking habits
   - Self-discipline

6. **Happiness & Peace** ☮️
   - Inner peace
   - Joy & gratitude
   - Stress relief
   - Mindfulness

7. **Creativity & Expression** 🎨
   - Creative projects
   - Artistic expression
   - Public speaking
   - Writing/creating

8. **Freedom & Adventure** ✈️
   - Travel
   - Location independence
   - New experiences
   - Breaking free

**Data Structure**:
```typescript
interface ManifestationGoal {
  id: string;
  category: GoalCategory;
  title: string; // "Financial Freedom", "Finding Love", etc.
  description: string; // User's custom description
  customText?: string; // If user wants custom goal
  priority: 1 | 2 | 3; // Which of the 3 main goals (1 = highest)
  startDate: string;
  targetDate?: string; // Optional target date
  status: 'active' | 'achieved' | 'paused';
  progress: number; // 0-100
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  goalId: string;
  title: string;
  achieved: boolean;
  achievedDate?: string;
}
```

---

### Phase 2: Onboarding Enhancement

**New Onboarding Screens** (Add after current quiz):

#### Screen 1: "What Are You Manifesting?"
```
┌─────────────────────────────────┐
│  What Are You Manifesting? ✨    │
│                                 │
│  Choose your 3 main goals.      │
│  Everything in Moonifest will   │
│  be personalized to support     │
│  these manifestations.          │
│                                 │
│  [Wealth & Abundance]  💰       │
│  [Love & Relationships] ❤️      │
│  [Health & Wellness]   🌿       │
│  [Career & Purpose]    💼       │
│  [Personal Growth]     🌱       │
│  [Happiness & Peace]   ☮️       │
│  [Creativity]          🎨       │
│  [Freedom & Adventure] ✈️       │
│                                 │
│  Selected: 0/3                  │
│                                 │
│         [Continue] →            │
└─────────────────────────────────┘
```

#### Screen 2: "Describe Your Goals"
For each selected goal, ask:
```
┌─────────────────────────────────┐
│  💰 Wealth & Abundance          │
│                                 │
│  Be specific about what you're  │
│  manifesting:                   │
│                                 │
│  Quick options:                 │
│  □ Financial freedom            │
│  □ $100k/year income            │
│  □ Starting a business          │
│  □ Passive income streams       │
│  □ Debt freedom                 │
│                                 │
│  Or write your own:             │
│  ┌─────────────────────────┐   │
│  │ I am manifesting...     │   │
│  └─────────────────────────┘   │
│                                 │
│  Priority: ⭐⭐⭐ (1st Goal)    │
│                                 │
│         [Continue] →            │
└─────────────────────────────────┘
```

#### Screen 3: "Set Your Timeline" (Optional)
```
┌─────────────────────────────────┐
│  When Do You Want To Achieve    │
│  These Goals? 📅                │
│                                 │
│  💰 Financial Freedom           │
│  [ ] 3 months                   │
│  [ ] 6 months                   │
│  [✓] 1 year                     │
│  [ ] No timeline                │
│                                 │
│  ❤️ Finding Love                │
│  [✓] 3 months                   │
│  [ ] 6 months                   │
│  [ ] 1 year                     │
│  [ ] No timeline                │
│                                 │
│  🌿 Better Health               │
│  [ ] 3 months                   │
│  [✓] 6 months                   │
│  [ ] 1 year                     │
│  [ ] No timeline                │
│                                 │
│         [Continue] →            │
└─────────────────────────────────┘
```

---

### Phase 3: Goal-Aligned Content System

**Content Tagging**:
Every piece of content (affirmations, meditations, prompts) gets tagged with goal categories:

```typescript
interface Content {
  id: string;
  type: 'affirmation' | 'meditation' | 'prompt' | 'task';
  title: string;
  content: string;
  goalTags: GoalCategory[]; // Can support multiple goals
  priority: 'high' | 'medium' | 'low'; // How aligned to goal
}
```

**Example Content Mapping**:
```typescript
// Affirmation
{
  title: "I Am Financially Abundant",
  goalTags: ['wealth', 'career'],
  priority: 'high'
}

// Meditation
{
  title: "Attracting Love Meditation",
  goalTags: ['love', 'happiness'],
  priority: 'high'
}

// Journal Prompt
{
  text: "What opportunities am I grateful for today?",
  goalTags: ['wealth', 'career', 'personal-growth'],
  priority: 'medium'
}
```

---

### Phase 4: Personalized Features

#### 1. **Smart Affirmations** 🎯
Filter affirmations by user's goals:

```typescript
// Before: Show all affirmations
const allAffirmations = AFFIRMATIONS;

// After: Prioritize goal-aligned affirmations
const personalizedAffirmations = AFFIRMATIONS
  .map(aff => ({
    ...aff,
    relevanceScore: calculateRelevance(aff, userGoals)
  }))
  .sort((a, b) => b.relevanceScore - a.relevanceScore);
```

**UI Change**:
```
Affirmations Screen:
┌──────────────────────────────┐
│ For You  |  All  |  Explore  │ ← New tabs
├──────────────────────────────┤
│ 🎯 Aligned to Your Goals     │
│                              │
│ 💰 Financial Abundance       │
│ Your #1 Goal                 │
│ ──────────────────────────   │
│                              │
│ ❤️ Attracting Love           │
│ Your #2 Goal                 │
│ ──────────────────────────   │
└──────────────────────────────┘
```

#### 2. **Goal-Based Journal Prompts** 📝
Rotate prompts based on goals:

```typescript
const GOAL_PROMPTS = {
  wealth: [
    "What abundance am I calling in today?",
    "What financial opportunities am I grateful for?",
    "How does financial freedom feel in my body?",
    "What wealthy thoughts am I affirming today?"
  ],
  love: [
    "What qualities am I attracting in my ideal partner?",
    "How am I showing love to myself today?",
    "What does my perfect relationship look like?",
    "Who am I becoming to attract this love?"
  ],
  health: [
    "How is my body healing and thriving today?",
    "What healthy choices am I grateful for?",
    "How does vibrant health feel in my life?",
    "What vitality am I manifesting?"
  ]
  // ... etc for all goal categories
};

// In VoiceJournalScreen, select prompt based on today's focus goal
const todayGoal = userGoals[dayOfWeek % 3]; // Rotate through 3 goals
const prompt = selectRandom(GOAL_PROMPTS[todayGoal.category]);
```

#### 3. **Task Suggestions** ✅
Suggest tasks aligned with goals:

```typescript
const GOAL_TASK_TEMPLATES = {
  wealth: [
    "Research one income opportunity",
    "Update my financial goals",
    "Learn something about investing",
    "Network with one successful person",
    "Create a money vision board"
  ],
  love: [
    "Do something nice for yourself",
    "Practice self-love meditation",
    "Write about ideal partner qualities",
    "Go somewhere you might meet people",
    "Work on a limiting belief about love"
  ],
  // ... etc
};

// In 45 NOW screen, suggest relevant tasks
function suggestTasks(userGoals: Goal[]): Task[] {
  return userGoals.flatMap(goal =>
    GOAL_TASK_TEMPLATES[goal.category]
      .slice(0, 2) // 2 suggestions per goal
      .map(title => ({ title, goalId: goal.id }))
  );
}
```

#### 4. **Goal-Aligned Meditations** 🧘
Filter meditations by goal:

```typescript
const MEDITATION_LIBRARY = [
  {
    id: '1',
    title: 'Wealth Manifestation',
    category: 'manifestation',
    goalTags: ['wealth', 'career'],
    duration: 10,
    description: 'Attract financial abundance...'
  },
  {
    id: '2',
    title: 'Attracting Love',
    category: 'relationships',
    goalTags: ['love'],
    duration: 15,
    description: 'Call in your ideal relationship...'
  },
  // ... more meditations
];

// Show goal-aligned meditations first
const recommendedMeditations = MEDITATION_LIBRARY
  .filter(m => m.goalTags.some(tag =>
    userGoals.some(g => g.category === tag)
  ));
```

---

### Phase 5: Goal Tracking & Progress

#### 1. **Goal Dashboard** (New Screen)
Access from: Home screen or Settings

```
┌─────────────────────────────────────┐
│  Your Manifestation Goals 🎯        │
├─────────────────────────────────────┤
│                                     │
│  💰 Financial Freedom               │
│  Priority: #1                       │
│  Progress: ████████░░ 75%           │
│  Streak: 12 days                    │
│  ───────────────────────────        │
│  • Daily affirmations: ✅           │
│  • Journal entries: 8 this week     │
│  • Tasks completed: 15              │
│  [View Details →]                   │
│                                     │
│  ❤️ Finding Love                    │
│  Priority: #2                       │
│  Progress: ██████░░░░ 60%           │
│  Streak: 8 days                     │
│  ───────────────────────────        │
│  • Daily affirmations: ✅           │
│  • Journal entries: 5 this week     │
│  • Tasks completed: 10              │
│  [View Details →]                   │
│                                     │
│  🌿 Vibrant Health                  │
│  Priority: #3                       │
│  Progress: █████░░░░░ 50%           │
│  Streak: 15 days                    │
│  ───────────────────────────        │
│  • Daily affirmations: ✅           │
│  • Journal entries: 6 this week     │
│  • Tasks completed: 12              │
│  [View Details →]                   │
│                                     │
│  [Edit Goals] [View All Progress]   │
└─────────────────────────────────────┘
```

#### 2. **Goal Attribution**
Tag activities with which goal they support:

```typescript
// When saving journal entry
interface JournalEntry {
  // ... existing fields
  goalTags: string[]; // Which goals this entry supports
  suggestedGoal: string; // AI/keyword-suggested goal
}

// When completing task
interface Task {
  // ... existing fields
  goalId?: string; // Which goal this task supports
  goalImpact: 'high' | 'medium' | 'low';
}

// When playing affirmation
interface AffirmationSession {
  // ... existing fields
  goalIds: string[]; // Which goals this supports
}
```

#### 3. **Progress Calculation**
```typescript
function calculateGoalProgress(goal: Goal): number {
  const weights = {
    dailyAffirmations: 0.3,
    journalEntries: 0.3,
    tasksCompleted: 0.2,
    meditationSessions: 0.1,
    consistency: 0.1,
  };

  const last30Days = getLast30DaysData();

  const affirmationScore =
    countGoalRelatedAffirmations(goal, last30Days) / 30;
  const journalScore =
    countGoalRelatedJournals(goal, last30Days) / 30;
  const taskScore =
    countGoalRelatedTasks(goal, last30Days) / 30;
  const meditationScore =
    countGoalRelatedMeditations(goal, last30Days) / 30;
  const consistencyScore =
    calculateStreak(goal) / 30;

  return Math.min(100,
    (affirmationScore * weights.dailyAffirmations +
     journalScore * weights.journalEntries +
     taskScore * weights.tasksCompleted +
     meditationScore * weights.meditationSessions +
     consistencyScore * weights.consistency) * 100
  );
}
```

---

### Phase 6: Visual Goal Indicators

**Throughout the app, show which goal an activity supports:**

#### Home Screen:
```
┌────────────────────────────┐
│ Today's Practices          │
├────────────────────────────┤
│ ✅ Affirmations            │
│    💰 Financial Freedom    │ ← Goal tag
│                            │
│ ⬜ Gratitude Journal       │
│    🎯 All Goals            │
│                            │
│ ⬜ Meditation              │
│    ❤️ Finding Love         │ ← Goal tag
└────────────────────────────┘
```

#### Journal Screen:
```
After saving entry:
┌────────────────────────────┐
│ ✅ Entry Saved!            │
│                            │
│ This supports your goals:  │
│ 💰 Financial Freedom       │
│ 🌱 Personal Growth         │
│                            │
│ [+5 pts] [Continue]        │
└────────────────────────────┘
```

---

### Phase 7: Smart Recommendations

**Daily Goal Focus**:
Each day, rotate focus through the 3 goals:

```typescript
// Determine today's primary goal
const todayGoalIndex = new Date().getDate() % 3;
const todayGoal = userGoals[todayGoalIndex];

// Show notification:
"Today's Focus: 💰 Financial Freedom
Try the 'Wealth Manifestation' meditation!"

// Adjust content recommendations:
- Prioritize affirmations for today's goal
- Suggest journal prompts for today's goal
- Recommend meditation for today's goal
- Suggest tasks aligned with today's goal
```

---

## 🔧 Implementation Steps

### Step 1: Update Onboarding (2-3 hours)
- [ ] Add goal selection screen
- [ ] Add goal description screens
- [ ] Add timeline selection
- [ ] Save to AsyncStorage: `@user_goals`

### Step 2: Create Goal Data Structure (1-2 hours)
- [ ] Create `src/data/goalCategories.ts`
- [ ] Create `src/types/goals.ts`
- [ ] Create `src/utils/goalManager.ts`

### Step 3: Tag Existing Content (2-3 hours)
- [ ] Tag all affirmations with goal categories
- [ ] Tag all meditations with goal categories
- [ ] Create goal-specific journal prompts
- [ ] Create goal-specific task templates

### Step 4: Update Contexts (2-3 hours)
- [ ] Add goals to AppContext
- [ ] Add goal filtering functions
- [ ] Add goal progress calculations
- [ ] Add goal attribution tracking

### Step 5: Update UI Components (4-6 hours)
- [ ] Update AffirmationsScreen with "For You" tab
- [ ] Update VoiceJournal with goal-based prompts
- [ ] Update FortyFiveHard with goal task suggestions
- [ ] Add goal tags to all activities

### Step 6: Create Goal Dashboard (3-4 hours)
- [ ] New GoalDashboardScreen
- [ ] Progress visualization
- [ ] Goal editing
- [ ] Milestone tracking

### Step 7: Add Goal Indicators (2-3 hours)
- [ ] Add goal tags to HomeScreen
- [ ] Add goal attribution to saves
- [ ] Add goal progress to ProgressScreen
- [ ] Add goal insights

---

## 💡 Advanced Features (Future)

1. **AI-Powered Goal Analysis**
   - Use OpenAI to analyze journal entries
   - Detect limiting beliefs
   - Suggest affirmations based on entries

2. **Goal Milestones**
   - Break goals into smaller milestones
   - Celebrate micro-wins
   - Track progress visually

3. **Goal Sharing**
   - Share goals with accountability partners
   - Community challenges around goals
   - Goal-based leaderboards

4. **Smart Insights**
   - "You're most consistent with your wealth goal"
   - "Try more journaling for your love goal"
   - "Your health goal needs attention this week"

---

## 📊 Expected Impact

**User Engagement**: +40%
- More relevant content
- Clearer sense of purpose
- Better progress tracking

**Retention**: +30%
- Personal investment in goals
- See tangible progress
- Feel app understands them

**Value Perception**: +50%
- Truly personalized experience
- Not generic affirmation app
- Real manifestation coaching

---

## 🎯 Success Metrics

Track:
- % of users who complete goal onboarding
- Average goal progress scores
- Content engagement by goal alignment
- Goal achievement rate
- User retention by goal count

---

**This transforms Moonifest from a generic wellness app into a personalized manifestation coach!** 🚀

Every feature becomes part of a cohesive journey toward the user's specific dreams.
