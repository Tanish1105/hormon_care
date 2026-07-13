import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import * as api from '../api/client';
import {
  formatStartDate,
  usePatientDashboard,
} from '../hooks/usePatientDashboard';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { MainTabParamList } from '../navigation/MainTabs';
import Card from '../components/Card';
import Button from '../components/Button';
import FullscreenImage from '../components/FullscreenImage';
import { colors, radius, shadows } from '../theme';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function HomeScreen() {
  const { user } = useAuth();
  const { t } = useLocale();
  const nav = useNavigation<Nav>();
  const {
    loading,
    refreshing,
    onRefresh,
    gate,
    error,
    plan,
    unlockedWeek,
    currentWeek,
    progressPct,
    planImage,
    startDate,
  } = usePatientDashboard();

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const pendingForms =
    (gate?.blocked && gate.blockType === 'lifestyle') ||
    (gate?.followup?.showPrompt && !gate.blocked);

  return (
    <SafeAreaView style={styles.safe} edges={['top']} testID="home-screen">
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>{t('hello')}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {user?.name}
          </Text>
        </View>
        <View style={styles.brandPill}>
          <Text style={styles.brandPillText}>Hormon Care</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }>
        {error ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        ) : null}

        {pendingForms ? (
          <Text style={styles.sectionTitle}>{t('pendingForms')}</Text>
        ) : null}

        {gate?.blocked && gate.blockType === 'lifestyle' ? (
          <Card accent="warm" title={t('lifestylePendingTitle')}>
            <Text style={styles.cardBody}>{gate.blockMessage}</Text>
            <Button
              title={t('fillForm')}
              onPress={() => nav.navigate('LifestyleAssessment')}
              testID="lifestyle-cta-button"
            />
          </Card>
        ) : null}

        {gate?.followup?.showPrompt && !gate.blocked ? (
          <Card accent="warm" title={t('weeklyFollowup')}>
            <Text style={styles.cardBody}>
              {t('followupDue', { week: gate.followup.nextDueWeek ?? '' })}
            </Text>
            <Button
              title={t('fillFollowup')}
              onPress={() =>
                nav.navigate('Followup', {
                  week: gate.followup.nextDueWeek || 1,
                })
              }
              testID="followup-cta-button"
            />
          </Card>
        ) : null}

        <Text style={styles.sectionTitle}>{t('planDetails')}</Text>

        {plan ? (
          <View style={styles.planCard}>
            {planImage ? (
              <FullscreenImage
                uri={planImage}
                style={styles.planBanner}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.planBannerPlaceholder}>
                <Text style={styles.planBannerMark}>HC</Text>
              </View>
            )}
            <View style={styles.planHero}>
              <Text style={styles.planKicker}>{t('yourCurrentPlan')}</Text>
              <Text style={styles.planTitle}>{plan.title}</Text>
              {plan.description ? (
                <Text style={styles.planDesc}>{plan.description}</Text>
              ) : null}

              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progressPct}%` }]}
                />
              </View>

              <View style={styles.pillRow}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>
                    {t('weekOf', {
                      current: Math.max(unlockedWeek, 0),
                      total: plan.totalWeeks,
                    })}
                  </Text>
                </View>
                {plan.isDayWise ? (
                  <View style={styles.pillWarm}>
                    <Text style={styles.pillWarmText}>{t('dayWise')}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ) : (
          <Card title={t('noPlanTitle')}>
            <Text style={styles.cardBodyMuted}>{t('noPlanBody')}</Text>
          </Card>
        )}

        {plan && unlockedWeek === 0 ? (
          <Card accent="warm" title={t('planNotStartedTitle')}>
            <Text style={styles.cardBody}>
              {t('planNotStartedBody', {
                date: formatStartDate(startDate),
              })}
            </Text>
          </Card>
        ) : null}

        {plan && currentWeek ? (
          <Card title={t('thisWeek')}>
            <Pressable
              onPress={() =>
                nav.navigate('WeekDetail', {
                  weekNumber: currentWeek.weekNumber,
                })
              }
              style={({ pressed }) => [
                styles.quickWeek,
                pressed && { opacity: 0.9 },
              ]}>
              <View style={styles.weekNumCurrent}>
                <Text style={styles.weekNumTextCurrent}>
                  {currentWeek.weekNumber}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.weekTitle} numberOfLines={2}>
                  {currentWeek.title || `Week ${currentWeek.weekNumber}`}
                </Text>
                <Text style={styles.weekMeta}>
                  {api.countWeekContents(currentWeek, plan.isDayWise) === 1
                    ? t('contentOne')
                    : t('contentMany', {
                        count: api.countWeekContents(
                          currentWeek,
                          plan.isDayWise,
                        ),
                      })}
                  {` • ${t('current')}`}
                </Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </Pressable>
            <Button
              title={t('viewAllWeeks')}
              variant="secondary"
              onPress={() => nav.navigate('Plan')}
              style={{ marginTop: 12 }}
            />
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 12,
  },
  hello: { color: colors.textMuted, fontSize: 12, fontWeight: '500' },
  name: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 22,
    letterSpacing: -0.4,
  },
  brandPill: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  brandPillText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    marginBottom: 10,
    marginTop: 4,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  errorCard: {
    borderColor: '#fecaca',
    backgroundColor: colors.dangerSoft,
  },
  errorText: { color: colors.danger, fontWeight: '600' },
  cardBody: {
    color: colors.textSoft,
    marginBottom: 14,
    lineHeight: 20,
    fontSize: 14,
  },
  cardBodyMuted: { color: colors.textSoft, lineHeight: 20, fontSize: 14 },
  planCard: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: colors.primary,
    ...shadows.glow,
  },
  planBanner: {
    width: '100%',
    height: 168,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  planBannerPlaceholder: {
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  planBannerMark: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  planHero: { padding: 20 },
  planKicker: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  planTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  planDesc: {
    color: 'rgba(255,255,255,0.88)',
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pillWarm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#fef3c7',
  },
  pillWarmText: { color: '#92400e', fontSize: 12, fontWeight: '700' },
  quickWeek: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weekNumCurrent: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNumTextCurrent: { fontSize: 16, fontWeight: '800', color: '#fff' },
  weekTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  weekMeta: { fontSize: 12, color: colors.textSoft, marginTop: 3 },
  chev: { fontSize: 24, color: colors.textMuted },
});
