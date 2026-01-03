import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, TOUCH_TARGET_MIN } from '../utils/theme';
import { IncompleteDayInfo } from '../utils/dayRolloverManager';

interface IncompleteDayModalProps {
  visible: boolean;
  incompleteDay: IncompleteDayInfo | null;
  onMarkComplete: () => void;
  onRestartChallenge: () => void;
  onKeepGoing: () => void;
}

export const IncompleteDayModal: React.FC<IncompleteDayModalProps> = ({
  visible,
  incompleteDay,
  onMarkComplete,
  onRestartChallenge,
  onKeepGoing,
}) => {
  if (!incompleteDay) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onKeepGoing}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons name="calendar-outline" size={32} color={Theme.colors.accent} />
            <Text style={styles.title}>New day started</Text>
          </View>

          <Text style={styles.body}>
            Yesterday wasn't marked complete. Did you complete it and forget to log it?
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Yesterday: {incompleteDay.localDayKey}
            </Text>
            <Text style={styles.infoText}>
              Check-ins: {incompleteDay.checkInCount}/3
            </Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={onMarkComplete}
              accessibilityLabel="Mark yesterday complete"
              accessibilityRole="button"
            >
              <Text style={styles.buttonTextPrimary}>Mark yesterday complete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={onRestartChallenge}
              accessibilityLabel="Restart challenge"
              accessibilityRole="button"
            >
              <Text style={styles.buttonTextSecondary}>Restart challenge</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonTertiary]}
              onPress={onKeepGoing}
              accessibilityLabel="Keep going, yesterday missed"
              accessibilityRole="button"
            >
              <Text style={styles.buttonTextTertiary}>Keep going (yesterday missed)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  modal: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Theme.shadow.large,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  title: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
  body: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    lineHeight: Theme.typography.body.lineHeight,
  },
  infoBox: {
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  infoText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs / 2,
  },
  buttons: {
    gap: Theme.spacing.md,
  },
  button: {
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    minHeight: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: Theme.colors.accent,
    ...Theme.shadow.medium,
  },
  buttonSecondary: {
    backgroundColor: Theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Theme.colors.borderMedium,
  },
  buttonTertiary: {
    backgroundColor: 'transparent',
  },
  buttonTextPrimary: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textInverse,
  },
  buttonTextSecondary: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
  },
  buttonTextTertiary: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
});









