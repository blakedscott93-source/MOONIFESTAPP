import React from 'react';
import { NativeModules, View, Text, StyleSheet } from 'react-native';
import { Logger } from './logger';

const { RNGoogleMobileAdsModule } = NativeModules;

// Check if the native module is actually linked
// If it's missing (e.g. inside Expo Go), we mock the library to prevent crashes
const isNativeModuleAvailable = false; // DISABLED FOR LAUNCH (Account Pending)

let BannerAd: any;
let TestIds: any;
let InterstitialAd: any;
let AdEventType: any;
let BannerAdSize: any;

// ... (Rest of logic will now use the "mock" path which we will also silence)

if (!isNativeModuleAvailable) {
    Logger.log('[AdWrapper] AdMob disabled for launch.');

    // MOCK: TestIds
    TestIds = { BANNER: '', INTERSTITIAL: '' };

    // MOCK: AdEventType
    AdEventType = {
        LOADED: 'loaded',
        CLOSED: 'closed',
        ERROR: 'error',
        OPENED: 'opened',
        CLICKED: 'clicked',
        PAID: 'paid',
    };

    // MOCK: BannerAdSize
    BannerAdSize = {
        ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
        BANNER: 'BANNER',
        FULL_BANNER: 'FULL_BANNER',
        LARGE_BANNER: 'LARGE_BANNER',
        LEADERBOARD: 'LEADERBOARD',
        MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
    };

    // MOCK: BannerAd Component - Renders NOTHING
    BannerAd = () => null;

    // MOCK: InterstitialAd Class - Does NOTHING
    InterstitialAd = {
        createForAdRequest: () => ({
            load: () => { },
            show: () => { },
            addAdEventListener: () => () => { },
            loaded: false,
        }),
    };
} else {
    // UNREACHABLE currently
    // const mobileAds = require('react-native-google-mobile-ads');
    // BannerAd = mobileAds.BannerAd;
    // TestIds = mobileAds.TestIds;
    // InterstitialAd = mobileAds.InterstitialAd;
    // AdEventType = mobileAds.AdEventType;
    // BannerAdSize = mobileAds.BannerAdSize;

    // Fallback references to prevent TS errors if this block is re-enabled without full restoration
    BannerAd = () => null;
    TestIds = { BANNER: '', INTERSTITIAL: '' };
    InterstitialAd = { createForAdRequest: () => ({ load: () => { }, show: () => { }, loaded: false }) };
    BannerAdSize = {};
}

const styles = StyleSheet.create({
    mockBanner: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 50,
    },
    mockText: {
        fontSize: 12,
        color: '#333',
        fontWeight: 'bold',
    },
    mockSubText: {
        fontSize: 10,
        color: '#666',
    }
});

export { BannerAd, TestIds, InterstitialAd, AdEventType, BannerAdSize, isNativeModuleAvailable };
