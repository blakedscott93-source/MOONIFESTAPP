import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../utils/theme';

export const GratitudeHelperSection: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  const exampleNormal = `• I'm grateful for my health and energy
• I appreciate my supportive friends
• I'm thankful for this beautiful day`;

  const exampleManifestation = `• I am grateful for the new opportunities flowing to me
• I am thankful for the abundance I'm receiving
• I appreciate the success that's manifesting in my life`;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
        accessibilityLabel={expanded ? 'Collapse helper section' : 'Expand helper section'}
        accessibilityRole="button"
      >
        <View style={styles.headerLeft}>
          <Ionicons
            name="bulb-outline"
            size={20}
            color={Theme.colors.accent}
          />
          <Text style={styles.headerText}>How to write your entry</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={16} color={Theme.colors.success} />
            <Text style={styles.tipText}>List as many things as you want.</Text>
          </View>

          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={16} color={Theme.colors.success} />
            <Text style={styles.tipText}>You can be grateful for what you have right now.</Text>
          </View>

          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={16} color={Theme.colors.success} />
            <Text style={styles.tipText}>
              You can also manifest: write gratitude in the present tense for what you're calling in.
            </Text>
          </View>

          <View style={styles.examples}>
            <View style={styles.example}>
              <Text style={styles.exampleLabel}>Example: Normal Gratitude</Text>
              <Text style={styles.exampleText}>{exampleNormal}</Text>
            </View>

            <View style={styles.example}>
              <Text style={styles.exampleLabel}>Example: Manifestation Style</Text>
              <Text style={styles.exampleText}>{exampleManifestation}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  headerText: {
    ...Theme.typography.captionBold,
    color: Theme.colors.textPrimary,
  },
  content: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.sm,
  },
  tipText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    flex: 1,
    lineHeight: Theme.typography.caption.lineHeight,
  },
  examples: {
    marginTop: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  example: {
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.sm,
    padding: Theme.spacing.md,
  },
  exampleLabel: {
    ...Theme.typography.small,
    color: Theme.colors.accent,
    marginBottom: Theme.spacing.xs,
    fontWeight: '700',
  },
  exampleText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: Theme.typography.caption.lineHeight + 4,
  },
});








