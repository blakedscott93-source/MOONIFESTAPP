import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SectionCard } from '../ui';
import { ListRow } from '../ListRow';
import { tokens } from '../../theme/tokens';
import { useTheme } from '../../context/ThemeContext';

export interface DailyPractice {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    completed: boolean;
    action: () => void;
    onLongPress?: () => void;
}

interface HomeDailyTasksProps {
    practices: DailyPractice[];
}

export function HomeDailyTasks({ practices }: HomeDailyTasksProps) {
    const { theme } = useTheme();

    return (
        <SectionCard style={styles.dailyTasksCard}>
            <View style={styles.dailyTasksHeader}>
                <Text style={[styles.dailyTasksTitle, { color: theme.colors.textPrimary }]}>
                    Daily Tasks
                </Text>
                <Text style={[styles.dailyTasksSubtitle, { color: theme.colors.textSecondary }]}>
                    Complete all 5 to finish today
                </Text>
            </View>
            <View style={styles.dailyTasksList}>
                {practices.map((practice, index) => (
                    <View key={practice.id}>
                        <ListRow
                            title={practice.title}
                            subtitle={practice.subtitle}
                            icon={practice.icon as any}
                            iconColor={practice.color}
                            rightIcon={practice.completed ? 'checkmark-circle' : 'chevron-forward'}
                            onPress={practice.action}
                            onLongPress={practice.onLongPress}
                            completed={practice.completed}
                        />
                        {index < practices.length - 1 && (
                            <View style={styles.taskSeparator} />
                        )}
                    </View>
                ))}
            </View>
        </SectionCard>
    );
}

const styles = StyleSheet.create({
    dailyTasksCard: {
        marginBottom: tokens.spacing.lg,
        padding: tokens.spacing.lg,
    },
    dailyTasksHeader: {
        marginBottom: tokens.spacing.md,
        gap: 4,
    },
    dailyTasksTitle: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    dailyTasksSubtitle: {
        fontSize: 13,
        fontWeight: '400',
    },
    dailyTasksList: {
        gap: 0,
    },
    taskSeparator: {
        height: 1,
        backgroundColor: 'rgba(31, 18, 53, 0.05)',
        marginLeft: 60,
        marginRight: 0,
        marginVertical: tokens.spacing.xs,
    },
});
