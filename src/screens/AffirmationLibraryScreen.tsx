import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { AFFIRMATION_CATEGORIES, searchAffirmations } from '../data/affirmationLibrary';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_AFFIRMATIONS_KEY = '@saved_affirmations';

export default function AffirmationLibraryScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedAffirmations, setSavedAffirmations] = useState<string[]>([]);

  React.useEffect(() => {
    loadSavedAffirmations();
  }, []);

  const loadSavedAffirmations = async () => {
    try {
      const saved = await AsyncStorage.getItem(SAVED_AFFIRMATIONS_KEY);
      if (saved) {
        setSavedAffirmations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved affirmations:', error);
    }
  };

  const toggleSaveAffirmation = async (affirmation: string) => {
    try {
      let updated: string[];
      if (savedAffirmations.includes(affirmation)) {
        // Remove
        updated = savedAffirmations.filter(a => a !== affirmation);
        Alert.alert('Removed', 'Affirmation removed from your collection');
      } else {
        // Add
        updated = [...savedAffirmations, affirmation];
        Alert.alert('Saved!', 'Affirmation added to your collection');
      }
      setSavedAffirmations(updated);
      await AsyncStorage.setItem(SAVED_AFFIRMATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving affirmation:', error);
    }
  };

  const renderCategoryGrid = () => {
    return (
      <View style={styles.categoryGrid}>
        {AFFIRMATION_CATEGORIES.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              { backgroundColor: category.color + '20' },
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.categoryIconCircle, { backgroundColor: category.color + '40' }]}>
              <Ionicons name={category.icon as any} size={32} color={category.color} />
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryCount}>{category.affirmations.length} affirmations</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAffirmationsList = () => {
    if (!selectedCategory) return null;

    const category = AFFIRMATION_CATEGORIES.find(c => c.id === selectedCategory);
    if (!category) return null;

    return (
      <View style={styles.affirmationsListContainer}>
        {/* Category Header */}
        <View style={styles.categoryHeader}>
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.categoryHeaderContent}>
            <View style={[styles.categoryHeaderIcon, { backgroundColor: category.color + '20' }]}>
              <Ionicons name={category.icon as any} size={28} color={category.color} />
            </View>
            <View>
              <Text style={styles.categoryHeaderTitle}>{category.name}</Text>
              <Text style={styles.categoryHeaderDescription}>{category.description}</Text>
            </View>
          </View>
        </View>

        {/* Affirmations */}
        <ScrollView
          style={styles.affirmationsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.affirmationsListContent}
        >
          {category.affirmations.map((affirmation, index) => {
            const isSaved = savedAffirmations.includes(affirmation);
            return (
              <View key={index} style={styles.affirmationCard}>
                <View style={styles.affirmationContent}>
                  <Ionicons name="quote" size={24} color={category.color} style={styles.quoteIcon} />
                  <Text style={styles.affirmationText}>{affirmation}</Text>
                </View>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => toggleSaveAffirmation(affirmation)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={24}
                    color={isSaved ? category.color : Theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  };

  const renderSearchResults = () => {
    if (!searchQuery.trim()) return null;

    const results = searchAffirmations(searchQuery);

    return (
      <View style={styles.searchResultsContainer}>
        <Text style={styles.searchResultsHeader}>
          {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
        </Text>
        <ScrollView
          style={styles.affirmationsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.affirmationsListContent}
        >
          {results.map((result, index) => {
            const isSaved = savedAffirmations.includes(result.affirmation);
            const category = AFFIRMATION_CATEGORIES.find(c => c.name === result.category);
            return (
              <View key={index} style={styles.affirmationCard}>
                <View style={styles.affirmationContent}>
                  <View style={styles.searchResultCategory}>
                    <Text style={styles.searchResultCategoryText}>{result.category}</Text>
                  </View>
                  <Text style={styles.affirmationText}>{result.affirmation}</Text>
                </View>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => toggleSaveAffirmation(result.affirmation)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={24}
                    color={isSaved ? category?.color || Theme.colors.accent : Theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  };

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBackButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Affirmation Library</Text>
          <View style={{ width: TOUCH_TARGET_MIN }} />
        </View>

        <Text style={styles.headerSubtitle}>
          Browse and save powerful affirmations to your collection
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search affirmations..."
            placeholderTextColor={Theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
              <Ionicons name="close-circle" size={20} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {searchQuery.trim() ? (
          renderSearchResults()
        ) : selectedCategory ? (
          renderAffirmationsList()
        ) : (
          <>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            {renderCategoryGrid()}
          </>
        )}

        {/* My Collection Link */}
        {savedAffirmations.length > 0 && !selectedCategory && !searchQuery && (
          <TouchableOpacity
            style={styles.myCollectionButton}
            onPress={() => {
              Alert.alert(
                'My Collection',
                `You have ${savedAffirmations.length} saved affirmation${savedAffirmations.length !== 1 ? 's' : ''}.`,
                [
                  {
                    text: 'View',
                    onPress: () => {
                      navigation.navigate('SavedAffirmationsScreen');
                    },
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          >
            <Ionicons name="bookmarks" size={24} color={Theme.colors.accent} />
            <Text style={styles.myCollectionText}>
              My Collection ({savedAffirmations.length})
            </Text>
            <Ionicons name="chevron-forward" size={20} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
  },
  headerBackButton: {
    width: TOUCH_TARGET_MIN,
    height: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.radius.full,
  },
  headerTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
  },
  headerSubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    paddingHorizontal: Theme.spacing.md,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    ...Theme.shadow.subtle,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    paddingVertical: Theme.spacing.md,
  },
  searchClear: {
    padding: Theme.spacing.xs,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  categoryCard: {
    width: '48%',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    ...Theme.shadow.medium,
  },
  categoryIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  categoryName: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  categoryCount: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
  },
  affirmationsListContainer: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },
  backButton: {
    marginRight: Theme.spacing.md,
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  categoryHeaderTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs / 2,
  },
  categoryHeaderDescription: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
  },
  affirmationsList: {
    flex: 1,
  },
  affirmationsListContent: {
    paddingHorizontal: Theme.spacing.lg,
  },
  affirmationCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.shadow.subtle,
  },
  affirmationContent: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  quoteIcon: {
    marginBottom: Theme.spacing.sm,
  },
  affirmationText: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    lineHeight: 22,
  },
  saveButton: {
    padding: Theme.spacing.xs,
  },
  searchResultsContainer: {
    flex: 1,
  },
  searchResultsHeader: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textSecondary,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  searchResultCategory: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.accent + '20',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs / 2,
    borderRadius: Theme.radius.sm,
    marginBottom: Theme.spacing.sm,
  },
  searchResultCategoryText: {
    ...Theme.typography.caption,
    color: Theme.colors.accent,
    fontWeight: '600',
  },
  myCollectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.xl,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    ...Theme.shadow.medium,
  },
  myCollectionText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
});
