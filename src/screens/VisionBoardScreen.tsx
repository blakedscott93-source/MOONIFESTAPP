import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { Theme } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Theme.spacing.lg * 3) / 2;

interface VisionBoardItem {
  id: string;
  imageUri: string;
  title: string;
  createdAt: string;
}

const STORAGE_KEY = '@vision_board_items';

// Placeholder images for the vision board
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
  'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
];

export default function VisionBoardScreen({ navigation }: any) {
  const { addGlowPoints } = useApp();
  const { showSuccess, showError, showPoints } = useToast();
  const [items, setItems] = useState<VisionBoardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setItems(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading vision board items:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveItems = async (newItems: VisionBoardItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      setItems(newItems);
    } catch (error) {
      console.error('Error saving vision board items:', error);
      showError('Error', 'Failed to save item');
    }
  };

  const addImage = () => {
    Alert.alert(
      'Add Image',
      'Choose an option',
      [
        {
          text: 'Sample Image (Demo)',
          onPress: () => addSampleImage(),
        },
        {
          text: 'Camera/Gallery (Coming Soon)',
          onPress: () => Alert.alert('Coming Soon', 'Camera and gallery access will be available soon!'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const addSampleImage = () => {
    Alert.prompt(
      'Add Title',
      'Give this vision a title',
      async (title) => {
        if (title && title.trim()) {
          const randomImage = PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];
          const newItem: VisionBoardItem = {
            id: Date.now().toString(),
            imageUri: randomImage,
            title: title.trim(),
            createdAt: new Date().toISOString(),
          };

          const updatedItems = [...items, newItem];
          await saveItems(updatedItems);
          await addGlowPoints(15, 'Added vision to vision board');
          showSuccess('Vision Added!', 'Your vision has been added to the board.');
          showPoints(15, 'Added vision to vision board');
        }
      }
    );
  };

  const deleteItem = (id: string) => {
    Alert.alert(
      'Delete Vision',
      'Are you sure you want to remove this from your vision board?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedItems = items.filter((item) => item.id !== id);
            await saveItems(updatedItems);
          },
        },
      ]
    );
  };

  const editItem = (item: VisionBoardItem) => {
    Alert.prompt(
      'Edit Title',
      'Update the title for this vision',
      async (newTitle) => {
        if (newTitle && newTitle.trim()) {
          const updatedItems = items.map((i) =>
            i.id === item.id ? { ...i, title: newTitle.trim() } : i
          );
          await saveItems(updatedItems);
        }
      },
      'plain-text',
      item.title
    );
  };

  if (loading) {
    return (
      <Screen style={styles.container}>
        <AppHeader
          title="Vision Board"
          subtitle="Visualize your dreams"
          leftIcon={{
            name: 'chevron-back',
            onPress: () => navigation.goBack(),
            accessibilityLabel: 'Go back',
          }}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <AppHeader
        title="Vision Board"
        subtitle="Visualize your dreams"
        leftIcon={{
          name: 'chevron-back',
          onPress: () => navigation.goBack(),
          accessibilityLabel: 'Go back',
        }}
        rightIcon={{
          name: 'add-circle-outline',
          onPress: addImage,
          accessibilityLabel: 'Add image',
          color: Theme.colors.accent,
        }}
      />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={['#C77DFF', '#9D4EDD']}
            style={styles.emptyCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="images-outline" size={60} color={Theme.colors.textInverse} />
          </LinearGradient>

          <Text style={styles.emptyTitle}>Create Your Vision Board</Text>
          <Text style={styles.emptySubtitle}>
            Add images that represent your goals, dreams, and aspirations. Visualize what you want to manifest.
          </Text>

          <TouchableOpacity style={styles.emptyButton} onPress={addImage} activeOpacity={0.7}>
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.emptyButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={24} color={Theme.colors.textInverse} />
              <Text style={styles.emptyButtonText}>Add First Image</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips for Your Vision Board:</Text>
            {[
              'Choose images that inspire you',
              'Include goals from different life areas',
              'Look at your board daily for manifestation',
              'Update it as your dreams evolve',
            ].map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="sparkles" size={16} color={Theme.colors.gold} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.countText}>{items.length} {items.length === 1 ? 'Vision' : 'Visions'}</Text>
            <TouchableOpacity onPress={addImage} style={styles.addButton}>
              <Ionicons name="add-circle" size={28} color={Theme.colors.accent} />
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.8}
                onLongPress={() => {
                  Alert.alert(
                    item.title,
                    'What would you like to do?',
                    [
                      { text: 'Edit Title', onPress: () => editItem(item) },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}
              >
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.imageOverlay}
                  >
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footerTip}>
            <Ionicons name="information-circle-outline" size={20} color={Theme.colors.textSecondary} />
            <Text style={styles.footerTipText}>Long press any image to edit or delete</Text>
          </View>

          <View style={{ height: Theme.spacing.xxxl }} />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
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
    marginBottom: Theme.spacing.xl,
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    marginBottom: Theme.spacing.xxxl,
    ...Theme.shadow.medium,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.sm,
  },
  emptyButtonText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
  },
  tipsContainer: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    alignSelf: 'stretch',
    ...Theme.shadow.subtle,
  },
  tipsTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  tipText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  countText: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  addButton: {
    padding: Theme.spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadow.medium,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Theme.colors.surface,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Theme.spacing.md,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
  },
  footerTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.xl,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
  },
  footerTipText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
});
