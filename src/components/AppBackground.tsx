import React from 'react';
import { StyleSheet, View, ViewProps, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors } from '../utils/themeColors';

interface AppBackgroundProps extends ViewProps {
    children?: React.ReactNode;
}

/**
 * AppBackground Component - "Serene Flow" Design
 * 
 * This component implements a subtle, psychological "calm" background.
 * It uses a sophisticated gradient blend to create a premium, depth-rich environment
 * that isn't distracting but provides emotional resonance (trust/serenity).
 */
export const AppBackground: React.FC<AppBackgroundProps> = ({
    children,
    style,
    ...props
}) => {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const colors = getColors(isDark);

    // "Serene Flow" Gradient Configuration
    // We use opacity on the accent colors to blend them softly with the base background
    // Light Mode: Soft Lavender/Blue tint on White/Grey
    // Dark Mode: Deep Nebula feel

    // We cast to any for LinearGradient to avoid strict tuple length checks from the library types
    // The library expects [string, string, ...string[]] but dynamic arrays are harder to type strictly
    const gradientColors = (isDark
        ? [
            colors.bg,           // #121212 start
            colors.accentSoft,   // #3D2A5C middle-ish (Dark Purple)
            colors.bg            // #121212 end
        ]
        : [
            '#FFFFFF',           // Pure white start for clarity
            colors.bg,           // #F6F5FB base
            colors.surfaceSecondary // #F5F0FF soft purple tint
        ]) as any;

    // We add a subtle secondary gradient layer for "mesh-like" depth if needed,
    // but for performance and cleanness, a single well-tuned diagonal is often best.
    // Locations allow us to push the color to corners.
    const locations = [0, 0.5, 1] as any;

    return (
        <View style={[styles.container, style]} {...props}>
            <LinearGradient
                colors={gradientColors}
                locations={locations}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            {/* 
         Optional: Add a second absolute gradient for more complexity (Mesh effect)
         This adds a touch of "Info" blue to the bottom left for trust/calm
      */}
            <LinearGradient
                colors={isDark ? ['transparent', 'rgba(100, 181, 246, 0.05)'] : ['transparent', 'rgba(52, 152, 219, 0.03)']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
            />

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
