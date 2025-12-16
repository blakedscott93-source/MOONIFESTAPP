import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Voice-to-Text Transcription Service
 *
 * This module provides voice transcription capabilities using various services.
 *
 * IMPLEMENTATION OPTIONS:
 * 1. OpenAI Whisper API (Recommended - Best accuracy, multilingual)
 * 2. Google Cloud Speech-to-Text
 * 3. AWS Transcribe
 * 4. Azure Speech Services
 * 5. Deepgram (Fast, good for real-time)
 *
 * Current Status: Mock implementation
 * TODO: Integrate with your preferred service
 */

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  duration?: number;
  language?: string;
  error?: string;
}

export interface TranscriptionOptions {
  language?: string; // Default: 'en-US'
  maxDuration?: number; // Maximum recording duration in seconds
  hints?: string[]; // Context hints for better accuracy
}

/**
 * Transcribe audio file to text
 * @param audioUri - Local file URI of the recorded audio
 * @param options - Transcription options
 * @returns Transcription result
 */
export async function transcribeAudio(
  audioUri: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  try {
    console.log('🎯 Transcribing audio:', audioUri);

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      return {
        text: '',
        error: 'Audio file not found',
      };
    }

    // TODO: Implement actual transcription
    // For now, return mock transcription based on platform
    if (__DEV__) {
      return await mockTranscription(audioUri, options);
    }

    // PRODUCTION: Uncomment one of the implementations below
    // return await transcribeWithWhisper(audioUri, options);
    // return await transcribeWithGoogle(audioUri, options);
    // return await transcribeWithDeepgram(audioUri, options);

    return {
      text: '',
      error: 'Transcription service not configured. Please set up an API key.',
    };
  } catch (error) {
    console.error('Transcription error:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown transcription error',
    };
  }
}

/**
 * Mock transcription for development/testing
 */
async function mockTranscription(
  audioUri: string,
  options: TranscriptionOptions
): Promise<TranscriptionResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockTranscriptions = [
    "I am so grateful for this beautiful day and all the abundance flowing into my life.",
    "Today I'm manifesting financial freedom and opportunities that align with my highest purpose.",
    "I'm thankful for my health, my family, and the courage to pursue my dreams.",
    "Gratitude fills my heart as I recognize all the blessings already present in my life.",
    "I'm calling in prosperity, love, and success. The universe supports my journey.",
    "Thank you for the lessons, the growth, and the magic unfolding in my life.",
    "I am worthy of all the good things coming my way. Abundance is my natural state.",
    "Grateful for this moment, this breath, this chance to create my dream reality.",
  ];

  const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];

  return {
    text: randomText,
    confidence: 0.95,
    duration: 5.2,
    language: options.language || 'en-US',
  };
}

/**
 * OPTION 1: OpenAI Whisper API (Recommended)
 *
 * Setup:
 * 1. Get API key from https://platform.openai.com/api-keys
 * 2. Store in environment variable: OPENAI_API_KEY
 * 3. Uncomment this function
 *
 * Pricing: $0.006 per minute (very affordable)
 * Accuracy: Excellent (multilingual, handles accents well)
 */
async function transcribeWithWhisper(
  audioUri: string,
  options: TranscriptionOptions
): Promise<TranscriptionResult> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-api-key-here';

  try {
    // Read audio file as base64
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to form data
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('model', 'whisper-1');
    if (options.language) {
      formData.append('language', options.language.split('-')[0]); // 'en' from 'en-US'
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Whisper API error');
    }

    const result = await response.json();

    return {
      text: result.text,
      confidence: 0.9, // Whisper doesn't provide confidence scores
      language: options.language || 'en-US',
    };
  } catch (error) {
    console.error('Whisper transcription error:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Whisper API error',
    };
  }
}

/**
 * OPTION 2: Google Cloud Speech-to-Text
 *
 * Setup:
 * 1. Enable Cloud Speech-to-Text API in Google Cloud Console
 * 2. Get API key or set up service account
 * 3. Store credentials securely
 *
 * Pricing: $0.006 per 15 seconds
 * Accuracy: Excellent (best for English)
 */
async function transcribeWithGoogle(
  audioUri: string,
  options: TranscriptionOptions
): Promise<TranscriptionResult> {
  const GOOGLE_API_KEY = process.env.GOOGLE_CLOUD_API_KEY || 'your-api-key-here';

  try {
    // Read audio file as base64
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 44100,
            languageCode: options.language || 'en-US',
            enableAutomaticPunctuation: true,
            model: 'default',
          },
          audio: {
            content: audioBase64,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Google Speech API error');
    }

    const result = await response.json();

    if (!result.results || result.results.length === 0) {
      return {
        text: '',
        error: 'No speech detected',
      };
    }

    const transcription = result.results
      .map((r: any) => r.alternatives[0].transcript)
      .join(' ');
    const confidence = result.results[0]?.alternatives[0]?.confidence || 0;

    return {
      text: transcription,
      confidence,
      language: options.language || 'en-US',
    };
  } catch (error) {
    console.error('Google Speech transcription error:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Google Speech API error',
    };
  }
}

/**
 * OPTION 3: Deepgram (Fast, real-time capable)
 *
 * Setup:
 * 1. Sign up at https://deepgram.com
 * 2. Get API key from console
 * 3. Store in environment variable: DEEPGRAM_API_KEY
 *
 * Pricing: Pay-as-you-go, ~$0.0125 per minute
 * Accuracy: Very good (fast processing)
 */
async function transcribeWithDeepgram(
  audioUri: string,
  options: TranscriptionOptions
): Promise<TranscriptionResult> {
  const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || 'your-api-key-here';

  try {
    // Read audio file
    const audioData = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/m4a',
      },
      body: audioData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Deepgram API error');
    }

    const result = await response.json();
    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || '';
    const confidence = result.results?.channels[0]?.alternatives[0]?.confidence || 0;

    return {
      text: transcript,
      confidence,
      language: options.language || 'en-US',
    };
  } catch (error) {
    console.error('Deepgram transcription error:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Deepgram API error',
    };
  }
}

/**
 * Check if transcription is available
 */
export function isTranscriptionAvailable(): boolean {
  // Check if API keys are configured
  if (__DEV__) {
    return true; // Mock transcription always available in dev
  }

  // Check for configured API keys
  return !!(
    process.env.OPENAI_API_KEY ||
    process.env.GOOGLE_CLOUD_API_KEY ||
    process.env.DEEPGRAM_API_KEY
  );
}

/**
 * Get recommended service based on configuration
 */
export function getTranscriptionService(): string {
  if (process.env.OPENAI_API_KEY) return 'Whisper (OpenAI)';
  if (process.env.GOOGLE_CLOUD_API_KEY) return 'Google Cloud Speech';
  if (process.env.DEEPGRAM_API_KEY) return 'Deepgram';
  if (__DEV__) return 'Mock (Development)';
  return 'None';
}
