/**
 * useScreenTracking Hook
 * Automatically tracks screen views for analytics
 */

import { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { trackScreenView } from '../utils/analytics';

/**
 * Track screen views automatically
 * Usage: useScreenTracking('ScreenName', { custom_property: 'value' });
 */
export function useScreenTracking(
  screenName: string,
  properties?: Record<string, any>
) {
  useFocusEffect(
    useCallback(() => {
      trackScreenView(screenName, properties);
    }, [screenName, properties])
  );
}
