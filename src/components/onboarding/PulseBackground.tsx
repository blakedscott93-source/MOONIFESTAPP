import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withDelay,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { tokens } from '../../theme/tokens';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = Math.max(width, height) * 1.2;

const PulseCircle = ({ delay, index }: { delay: number; index: number }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, {
                    duration: 4000,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                }),
                -1,
                false
            )
        );
    }, [delay, progress]);

    const rStyle = useAnimatedStyle(() => {
        const scale = interpolate(progress.value, [0, 1], [0.8, 1.5]);
        const opacity = interpolate(progress.value, [0, 0.5, 1], [0.1, 0.05, 0]);

        return {
            opacity,
            transform: [{ scale }],
        };
    });

    return (
        <Animated.View
            style={[
                styles.circle,
                {
                    width: CIRCLE_SIZE,
                    height: CIRCLE_SIZE,
                    borderRadius: CIRCLE_SIZE / 2,
                    backgroundColor: index % 2 === 0 ? tokens.colors.primary : '#A78BFA', // Alternate slightly
                    zIndex: -1,
                },
                rStyle,
            ]}
        />
    );
};

export const PulseBackground = () => {
    return (
        <View style={StyleSheet.absoluteFillObject}>
            <View style={styles.container}>
                {[0, 1, 2].map((i) => (
                    <PulseCircle key={i} index={i} delay={i * 1200} />
                ))}
            </View>
            {/* Soft gradient overlay to ensure text readability if needed, usually handled by screen bg */}
            <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#FAF8FF', // Very soft purple tint background
    },
    circle: {
        position: 'absolute',
    },
    overlay: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)', // Light diffusion
    }
});
