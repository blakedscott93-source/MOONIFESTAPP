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
import { Screen } from '../components/layout/Screen';
import { Card, RowItem } from '../components/ui';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { useTheme } from '../theme/ThemeProvider';
import { AFFIRMATION_CATEGORIES, searchAffirmations } from '../data/affirmationLibrary';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_AFFIRMATIONS_KEY = '@saved_affirmations';

export default function AffirmationLibraryScreen({ navigation }: any) {
  const { theme: designTheme } = useTheme();
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
          <Card
            key={category.id}
            style={[
              styles.categoryCard,
              { backgroundColor: category.color + '20' },
            ]}
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.7}
              style={styles.categoryCardTouchable}
            >
              <View style={[styles.categoryIconCircle, { backgroundColor: category.color + '40' }]}>
                <Ionicons name={category.icon as any} size={32} color={category.color} />
              </View>
              <Text style={[styles.categoryName, { color: designTheme.colors.text }]}>{category.name}</Text>
              <Text style={[styles.categoryCount, { color: designTheme.colors.textSecondary }]}>{category.affirmations.length} affirmations</Text>
            </TouchableOpacity>
          </Card>
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
              <Card key={index} style={styles.affirmationCard}>
                <View style={styles.affirmationContent}>
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color={category.color} style={styles.quoteIcon} />
                  <Text style={[styles.affirmationText, { color: designTheme.colors.text }]}>{affirmation}</Text>
                </View>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => toggleSaveAffirmation(affirmation)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={24}
                    color={isSaved ? category.color : designTheme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </Card>
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
              <Card key={index} style={styles.affirmationCard}>
                <View style={styles.affirmationContent}>
                  <View style={styles.searchResultCategory}>
                    <Text style={styles.searchResultCategoryText}>{result.category}</Text>
                  </View>
                  <Text style={[styles.affirmationText, { color: designTheme.colors.text }]}>{result.affirmation}</Text>
                </View>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => toggleSaveAffirmation(result.affirmation)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={24}
                    color={isSaved ? category?.color || designTheme.colors.primary : designTheme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </Card>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  };

  return (
    <Screen
      scroll
      title="Affirmation Library"
      subtitle="Browse and save powerful affirmations to your collection"
    >
      {/* Search Bar */}
      <Card style={styles.searchCard}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B5B8A" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search affirmations..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
              <Ionicons name="close-circle" size={20} color="#6B5B8A" />
            </TouchableOpacity>
          )}
        </View>
      </Card>

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
          <Card style={styles.myCollectionCard}>
            <RowItem
              title={`My Collection (${savedAffirmations.length})`}
              icon="bookmarks"
              iconColor={designTheme.colors.primary}
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
            />
          </Card>
        )}

        <View style={{ height: 100 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1F1235',
    paddingVertical: 12,
  },
  searchClear: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1235',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
  },
  categoryCardTouchable: {
    width: '100%',
    alignItems: 'center',
  },
  categoryIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  affirmationsListContainer: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 12,
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
    marginRight: 12,
  },
  categoryHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F1235',
    marginBottom: 2,
  },
  categoryHeaderDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B5B8A',
  },
  affirmationsList: {
    flex: 1,
  },
  affirmationsListContent: {
    paddingHorizontal: 16,
  },
  affirmationCard: {
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  affirmationContent: {
    flex: 1,
    marginRight: 12,
  },
  quoteIcon: {
    marginBottom: 8,
  },
  affirmationText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  saveButton: {
    padding: 4,
  },
  searchResultsContainer: {
    flex: 1,
  },
  searchResultsHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B5B8A',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchResultCategory: {
    alignSelf: 'flex-start',
    backgroundColor: '#7C3AED20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 8,
  },
  searchResultCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  myCollectionCard: {
    marginHorizontal: 16,
    marginTop: 20,
  },
});
