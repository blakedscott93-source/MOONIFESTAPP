/**
 * App Tutorial Modal
 * A multi-slide onboarding tutorial shown to first-time users
 * Explains how to use the app, especially the daily task reset system
 */

import React, { useState, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    FlatList,
    ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
    FadeIn,
    FadeInUp,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TUTORIAL_SEEN_KEY = '@hasSeenAppTutorial';

interface TutorialSlide {
    id: string;
    emoji: string;
    title: string;
    body: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const TUTORIAL_SLIDES: TutorialSlide[] = [
    {
        id: 'welcome',
        emoji: '✨',
        title: 'Welcome to Vortex!',
        body: "You're about to begin a transformative 45-day journey. Here's a quick guide to help you get the most out of your practice.",
        icon: 'sparkles',
    },
    {
        id: 'daily-reset',
        emoji: '🌅',
        title: 'Fresh Start Every Day',
        body: "Your 5 daily tasks reset at midnight. This isn't a bug—it's by design! Each day is a fresh opportunity to build your manifestation practice.",
        icon: 'sunny',
    },
    {
        id: 'five-tasks',
        emoji: '🎯',
        title: '5 Practices, 1 Goal',
        body: 'Complete all 5 tasks each day: Gratitude, Affirmations, Visualization, Journaling, and Meditation. Complete them all to mark your day as done!',
        icon: 'checkmark-done-circle',
    },
    {
        id: 'progress',
        emoji: '📈',
        title: 'Track Your Progress',
        body: 'Consistency is key! Complete all tasks daily to build your streak and unlock achievements. Your transformation journey starts now!',
        icon: 'trending-up',
    },
];

interface AppTutorialModalProps {
    visible: boolean;
    onComplete: () => void;
}

export function AppTutorialModal({ visible, onComplete }: AppTutorialModalProps) {
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const progressAnimation = useSharedValue(0);

    const isLastSlide = currentIndex === TUTORIAL_SLIDES.length - 1;

    const handleNext = async () => {
        if (isLastSlide) {
            // Mark tutorial as seen and close
            await AsyncStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
            onComplete();
        } else {
            // Go to next slide
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
            progressAnimation.value = withSpring(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const renderSlide = ({ item, index }: { item: TutorialSlide; index: number }) => (
        <View style={styles.slide}>
            <Animated.View
                entering={FadeInUp.delay(200).springify()}
                style={styles.emojiContainer}
            >
                <Text style={styles.emoji}>{item.emoji}</Text>
            </Animated.View>

            <Animated.Text
                entering={FadeInUp.delay(300).springify()}
                style={styles.title}
            >
                {item.title}
            </Animated.Text>

            <Animated.Text
                entering={FadeInUp.delay(400).springify()}
                style={styles.body}
            >
                {item.body}
            </Animated.Text>

            {/* Feature highlight for the "daily reset" slide */}
            {item.id === 'daily-reset' && (
                <Animated.View
                    entering={FadeIn.delay(500)}
                    style={styles.highlightBox}
                >
                    <Ionicons name="time-outline" size={20} color="#7C3AED" />
                    <Text style={styles.highlightText}>
                        Tasks reset at midnight in your timezone
                    </Text>
                </Animated.View>
            )}
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={false}
            statusBarTranslucent
        >
            <LinearGradient
                colors={['#7C3AED', '#9333EA', '#A855F7']}
                style={[styles.container, { paddingTop: insets.top }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Skip button */}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={async () => {
                        await AsyncStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
                        onComplete();
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>

                {/* Slides */}
                <FlatList
                    ref={flatListRef}
                    data={TUTORIAL_SLIDES}
                    renderItem={renderSlide}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    bounces={false}
                    style={styles.flatList}
                />

                {/* Progress dots */}
                <View style={styles.dotsContainer}>
                    {TUTORIAL_SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentIndex === index && styles.dotActive,
                            ]}
                        />
                    ))}
                </View>

                {/* Bottom button */}
                <Animated.View
                    entering={FadeInDown.delay(500)}
                    style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}
                >
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={handleNext}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.ctaText}>
                            {isLastSlide ? "Let's Begin! 🚀" : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </LinearGradient>
        </Modal>
    );
}

// Helper function to check if tutorial has been seen
export async function hasSeenTutorial(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(TUTORIAL_SEEN_KEY);
        return value === 'true';
    } catch {
        return false;
    }
}

// Helper function to reset tutorial (for testing)
export async function resetTutorial(): Promise<void> {
    await AsyncStorage.removeItem(TUTORIAL_SEEN_KEY);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipButton: {
        alignSelf: 'flex-end',
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginTop: 8,
    },
    skipText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontWeight: '500',
    },
    flatList: {
        flex: 1,
    },
    slide: {
        width: SCREEN_WIDTH,
        paddingHorizontal: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    emoji: {
        fontSize: 48,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    body: {
        fontSize: 17,
        color: 'rgba(255,255,255,0.95)',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 8,
    },
    highlightBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 14,
        marginTop: 24,
        gap: 10,
    },
    highlightText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1B22',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    dotActive: {
        width: 24,
        backgroundColor: '#FFFFFF',
    },
    bottomContainer: {
        paddingHorizontal: 24,
    },
    ctaButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    ctaText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#7C3AED',
    },
});
