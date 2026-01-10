import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Custom SecureStore adapter for Supabase and general app usage.
 * Encrypts data on the device.
 */
const SecureStorageAdapter = {
    getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
        return SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
        return SecureStore.deleteItemAsync(key);
    },
};

export default SecureStorageAdapter;
