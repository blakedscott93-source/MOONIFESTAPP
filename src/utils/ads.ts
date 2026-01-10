import { InterstitialAd, AdEventType } from './adWrapper';
import { isPremiumUser } from './premium';
import { adConfig } from './adConfig';

const adUnitId = adConfig.interstitialId;

// Counter to track actions for frequency capping
let actionCounter = 0;
// Show ad every 3 actions (e.g. 3 journal entries, 3 vision board adds)
const AD_FREQUENCY = 3;

let interstitial: any = null;
let adLoaded = false;

export const loadInterstitial = () => {
    if (interstitial) return;

    interstitial = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
    });

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
        adLoaded = true;
    });

    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        adLoaded = false;
        interstitial = null;
        loadInterstitial(); // Preload next one
    });

    interstitial.load();
};

export const showInterstitial = async (force: boolean = false): Promise<boolean> => {
    // Check premium status
    const isPremium = await isPremiumUser();
    if (isPremium) return false;

    // Increment counter
    actionCounter++;

    // Check frequency
    if (!force && actionCounter % AD_FREQUENCY !== 0) {
        return false;
    }

    if (interstitial && adLoaded) {
        interstitial.show();
        return true;
    } else {
        // If not loaded, try to load for next time
        loadInterstitial();
        return false;
    }
};

// Initialize ad loading
loadInterstitial();
