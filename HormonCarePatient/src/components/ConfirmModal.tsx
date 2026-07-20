import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Button from './Button';
import { colors, radius, shadows } from '../theme';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
};

function LogoutIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 17l5-5-5-5"
        stroke={colors.danger}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 12H3"
        stroke={colors.danger}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M21 19V5a2 2 0 00-2-2h-6"
        stroke={colors.danger}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  testID,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
      testID={testID}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.iconRing}>
            <LogoutIcon />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button
              title={cancelLabel}
              variant="ghost"
              onPress={onCancel}
              style={styles.btn}
              testID="confirm-modal-cancel"
            />
            <Button
              title={confirmLabel}
              variant="danger"
              onPress={onConfirm}
              style={styles.btn}
              testID="confirm-modal-confirm"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
    alignItems: 'center',
    ...shadows.card,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 18,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSoft,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    width: '100%',
  },
  btn: {
    flex: 1,
  },
});
