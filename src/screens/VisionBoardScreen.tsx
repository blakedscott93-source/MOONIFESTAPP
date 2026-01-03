/**
 * Vision Board Screen
 * Instagram-style grid layout with fullscreen photo viewer
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Animated,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen } from '../components/layout/Screen';
import { tokens } from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { getLocalDayKey } from '../utils/dayRollover';
import { useTabBarInset, TAB_BAR_SPACE } from '../hooks/useTabBarInset';
import { mediumHaptic, lightHaptic } from '../utils/haptics';
import { VisionTabProps } from '../types/navigation';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { trackEvent } from '../utils/analytics';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_GAP = 2;

// ============================================
// TYPES
// ============================================

interface VisionBoardPhoto {
  id: string;
  boardId: string;
  imageUri: string;
  caption: string;
  createdAt: string;
  dayKey?: string;
}

const STORAGE_KEY_PHOTOS = '@vision_board_photos';

export default function VisionBoardScreen({ navigation, route }: VisionTabProps) {
  useScreenTracking('VisionBoard');
  const { theme, isDark } = useTheme();
  const { addGlowPoints, markVisionImageAdded, appState, hasVisionImageAddedToday } = useApp();
  const { showSuccess, showError, showPoints } = useToast();
  const tabBarInset = useTabBarInset();

  // State
  const [photos, setPhotos] = useState<VisionBoardPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<VisionBoardPhoto | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [gridWidth, setGridWidth] = useState(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const photosRef = useRef<VisionBoardPhoto[]>([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  // Animation refs for fullscreen
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Sort photos by date (newest first)
  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [photos]);

  const gridItemSize = useMemo(() => {
    const baseWidth = gridWidth || width;
    const contentWidth = Math.max(0, baseWidth - GRID_GAP * 2);
    return (contentWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  }, [gridWidth]);

  // ============================================
  // DATA LOADING
  // ============================================
  useEffect(() => {
    loadData();
    if (route?.params?.fromDailyVisionImage) {
      const addTimeoutId = setTimeout(() => {
        addPhoto();
      }, 500);
      timeoutsRef.current.push(addTimeoutId);
    }
  }, [route?.params?.fromDailyVisionImage]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current = [];
    };
  }, []);

  const loadData = async () => {
    try {
      const photosData = await AsyncStorage.getItem(STORAGE_KEY_PHOTOS);
      const loadedPhotos: VisionBoardPhoto[] = photosData ? JSON.parse(photosData) : [];
      
      // Validate and filter out invalid photos
      const validPhotos = loadedPhotos.filter(photo => {
        if (!photo.id || !photo.imageUri || !photo.caption) {
          console.warn('Invalid photo found, skipping:', photo);
          return false;
        }
        return true;
      });
      
      if (validPhotos.length !== loadedPhotos.length) {
        console.log(`Filtered ${loadedPhotos.length - validPhotos.length} invalid photos`);
        // Save cleaned data
        await AsyncStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(validPhotos));
      }
      
      console.log(`Loaded ${validPhotos.length} vision board photos`);
      setPhotos(validPhotos);
    } catch (error) {
      console.error('Error loading vision board data:', error);
      showError('Error', 'Failed to load your vision boards');
    } finally {
      setLoading(false);
    }
  };

  const savePhotos = async (newPhotos: VisionBoardPhoto[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(newPhotos));
      setPhotos(newPhotos);
      return true;
    } catch (error) {
      console.error('Error saving photos:', error);
      showError('Error', 'Failed to save photo');
      return false;
    }
  };

  // ============================================
  // IMAGE PICKING
  // ============================================
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissions Required', 'We need photo library permissions to add images.', [
          { text: 'OK' },
        ]);
        return false;
      }
    }
    return true;
  };

  const addPhoto = async () => {
    if (Platform.OS === 'web') {
      await pickImageFromGallery();
      return;
    }

    Alert.alert(
      'Add Vision Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const hasPermission = await requestPermissions();
            if (hasPermission) await pickImageFromCamera();
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const hasPermission = await requestPermissions();
            if (hasPermission) await pickImageFromGallery();
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const pickImageFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
        base64: Platform.OS === 'web',
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const resolvedUri = Platform.OS === 'web' && asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        setPendingImageUri(resolvedUri);
        setCaptionInput('');
        setShowPhotoModal(true);
      }
    } catch (error) {
      console.error('Error picking image from camera:', error);
      showError('Error', 'Failed to take photo');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
        base64: Platform.OS === 'web',
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const resolvedUri = Platform.OS === 'web' && asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        setPendingImageUri(resolvedUri);
        setCaptionInput('');
        setShowPhotoModal(true);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      showError('Error', 'Failed to select image');
    }
  };

  // ============================================
  // PHOTO MANAGEMENT
  // ============================================
  const savePhoto = async () => {
    if (!pendingImageUri || !captionInput.trim()) {
      showError('Error', 'Please add a caption for your vision');
      return;
    }

    try {
      mediumHaptic();

      // Verify image URI is valid
      if (!pendingImageUri || pendingImageUri.trim() === '') {
        showError('Error', 'Invalid image. Please try again.');
        return;
      }

      const newPhoto: VisionBoardPhoto = {
        id: Date.now().toString(),
        boardId: 'vision',
        imageUri: pendingImageUri,
        caption: captionInput.trim(),
        createdAt: new Date().toISOString(),
        dayKey: getLocalDayKey(),
      };
      
      console.log('Saving photo:', newPhoto.id, newPhoto.imageUri.substring(0, 50) + '...');
      const success = await savePhotos([...photos, newPhoto]);
      
      if (!success) {
        showError('Error', 'Failed to save photo');
        return;
      }

      if (!hasVisionImageAddedToday()) {
        await addGlowPoints(15, 'Added vision image');
        await markVisionImageAdded();
        showPoints(15, 'Vision image added');
        trackEvent('vision_image_added', { 
          is_today: true,
          has_caption: !!captionInput.trim(),
          caption_length: captionInput.trim().length
        });

      } else {
        trackEvent('vision_image_updated', { 
          is_today: true,
          has_caption: !!captionInput.trim()
        });
      }

      showSuccess('Added!', 'Vision image added');
      setShowPhotoModal(false);
      setPendingImageUri(null);
      setCaptionInput('');
    } catch (error) {
      console.error('Error saving photo:', error);
      showError('Error', 'Failed to save photo');
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      mediumHaptic();
      
      // Get current photos from ref to avoid stale closure
      const currentPhotos = photosRef.current;
      const updatedPhotos = currentPhotos.filter(p => p.id !== photoId);
      
      // Update state
      setPhotos(updatedPhotos);
      
      // Save to storage
      try {
        await AsyncStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(updatedPhotos));
      } catch (error) {
        console.error('Error saving photos after delete:', error);
        // Revert state on error
        setPhotos(currentPhotos);
        showError('Error', 'Failed to save changes');
        return;
      }
      
      // Close fullscreen if this photo was selected
      if (selectedPhoto?.id === photoId) {
        setShowFullscreenModal(false);
        setSelectedPhoto(null);
      }

      setImageErrors(prev => {
        if (!prev[photoId]) {
          return prev;
        }
        const { [photoId]: _removed, ...rest } = prev;
        return rest;
      });
      
      trackEvent('vision_image_deleted', { photo_id: photoId });
      showSuccess('Deleted', 'Vision image removed');
    } catch (error) {
      console.error('Error deleting photo:', error);
      showError('Error', 'Failed to delete photo');
    }
  };

  const openFullscreen = (photo: VisionBoardPhoto) => {
    setSelectedPhoto(photo);
    setShowFullscreenModal(true);
    
    // Animate in
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeFullscreen = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowFullscreenModal(false);
      setSelectedPhoto(null);
    });
  };

  const handleDeleteFromFullscreen = () => {
    if (!selectedPhoto) return;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to delete this vision image?');
      if (confirmed) {
        deletePhoto(selectedPhoto.id);
      }
      return;
    }

    Alert.alert('Delete Vision', 'Are you sure you want to delete this vision image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deletePhoto(selectedPhoto.id),
      },
    ]);
  };

  // ============================================
  // RENDER
  // ============================================

  const renderGridItem = ({ item, index }: { item: VisionBoardPhoto; index: number }) => {
    const isWebBrokenUri = Platform.OS === 'web'
      && (item.imageUri.startsWith('blob:') || item.imageUri.startsWith('file:') || item.imageUri.startsWith('content:'));
    const imageError = imageErrors[item.id] || isWebBrokenUri;
    return (
      <TouchableOpacity
        style={[styles.gridItem, { width: gridItemSize, height: gridItemSize }]}
        onPress={() => {
          lightHaptic();
          openFullscreen(item);
        }}
        onLongPress={() => {
          mediumHaptic();
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            const confirmed = window.confirm(`Delete "${item.caption || 'this vision'}"?`);
            if (confirmed) {
              deletePhoto(item.id);
            }
            return;
          }
          Alert.alert('Delete Vision', `Delete "${item.caption || 'this vision'}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => deletePhoto(item.id),
            },
          ]);
        }}
        activeOpacity={0.9}
      >
        {!imageError ? (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.gridImage}
            resizeMode="cover"
            onError={() => {
              console.error('Error loading image:', item.imageUri);
              setImageErrors(prev => ({
                ...prev,
                [item.id]: true,
              }));
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', item.id);
            }}
          />
        ) : (
          <View style={styles.gridItemError}>
            <Ionicons name="image-outline" size={32} color={theme.colors.textTertiary} />
            <Text style={[styles.gridItemErrorText, { color: theme.colors.textTertiary }]}>
              Image not found
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <Screen title="Vision Board" subtitle="Visualize your dreams">
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <>
      <Screen
        title="Vision Board"
        subtitle={sortedPhotos.length > 0 ? `${sortedPhotos.length} vision${sortedPhotos.length !== 1 ? 's' : ''}` : 'Visualize your dreams'}
        rightAction={{
          icon: 'add-circle-outline',
          onPress: () => {
            mediumHaptic();
            addPhoto();
          },
          label: 'Add Photo',
        }}
        scroll={false}
      >
        {sortedPhotos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: `${theme.colors.accent}10` }]}>
              <Ionicons name="images-outline" size={64} color={theme.colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
              Start Your Vision Board
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Add photos that represent your goals and dreams
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => {
                mediumHaptic();
                addPhoto();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Add Your First Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={sortedPhotos}
            renderItem={renderGridItem}
            numColumns={GRID_COLUMNS}
            keyExtractor={item => item.id}
            onLayout={(event) => {
              const nextWidth = event.nativeEvent.layout.width;
              if (nextWidth && nextWidth !== gridWidth) {
                setGridWidth(nextWidth);
              }
            }}
            contentContainerStyle={[
              styles.gridContainer,
              { paddingBottom: TAB_BAR_SPACE + 24 },
            ]}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Screen>

      {/* Add Photo Modal */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowPhotoModal(false);
          setPendingImageUri(null);
          setCaptionInput('');
        }}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => {
                setShowPhotoModal(false);
                setPendingImageUri(null);
                setCaptionInput('');
              }}
            />
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              {pendingImageUri && (
                <View style={styles.modalPreviewContainer}>
                  <Image source={{ uri: pendingImageUri }} style={styles.modalPreview} resizeMode="cover" />
                </View>
              )}
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                What does this represent?
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: theme.colors.bg,
                    color: theme.colors.textPrimary,
                    borderColor: captionInput.trim() ? theme.colors.accent : theme.colors.border,
                  },
                ]}
                placeholder="Describe your vision..."
                placeholderTextColor={theme.colors.textTertiary}
                value={captionInput}
                onChangeText={setCaptionInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={savePhoto}
                multiline
                maxLength={100}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { borderColor: theme.colors.border }]}
                  onPress={() => {
                    mediumHaptic();
                    setShowPhotoModal(false);
                    setPendingImageUri(null);
                    setCaptionInput('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalCancelText, { color: theme.colors.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalSaveButton,
                    {
                      backgroundColor: captionInput.trim() ? theme.colors.accent : theme.colors.border,
                      opacity: captionInput.trim() ? 1 : 0.5,
                    },
                  ]}
                  onPress={savePhoto}
                  disabled={!captionInput.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Fullscreen Photo Modal */}
      <Modal
        visible={showFullscreenModal}
        transparent
        animationType="none"
        onRequestClose={closeFullscreen}
        presentationStyle="overFullScreen"
      >
        <View style={styles.fullscreenOverlay}>
          {selectedPhoto && (
            <>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.fullscreenClose}
                onPress={closeFullscreen}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Add More Button */}
              <TouchableOpacity
                style={styles.fullscreenAdd}
                onPress={() => {
                  closeFullscreen();
                  const addTimeoutId = setTimeout(() => addPhoto(), 300);
                  timeoutsRef.current.push(addTimeoutId);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={28} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Photo */}
              <Animated.View
                style={[
                  styles.fullscreenImageContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={closeFullscreen}
                  style={styles.fullscreenImageTouchable}
                >
                  <Image
                    source={{ uri: selectedPhoto.imageUri }}
                    style={styles.fullscreenImage}
                    resizeMode="contain"
                    onError={() => {
                      setImageErrors(prev => ({
                        ...prev,
                        [selectedPhoto.id]: true,
                      }));
                    }}
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Bottom Content */}
              <Animated.View
                style={[
                  styles.fullscreenContent,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              >
                <Text style={styles.fullscreenCaption}>{selectedPhoto.caption}</Text>
                <TouchableOpacity
                  style={styles.fullscreenDeleteButton}
                  onPress={handleDeleteFromFullscreen}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.fullscreenDeleteText}>Delete</Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
        </View>
      </Modal>
    </>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...tokens.typography.body,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.xl,
    paddingBottom: TAB_BAR_SPACE + 100,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.xl,
  },
  emptyTitle: {
    ...tokens.typography.h2,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...tokens.typography.body,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.lg,
    ...tokens.shadows.card,
  },
  emptyButtonText: {
    ...tokens.typography.bodyBold,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Grid
  gridContainer: {
    padding: GRID_GAP,
  },
  gridRow: {
    gap: GRID_GAP,
  },
  gridItem: {
    backgroundColor: tokens.colors.surface,
    overflow: 'hidden',
    borderRadius: 4,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridItemError: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.bg,
    gap: 8,
  },
  gridItemErrorText: {
    ...tokens.typography.caption,
    fontSize: 10,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    borderTopLeftRadius: tokens.radii.xl,
    borderTopRightRadius: tokens.radii.xl,
    padding: tokens.spacing.xl,
    maxHeight: '80%',
  },
  modalPreviewContainer: {
    width: '100%',
    height: 200,
    marginBottom: tokens.spacing.lg,
    borderRadius: tokens.radii.md,
    overflow: 'hidden',
    backgroundColor: tokens.colors.bg,
  },
  modalPreview: {
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    ...tokens.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: tokens.spacing.md,
    letterSpacing: -0.3,
  },
  modalInput: {
    ...tokens.typography.body,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radii.md,
    borderWidth: 2,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: tokens.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  modalCancelText: {
    ...tokens.typography.bodyBold,
    fontWeight: '600',
    fontSize: 16,
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  modalSaveText: {
    ...tokens.typography.bodyBold,
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Fullscreen Modal
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
  },
  fullscreenClose: {
    position: 'absolute',
    top: 50,
    left: tokens.spacing.lg,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 22,
    zIndex: 10,
  },
  fullscreenAdd: {
    position: 'absolute',
    top: 50,
    right: tokens.spacing.lg,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 22,
    zIndex: 10,
  },
  fullscreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImageTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: width,
    height: '70%',
    maxHeight: 600,
  },
  fullscreenContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl + tokens.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    gap: tokens.spacing.md,
  },
  fullscreenCaption: {
    ...tokens.typography.h3,
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.3,
    marginBottom: tokens.spacing.sm,
  },
  fullscreenDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  fullscreenDeleteText: {
    ...tokens.typography.bodyMedium,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
