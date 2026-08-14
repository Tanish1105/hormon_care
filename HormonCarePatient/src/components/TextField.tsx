import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, radius } from '../theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  suffix?: string;
  /** When true with secureTextEntry, shows an eye button to reveal password */
  showSecureToggle?: boolean;
};

function EyeIcon({ open }: { open: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      {open ? (
        <>
          <Path
            d="M3 3l18 18"
            stroke={colors.textMuted}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Path
            d="M10.6 10.6a2 2 0 002.8 2.8"
            stroke={colors.textMuted}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Path
            d="M9.9 5.2A9.8 9.8 0 0112 5c5 0 9.3 3.1 11 7.5a11.4 11.4 0 01-4.2 5.1M6.1 6.1A11.3 11.3 0 001 12.5C2.7 16.9 7 20 12 20a9.9 9.9 0 005.1-1.4"
            stroke={colors.textMuted}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <Path
            d="M1 12.5C2.7 8.1 7 5 12 5s9.3 3.1 11 7.5c-1.7 4.4-6 7.5-11 7.5S2.7 16.9 1 12.5z"
            stroke={colors.textMuted}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <Circle
            cx={12}
            cy={12.5}
            r={3}
            stroke={colors.textMuted}
            strokeWidth={1.8}
          />
        </>
      )}
    </Svg>
  );
}

export default function TextField({
  label,
  error,
  hint,
  required,
  suffix,
  showSecureToggle,
  secureTextEntry,
  style,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const useToggle = !!showSecureToggle && secureTextEntry;
  const isSecure = useToggle ? !passwordVisible : !!secureTextEntry;
  const hasRightPad = !!suffix || useToggle;

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
        </Text>
      ) : null}
      <View>
        <TextInput
          placeholderTextColor={colors.textMuted}
          {...rest}
          secureTextEntry={isSecure}
          onFocus={e => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[
            styles.input,
            hasRightPad && styles.inputWithSuffix,
            focused && styles.inputFocused,
            !!error && styles.inputError,
            style,
          ]}
        />
        {useToggle ? (
          <Pressable
            onPress={() => setPasswordVisible(v => !v)}
            style={styles.eyeButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? 'Hide password' : 'Show password'
            }
            testID={
              rest.testID ? `${rest.testID}-toggle` : 'password-visibility-toggle'
            }>
            <EyeIcon open={passwordVisible} />
          </Pressable>
        ) : suffix ? (
          <Text style={styles.suffix}>{suffix}</Text>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSoft,
    marginBottom: 7,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
  },
  inputWithSuffix: {
    paddingRight: 48,
  },
  suffix: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  error: { color: colors.danger, fontSize: 12, marginTop: 6, fontWeight: '500' },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
});
