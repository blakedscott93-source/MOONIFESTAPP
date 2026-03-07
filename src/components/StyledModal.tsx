import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface StyledModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'info' | 'warning';
    buttonText?: string;
}

const ICON_MAP = {
    error: 'close-circle' as const,
    success: 'checkmark-circle' as const,
    info: 'information-circle' as const,
    warning: 'warning' as const,
};

const COLOR_MAP = {
    error: '#EF4444',
    success: '#10B981',
    info: '#6366F1',
    warning: '#F59E0B',
};

export function StyledModal({
    visible,
    onClose,
    title,
    message,
    type = 'error',
    buttonText = 'OK',
}: StyledModalProps) {
    const iconName = ICON_MAP[type];
    const accentColor = COLOR_MAP[type];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={50} tint="dark" style={styles.blurContainer}>
                    <View style={styles.modalContent}>
                        {/* Icon */}
                        <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
                            <Ionicons name={iconName} size={32} color={accentColor} />
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>{title}</Text>

                        {/* Message */}
                        <Text style={styles.message}>{message}</Text>

                        {/* Button */}
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: accentColor }]}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>{buttonText}</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </View>
        </Modal>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    blurContainer: {
        width: width * 0.85,
        borderRadius: 24,
        overflow: 'hidden',
    },
    modalContent: {
        backgroundColor: 'rgba(30, 30, 40, 0.95)',
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#A0A0B0',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 48,
        borderRadius: 14,
        minWidth: 120,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
