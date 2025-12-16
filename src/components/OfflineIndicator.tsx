import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { subscribeToNetworkState, getOfflineQueue } from '../utils/offline';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = subscribeToNetworkState(async (connected) => {
      setIsOnline(connected);

      if (!connected) {
        // Show indicator when offline
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }).start();
      } else {
        // Hide indicator when back online
        setTimeout(() => {
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
    };
  }, []);

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
