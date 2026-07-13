import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import Button from '../components/Button';
import TextField from '../components/TextField';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { colors, radius, shadows } from '../theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { t } = useLocale();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(e?.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} testID="login-screen">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.orbTop} />
          <View style={styles.orbMid} />
          <View style={styles.orbBottom} />

          <View style={styles.langRow}>
            <LanguageSwitcher compact />
          </View>

          <View style={styles.brandBlock}>
            <View style={styles.logoRing}>
              <Image
                source={{
                  uri: 'https://hormoncare.mediiqr.com/hormon-care-logo.png?v=3',
                }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brand}>Hormon Care</Text>
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
              testID="login-username-input"
            />
            <TextField
              label={t('password')}
              placeholder="••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
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
            <Text style={styles.link}>{t('termsConditions')}</Text> {t('termsAnd')}{' '}
            <Text style={styles.link}>{t('privacyPolicy')}</Text>
            {t('termsSuffix')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  langRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
    marginTop: 8,
  },
  orbTop: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 320,
    top: -140,
    right: -90,
    backgroundColor: 'rgba(190,24,93,0.12)',
  },
  orbMid: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 180,
    top: 180,
    left: -70,
    backgroundColor: 'rgba(251,146,60,0.1)',
  },
  orbBottom: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 280,
    bottom: -120,
    right: -60,
    backgroundColor: 'rgba(190,24,93,0.08)',
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoRing: {
    width: 112,
    height: 112,
    borderRadius: 999,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    ...shadows.soft,
  },
  logo: { width: 92, height: 92, borderRadius: 999 },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    textAlign: 'center',
    marginTop: 8,
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: radius.xxl,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderColor: '#fecaca',
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
