/**
 * Hook to get bottom padding for floating tab bar
 * Prevents content from being hidden behind the tab bar
 */

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';

// Export constant for direct use
export const TAB_BAR_SPACE = tokens.tabBar.TAB_BAR_SPACE; // 100

export const useTabBarInset = () => {
  const insets = useSafeAreaInsets();
  
  // Floating pill: height + bottom offset + safe area + breathing room
  // Plus button is same height, so use the larger of the two
  const pillHeight = tokens.tabBar.PILL_HEIGHT || tokens.tabBar.height;
  const bottomOffset = tokens.tabBar.PILL_BOTTOM_OFFSET || tokens.tabBar.bottomOffset;
  const plusButtonSize = tokens.tabBar.PLUS_BUTTON_SIZE || 56;
  const maxHeight = Math.max(pillHeight, plusButtonSize);
  
  const bottomPadding = maxHeight + bottomOffset + insets.bottom + 20; // Extra breathing room for floating pill
  
  return bottomPadding;
};

