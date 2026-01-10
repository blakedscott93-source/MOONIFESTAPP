import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, ProgressBar } from '../ui';
import { tokens } from '../../theme/tokens';
import { useTheme } from '../../context/ThemeContext';

interface HomeProgressCardProps {
    completedCount: number;
    totalCount: number;
    progressPercentage: number;
    isDayComplete: boolean;
}

export function HomeProgressCard({
    completedCount,
    totalCount,
    progressPercentage,
    isDayComplete,
}: HomeProgressCardProps) {
    const { theme } = useTheme();

    return (
        <GlassCard style={styles.progressOverviewCard}>
            <View style={styles.progressOverviewHeader}>
                <Text style={[styles.progressOverviewTitle, { color: theme.colors.textPrimary }]}>
                    Today's Progress
                </Text>
                {isDayComplete && (
                    <View style={styles.completeBadge}>
                        <Ionicons name="checkmark-circle" size={20} color={tokens.colors.success} />
                    </View>
                )}
            </View>
            <View style={styles.progressCountDisplay}>
                <Text style={[styles.progressCountLarge, { color: theme.colors.accent }]}>
                    {completedCount}
                </Text>
                <Text style={[styles.progressCountDivider, { color: theme.colors.textSecondary }]}>
                    /
                </Text>
                <Text style={[styles.progressCountTotal, { color: theme.colors.textSecondary }]}>
                    {totalCount}
                </Text>
                <Text style={[styles.progressCountLabel, { color: theme.colors.textSecondary }]}>
                    complete
                </Text>
            </View>
            <ProgressBar
                progress={progressPercentage / 100}
                height={10}
                fillColor={isDayComplete ? tokens.colors.success : tokens.colors.accent}
                trackColor={`${tokens.colors.accent}15`}
            />
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    progressOverviewCard: {
        marginBottom: tokens.spacing.md,
        paddingHorizontal: tokens.spacing.lg,
        paddingVertical: tokens.spacing.lg * 0.56,
    },
    progressOverviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacing.sm * 0.56,
    },
    progressOverviewTitle: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    completeBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: `${tokens.colors.success}20`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressCountDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: tokens.spacing.md * 0.56,
        gap: tokens.spacing.xs,
    },
    progressCountLarge: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -1,
    },
    progressCountDivider: {
        fontSize: 22,
        fontWeight: '300',
    },
    progressCountTotal: {
        fontSize: 22,
        fontWeight: '300',
    },
    progressCountLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginLeft: tokens.spacing.xs,
    },
});
