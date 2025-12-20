/**
 * Community Screen
 * Similar to I Am Sober app's community feature
 * Premium feature - users can share milestones, struggles, wins, and support each other
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { AppHeader } from '../components/AppHeader';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { PremiumGate } from '../components/PremiumGate';
import { isPremiumUser } from '../utils/premium';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { mediumHaptic, successHaptic } from '../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@community_posts';

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userStreak: number;
  type: 'milestone' | 'struggle' | 'win' | 'support';
  content: string;
  likes: number;
  comments: number;
  createdAt: string;
  likedByUser?: boolean;
}

type PostFilter = 'all' | 'milestone' | 'struggle' | 'win' | 'support';

export default function CommunityScreen({ navigation }: any) {
  const { appState } = useApp();
  const { showSuccess, showError } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState<PostFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [showNewPostInput, setShowNewPostInput] = useState(false);
  const [postType, setPostType] = useState<CommunityPost['type']>('win');
  const [isPosting, setIsPosting] = useState(false);
  const [likingPostId, setLikingPostId] = useState<string | null>(null);

  useEffect(() => {
    checkPremiumStatus();
    loadPosts();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const premium = await isPremiumUser();
      setIsPremium(premium);
      // Don't show premium gate on load - only when user tries to interact
    } catch (error) {
      console.error('Error checking premium status:', error);
      // Default to non-premium on error
      setIsPremium(false);
    }
  };

  const loadPosts = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedPosts = JSON.parse(saved);
        setPosts(parsedPosts);
      } else {
        // Load sample posts for demo
        loadSamplePosts();
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      showError('Error', 'Failed to load community posts. Please try again.');
      // Load sample posts as fallback
      loadSamplePosts();
    }
  };

  const loadSamplePosts = () => {
    const samplePosts: CommunityPost[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Manifestor123',
        userStreak: 45,
        type: 'milestone',
        content: 'Just hit 45 days! This challenge has transformed my life. Keep going everyone! 🔥',
        likes: 23,
        comments: 5,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'GratefulSoul',
        userStreak: 12,
        type: 'win',
        content: 'Got the job I was manifesting! The daily affirmations really worked. Trust the process! ✨',
        likes: 45,
        comments: 12,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'DayByDay',
        userStreak: 7,
        type: 'struggle',
        content: 'Having a tough day today but staying committed to my practice. We got this! 💪',
        likes: 18,
        comments: 8,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        userId: 'user4',
        userName: 'AbundanceSeeker',
        userStreak: 30,
        type: 'support',
        content: 'Remember: Every day you show up is a win. Progress over perfection! 🌟',
        likes: 32,
        comments: 3,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ];
    setPosts(samplePosts);
    savePosts(samplePosts);
  };

  const savePosts = async (postsToSave: CommunityPost[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(postsToSave));
    } catch (error) {
      console.error('Error saving posts:', error);
      showError('Error', 'Failed to save post. Please try again.');
      throw error; // Re-throw to allow caller to handle
    }
  };

  const handleCreatePost = async () => {
    if (!isPremium) {
      setShowPremiumGate(true);
      return;
    }

    if (!newPostText.trim()) {
      showError('Error', 'Please write something before posting.');
      return;
    }

    setIsPosting(true);
    try {
      const newPost: CommunityPost = {
        id: Date.now().toString(),
        userId: 'current_user',
        userName: 'You',
        userStreak: appState.currentStreak,
        type: postType,
        content: newPostText.trim(),
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        likedByUser: false,
      };

      // Optimistic update
      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      
      await savePosts(updatedPosts);
      setNewPostText('');
      setShowNewPostInput(false);
      successHaptic();
      showSuccess('Posted!', 'Your post has been shared with the community.');
    } catch (error) {
      // Revert optimistic update on error
      setPosts(posts);
      showError('Error', 'Failed to post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!isPremium) {
      setShowPremiumGate(true);
      return;
    }

    // Prevent double-tapping
    if (likingPostId === postId) return;

    setLikingPostId(postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const wasLiked = post.likedByUser;
    const previousPosts = [...posts];

    // Optimistic update
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: wasLiked ? p.likes - 1 : p.likes + 1,
          likedByUser: !wasLiked,
        };
      }
      return p;
    });

    setPosts(updatedPosts);
    mediumHaptic();

    try {
      await savePosts(updatedPosts);
    } catch (error) {
      // Revert on error
      setPosts(previousPosts);
      showError('Error', 'Failed to update like. Please try again.');
    } finally {
      setLikingPostId(null);
    }
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.type === filter);

  const getPostTypeIcon = (type: CommunityPost['type']): string => {
    switch (type) {
      case 'milestone': return 'trophy';
      case 'win': return 'star';
      case 'struggle': return 'heart';
      case 'support': return 'hand-left';
      default: return 'chatbubble';
    }
  };

  const getPostTypeColor = (type: CommunityPost['type']): string => {
    switch (type) {
      case 'milestone': return '#FFD700';
      case 'win': return '#4ECDC4';
      case 'struggle': return '#FF6B9D';
      case 'support': return '#8B7DD8';
      default: return Theme.colors.accent;
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderPost = ({ item }: { item: CommunityPost }) => {
    const typeColor = getPostTypeColor(item.type);
    const typeIcon = getPostTypeIcon(item.type);

    return (
      <View style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: typeColor + '20' }]}>
              <Ionicons name="person" size={20} color={typeColor} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.userName}</Text>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={12} color="#FF6B35" />
                <Text style={styles.streakText}>{item.userStreak} days</Text>
              </View>
            </View>
          </View>
          <View style={[styles.postTypeBadge, { backgroundColor: typeColor + '20' }]}>
            <Ionicons name={typeIcon as any} size={16} color={typeColor} />
            <Text style={[styles.postTypeText, { color: typeColor }]}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
        </View>

        {/* Post Content */}
        <Text style={styles.postContent}>{item.content}</Text>

        {/* Post Footer */}
        <View style={styles.postFooter}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item.id)}
              disabled={!isPremium || likingPostId === item.id}
              accessibilityLabel={item.likedByUser ? 'Unlike post' : 'Like post'}
              accessibilityRole="button"
            >
            <Ionicons
              name={item.likedByUser ? 'heart' : 'heart-outline'}
              size={20}
              color={item.likedByUser ? '#FF6B9D' : Theme.colors.textSecondary}
            />
            <Text style={[
              styles.actionText,
              item.likedByUser && styles.actionTextLiked
            ]}>
              {item.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            disabled={!isPremium}
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={Theme.colors.textSecondary}
            />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>

          <Text style={styles.timeAgo}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  const renderFilterChips = () => {
    const filters: Array<{ id: PostFilter; label: string; icon: string }> = [
      { id: 'all', label: 'All', icon: 'apps' },
      { id: 'milestone', label: 'Milestones', icon: 'trophy' },
      { id: 'win', label: 'Wins', icon: 'star' },
      { id: 'struggle', label: 'Struggles', icon: 'heart' },
      { id: 'support', label: 'Support', icon: 'hand-left' },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filterOption) => (
          <TouchableOpacity
            key={filterOption.id}
            style={[
              styles.filterChip,
              filter === filterOption.id && styles.filterChipActive,
              filter === filterOption.id && { backgroundColor: Theme.colors.accent + '20' },
            ]}
            onPress={() => setFilter(filterOption.id)}
          >
            <Ionicons
              name={filterOption.icon as any}
              size={16}
              color={filter === filterOption.id ? Theme.colors.accent : Theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.filterChipText,
                filter === filterOption.id && { color: Theme.colors.accent },
              ]}
            >
              {filterOption.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <Screen style={styles.container}>
      <AppHeader
        title="Community"
        subtitle="Connect with fellow manifestors"
        leftIcon={{
          name: 'chevron-back',
          onPress: () => navigation.goBack(),
          accessibilityLabel: 'Go back',
        }}
        rightIcon={{
          name: 'add-circle-outline',
          onPress: () => {
            if (!isPremium) {
              setShowPremiumGate(true);
            } else {
              setShowNewPostInput(true);
            }
          },
          accessibilityLabel: 'Create post',
          color: Theme.colors.accent,
        }}
      />

      {/* Premium Gate Modal */}
      <PremiumGate
        visible={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        onUpgrade={() => {
          // In production, navigate to payment screen
          Alert.alert(
            'Upgrade to Premium',
            'Premium subscription will be available soon! For now, you can enable premium features in settings for testing.',
            [
              {
                text: 'Enable (Test)',
                onPress: async () => {
                  const { setPremiumStatus } = await import('../utils/premium');
                  await setPremiumStatus(true);
                  setIsPremium(true);
                  setShowPremiumGate(false);
                  showSuccess('Premium Enabled', 'Premium features unlocked! (Test mode)');
                },
              },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
        featureName="Community"
        featureDescription="Connect with thousands of manifestors, share your journey, celebrate milestones, and support each other."
      />

      {/* New Post Input */}
      {showNewPostInput && (
        <View style={styles.newPostContainer}>
          <View style={styles.newPostHeader}>
            <Text style={styles.newPostTitle}>Create Post</Text>
            <TouchableOpacity onPress={() => setShowNewPostInput(false)}>
              <Ionicons name="close" size={24} color={Theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Post Type Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.postTypeSelector}
          >
            {(['win', 'milestone', 'struggle', 'support'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.postTypeButton,
                  postType === type && [
                    styles.postTypeButtonActive,
                    { backgroundColor: getPostTypeColor(type) + '20', borderColor: getPostTypeColor(type) },
                  ],
                ]}
                onPress={() => setPostType(type)}
              >
                <Ionicons
                  name={getPostTypeIcon(type) as any}
                  size={20}
                  color={postType === type ? getPostTypeColor(type) : Theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.postTypeButtonText,
                    postType === type && { color: getPostTypeColor(type) },
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={styles.newPostInput}
            placeholder="Share your journey..."
            placeholderTextColor={Theme.colors.textTertiary}
            value={newPostText}
            onChangeText={setNewPostText}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <View style={styles.newPostFooter}>
            <Text style={styles.charCount}>{newPostText.length}/500</Text>
            <TouchableOpacity
              style={[
                styles.postButton,
                (!newPostText.trim() || isPosting) && styles.postButtonDisabled,
              ]}
              onPress={handleCreatePost}
              disabled={!newPostText.trim() || isPosting}
              accessibilityLabel="Post to community"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['#C77DFF', '#9D4EDD']}
                style={styles.postButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Posts List */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await loadPosts();
              } catch (error) {
                showError('Error', 'Failed to refresh posts. Please try again.');
              } finally {
                setRefreshing(false);
              }
            }}
            tintColor={Theme.colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color={Theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to share your journey!
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  filterContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.surface,
    gap: Theme.spacing.xs,
    marginRight: Theme.spacing.sm,
  },
  filterChipActive: {
    borderWidth: 1,
  },
  filterChipText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  postsList: {
    padding: Theme.spacing.lg,
    paddingTop: 0,
  },
  postCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadow.medium,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs / 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs / 2,
  },
  streakText: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
  },
  postTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs / 2,
    borderRadius: Theme.radius.sm,
    gap: Theme.spacing.xs / 2,
  },
  postTypeText: {
    ...Theme.typography.small,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  postContent: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    lineHeight: 22,
    marginBottom: Theme.spacing.md,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  actionText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  actionTextLiked: {
    color: '#FF6B9D',
  },
  timeAgo: {
    ...Theme.typography.small,
    color: Theme.colors.textTertiary,
    marginLeft: 'auto',
  },
  newPostContainer: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  newPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  newPostTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  postTypeSelector: {
    marginBottom: Theme.spacing.md,
  },
  postTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: Theme.spacing.xs,
    marginRight: Theme.spacing.sm,
  },
  postTypeButtonActive: {
    borderWidth: 2,
  },
  postTypeButtonText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  newPostInput: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.bg,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    minHeight: 100,
    maxHeight: 200,
    marginBottom: Theme.spacing.md,
  },
  newPostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    ...Theme.typography.small,
    color: Theme.colors.textTertiary,
  },
  postButton: {
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonGradient: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
  },
  postButtonText: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xxxl * 2,
  },
  emptyTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
  },
  emptySubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
});

