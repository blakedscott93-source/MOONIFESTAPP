import { Audio, AVPlaybackStatus } from 'expo-av';

/**
 * Audio player with optional background music support
 * Plays voice audio with an optional ambient background track
 */
export class AudioPlayer {
  private sound: Audio.Sound | null = null;
  private backgroundSound: Audio.Sound | null = null;
  private isLoaded: boolean = false;
  private isBackgroundLoaded: boolean = false;
  private backgroundVolume: number = 0.2; // 20% volume for background

  async loadAudio(audioPath: any, backgroundPath?: any): Promise<void> {
    try {
      // Unload previous sounds if they exist
      if (this.sound) {
        await this.unloadAudio();
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Create and load main (voice) sound
      const { sound } = await Audio.Sound.createAsync(audioPath, {
        shouldPlay: false,
        volume: 1.0,
      });

      // Ensure frequent progress callbacks for UI timers/progress bars
      try {
        await sound.setProgressUpdateIntervalAsync(250);
      } catch {
        // Non-fatal: some platforms/versions may not support this
      }

      this.sound = sound;
      this.isLoaded = true;

      // Load background music if provided
      if (backgroundPath) {
        try {
          const { sound: bgSound } = await Audio.Sound.createAsync(backgroundPath, {
            shouldPlay: false,
            volume: this.backgroundVolume,
            isLooping: true, // Loop background music
          });
          this.backgroundSound = bgSound;
          this.isBackgroundLoaded = true;
        } catch (bgError) {
          console.warn('Background music could not be loaded:', bgError);
          // Continue without background music - not critical
        }
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    if (!this.sound || !this.isLoaded) {
      throw new Error('Audio not loaded');
    }

    try {
      // Start background music first (if available)
      if (this.backgroundSound && this.isBackgroundLoaded) {
        await this.backgroundSound.playAsync();
      }

      // Then start voice audio
      await this.sound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  async pause(): Promise<void> {
    if (!this.sound || !this.isLoaded) {
      throw new Error('Audio not loaded');
    }

    try {
      await this.sound.pauseAsync();

      // Also pause background music
      if (this.backgroundSound && this.isBackgroundLoaded) {
        await this.backgroundSound.pauseAsync();
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    // If sound object is missing or not loaded, do nothing
    if (!this.sound) return;

    try {
      // Check status safely before stopping
      if (this.isLoaded) {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) {
          await this.sound.stopAsync();
          await this.sound.setPositionAsync(0);
        }
      }

      // Handle background music safely
      if (this.backgroundSound && this.isBackgroundLoaded) {
        const bgStatus = await this.backgroundSound.getStatusAsync();
        if (bgStatus.isLoaded) {
          await this.backgroundSound.stopAsync();
          await this.backgroundSound.setPositionAsync(0);
        }
      }
    } catch (error: any) {
      if (error?.message?.includes('not loaded')) {
        // Ignore "not loaded" errors as we're stopping anyway
        this.isLoaded = false;
        return;
      }
      console.warn('Silent error stopping audio:', error);
    }
  }

  async seek(positionMillis: number): Promise<void> {
    if (!this.sound || !this.isLoaded) {
      throw new Error('Audio not loaded');
    }

    try {
      await this.sound.setPositionAsync(positionMillis);
      // Note: We don't seek background music - it loops independently
    } catch (error) {
      console.error('Error seeking audio:', error);
      throw error;
    }
  }

  async getStatus(): Promise<AVPlaybackStatus> {
    if (!this.sound || !this.isLoaded) {
      throw new Error('Audio not loaded');
    }

    return await this.sound.getStatusAsync();
  }

  setOnPlaybackStatusUpdate(callback: (status: AVPlaybackStatus) => void): void {
    if (!this.sound || !this.isLoaded) {
      return;
    }

    // Wrap callback to stop background music when voice audio finishes
    this.sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      if (status.isLoaded && status.didJustFinish) {
        // Voice audio finished - stop background music
        this.stopBackgroundMusic();
      }
      callback(status);
    });
  }

  private async stopBackgroundMusic(): Promise<void> {
    if (this.backgroundSound && this.isBackgroundLoaded) {
      try {
        await this.backgroundSound.stopAsync();
      } catch (error) {
        console.warn('Error stopping background music:', error);
      }
    }
  }

  async unloadAudio(): Promise<void> {
    // Unload main sound
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
        this.isLoaded = false;
      } catch (error) {
        console.error('Error unloading audio:', error);
      }
    }

    // Unload background sound
    if (this.backgroundSound) {
      try {
        await this.backgroundSound.unloadAsync();
        this.backgroundSound = null;
        this.isBackgroundLoaded = false;
      } catch (error) {
        console.error('Error unloading background audio:', error);
      }
    }
  }

  getIsLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Set background music volume (0.0 to 1.0)
   */
  async setBackgroundVolume(volume: number): Promise<void> {
    this.backgroundVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundSound && this.isBackgroundLoaded) {
      await this.backgroundSound.setVolumeAsync(this.backgroundVolume);
    }
  }
}

// Background music tracks
export const BACKGROUND_MUSIC = {
  // Calm ambient tracks for meditation and affirmations
  'calm-ambient': require('../../assets/audio/backgrounds/calm-ambient.mp3'),
  'nature-sounds': null as any,
  'soft-piano': null as any,
} as const;

// Helper to get default background music
export const getDefaultBackgroundMusic = () => {
  // Return the first available background track, or undefined if none exist
  return BACKGROUND_MUSIC['calm-ambient'] || undefined;
};

// Audio file paths
export const AFFIRMATION_AUDIO = {
  'balance-1': require('../../assets/audio/affirmations/balance-1.mp3'),
  'fulfilled-1': require('../../assets/audio/affirmations/fulfilled-1.mp3'),
  'harmony-1': require('../../assets/audio/affirmations/harmony-1.mp3'),
  'stress-1': require('../../assets/audio/affirmations/stress-1.mp3'),
  'wealth-1': require('../../assets/audio/affirmations/wealth-1.mp3'),
  'love-1': require('../../assets/audio/affirmations/love-1.mp3'),
  'confidence-1': require('../../assets/audio/affirmations/confidence-1.mp3'),
  'healing-1': require('../../assets/audio/affirmations/healing-1.mp3'),
  // New files discovered
  'balance-2': require('../../assets/audio/affirmations/balance2eveningbalance.mp3'),
  'creative-1': require('../../assets/audio/affirmations/Crativeflowactivation.mp3'), // Typo in filename
  'growth-1': require('../../assets/audio/affirmations/innerfreedom.mp3'),
  'joy-1': require('../../assets/audio/affirmations/Joyinthepresent.mp3'),
  'healing-2': require('../../assets/audio/affirmations/Emotionalhealingspace.mp3'),
  'confidence-2': require('../../assets/audio/affirmations/quietconfidence.mp3'),
} as const;

export const MEDITATION_AUDIO = {
  'morning-1': require('../../assets/audio/meditations/morning-clarity.mp3'),
  'morning-2': require('../../assets/audio/meditations/energize-day.mp3'),
  'morning-3': require('../../assets/audio/meditations/focus-intention.mp3'),
  'morning-4': require('../../assets/audio/meditations/Morning-intention-grounding.mp3'),
  'midday-1': require('../../assets/audio/meditations/midday-reset.mp3'),
  'midday-2': require('../../assets/audio/meditations/stress-relief.mp3'),
  'midday-3': require('../../assets/audio/meditations/productivity-boost.mp3'),
  'midday-4': require('../../assets/audio/meditations/midday-calm-reset.mp3'),
  'midday-5': require('../../assets/audio/meditations/Creativity-flow-focus.mp3'),
  'sleep-1': require('../../assets/audio/meditations/deep-sleep.mp3'),
  'sleep-2': require('../../assets/audio/meditations/peaceful-rest.mp3'),
  'sleep-3': require('../../assets/audio/meditations/dream-journey.mp3'),
  'sleep-4': require('../../assets/audio/meditations/deep-sleep-2.mp3'),
  // New categories
  'wealth-1': require('../../assets/audio/meditations/abundance.mp3'),
  'growth-1': require('../../assets/audio/meditations/freedom-expansio-lightness.mp3'),
  'confidence-1': require('../../assets/audio/meditations/quiet-confidence-innerstrength.mp3'),
} as const;

export type AffirmationAudioId = keyof typeof AFFIRMATION_AUDIO;
export type MeditationAudioId = keyof typeof MEDITATION_AUDIO;
export type BackgroundMusicId = keyof typeof BACKGROUND_MUSIC;
