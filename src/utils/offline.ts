import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = '@offline_queue';
const LAST_SYNC_KEY = '@last_sync';

export interface OfflineOperation {
  id: string;
  type: 'achievement_unlock' | 'glow_points' | 'mood_entry' | 'journal_entry' | 'task_update';
  data: any;
  timestamp: string;
  retries: number;
}

/**
 * Check if device is online
 */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable === true;
}

/**
 * Get current network state
 */
export async function getNetworkState() {
  return await NetInfo.fetch();
}

/**
 * Subscribe to network state changes
 */
export function subscribeToNetworkState(callback: (isConnected: boolean) => void) {
  return NetInfo.addEventListener(state => {
    const connected = state.isConnected === true && state.isInternetReachable === true;
    callback(connected);
  });
}

/**
 * Queue an operation for offline sync
 */
export async function queueOfflineOperation(operation: Omit<OfflineOperation, 'id' | 'retries'>): Promise<void> {
  try {
    const queue = await getOfflineQueue();
    const newOperation: OfflineOperation = {
      ...operation,
      id: `${operation.type}_${Date.now()}_${Math.random()}`,
      retries: 0,
    };
    queue.push(newOperation);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log('📥 Operation queued for offline sync:', operation.type);
  } catch (error) {
    console.error('Error queuing offline operation:', error);
  }
}

/**
 * Get all queued offline operations
 */
export async function getOfflineQueue(): Promise<OfflineOperation[]> {
  try {
    const saved = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error getting offline queue:', error);
    return [];
  }
}

/**
 * Clear offline queue
 */
export async function clearOfflineQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing offline queue:', error);
  }
}

/**
 * Remove specific operation from queue
 */
export async function removeFromQueue(operationId: string): Promise<void> {
  try {
    const queue = await getOfflineQueue();
    const updated = queue.filter(op => op.id !== operationId);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing from queue:', error);
  }
}

/**
 * Increment retry count for operation
 */
export async function incrementRetries(operationId: string): Promise<void> {
  try {
    const queue = await getOfflineQueue();
    const updated = queue.map(op =>
      op.id === operationId ? { ...op, retries: op.retries + 1 } : op
    );
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error incrementing retries:', error);
  }
}

/**
 * Process offline queue when coming back online
 */
export async function processOfflineQueue(
  processor: (operation: OfflineOperation) => Promise<boolean>
): Promise<{ processed: number; failed: number }> {
  const queue = await getOfflineQueue();
  let processed = 0;
  let failed = 0;

  if (queue.length === 0) {
    return { processed, failed };
  }

  console.log(`📤 Processing ${queue.length} offline operations...`);

  for (const operation of queue) {
    try {
      // Skip if too many retries (max 3)
      if (operation.retries >= 3) {
        console.log(`❌ Max retries reached for operation: ${operation.type}`);
        await removeFromQueue(operation.id);
        failed++;
        continue;
      }

      // Try to process the operation
      const success = await processor(operation);

      if (success) {
        await removeFromQueue(operation.id);
        processed++;
        console.log(`✅ Processed offline operation: ${operation.type}`);
      } else {
        await incrementRetries(operation.id);
        failed++;
        console.log(`❌ Failed to process operation: ${operation.type}`);
      }
    } catch (error) {
      console.error(`Error processing operation ${operation.type}:`, error);
      await incrementRetries(operation.id);
      failed++;
    }
  }

  // Update last sync time
  await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

  return { processed, failed };
}

/**
 * Get last sync time
 */
export async function getLastSyncTime(): Promise<Date | null> {
  try {
    const saved = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return saved ? new Date(saved) : null;
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
}

/**
 * Check if data needs sync (e.g., last sync was more than 1 hour ago)
 */
export async function needsSync(hours: number = 1): Promise<boolean> {
  const lastSync = await getLastSyncTime();
  if (!lastSync) return true;

  const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
  return hoursSinceSync >= hours;
}
