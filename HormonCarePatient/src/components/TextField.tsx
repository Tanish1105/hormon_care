import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, radius } from '../theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  suffix?: string;
};

export default function TextField({
  label,
  error,
  hint,
  required,
  suffix,
  style,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
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
            !!suffix && styles.inputWithSuffix,
            focused && styles.inputFocused,
            !!error && styles.inputError,
            style,
          ]}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
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
    paddingRight: 44,
  },
  suffix: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
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
