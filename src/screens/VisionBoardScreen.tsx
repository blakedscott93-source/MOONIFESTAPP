/**
 * Vision Board Screen
 * Clean, focused interface for daily vision visualization
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen } from '../components/layout/Screen';
import { GlassCard, PrimaryButton, SectionCard } from '../components/ui';
import { tokens } from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { getLocalDayKey } from '../utils/dayRollover';
import { useTabBarInset } from '../hooks/useTabBarInset';
import { mediumHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

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

export default function VisionBoardScreen({ navigation, route }: any) {
  const { theme, isDark } = useTheme();
  const { addGlowPoints, markVisionImageAdded, appState, hasVisionImageAddedToday } = useApp();
  const { showSuccess, showError, showPoints } = useToast();
  const tabBarInset = useTabBarInset();

  // State
  const [photos, setPhotos] = useState<VisionBoardPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<VisionBoardPhoto | null>(null);

  const todayKey = getLocalDayKey();
  const todayPhoto = useMemo(
    () => photos.find(p => p.boardId === 'today' && p.dayKey === todayKey),
    [photos, todayKey]
  );

  const pastVisionImages = useMemo(() => {
    return photos
      .filter(p => p.boardId === 'today' && p.dayKey !== todayKey)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [photos, todayKey]);

  const needsTodayImage = appState.challengeActive && !hasVisionImageAddedToday();

  // ============================================
  // DATA LOADING
  // ============================================

  useEffect(() => {
    loadData();
    if (route?.params?.fromDailyVisionImage) {
      setTimeout(() => {
        addPhoto();
      }, 500);
    }
  }, [route?.params?.fromDailyVisionImage]);

  const loadData = async () => {
    try {
      const photosData = await AsyncStorage.getItem(STORAGE_KEY_PHOTOS);
      const loadedPhotos: VisionBoardPhoto[] = photosData ? JSON.parse(photosData) : [];
      setPhotos(loadedPhotos);
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
    } catch (error) {
      console.error('Error saving photos:', error);
      showError('Error', 'Failed to save photo');
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
        aspect: [4, 5],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]) {
        setPendingImageUri(result.assets[0].uri);
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
        aspect: [4, 5],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]) {
        setPendingImageUri(result.assets[0].uri);
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

      if (todayPhoto) {
        const updatedPhotos = photos.map(p =>
          p.id === todayPhoto.id
            ? {
                ...p,
                imageUri: pendingImageUri,
                caption: captionInput.trim(),
                createdAt: new Date().toISOString(),
              }
            : p
        );
        await savePhotos(updatedPhotos);
      } else {
        const newPhoto: VisionBoardPhoto = {
          id: Date.now().toString(),
          boardId: 'today',
          imageUri: pendingImageUri,
          caption: captionInput.trim(),
          createdAt: new Date().toISOString(),
          dayKey: todayKey,
        };
        await savePhotos([...photos, newPhoto]);
      }

      if (!hasVisionImageAddedToday()) {
        await addGlowPoints(15, 'Added vision image');
        await markVisionImageAdded();
        showPoints(15, 'Vision image added');

        setTimeout(() => {
          navigation.navigate('Today');
        }, 1500);
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

  const deletePhoto = (photoId: string) => {
    Alert.alert('Delete Vision', 'Remove this vision image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedPhotos = photos.filter(p => p.id !== photoId);
          await savePhotos(updatedPhotos);
          showSuccess('Deleted', 'Vision image removed');
        },
      },
    ]);
  };

  const openPreview = (photo: VisionBoardPhoto) => {
    setPreviewPhoto(photo);
    setShowPreviewModal(true);
  };

  // ============================================
  // RENDER
  // ============================================

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
        subtitle="See it, believe it, achieve it"
        rightAction={{
          icon: 'home-outline',
          onPress: () => navigation.navigate('Today'),
          label: 'Back to Today',
        }}
        scroll={false}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarInset }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Today's Vision */}
          {todayPhoto ? (
            <SectionCard style={styles.todayCard}>
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => openPreview(todayPhoto)}
                onLongPress={() => {
                  Alert.alert('Options', todayPhoto.caption, [
                    { text: 'Replace Photo', onPress: () => addPhoto() },
                    { text: 'Delete', style: 'destructive', onPress: () => deletePhoto(todayPhoto.id) },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}
              >
                <Image source={{ uri: todayPhoto.imageUri }} style={styles.todayImage} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0, 0, 0, 0.85)']}
                  style={styles.imageOverlay}
                >
                  <View style={styles.completeBadge}>
                    <Ionicons name="checkmark-circle" size={18} color={tokens.colors.success} />
                    <Text style={styles.completeBadgeText}>Today's Vision</Text>
                  </View>
                  <Text style={styles.imageCaption}>{todayPhoto.caption}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </SectionCard>
          ) : (
            <GlassCard style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <View style={[styles.emptyIcon, { backgroundColor: `${tokens.colors.accent}15` }]}>
                  <Ionicons name="sparkles" size={52} color={tokens.colors.accent} />
                </View>

                <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                  Today's Vision Ritual
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                  Choose one powerful image representing what you're manifesting today
                </Text>

                <PrimaryButton
                  title="Add Your Vision"
                  onPress={() => {
                    mediumHaptic();
                    addPhoto();
                  }}
                  style={styles.addButton}
                  size="large"
                />
              </View>
            </GlassCard>
          )}

          {/* Past Visions Gallery */}
          {pastVisionImages.length > 0 && (
            <View style={styles.pastSection}>
              <View style={styles.pastHeader}>
                <Text style={[styles.pastTitle, { color: theme.colors.textPrimary }]}>Past Visions</Text>
                <Text style={[styles.pastCount, { color: theme.colors.textSecondary }]}>
                  {pastVisionImages.length}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pastGallery}
              >
                {pastVisionImages.map(photo => (
                  <TouchableOpacity
                    key={photo.id}
                    style={styles.pastItem}
                    onPress={() => openPreview(photo)}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: photo.imageUri }} style={styles.pastImage} resizeMode="cover" />
                    <LinearGradient
                      colors={['transparent', 'rgba(0, 0, 0, 0.75)']}
                      style={styles.pastOverlay}
                    >
                      <Text style={styles.pastCaption} numberOfLines={2}>
                        {photo.caption}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
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
                Describe your vision
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: theme.colors.bg,
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="What does this vision represent?"
                placeholderTextColor={theme.colors.textTertiary}
                value={captionInput}
                onChangeText={setCaptionInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={savePhoto}
                multiline
                maxLength={150}
              />
              <Text style={[styles.charCount, { color: theme.colors.textTertiary }]}>
                {captionInput.length}/150
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { borderColor: theme.colors.border }]}
                  onPress={() => {
                    setShowPhotoModal(false);
                    setPendingImageUri(null);
                    setCaptionInput('');
                  }}
                >
                  <Text style={[styles.modalCancelText, { color: theme.colors.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <PrimaryButton
                  title="Save Vision"
                  onPress={savePhoto}
                  disabled={!captionInput.trim()}
                  style={styles.modalSaveButton}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={showPreviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPreviewModal(false);
          setPreviewPhoto(null);
        }}
      >
        <View style={styles.previewOverlay}>
          {previewPhoto && (
            <>
              <TouchableOpacity
                style={styles.previewClose}
                onPress={() => {
                  setShowPreviewModal(false);
                  setPreviewPhoto(null);
                }}
              >
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  setShowPreviewModal(false);
                  setPreviewPhoto(null);
                }}
              >
                <Image
                  source={{ uri: previewPhoto.imageUri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.previewContent}>
                <Text style={styles.previewCaption}>{previewPhoto.caption}</Text>
                <TouchableOpacity
                  style={styles.previewDeleteButton}
                  onPress={() => {
                    setShowPreviewModal(false);
                    deletePhoto(previewPhoto.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.previewDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.lg,
    gap: tokens.spacing.xl,
  },

  // Today's Vision Card
  todayCard: {
    padding: 0,
    overflow: 'hidden',
  },
  todayImage: {
    width: '100%',
    height: 400,
    backgroundColor: tokens.colors.bg,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: tokens.spacing.xl,
    paddingTop: tokens.spacing.xxl * 2,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  completeBadgeText: {
    ...tokens.typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  imageCaption: {
    ...tokens.typography.h3,
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.4,
  },

  // Empty State
  emptyCard: {
    padding: tokens.spacing.xl * 2,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.xl,
    borderWidth: 2,
    borderColor: `${tokens.colors.accent}25`,
    ...tokens.shadows.card,
  },
  emptyTitle: {
    ...tokens.typography.h2,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    ...tokens.typography.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl * 1.5,
  },
  addButton: {
    width: '100%',
  },

  // Past Visions Gallery
  pastSection: {
    gap: tokens.spacing.md,
  },
  pastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pastTitle: {
    ...tokens.typography.h3,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  pastCount: {
    ...tokens.typography.caption,
    fontWeight: '600',
  },
  pastGallery: {
    gap: tokens.spacing.md,
    paddingRight: tokens.spacing.lg,
  },
  pastItem: {
    width: 140,
    height: 200,
    borderRadius: tokens.radii.md,
    overflow: 'hidden',
    backgroundColor: tokens.colors.surface,
    ...tokens.shadows.card,
  },
  pastImage: {
    width: '100%',
    height: '100%',
  },
  pastOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: tokens.spacing.md,
  },
  pastCaption: {
    ...tokens.typography.caption,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 16,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    maxHeight: '85%',
  },
  modalPreviewContainer: {
    width: '100%',
    height: 220,
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
    fontWeight: '700',
    marginBottom: tokens.spacing.md,
  },
  modalInput: {
    ...tokens.typography.body,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radii.md,
    borderWidth: 2,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: tokens.spacing.xs,
  },
  charCount: {
    ...tokens.typography.caption,
    textAlign: 'right',
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
    ...tokens.typography.bodyMedium,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
  },

  // Preview Modal
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewClose: {
    position: 'absolute',
    top: 50,
    right: tokens.spacing.lg,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 22,
    zIndex: 1,
  },
  previewImage: {
    width: width - tokens.spacing.xl * 2,
    height: '70%',
    maxHeight: 600,
  },
  previewContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: tokens.spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    gap: tokens.spacing.md,
  },
  previewCaption: {
    ...tokens.typography.h3,
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 28,
  },
  previewDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
  },
  previewDeleteText: {
    ...tokens.typography.bodyMedium,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
