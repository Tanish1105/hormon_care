import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Card from '../components/Card';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import FollowupProgressCard from '../components/FollowupProgressCard';
import { colors, radius, shadows } from '../theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { t } = useLocale();
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']} testID="profile-screen">
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabProfile')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || 'P').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>{t('patientAccount')}</Text>
        </View>

        <Card title={t('accountInfo')}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('patientName')}</Text>
            <Text style={styles.rowValue}>{user?.name || '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('patientId')}</Text>
            <Text style={styles.rowValue}>{user?.username || '—'}</Text>
          </View>
        </Card>

        <FollowupProgressCard />

        <Card title={t('language')}>
          <Text style={styles.langHint}>{t('selectLanguage')}</Text>
          <View style={styles.langWrap}>
            <LanguageSwitcher />
          </View>
        </Card>

        <Button
          title={t('logout')}
          variant="danger"
          onPress={() => setLogoutOpen(true)}
          fullWidth
          testID="profile-logout-button"
          style={{ marginTop: 4 }}
        />
      </ScrollView>

      <ConfirmModal
        visible={logoutOpen}
        title={t('logoutConfirmTitle')}
        message={t('logoutConfirmMessage')}
        cancelLabel={t('cancel')}
        confirmLabel={t('logout')}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          signOut();
        }}
        testID="logout-confirm-modal"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  scroll: { padding: 16, paddingBottom: 40 },
  heroCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    ...shadows.soft,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...shadows.glow,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  role: {
    marginTop: 4,
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  rowLabel: { color: colors.textSoft, fontSize: 14, fontWeight: '500' },
  rowValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  langHint: {
    color: colors.textSoft,
    fontSize: 13,
    marginBottom: 12,
  },
  langWrap: { alignItems: 'flex-start' },
});
