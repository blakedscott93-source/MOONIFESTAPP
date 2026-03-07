/**
 * Voice-to-Text Transcription Service
 * 
 * Uses OpenAI Whisper API for transcription.
 * Falls back to mock in development if API key not available.
 */

import * as FileSystem from 'expo-file-system';
import { Logger } from './logger';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  duration?: number;
  language?: string;
  error?: string;
}

export interface TranscriptionOptions {
  language?: string;
  maxDuration?: number;
  hints?: string[];
}

/**
 * Transcribe audio file to text
 */
export async function transcribeAudio(
  audioUri: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  // Use OpenAI Whisper if API key available
  if (OPENAI_API_KEY) {
    return transcribeViaOpenAI(audioUri, options);
  }

  // Fallback to mock in dev
  if (__DEV__) {
    Logger.log('OpenAI API key not configured, using mock transcription');
    return mockTranscription(options);
  }

  return {
    text: '',
    error: 'Transcription service not available',
  };
}

/**
 * Transcribe via OpenAI Whisper API directly
 */
async function transcribeViaOpenAI(
  audioUri: string,
  options: TranscriptionOptions
): Promise<TranscriptionResult> {
  try {
    // Read audio file as base64
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: 'base64',
    });

    // Convert base64 to blob for form data
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const audioBlob = new Blob([bytes], { type: 'audio/m4a' });

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.m4a');
    formData.append('model', 'whisper-1');
    if (options.language) {
      formData.append('language', options.language.split('-')[0]);
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      Logger.error('OpenAI transcription error:', errorText);
      return { text: '', error: 'Transcription failed' };
    }

    const result = await response.json();
    return {
      text: result.text || '',
      confidence: 0.95,
      language: options.language || 'en-US',
    };
  } catch (error) {
    Logger.error('Transcription error:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Transcription failed',
    };
  }
}

/**
 * Mock transcription for development
 */
async function mockTranscription(
  options: TranscriptionOptions
): Promise<TranscriptionResult> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockTexts = [
    "I am so grateful for this beautiful day and all the abundance flowing into my life.",
    "Today I'm manifesting financial freedom and opportunities that align with my highest purpose.",
    "Gratitude fills my heart as I recognize all the blessings already present in my life.",
    "I'm thankful for my health, my family, and the courage to pursue my dreams.",
    "I'm calling in prosperity, love, and success. The universe supports my journey.",
  ];

  return {
    text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
    confidence: 0.95,
    language: options.language || 'en-US',
  };
}

/**
 * Check if transcription is available
 */
export function isTranscriptionAvailable(): boolean {
  return !!OPENAI_API_KEY || __DEV__;
}

/**
 * Get transcription service name
 */
export function getTranscriptionService(): string {
  if (OPENAI_API_KEY) return 'OpenAI Whisper';
  if (__DEV__) return 'Mock (Dev)';
  return 'None';
}
