import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import FollowupProgressCard from '../components/FollowupProgressCard';
import BrandTitle from '../components/BrandTitle';
import { brandLogo } from '../assets/brand';
import { colors, layout, radius, shadows, spacing } from '../theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { t } = useLocale();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const initial = (user?.name || 'P').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']} testID="profile-screen">
      <View style={styles.mistA} pointerEvents="none" />
      <View style={styles.mistB} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Image source={brandLogo} style={styles.logo} resizeMode="contain" />
          <BrandTitle size="compact" showTagline />
        </View>

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={styles.name} numberOfLines={1}>
              {user?.name || '—'}
            </Text>
            <Text style={styles.role}>{t('patientAccount')}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('accountInfo')}</Text>
        <View style={styles.panel}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('patientName')}</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {user?.name || '—'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('patientId')}</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {user?.username || '—'}
            </Text>
          </View>
        </View>

        <FollowupProgressCard />

        <Text style={styles.sectionTitle}>{t('language')}</Text>
        <View style={styles.panel}>
          <Text style={styles.langHint}>{t('selectLanguage')}</Text>
          <View style={styles.langWrap}>
            <LanguageSwitcher />
          </View>
        </View>

        <Button
          title={t('logout')}
          variant="danger"
          onPress={() => setLogoutOpen(true)}
          fullWidth
          testID="profile-logout-button"
          style={{ marginTop: 8 }}
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
  safe: layout.screen,
  mistA: {
    position: 'absolute',
    top: -100,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: 'rgba(31,107,69,0.09)',
  },
  mistB: {
    position: 'absolute',
    top: 40,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 200,
    backgroundColor: 'rgba(201,162,39,0.10)',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 48,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.soft,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textInverse,
    fontSize: 20,
    fontWeight: '700',
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  role: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 10,
    marginTop: 4,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    ...shadows.soft,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  rowLabel: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '500',
  },
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
    marginVertical: 8,
  },
  langHint: {
    color: colors.textSoft,
    fontSize: 13,
    marginBottom: 12,
  },
  langWrap: { alignItems: 'flex-start' },
});
