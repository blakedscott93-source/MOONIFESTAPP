import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';

export interface ChipOption {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface ChipRowProps {
  chips: ChipOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  style?: any;
}

export const ChipRow: React.FC<ChipRowProps> = ({
  chips,
  selectedId,
  onSelect,
  style,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
      style={styles.scrollView}
    >
      {chips.map((chip) => {
        const isSelected = chip.id === selectedId;
        return (
          <TouchableOpacity
            key={chip.id}
            style={[
              styles.chip,
              isSelected && styles.chipSelected,
            ]}
            onPress={() => onSelect(chip.id)}
            activeOpacity={0.7}
            accessibilityLabel={chip.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            {chip.icon && (
              <Ionicons
                name={chip.icon}
                size={16}
                color={isSelected ? Theme.colors.accent : Theme.colors.textSecondary}
                style={styles.chipIcon}
              />
            )}
            <Text
              style={[
                styles.chipText,
                isSelected && styles.chipTextSelected,
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'transparent',
    minHeight: TOUCH_TARGET_MIN,
    gap: Theme.spacing.xs,
  },
  chipSelected: {
    backgroundColor: Theme.colors.accentSoft,
    borderColor: Theme.colors.accent,
  },
  chipIcon: {
    marginRight: Theme.spacing.xs / 2,
  },
  chipText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  chipTextSelected: {
    color: Theme.colors.accent,
    fontWeight: '600',
  },
});





