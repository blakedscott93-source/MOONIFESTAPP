import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BannerAd, BannerAdSize } from '../../utils/adWrapper';

import { adConfig } from '../../utils/adConfig';

interface BannerAdProps {
    unitId?: string;
    size?: any;
    style?: ViewStyle;
}

export const AdBanner: React.FC<BannerAdProps> = ({
    unitId = adConfig.bannerId,
    size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <BannerAd
                unitId={unitId}
                size={size}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginVertical: 10,
    },
});
