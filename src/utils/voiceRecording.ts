import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let recording: Audio.Recording | null = null;
let recordingUri: string | null = null;

// Recording modes
export const RECORDING_OPTIONS = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

// Request microphone permissions
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    return false;
  }
}

// Check if we have recording permission
export async function hasRecordingPermission(): Promise<boolean> {
  try {
    const { status } = await Audio.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking recording permission:', error);
    return false;
  }
}

// Start recording
export async function startRecording(): Promise<void> {
  try {
    // Request permission first
    const hasPermission = await hasRecordingPermission();
    if (!hasPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        throw new Error('Microphone permission not granted');
      }
    }

    // Stop any existing recording
    if (recording) {
      await stopRecording();
    }

    // Set audio mode for recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    // Create new recording
    const { recording: newRecording } = await Audio.Recording.createAsync(
      Platform.select({
        ios: RECORDING_OPTIONS.ios,
        android: RECORDING_OPTIONS.android,
        web: RECORDING_OPTIONS.web,
        default: RECORDING_OPTIONS.android,
      }) as any
    );

    recording = newRecording;
    console.log('🎤 Recording started');
  } catch (error) {
    console.error('Failed to start recording:', error);
    throw error;
  }
}

// Stop recording and return URI
export async function stopRecording(): Promise<string | null> {
  try {
    if (!recording) {
      console.log('No active recording to stop');
      return null;
    }

    console.log('⏹️ Stopping recording...');
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recordingUri = uri;
    recording = null;

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    console.log('✅ Recording stopped, URI:', uri);
    return uri;
  } catch (error) {
    console.error('Failed to stop recording:', error);
    recording = null;
    return null;
  }
}

// Cancel recording without saving
export async function cancelRecording(): Promise<void> {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      recording = null;
      recordingUri = null;
      console.log('❌ Recording cancelled');
    }

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (error) {
    console.error('Failed to cancel recording:', error);
  }
}

// Get recording status (for monitoring)
export async function getRecordingStatus(): Promise<Audio.RecordingStatus | null> {
  try {
    if (recording) {
      return await recording.getStatusAsync();
    }
    return null;
  } catch (error) {
    console.error('Failed to get recording status:', error);
    return null;
  }
}

// Check if currently recording
export function isRecording(): boolean {
  return recording !== null;
}

// Get duration of current recording in milliseconds
export async function getRecordingDuration(): Promise<number> {
  try {
    const status = await getRecordingStatus();
    if (status && status.isRecording) {
      return status.durationMillis;
    }
    return 0;
  } catch (error) {
    console.error('Failed to get recording duration:', error);
    return 0;
  }
}

// Get metering level (for waveform visualization)
export async function getMeteringLevel(): Promise<number> {
  try {
    const status = await getRecordingStatus();
    if (status && status.isRecording && status.metering !== undefined) {
      // Normalize metering to 0-1 range
      // expo-av metering is typically in dB, range -160 to 0
      const normalized = Math.max(0, Math.min(1, (status.metering + 160) / 160));
      return normalized;
    }
    return 0;
  } catch (error) {
    return 0;
  }
}

// Play back a recording
export async function playRecording(uri: string): Promise<Audio.Sound | null> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );
    return sound;
  } catch (error) {
    console.error('Failed to play recording:', error);
    return null;
  }
}

// Format duration for display (milliseconds to MM:SS)
export function formatDuration(durationMillis: number): string {
  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
