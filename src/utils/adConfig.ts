import { Platform } from 'react-native';
import { TestIds } from './adWrapper';

// =================================================================
// ADMOB CONFIGURATION
// =================================================================
// 1. Create an account at apps.admob.com
// 2. Create an App (Select Platform: Android/iOS)
// 3. Create Ad Units (Banner and Interstitial)
// 4. Copry the Ad Unit IDs and paste them below
// 5. Set __DEV__ check or isProduction flag to control test vs real ads
// =================================================================

// REPLACE with your real AdMob Unit IDs
const PRODUCTION_IDS = {
    android: {
        banner: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy',
        interstitial: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy',
    },
    ios: {
        banner: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy',
        interstitial: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy',
    },
};

// Automatically use Test IDs in development, Real IDs in production
const useRealAds = !__DEV__;

export const adConfig = {
    bannerId: useRealAds
        ? Platform.select({
            ios: PRODUCTION_IDS.ios.banner,
            android: PRODUCTION_IDS.android.banner,
            default: TestIds.BANNER,
        }) || TestIds.BANNER
        : TestIds.BANNER,

    interstitialId: useRealAds
        ? Platform.select({
            ios: PRODUCTION_IDS.ios.interstitial,
            android: PRODUCTION_IDS.android.interstitial,
            default: TestIds.INTERSTITIAL,
        }) || TestIds.INTERSTITIAL
        : TestIds.INTERSTITIAL,
};
