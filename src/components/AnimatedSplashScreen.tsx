import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SPLASH_QUOTES = [
    "What you seek is seeking you.",
    "Your thoughts create your reality.",
    "Trust the timing of your life.",
    "You are a magnet for miracles.",
    "The universe has your back.",
    "Vibrate higher.",
    "Manifestation begins with gratitude.",
    "Everything you need is already within you.",
    "Align yourself with abundance.",
    "Your potential is infinite."
];

interface AnimatedSplashScreenProps {
    onAnimationFinish?: () => void;
}

export function AnimatedSplashScreen({ onAnimationFinish }: AnimatedSplashScreenProps) {
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [quote] = useState(() => SPLASH_QUOTES[Math.floor(Math.random() * SPLASH_QUOTES.length)]);

    useEffect(() => {
        // Start Pulse Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Fade out after delay
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }).start(() => {
                onAnimationFinish?.();
            });
        }, 3000); // Show for at least 3 seconds

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.centerContent}>
                <Animated.Image
                    source={require('../../assets/icon.png')} // Fallback to icon if splash icon varies
                    style={[styles.logo, { transform: [{ scale: pulseAnim }] }]}
                    resizeMode="contain"
                />

                <View style={styles.quoteContainer}>
                    <Text style={styles.quoteText}>"{quote}"</Text>
                </View>
            </View>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <Text style={styles.brandText}>VORTEX</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
        zIndex: 9999, // Ensure it sits on top of everything
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 40,
    },
    logo: {
        width: 120, // Smaller, elegant size
        height: 120,
        marginBottom: 40,
    },
    quoteContainer: {
        marginTop: 20,
        opacity: 0.9,
    },
    quoteText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Sora_400Regular', // Assuming you have this font
        textAlign: 'center',
        lineHeight: 28,
        letterSpacing: 0.5,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
    },
    brandText: {
        color: '#666666',
        fontSize: 12,
        letterSpacing: 2,
        textTransform: 'uppercase',
    }
});
