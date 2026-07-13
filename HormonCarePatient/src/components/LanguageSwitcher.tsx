import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocale } from '../context/LocaleContext';
import { LOCALES, type Locale } from '../i18n/types';
import { colors, radius } from '../theme';

type Props = {
  compact?: boolean;
  /** When set, switcher is local-only and does not change app language. */
  value?: Locale;
  onChange?: (locale: Locale) => void;
};

export default function LanguageSwitcher({
  compact = false,
  value,
  onChange,
}: Props) {
  const global = useLocale();
  const locale = value ?? global.locale;
  const setLocale = onChange ?? global.setLocale;
  const showLabel = !compact && !onChange;

  return (
    <View style={styles.wrap} testID="language-switcher">
      {showLabel ? <Text style={styles.label}>{global.t('language')}</Text> : null}
      <View style={styles.row}>
        {LOCALES.map(item => {
          const active = locale === item.code;
          return (
            <Pressable
              key={item.code}
              onPress={() => setLocale(item.code as Locale)}
              style={[styles.chip, active && styles.chipActive]}
              testID={`lang-${item.code}`}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item.code === 'en' ? 'EN' : 'ગુ'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSoft,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    gap: 2,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    minWidth: 36,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSoft,
  },
  chipTextActive: {
    color: '#fff',
  },
});
