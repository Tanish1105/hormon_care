import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export type CheckboxOption = string | { value: string; label: string };

type Props = {
  label: string;
  options: CheckboxOption[];
  values: string[];
  onChange: (values: string[]) => void;
  columns?: number;
};

function normalize(opt: CheckboxOption): { value: string; label: string } {
  if (typeof opt === 'string') return { value: opt, label: opt };
  return opt;
}

export default function CheckboxGroup({
  label,
  options,
  values,
  onChange,
  columns = 2,
}: Props) {
  function toggle(optValue: string) {
    if (values.includes(optValue)) onChange(values.filter(v => v !== optValue));
    else onChange([...values, optValue]);
  }
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.grid}>
        {options.map(raw => {
          const opt = normalize(raw);
          const active = values.includes(opt.value);
          return (
            <Pressable
              key={opt.value}
              onPress={() => toggle(opt.value)}
              style={({ pressed }) => [
                styles.chip,
                columns === 1
                  ? { width: '100%' }
                  : { width: `${100 / columns - 2}%` as any },
                active && styles.chipActive,
                pressed && { opacity: 0.9 },
              ]}>
              <View style={[styles.box, active && styles.boxActive]}>
                {active ? <Text style={styles.tick}>✓</Text> : null}
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
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  boxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tick: { color: '#fff', fontSize: 11, fontWeight: '800' },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
});
