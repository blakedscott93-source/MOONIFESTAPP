/**
 * Contact Support Utility
 * Handles opening email client or contact methods
 */

import { Linking, Platform, Alert } from 'react-native';

const SUPPORT_EMAIL = 'support@moonifest.app';
const SUPPORT_SUBJECT = 'Vortex Support Request';

/**
 * Open email client with pre-filled support email
 */
export async function openSupportEmail(): Promise<boolean> {
  try {
    const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}`;
    const canOpen = await Linking.canOpenURL(emailUrl);

    if (canOpen) {
      await Linking.openURL(emailUrl);
      return true;
    } else {
      // Fallback: show email address
      Alert.alert(
        'Contact Support',
        `Please email us at:\n\n${SUPPORT_EMAIL}\n\nWe'll get back to you as soon as possible!`,
        [{ text: 'OK' }]
      );
      return false;
    }
  } catch (error) {
    console.error('Error opening email:', error);
    Alert.alert(
      'Contact Support',
      `Please email us at:\n\n${SUPPORT_EMAIL}\n\nWe'll get back to you as soon as possible!`,
      [{ text: 'OK' }]
    );
    return false;
  }
}

/**
 * Copy support email to clipboard (if needed)
 */
export function getSupportEmail(): string {
  return SUPPORT_EMAIL;
}


