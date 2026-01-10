import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../ui';
import { tokens } from '../../theme/tokens';
import { useTheme } from '../../context/ThemeContext';

interface DayCompleteCelebrationProps {
    streak: number;
}

export function DayCompleteCelebration({ streak }: DayCompleteCelebrationProps) {
    const { theme } = useTheme();

    return (
        <GlassCard style={styles.celebrationCard}>
            <View style={styles.celebrationContent}>
                <Ionicons name="trophy" size={40} color={tokens.colors.warning} />
                <View style={styles.celebrationText}>
                    <Text style={[styles.celebrationTitle, { color: theme.colors.textPrimary }]}>
                        Day Complete! 🎉
                    </Text>
                    <Text style={[styles.celebrationSubtitle, { color: theme.colors.textSecondary }]}>
                        {streak > 1
                            ? `${streak} day streak! Keep it going!`
                            : `Great start! Come back tomorrow to build your streak`}
                    </Text>
                </View>
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    celebrationCard: {
        marginBottom: tokens.spacing.md,
        padding: tokens.spacing.lg,
        backgroundColor: `${tokens.colors.success}10`,
    },
    celebrationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: tokens.spacing.md,
    },
    celebrationText: {
        flex: 1,
        gap: 4,
    },
    celebrationTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    celebrationSubtitle: {
        fontSize: 14,
        fontWeight: '400',
    },
});
