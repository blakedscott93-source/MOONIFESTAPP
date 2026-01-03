/**
 * Saved Affirmations Utility
 * Manages user's saved/favorite affirmations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@saved_affirmations';

export interface SavedAffirmation {
  id: string;
  text: string;
  category?: string;
  savedAt: string;
  source?: 'library' | 'custom' | 'guided';
  sessionId?: string;
}

/**
 * Get all saved affirmations
 */
export async function getSavedAffirmations(): Promise<SavedAffirmation[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading saved affirmations:', error);
    return [];
  }
}

/**
 * Save an affirmation
 */
export async function saveAffirmation(
  text: string,
  category?: string,
  source?: 'library' | 'custom' | 'guided',
  sessionId?: string
): Promise<SavedAffirmation> {
  try {
    const affirmations = await getSavedAffirmations();
    
    // Check if already saved
    const existing = affirmations.find(a => a.text === text);
    if (existing) {
      return existing;
    }

    const newAffirmation: SavedAffirmation = {
      id: Date.now().toString(),
      text: text.trim(),
      category,
      savedAt: new Date().toISOString(),
      source,
      sessionId,
    };

    affirmations.unshift(newAffirmation); // Add to beginning
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(affirmations));

    return newAffirmation;
  } catch (error) {
    console.error('Error saving affirmation:', error);
    throw error;
  }
}

/**
 * Remove a saved affirmation
 */
export async function removeSavedAffirmation(id: string): Promise<void> {
  try {
    const affirmations = await getSavedAffirmations();
    const filtered = affirmations.filter(a => a.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing saved affirmation:', error);
    throw error;
  }
}

/**
 * Check if an affirmation is saved
 */
export async function isAffirmationSaved(text: string): Promise<boolean> {
  try {
    const affirmations = await getSavedAffirmations();
    return affirmations.some(a => a.text === text);
  } catch (error) {
    console.error('Error checking if affirmation is saved:', error);
    return false;
  }
}


