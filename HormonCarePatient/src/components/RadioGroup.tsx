import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export type RadioOption = string | { value: string; label: string };

type Props = {
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
  required?: boolean;
};

function normalize(opt: RadioOption): { value: string; label: string } {
  if (typeof opt === 'string') return { value: opt, label: opt };
  return opt;
}

export default function RadioGroup({
  label,
  options,
  value,
  onChange,
  columns = 2,
  required,
}: Props) {
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
        </Text>
      ) : null}
      <View style={[styles.grid, columns === 1 && { flexDirection: 'column' }]}>
        {options.map(raw => {
          const opt = normalize(raw);
          const active = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={({ pressed }) => [
                styles.chip,
                columns === 1
                  ? { width: '100%' }
                  : { width: `${100 / columns - 2}%` as any },
                active && styles.chipActive,
                pressed && { opacity: 0.9 },
              ]}>
              <View style={[styles.dot, active && styles.dotActive]}>
                {active ? <View style={styles.dotInner} /> : null}
              </View>
              <Text
                style={[styles.chipText, active && styles.chipTextActive]}
                numberOfLines={2}>
                {opt.label}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { borderColor: colors.primary },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
});
