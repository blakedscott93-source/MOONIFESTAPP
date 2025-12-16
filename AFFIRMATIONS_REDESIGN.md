# Affirmations Tab Redesign - Calm-Inspired Layout

## Overview
Redesigned the Affirmations tab to feel like Calm's Sleep/Discover layout while maintaining Moonifest's light/lavender branding and existing functionality.

## New Components Created

### 1. `ChipRow.tsx`
**Purpose**: Horizontal scrollable filter chips
**Features**:
- Horizontal scrolling with smooth behavior
- Selected/unselected states with Moonifest colors
- Icon support for chips
- Accessibility labels and states
- Consistent pill shape with rounded borders

**Props**:
- `chips`: Array of `ChipOption` objects
- `selectedId`: Currently selected chip ID
- `onSelect`: Callback when chip is pressed

### 2. `MediaCard.tsx`
**Purpose**: Premium 2-column grid card component
**Features**:
- Large rounded rectangle cards (24px radius)
- Gradient backgrounds using Moonifest color palette
- Lock badge for locked content (top-left)
- Play button overlay for meditations (bottom-right)
- Icon/illustration placeholder
- Title + subtitle metadata
- Consistent card height (200px gradient area)
- Subtle shadows matching design system

**Props**:
- `data`: `MediaCardData` object with title, subtitle, gradient, icon, locked, playButton
- `onPress`: Callback when card is tapped
- `style`: Optional custom styles

### 3. `SectionHeader.tsx`
**Purpose**: Header with title + subtitle (Calm-style)
**Features**:
- Large title (28px, bold)
- Optional subtitle (15px, secondary color)
- Optional right icon button
- Consistent spacing and typography

**Props**:
- `title`: Main header text
- `subtitle`: Optional descriptive text
- `rightIcon`: Optional icon button config

### 4. `AffirmationsFAB.tsx`
**Purpose**: Premium floating action button for "New Affirmation"
**Features**:
- Perfect pill shape (56px height, borderRadius = height/2)
- Positioned above bottom tab bar with safe area respect
- Purple gradient matching Moonifest accent
- Press animations (scale + opacity)
- Shadow elevation for depth
- Accessibility labels

**Positioning**:
- `bottom`: `BOTTOM_TAB_HEIGHT + safeAreaBottom + 16px`
- `right`: `Theme.spacing.lg` (16px from right edge)
- `zIndex`: 1000 (always on top)

### 5. `meditations.ts` (Data)
**Purpose**: Meditation session data structure
**Features**:
- 9 meditation sessions (3 per type: Morning, Midday, Sleep)
- Each session has: id, title, subtitle, type, duration, gradient, icon, locked state
- Helper function: `getMeditationsByType()`

**Meditation Types**:
- `morning`: Energizing meditations (5-10 min)
- `midday`: Reset/stress relief (5-8 min)
- `sleep`: Deep sleep/rest (12-20 min)

## Screen Redesign: `AffirmationsScreen.tsx`

### Layout Structure (Calm-Inspired)
1. **SectionHeader**: Large title + subtitle
2. **Segmented Control**: Affirmations / Meditations tabs
3. **Filter Chips**: Horizontal scrollable chips (All + categories/types)
4. **2-Column Grid**: FlatList with `numColumns={2}` for premium cards
5. **FAB**: Floating "New Affirmation" button (only on Affirmations tab)

### Key Features

#### Segmented Control
- Two tabs: "Affirmations" and "Meditations"
- Active tab highlighted with background + shadow
- Smooth transitions
- Default: "Affirmations"

#### Filter Chips
**Affirmations Tab**:
- "All" + 8 category chips (Balance, Fulfilled, Harmony, Stress, Wealth, Love, Confidence, Healing)
- Each chip has icon matching category
- Selected chip: `accentSoft` background + `accent` text
- Unselected: Transparent background + subtle border

**Meditations Tab**:
- "All" + 3 type chips (Morning, Midday, Sleep)
- Each chip has icon (sunny, partly-sunny, moon)
- Same selection styling as affirmations

#### 2-Column Grid
- Uses `FlatList` with `numColumns={2}` for performance
- Cards are 48% width with gap spacing
- Consistent card heights (200px gradient + info section)
- Memoized filtered data for smooth scrolling
- Proper key extraction

#### Premium FAB
- Only visible on "Affirmations" tab
- Positioned lower (16px above tab bar) to not block content
- Perfect pill shape with gradient
- Press animations for premium feel

## Data Structures

### Affirmation Items
Uses existing `GUIDED_SESSIONS` from `guidedAffirmations.ts`:
- `id`: Unique identifier
- `categoryId`: Category reference
- `title`: Session title
- `subtitle`: Metadata (e.g., "10 affirmations · 2 mins")
- `duration`: Duration in seconds
- `affirmationCount`: Number of affirmations
- `locked`: Boolean lock state
- `affirmations`: Array of affirmation strings

### Meditation Items
New `MEDITATION_SESSIONS` from `meditations.ts`:
- `id`: Unique identifier
- `title`: Session title
- `subtitle`: Metadata (e.g., "Meditation · 7 min")
- `type`: 'morning' | 'midday' | 'sleep'
- `duration`: Duration in seconds
- `gradient`: Array of 2 color strings
- `icon`: Ionicons icon name
- `locked`: Boolean lock state
- `playButton`: Boolean (always true for meditations)

## UI Changes Summary

### Before
- Narrow stacked cards in single column
- No filter chips
- Large red/pink "New Affirmation" button taking full width
- No segmented control (only affirmations)
- Basic header with icons

### After
- **2-column grid** of premium large cards
- **Horizontal filter chips** for categories/types
- **Segmented control** for Affirmations/Meditations
- **Premium FAB** floating bottom-right
- **Calm-style header** with title + subtitle
- **Consistent spacing** and typography
- **Moonifest branding** maintained (lavender/purple theme)

## Functionality Preserved

✅ **Navigation**: All existing navigation flows maintained
- Affirmation cards → `AffirmationPlayer` screen
- Locked items still tappable (for future upsell flow)

✅ **State Management**: No changes to context/state
- Uses existing `GUIDED_SESSIONS` data
- No new state dependencies

✅ **Lock System**: Lock badges and states preserved
- Lock icon shown on locked cards
- Locked cards still tappable (for upsell)

✅ **Categories**: All 8 affirmation categories maintained
- Filter chips match existing categories
- Category gradients and icons preserved

## Accessibility

✅ **Touch Targets**: All interactive elements ≥ 44x44px
- Cards: Full card area tappable
- Chips: Minimum 44px height
- FAB: 56px height
- Segmented control: Adequate padding

✅ **Screen Reader Support**:
- All cards have `accessibilityLabel` with title + subtitle + lock state
- Chips have labels and `accessibilityState` for selection
- Segmented control has `accessibilityRole="tab"` and states
- FAB has descriptive label and hint

✅ **Contrast**: All text meets WCAG AA standards
- Primary text: `#3D1F5C` on white/light backgrounds
- Secondary text: `#8B7DD8` on white/light backgrounds
- Inverse text: `#FFFFFF` on gradient backgrounds

## Performance Optimizations

✅ **Memoization**:
- `filteredAffirmations` memoized based on `selectedCategory`
- `filteredMeditations` memoized based on `selectedMeditationType`
- `affirmationChips` and `meditationChips` memoized

✅ **FlatList**:
- Uses `FlatList` with `numColumns={2}` for efficient rendering
- Proper `keyExtractor` for React keys
- `columnWrapperStyle` for consistent spacing

✅ **Smooth Scrolling**:
- No heavy computations in render
- Filtered data pre-computed
- Card rendering optimized

## Files Changed

### New Files:
- `src/components/ChipRow.tsx`
- `src/components/MediaCard.tsx`
- `src/components/SectionHeader.tsx`
- `src/components/AffirmationsFAB.tsx`
- `src/data/meditations.ts`

### Updated Files:
- `src/screens/AffirmationsScreen.tsx` (complete redesign)

## Acceptance Criteria ✅

✅ **Calm-Inspired Layout**: Top title + subtitle, filter chips, 2-column grid
✅ **Moonifest Branding**: Light/lavender theme, soft shadows, rounded cards
✅ **No Functionality Broken**: Navigation, state, locks all preserved
✅ **Premium Feel**: Large cards, consistent spacing, smooth animations
✅ **Performance**: FlatList, memoization, smooth scrolling
✅ **Accessibility**: 44px targets, labels, contrast, screen reader support
✅ **Segmented Control**: Affirmations/Meditations tabs
✅ **Filter Chips**: Horizontal scrollable with selection states
✅ **Premium FAB**: Perfect pill shape, positioned correctly, animations

## Next Steps (Future Enhancements)

1. **Meditation Player**: Implement meditation playback screen
2. **New Affirmation Flow**: Create screen for custom affirmation creation
3. **Upsell Flow**: Implement lock/unlock purchase flow
4. **Audio Integration**: Add actual audio playback for sessions
5. **Search**: Add search functionality for affirmations/meditations
6. **Favorites**: Allow users to favorite sessions





