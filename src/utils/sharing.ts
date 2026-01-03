import { Share, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';

export interface ShareContent {
  title: string;
  message: string;
  url?: string;
}

/**
 * Share text content using native share sheet
 */
export async function shareText(content: ShareContent): Promise<boolean> {
  try {
    const result = await Share.share({
      title: content.title,
      message: content.message,
      url: content.url,
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
      } else {
      }
      return true;
    } else if (result.action === Share.dismissedAction) {
      return false;
    }
    return false;
  } catch (error) {
    console.error('Error sharing:', error);
    return false;
  }
}

/**
 * Share achievement unlock
 */
export async function shareAchievement(
  achievementTitle: string,
  achievementDescription: string,
  glowPoints: number
): Promise<boolean> {
  const message = `🏆 Achievement Unlocked!\n\n${achievementTitle}\n${achievementDescription}\n\n+${glowPoints} Glow Points earned!\n\nJoin me on Moonifest - manifest your dreams! ✨`;

  return shareText({
    title: 'Achievement Unlocked! 🏆',
    message,
  });
}

/**
 * Share streak milestone
 */
export async function shareStreak(streakDays: number): Promise<boolean> {
  const message = `🔥 ${streakDays} Day Streak!\n\nI've maintained my manifestation practice for ${streakDays} days straight on Moonifest!\n\nConsistency is the key to manifesting your dreams. ✨`;

  return shareText({
    title: `${streakDays} Day Streak! 🔥`,
    message,
  });
}

/**
 * Share vision board (requires view reference)
 */
export async function shareVisionBoard(
  viewRef: any,
  visionCount: number
): Promise<boolean> {
  try {
    // Capture the view as an image
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 0.9,
    });

    const message = `✨ My Vision Board\n\nI have ${visionCount} visions that I'm manifesting on Moonifest!\n\nWhat are you manifesting? Join me! 💫`;

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      // Fallback to text sharing
      return shareText({
        title: 'My Vision Board ✨',
        message,
      });
    }

    // Share the image
    await Sharing.shareAsync(uri, {
      dialogTitle: 'Share your Vision Board',
      mimeType: 'image/png',
    });

    return true;
  } catch (error) {
    console.error('Error sharing vision board:', error);
    return false;
  }
}

/**
 * Share journal entry (with privacy option)
 */
export async function shareJournalEntry(
  entry: string,
  shareFullEntry: boolean = false
): Promise<boolean> {
  const message = shareFullEntry
    ? `✨ My Gratitude Journal Entry\n\n${entry}\n\nI'm practicing gratitude daily on Moonifest. Join me! 💜`
    : `✨ I just completed my daily gratitude practice on Moonifest!\n\nGratitude transforms everything. What are you grateful for today? 💜`;

  return shareText({
    title: 'My Gratitude Practice ✨',
    message,
  });
}

/**
 * Share progress/stats
 */
export async function shareProgress(stats: {
  streak: number;
  totalDays: number;
  achievements: number;
  glowPoints: number;
}): Promise<boolean> {
  const message = `✨ My Moonifest Journey\n\n🔥 ${stats.streak} day streak\n📅 ${stats.totalDays} total days\n🏆 ${stats.achievements} achievements unlocked\n⭐ ${stats.glowPoints} Glow Points earned\n\nManifesting my dreams one day at a time! 💫`;

  return shareText({
    title: 'My Manifestation Journey ✨',
    message,
  });
}

/**
 * Share app invitation
 */
export async function shareAppInvitation(): Promise<boolean> {
  const message = `✨ Transform your life with Moonifest\n\nI've been using Moonifest to:\n• Practice daily gratitude\n• Set and achieve meaningful goals\n• Build positive habits\n• Manifest my dreams\n\nJoin me on this incredible journey! 💫`;

  return shareText({
    title: 'Try Moonifest! ✨',
    message,
    // App store URLs will be added when published
    // url: Platform.OS === 'ios' 
    //   ? 'https://apps.apple.com/app/moonifest'
    //   : 'https://play.google.com/store/apps/details?id=com.moonifest.app',
  });
}
