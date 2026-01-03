import { Audio, AVPlaybackStatus } from 'expo-av';

export class AudioPlayer {
  private sound: Audio.Sound | null = null;
  private isLoaded: boolean = false;

  async loadAudio(audioPath: any): Promise<void> {
    try {
      // Unload previous sound if exists
      if (this.sound) {
        await this.unloadAudio();
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Create and load sound
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
    } catch (error) {
      console.error('Error pausing audio:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.sound || !this.isLoaded) {
      return;
    }

    try {
      await this.sound.stopAsync();
      await this.sound.setPositionAsync(0);
    } catch (error) {
      console.error('Error stopping audio:', error);
      throw error;
    }
  }

  async seek(positionMillis: number): Promise<void> {
    if (!this.sound || !this.isLoaded) {
      throw new Error('Audio not loaded');
    }

    try {
      await this.sound.setPositionAsync(positionMillis);
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

    this.sound.setOnPlaybackStatusUpdate(callback);
  }

  async unloadAudio(): Promise<void> {
    if (!this.sound) {
      return;
    }

    try {
      await this.sound.unloadAsync();
      this.sound = null;
      this.isLoaded = false;
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  }

  getIsLoaded(): boolean {
    return this.isLoaded;
  }
}

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
} as const;

export const MEDITATION_AUDIO = {
  'morning-1': require('../../assets/audio/meditations/morning-clarity.mp3'),
  'morning-2': require('../../assets/audio/meditations/energize-day.mp3'),
  'morning-3': require('../../assets/audio/meditations/focus-intention.mp3'),
  'midday-1': require('../../assets/audio/meditations/midday-reset.mp3'),
  'midday-2': require('../../assets/audio/meditations/stress-relief.mp3'),
  'midday-3': require('../../assets/audio/meditations/productivity-boost.mp3'),
  'sleep-1': require('../../assets/audio/meditations/deep-sleep.mp3'),
  'sleep-2': require('../../assets/audio/meditations/peaceful-rest.mp3'),
  'sleep-3': require('../../assets/audio/meditations/dream-journey.mp3'),
} as const;

export type AffirmationAudioId = keyof typeof AFFIRMATION_AUDIO;
export type MeditationAudioId = keyof typeof MEDITATION_AUDIO;
