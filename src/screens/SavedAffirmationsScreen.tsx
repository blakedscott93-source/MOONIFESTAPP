import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { UnifiedCard } from '../components/UnifiedCard';
import { Theme } from '../utils/theme';
import { SavedAffirmation, getSavedAffirmations, removeSavedAffirmation } from '../utils/savedAffirmations';
import { useToast } from '../context/ToastContext';

export default function SavedAffirmationsScreen({ navigation }: any) {
  const { showSuccess, showError } = useToast();
  const [affirmations, setAffirmations] = useState<SavedAffirmation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAffirmations();
  }, []);

  const loadAffirmations = async () => {
    try {
      setLoading(true);
      const saved = await getSavedAffirmations();
      setAffirmations(saved);
    } catch (error) {
      showError('Error', 'Failed to load saved affirmations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (affirmation: SavedAffirmation) => {
    Alert.alert(
      'Remove Affirmation',
      `Remove "${affirmation.text.substring(0, 50)}${affirmation.text.length > 50 ? '...' : ''}" from your saved affirmations?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeSavedAffirmation(affirmation.id);
              await loadAffirmations();
              showSuccess('Removed', 'Affirmation removed from saved');
            } catch (error) {
              showError('Error', 'Failed to remove affirmation');
            }
          },
        },
      ]
    );
  };

  const handleShare = (affirmation: SavedAffirmation) => {
    // Import share function dynamically to avoid circular dependencies
    import('../utils/sharing').then(({ shareText }) => {
      shareText({
        title: 'My Saved Affirmation',
        message: `✨ ${affirmation.text}\n\nSaved from Moonifest`,
      });
    });
  };

  const renderAffirmation = ({ item }: { item: SavedAffirmation }) => (
    <UnifiedCard style={styles.card}>
      <View style={styles.affirmationHeader}>
        <View style={styles.affirmationContent}>
          <Text style={styles.affirmationText}>{item.text}</Text>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
          <Text style={styles.dateText}>
            Saved {new Date(item.savedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(item)}
        >
          <Ionicons name="share-outline" size={20} color={Theme.colors.accent} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color={Theme.colors.danger} />
          <Text style={[styles.actionText, styles.deleteText]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </UnifiedCard>
  );

  if (loading) {
    return (
      <Screen>
        <AppHeader
          title="Saved Affirmations"
          subtitle="Your favorite affirmations"
          leftIcon={{
            name: 'chevron-back',
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Screen>
    );
  }

  if (affirmations.length === 0) {
    return (
      <Screen>
        <AppHeader
          title="Saved Affirmations"
          subtitle="Your favorite affirmations"
          leftIcon={{
            name: 'chevron-back',
            onPress: () => navigation.goBack(),
          }}
        />
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={['#C77DFF', '#9D4EDD']}
            style={styles.emptyCircle}
          >
            <Ionicons name="bookmark-outline" size={60} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No Saved Affirmations</Text>
          <Text style={styles.emptySubtitle}>
            Save affirmations you love by tapping the bookmark icon on any affirmation
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader
        title="Saved Affirmations"
        subtitle={`${affirmations.length} ${affirmations.length === 1 ? 'affirmation' : 'affirmations'}`}
        leftIcon={{
          name: 'chevron-back',
          onPress: () => navigation.goBack(),
        }}
      />
      <FlatList
        data={affirmations}
        renderItem={renderAffirmation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: Theme.spacing.xxxl,
  },
  card: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  affirmationHeader: {
    marginBottom: Theme.spacing.md,
  },
  affirmationContent: {
    gap: Theme.spacing.sm,
  },
  affirmationText: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.accentSoft,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    marginTop: Theme.spacing.xs,
  },
  categoryText: {
    ...Theme.typography.caption,
    color: Theme.colors.accent,
    fontWeight: '600',
  },
  dateText: {
    ...Theme.typography.small,
    color: Theme.colors.textTertiary,
    marginTop: Theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.surfaceSecondary,
  },
  deleteButton: {
    backgroundColor: Theme.colors.danger + '15',
  },
  actionText: {
    ...Theme.typography.body,
    color: Theme.colors.accent,
    fontWeight: '600',
  },
  deleteText: {
    color: Theme.colors.danger,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  emptyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xl,
    ...Theme.shadow.large,
  },
  emptyTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

