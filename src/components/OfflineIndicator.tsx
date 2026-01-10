import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { subscribeToNetworkState, getOfflineQueue } from '../utils/offline';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const hideTimeoutRef = React.useRef<any>(null);
  const isFirstLoad = React.useRef(true);

  useEffect(() => {
    // Skip on web - network detection not critical for web
    if (Platform.OS === 'web') return;

    // Subscribe to network changes
    const unsubscribe = subscribeToNetworkState(async (connected) => {
      // Prevent initial mount from triggering "Back Online"
      if (isFirstLoad.current) {
        setIsOnline(connected);
        isFirstLoad.current = false;
        // Only trigger offline animation if we start offline
        if (!connected) {
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
        return;
      }

      setIsOnline(connected);

      if (!connected) {
        // Show indicator when offline
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }).start();
      } else {
        // Hide indicator when back online
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 2000); // Show "Back Online" for 2 seconds
      }

      // Update queue count
      const queue = await getOfflineQueue();
      setQueueCount(queue.length);
    });

    // Check initial queue
    checkQueue();

    return () => {
      unsubscribe();
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, []);

  // Don't render on web
  if (Platform.OS === 'web') return null;

  const checkQueue = async () => {
    const queue = await getOfflineQueue();
    setQueueCount(queue.length);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isOnline ? Theme.colors.success : Theme.colors.warning,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons
        name={isOnline ? 'cloud-done' : 'cloud-offline'}
        size={16}
        color="#FFFFFF"
      />
      <Text style={styles.text}>
        {isOnline
          ? 'Back Online'
          : queueCount > 0
            ? `Offline • ${queueCount} pending`
            : 'Offline'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.xs,
    zIndex: 9999,
    elevation: 10,
  },
  text: {
    ...Theme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
