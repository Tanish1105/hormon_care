import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type Locale,
} from '../i18n/types';
import {
  optionLabel,
  translate,
  type TranslationKey,
} from '../i18n/translations';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  ready: boolean;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  opt: (value: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
        if (stored === 'en' || stored === 'gu') {
          setLocaleState(stored);
        }
      } catch {
        /* keep default */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, next).catch(() => {});
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale],
  );

  const opt = useCallback(
    (value: string) => optionLabel(locale, value),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, ready, t, opt }),
    [locale, setLocale, ready, t, opt],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
