import { useState, useRef, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as VoiceUtils from '../utils/voiceRecording';

export interface UseVoiceRecorderReturn {
    isRecording: boolean;
    recordingDuration: number;
    recordingUri: string | null;
    hasPermission: boolean | null;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<string | null>;
    cancelRecording: () => Promise<void>;
    resetRecording: () => void;
    formatDuration: (durationMillis: number) => string;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recordingUri, setRecordingUri] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const recordingStartTimeRef = useRef<number>(0);

    // Check initial permission status (optional, usually we check on action)
    useEffect(() => {
        VoiceUtils.hasRecordingPermission().then(setHasPermission);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopDurationTimer();
            if (VoiceUtils.isRecording()) {
                VoiceUtils.cancelRecording().catch(err =>
                    console.warn('Failed to cleanup recording on unmount:', err)
                );
            }
        };
    }, []);

    const startDurationTimer = () => {
        stopDurationTimer();
        recordingStartTimeRef.current = Date.now();
        setRecordingDuration(0);

        durationIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - recordingStartTimeRef.current;
            setRecordingDuration(elapsed);
        }, 500); // Update every 500ms
    };

    const stopDurationTimer = () => {
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }
    };

    const startRecording = useCallback(async () => {
        try {
            const permission = await VoiceUtils.requestMicrophonePermission();
            setHasPermission(permission);

            if (!permission) {
                Alert.alert(
                    'Microphone Permission',
                    Platform.OS === 'web'
                        ? 'Please allow microphone access in your browser settings.'
                        : 'Access to the microphone is required to record voice entries.'
                );
                return;
            }

            await VoiceUtils.startRecording();
            setIsRecording(true);
            setRecordingUri(null);
            startDurationTimer();
        } catch (error) {
            console.error('Failed to start recording:', error);
            setIsRecording(false);
            stopDurationTimer();
            Alert.alert('Error', 'Failed to start recording. Please try again.');
        }
    }, []);

    const stopRecording = useCallback(async (): Promise<string | null> => {
        try {
            stopDurationTimer();
            const uri = await VoiceUtils.stopRecording();
            setIsRecording(false);

            if (uri) {
                setRecordingUri(uri);
                return uri;
            }
            return null;
        } catch (error) {
            console.error('Failed to stop recording:', error);
            setIsRecording(false);
            return null;
        }
    }, []);

    const cancelRecording = useCallback(async () => {
        try {
            stopDurationTimer();
            await VoiceUtils.cancelRecording();
            setIsRecording(false);
            setRecordingUri(null);
            setRecordingDuration(0);
        } catch (error) {
            console.error('Failed to cancel recording:', error);
        }
    }, []);

    const resetRecording = useCallback(() => {
        setRecordingUri(null);
        setRecordingDuration(0);
        setIsRecording(false);
    }, []);

    return {
        isRecording,
        recordingDuration,
        recordingUri,
        hasPermission,
        startRecording,
        stopRecording,
        cancelRecording,
        resetRecording,
        formatDuration: VoiceUtils.formatDuration,
    };
}
