import React, { useState, useEffect } from 'react';
// Refreshed version
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import { PulseBackground } from '../components/onboarding/PulseBackground';
import Animated, {
    FadeInRight,
    FadeOutLeft,
    ZoomIn,
    useSharedValue,
    useAnimatedStyle,
    runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// --- Types ---

type QuestionType = 'single' | 'slider';

interface Question {
    id: string;
    type: QuestionType;
    title: string;
    subtitle?: string;
    options?: { label: string; value: string; icon?: any }[];
    sliderConfig?: { minLabel: string; maxLabel: string };
}

// --- Data ---
const QUESTIONS: Question[] = [
    {
        id: 'hook',
        type: 'single',
        title: 'What brings you to Vortex today?',
        subtitle: 'Select the one that calls to you most.',
        options: [
            { label: 'Attract Abundance', value: 'abundance', icon: 'cash-outline' },
            { label: 'Find True Love', value: 'love', icon: 'heart-outline' },
            { label: 'Find Inner Peace', value: 'peace', icon: 'leaf-outline' },
            { label: 'Achieve Career Goal', value: 'career', icon: 'briefcase-outline' },
            { label: 'Build Confidence', value: 'confidence', icon: 'sparkles-outline' }
        ]
    },
    {
        id: 'barrier',
        type: 'single',
        title: 'What has stopped you in the past?',
        subtitle: 'Be honest—this helps us break the block.',
        options: [
            { label: 'Inconsistency', value: 'inconsistency', icon: 'calendar-outline' },
            { label: 'Lack of Belief', value: 'belief', icon: 'cloud-offline-outline' },
            { label: 'Negative Self-Talk', value: 'negativity', icon: 'sad-outline' },
            { label: 'Don\'t know how', value: 'knowledge', icon: 'help-circle-outline' }
        ]
    },
    {
        id: 'energy',
        type: 'slider',
        title: 'How aligned do you feel right now?',
        subtitle: 'Trust your intuition.',
        sliderConfig: { minLabel: 'Blocked 🔒', maxLabel: 'Flowing 🌊' }
    },
    {
        id: 'time',
        type: 'single',
        title: 'How much time can you dedicate daily?',
        options: [
            { label: '5 min (Quick Reset)', value: '5', icon: 'battery-charging-outline' },
            { label: '15 min (Deep Dive)', value: '15', icon: 'time-outline' },
            { label: '30 min (Mastery)', value: '30', icon: 'trophy-outline' }
        ]
    },
    {
        id: 'commitment',
        type: 'single',
        title: 'Are you ready to create your blueprint?',
        subtitle: 'Your personalized plan is one click away.',
        options: [
            { label: 'Yes, I\'m ready!', value: 'ready', icon: 'checkmark-done-circle-outline' }
        ]
    }
];

// --- Components ---

const ProgressBar = ({ progress }: { progress: number }) => (
    <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
    </View>
);

const OptionButton = ({
    label,
    icon,
    selected,
    onPress,
    index
}: {
    label: string;
    icon: any;
    selected: boolean;
    onPress: () => void;
    index: number;
}) => (
    <Animated.View
        entering={FadeInRight.delay(index * 100).springify()}
    >
        <TouchableOpacity
            style={[
                styles.optionButton,
                selected && styles.optionSelected
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
                <Ionicons name={icon} size={24} color={selected ? '#FFF' : tokens.colors.primary} />
            </View>
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {label}
            </Text>
        </TouchableOpacity>
    </Animated.View>
);

const CustomSlider = ({ value, onValueChange }: { value: number, onValueChange: (v: number) => void }) => {
    const [width, setWidth] = useState(0);
    const knobWidth = 30;
    const maxRange = width - knobWidth;

    const position = useSharedValue(0);
    const context = useSharedValue(0);

    // Sync initial value (only on mount/layout)
    useEffect(() => {
        if (maxRange > 0) {
            position.value = (value / 100) * maxRange;
        }
    }, [width]); // remove maxRange from deps if stable, but generally width is enough

    const pan = Gesture.Pan()
        .onStart(() => {
            context.value = position.value;
        })
        .onUpdate((e) => {
            let newPos = context.value + e.translationX;
            if (newPos < 0) newPos = 0;
            if (newPos > maxRange) newPos = maxRange;
            position.value = newPos;

            const newValue = Math.round((newPos / maxRange) * 100);
            runOnJS(onValueChange)(newValue);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: position.value }]
    }));

    return (
        <View
            style={styles.sliderTrackContainer}
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        >
            <View style={styles.sliderTrack} />
            {width > 0 && (
                <GestureDetector gesture={pan}>
                    <Animated.View style={[styles.sliderKnob, animatedStyle]}>
                        <View style={styles.sliderKnobInner} />
                    </Animated.View>
                </GestureDetector>
            )}
        </View>
    );
};

// --- Main Screen ---

export default function OnboardingQuizScreen({ navigation }: any) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [sliderValue, setSliderValue] = useState(50); // 0-100

    // Safety guard to prevent crashes if index goes out of bounds
    const question = QUESTIONS[currentStep];
    const progress = (currentStep + 1) / QUESTIONS.length;

    if (!question) {
        // Fallback UI or loading state instead of crashing
        return null;
    }

    const handleOptionSelect = (value: string) => {
        setAnswers(prev => ({ ...prev, [question.id]: value }));

        setTimeout(() => {
            // Use functional update with bounds check to prevent race conditions
            setCurrentStep(prev => {
                if (prev >= QUESTIONS.length - 1) {
                    return prev; // Don't verify/finish here, let the effect or separate logic handle it if needed
                }
                return prev + 1;
            });

            // Check if we need to finish (based on CURRENT state captured in closure? No, rely on logic flow)
            // If we are at the last step, we should finish. 
            // BUT: handleOptionSelect is usually for earlier steps.
            if (currentStep === QUESTIONS.length - 1) {
                finishQuiz();
            }
        }, 250);
    };

    const handleNext = () => {
        if (question.type === 'slider') {
            setAnswers(prev => ({ ...prev, [question.id]: sliderValue }));
        }

        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        let archetype = 'Visionary';
        if (answers.barrier === 'inconsistency') archetype = 'Architect';
        if (answers.hook === 'peace') archetype = 'Healer';
        if (answers.hook === 'abundance') archetype = 'Alchemist';

        navigation.replace('OnboardingPaywall', {
            answers,
            archetype,
            userGenerated: true
        });
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <View style={styles.container}>
            <PulseBackground />

            <SafeAreaView style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    {currentStep > 0 ? (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={tokens.colors.textPrimary} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                    <ProgressBar progress={progress} />
                    <View style={{ width: 40 }} />
                </View>

                {/* Content */}
                <View style={styles.questionContainer}>
                    <Animated.View
                        key={`title-${currentStep}`} // Key forces re-render animation on step change
                        entering={FadeInRight.duration(400)}
                        exiting={FadeOutLeft.duration(200)}
                    >
                        <Text style={styles.questionTitle}>{question.title}</Text>
                        {question.subtitle && (
                            <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
                        )}
                    </Animated.View>

                    <View style={styles.optionsContainer}>
                        {question.type === 'single' && question.options?.map((opt, index) => (
                            <OptionButton
                                key={opt.value}
                                index={index}
                                label={opt.label}
                                icon={opt.icon}
                                selected={answers[question.id] === opt.value}
                                onPress={() => handleOptionSelect(opt.value)}
                            />
                        ))}

                        {question.type === 'slider' && (
                            <Animated.View entering={ZoomIn} style={styles.sliderWrapper}>
                                <View style={styles.sliderLabels}>
                                    <Text style={styles.sliderLabel}>{question.sliderConfig?.minLabel}</Text>
                                    <Text style={styles.sliderLabel}>{question.sliderConfig?.maxLabel}</Text>
                                </View>

                                <CustomSlider
                                    value={sliderValue}
                                    onValueChange={setSliderValue}
                                />

                                <TouchableOpacity
                                    style={[styles.bigButton, { marginTop: 40 }]}
                                    onPress={handleNext}
                                >
                                    <Text style={styles.bigButtonText}>I Feel Aligned 🌊</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </View>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF8FF',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
        height: 44,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    progressContainer: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        marginHorizontal: 12,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: tokens.colors.primary,
        borderRadius: 3,
    },
    questionContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    questionTitle: {
        ...tokens.typography.h2,
        color: tokens.colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    questionSubtitle: {
        ...tokens.typography.body,
        color: tokens.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    optionSelected: {
        borderColor: tokens.colors.primary,
        backgroundColor: '#F5F0FF',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F0FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    iconContainerSelected: {
        backgroundColor: tokens.colors.primary,
    },
    optionText: {
        ...tokens.typography.bodyMedium,
        color: tokens.colors.textPrimary,
        flex: 1,
    },
    optionTextSelected: {
        color: tokens.colors.primary,
        fontWeight: '600',
    },
    sliderWrapper: {
        padding: 20,
        width: '100%',
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    sliderLabel: {
        ...tokens.typography.body,
        color: tokens.colors.textSecondary
    },
    sliderTrackContainer: {
        height: 30,
        justifyContent: 'center',
        width: '100%',
    },
    sliderTrack: {
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E0E0E0',
        width: '100%',
        position: 'absolute',
    },
    sliderKnob: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFF',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    sliderKnobInner: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: tokens.colors.primary,
    },
    bigButton: {
        backgroundColor: tokens.colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: tokens.radii.full,
        width: '100%',
        alignItems: 'center',
        shadowColor: tokens.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    bigButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 18
    }
});
