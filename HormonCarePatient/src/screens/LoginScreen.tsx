import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import Button from '../components/Button';
import TextField from '../components/TextField';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { brandLogo } from '../assets/brand';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, layout, radius, shadows } from '../theme';

type LoginNav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { t } = useLocale();
  const nav = useNavigation<LoginNav>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, event => {
      setKeyboardPadding(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardPadding(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  function scrollToFocusedField() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }

  async function onSubmit() {
    if (!username.trim() || !password.trim()) {
      setError(t('usernamePasswordRequired'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(username.trim(), password);
    } catch (e: any) {
      setError(
        e?.message === 'NETWORK_ERROR'
          ? t('networkError')
          : e?.message === 'SESSION_SETUP_FAILED'
            ? t('sessionSetupFailed')
            : e?.message || t('loginFailed'),
      );
    } finally {
      setLoading(false);
    }
  }

  function openLegal(kind: 'terms' | 'privacy') {
    nav.navigate('LegalWeb', {
      title: kind === 'terms' ? t('termsConditions') : t('privacyPolicy'),
      kind,
    });
  }

  return (
    <SafeAreaView style={styles.safe} testID="login-screen">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: 32 + keyboardPadding },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <View style={styles.langRow}>
            <LanguageSwitcher compact />
          </View>

          <View style={styles.brandBlock}>
            <View style={styles.logoCard}>
              <Image
                source={brandLogo}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.tagline}>{t('loginSubtitle')}</Text>
          </View>

          <View style={styles.card}>
            <TextField
              label={t('patientId')}
              placeholder="PAT123456"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
              onFocus={scrollToFocusedField}
              testID="login-username-input"
            />
            <TextField
              label={t('password')}
              placeholder="••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={scrollToFocusedField}
              testID="login-password-input"
            />
            {error ? (
              <Text style={styles.errBanner} testID="login-error">
                {error}
              </Text>
            ) : null}
            <Button
              title={t('login')}
              onPress={onSubmit}
              loading={loading}
              fullWidth
              testID="login-submit-button"
              style={{ marginTop: 4 }}
            />
          </View>

          <Text style={styles.terms}>
            {t('termsPrefix')}{' '}
            <Text
              style={styles.link}
              onPress={() => openLegal('terms')}
              testID="terms-link">
              {t('termsConditions')}
            </Text>{' '}
            {t('termsAnd')}{' '}
            <Text
              style={styles.link}
              onPress={() => openLegal('privacy')}
              testID="privacy-link">
              {t('privacyPolicy')}
            </Text>
            {t('termsSuffix')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: layout.screen,
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  langRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
    marginTop: 8,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoCard: {
    width: 168,
    height: 168,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
    ...shadows.soft,
  },
  logo: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
  },
  tagline: {
    textAlign: 'center',
    marginTop: 4,
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  card: {
    ...layout.surfaceCard,
    padding: 22,
    ...shadows.card,
  },
  errBanner: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 10,
    backgroundColor: colors.dangerSoft,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    overflow: 'hidden',
  },
  terms: {
    textAlign: 'center',
    marginTop: 20,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  link: { color: colors.primary, fontWeight: '600' },
});
