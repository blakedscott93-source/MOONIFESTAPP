
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { isPremiumUser } from '../utils/premium';

/**
 * Hook to check if the current user is premium.
 * Updates on mount and when screen comes into focus.
 */
export function usePremium() {
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const checkPremium = useCallback(async () => {
        try {
            const status = await isPremiumUser();
            setIsPremium(status);
        } catch (error) {
            console.error('Error checking premium status:', error);
            setIsPremium(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            checkPremium();
        }, [checkPremium])
    );

    return { isPremium, loading, checkPremium };
}
