import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocale } from '../context/LocaleContext';
import { optionLabel } from '../i18n/translations';
import type { Locale } from '../i18n/types';
import { colors, radius } from '../theme';

const DAY_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
] as const;

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  locale?: Locale;
};

export default function DayScaleField({
  label,
  value,
  onChange,
  required,
  locale: localeProp,
}: Props) {
  const { locale: appLocale } = useLocale();
  const locale = localeProp ?? appLocale;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.req}> *</Text> : null}
      </Text>
      <View style={styles.track}>
        {DAY_OPTIONS.map(opt => {
          const selected = value === opt.value;
          const display =
            opt.label === 'None'
              ? optionLabel(locale, 'None')
              : optionLabel(locale, opt.label);
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.cell, selected && styles.cellActive]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}>
              <Text
                style={[styles.cellText, selected && styles.cellTextActive]}
                numberOfLines={1}>
                {display}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  req: { color: colors.danger },
  track: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 4,
    gap: 2,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  cellActive: {
    backgroundColor: colors.primary,
  },
  cellText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSoft,
  },
  cellTextActive: {
    color: colors.textInverse,
  },
});
