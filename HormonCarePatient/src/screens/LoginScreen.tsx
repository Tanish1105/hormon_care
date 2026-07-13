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
import Button from '../components/Button';
import TextField from '../components/TextField';
import { colors, radius } from '../theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (!username.trim() || !password.trim()) {
      setError('Username અને password જરૂરી છે');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(username.trim(), password);
    } catch (e: any) {
      setError(e?.message || 'Login failed');
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
          keyboardShouldPersistTaps="handled">
          <View style={styles.orbTop} />
          <View style={styles.orbBottom} />

          <View style={styles.card}>
            <View style={styles.logoRing}>
              <Image
                source={{
                  uri: 'https://hormoncare.mediiqr.com/hormon-care-logo.png?v=3',
                }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Hormon Care</Text>
            <Text style={styles.subtitle}>
              Doctor દ્વારા આપેલ ID અને Password થી login કરો
            </Text>

            <View style={{ marginTop: 20 }}>
              <TextField
                label="Patient ID"
                placeholder="PAT123456"
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={setUsername}
                testID="login-username-input"
              />
              <TextField
                label="Password"
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
                title="Login"
                onPress={onSubmit}
                loading={loading}
                fullWidth
                testID="login-submit-button"
                style={{ marginTop: 8 }}
              />
            </View>
          </View>

          <Text style={styles.terms}>
            Login કરીને તમે અમારી{' '}
            <Text style={styles.link}>Terms & Conditions</Text> અને{' '}
            <Text style={styles.link}>Privacy Policy</Text> સાથે સહમત છો.
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
    padding: 24,
    justifyContent: 'center',
  },
  orbTop: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 340,
    top: -120,
    right: -80,
    backgroundColor: 'rgba(190,24,93,0.14)',
  },
  orbBottom: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 300,
    bottom: -100,
    left: -80,
    backgroundColor: 'rgba(251,146,60,0.14)',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 20 },
    elevation: 4,
  },
  logoRing: {
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: '#fff',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: -4,
    marginBottom: 8,
  },
  logo: { width: 120, height: 120, borderRadius: 999 },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 6,
    color: colors.textSoft,
    fontSize: 13,
  },
  errBanner: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 10,
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: radius.sm,
  },
  terms: {
    textAlign: 'center',
    marginTop: 18,
    color: colors.textSoft,
    fontSize: 12,
  },
  link: { color: colors.primary, fontWeight: '600' },
});
