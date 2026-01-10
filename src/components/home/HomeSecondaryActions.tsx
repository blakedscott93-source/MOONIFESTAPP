import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard, SectionCard } from '../ui';
import { DailySpinButton } from '../DailySpin';
import { tokens } from '../../theme/tokens';
import { useTheme } from '../../context/ThemeContext';
import { MoodCheckInEntry, getMoodOption } from '../../data/moodTracking';
import { Quote } from '../../data/quotes';

interface HomeSecondaryActionsProps {
    todayMoodEntry: MoodCheckInEntry | null;
    onMoodPress: () => void;
    streak: number;
    streakPulseAnim: Animated.Value;
    onStreakPress: () => void;
    hasSpunToday: boolean;
    onSpinPress: () => void;
    dailyQuote: Quote | null;
}

export function HomeSecondaryActions({
    todayMoodEntry,
    onMoodPress,
    streak,
    streakPulseAnim,
    onStreakPress,
    hasSpunToday,
    onSpinPress,
    dailyQuote,
}: HomeSecondaryActionsProps) {
    const { theme } = useTheme();

    return (
        <>
            {/* Mood Check-In - Compact */}
            <GlassCard style={{ marginBottom: tokens.spacing.md }}>
                <TouchableOpacity
                    onPress={onMoodPress}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={todayMoodEntry ? 'Update mood' : 'Check in with your mood'}
                    style={styles.moodRowItemCompact}
                >
                    <View
                        style={[
                            styles.moodIconCircleCompact,
                            {
                                backgroundColor: todayMoodEntry
                                    ? `${getMoodOption(todayMoodEntry.mood)?.color}20`
                                    : `${tokens.colors.accent}20`,
                            },
                        ]}
                    >
                        {todayMoodEntry ? (
                            <Text style={styles.moodEmojiCompact}>
                                {getMoodOption(todayMoodEntry.mood)?.emoji}
                            </Text>
                        ) : (
                            <Ionicons name="happy-outline" size={18} color={tokens.colors.accent} />
                        )}
                    </View>

                    <View style={styles.moodTextContainerCompact}>
                        <Text style={[styles.moodTitleCompact, { color: theme.colors.textPrimary }]}>
                            {todayMoodEntry
                                ? `Mood: ${getMoodOption(todayMoodEntry.mood)?.label}`
                                : 'Check in with your mood'}
                        </Text>
                    </View>

                    <Ionicons
                        name={todayMoodEntry ? 'create-outline' : 'chevron-forward'}
                        size={18}
                        color={tokens.colors.textSecondary}
                    />
                </TouchableOpacity>
            </GlassCard>

            {/* Streak & Daily Spin - Compact */}
            <SectionCard style={styles.streakCardCompact}>
                <LinearGradient
                    colors={['rgba(167, 139, 250, 0.75)', 'rgba(124, 58, 237, 0.65)']}
                    style={styles.streakGradientCompact}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <TouchableOpacity
                        onPress={onStreakPress}
                        activeOpacity={0.9}
                        style={styles.streakTouchableCompact}
                        accessibilityLabel="View 45 NOW challenge"
                        accessibilityRole="button"
                    >
                        <Animated.View
                            style={[
                                styles.streakIconContainerCompact,
                                streak > 0 && {
                                    transform: [{ scale: streakPulseAnim }],
                                },
                            ]}
                        >
                            <Ionicons name="flame" size={20} color="#FFFFFF" />
                        </Animated.View>

                        <View style={styles.streakTextStackCompact}>
                            <Text style={styles.streakMessageCompact}>
                                {streak === 0 ? 'Start streak' : `${streak} day streak`}
                            </Text>
                        </View>

                        <Ionicons name="chevron-forward" size={18} color="rgba(255, 255, 255, 0.8)" />
                    </TouchableOpacity>

                    <View style={styles.spinButtonWrapperCompact}>
                        <DailySpinButton onPress={onSpinPress} hasSpun={hasSpunToday} />
                    </View>
                </LinearGradient>
            </SectionCard>

            {/* Daily Quote - Simple */}
            <GlassCard style={{ marginBottom: tokens.spacing.md }}>
                <View style={styles.quoteContainerCompact}>
                    <Text style={[styles.quoteTextCompact, { color: theme.colors.textPrimary }]}>
                        "{dailyQuote?.text || 'Your thoughts create your reality.'}"
                    </Text>
                    <Text style={[styles.quoteAuthorCompact, { color: theme.colors.textSecondary }]}>
                        — {dailyQuote?.author || 'Unknown'}
                    </Text>
                </View>
            </GlassCard>
        </>
    );
}

const styles = StyleSheet.create({
    streakCardCompact: {
        padding: 0,
        overflow: 'hidden',
        borderWidth: 0,
        marginBottom: tokens.spacing.md,
    },
    streakGradientCompact: {
        padding: tokens.spacing.md,
        borderRadius: tokens.radii.lg,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 60,
    },
    streakTouchableCompact: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: tokens.spacing.md,
    },
    streakIconContainerCompact: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.22)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    streakTextStackCompact: {
        flex: 1,
    },
    streakMessageCompact: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    spinButtonWrapperCompact: {
        marginLeft: tokens.spacing.md,
    },
    moodRowItemCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: tokens.spacing.md,
        paddingHorizontal: tokens.spacing.lg,
    },
    moodIconCircleCompact: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: tokens.spacing.md,
    },
    moodEmojiCompact: {
        fontSize: 20,
    },
    moodTextContainerCompact: {
        flex: 1,
    },
    moodTitleCompact: {
        fontSize: 15,
        fontWeight: '500',
    },
    quoteContainerCompact: {
        padding: tokens.spacing.lg,
        gap: tokens.spacing.sm,
    },
    quoteTextCompact: {
        fontSize: 15,
        fontWeight: '400',
        fontStyle: 'italic',
        lineHeight: 22,
    },
    quoteAuthorCompact: {
        fontSize: 13,
        fontWeight: '400',
        textAlign: 'right',
    },
});
