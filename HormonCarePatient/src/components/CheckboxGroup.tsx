import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

type Props = {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  columns?: number;
};

export default function CheckboxGroup({
  label,
  options,
  values,
  onChange,
  columns = 2,
}: Props) {
  function toggle(opt: string) {
    if (values.includes(opt)) onChange(values.filter(v => v !== opt));
    else onChange([...values, opt]);
  }
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.grid}>
        {options.map(opt => {
          const active = values.includes(opt);
          return (
            <Pressable
              key={opt}
              onPress={() => toggle(opt)}
              style={[
                styles.chip,
                columns === 1 ? { width: '100%' } : { width: `${100 / columns - 2}%` },
                active && styles.chipActive,
              ]}>
              <View style={[styles.box, active && styles.boxActive]}>
                {active ? <Text style={styles.tick}>✓</Text> : null}
              </View>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {opt}
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
    borderWidth: 1,
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
    borderRadius: 4,
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
  tick: { color: '#fff', fontSize: 12, fontWeight: '700' },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '500', flexShrink: 1 },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
});
