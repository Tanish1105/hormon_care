import React from 'react';
import {
  ActivityIndicator,
  Image,
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
  programLabelKey,
  usePatientDashboard,
} from '../hooks/usePatientDashboard';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { MainTabParamList } from '../navigation/MainTabs';
import Card from '../components/Card';
import Button from '../components/Button';
import FullscreenImage from '../components/FullscreenImage';
import { brandLogo } from '../assets/brand';
import { colors, layout, radius, shadows } from '../theme';

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
    assignedPrograms,
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

  const primaryPlan = assignedPrograms[0] ?? null;
  const primaryProgress =
    primaryPlan && primaryPlan.unlockedWeek > 0
      ? Math.min(
          100,
          Math.round(
            (primaryPlan.unlockedWeek /
              Math.max(primaryPlan.plan.totalWeeks, 1)) *
              100,
          ),
        )
      : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']} testID="home-screen">
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
        <View style={styles.welcome}>
          <View style={styles.welcomeGlowTop} />
          <View style={styles.welcomeGlowBottom} />
          <View style={styles.welcomeLogoWrap}>
            <Image
              source={brandLogo}
              style={styles.welcomeLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.hello}>
            {t('hello')} {user?.name}
          </Text>
          {user?.username ? (
            <Text style={styles.patientId}>
              {t('patientId')} · {user.username}
            </Text>
          ) : null}

          {primaryPlan && primaryPlan.unlockedWeek > 0 ? (
            <View style={styles.welcomeProgress}>
              <View style={styles.welcomeProgressRow}>
                <Text style={styles.welcomeProgressTitle} numberOfLines={1}>
                  {primaryPlan.plan.title}
                </Text>
                <Text style={styles.welcomeProgressMeta}>
                  {t('weekOf', {
                    current: primaryPlan.unlockedWeek,
                    total: primaryPlan.plan.totalWeeks,
                  })}
                </Text>
              </View>
              <View style={styles.welcomeTrack}>
                <View
                  style={[
                    styles.welcomeFill,
                    { width: `${primaryProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.welcomeUnlock}>
                {t('current')}: Week {primaryPlan.unlockedWeek}
                {primaryProgress ? ` · ${primaryProgress}%` : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {error ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        ) : null}

        {pendingForms ? (
          <Text style={styles.sectionTitle}>{t('pendingForms')}</Text>
        ) : null}

        {gate?.blocked && gate.blockType === 'lifestyle' ? (
          <View style={styles.alertRose}>
            <Text style={styles.alertTitle}>{t('lifestylePendingTitle')}</Text>
            <Text style={styles.alertBody}>{gate.blockMessage}</Text>
            <Button
              title={t('fillForm')}
              onPress={() => nav.navigate('LifestyleAssessment')}
              testID="lifestyle-cta-button"
            />
          </View>
        ) : null}

        {gate?.followup?.showPrompt && !gate.blocked ? (
          <View style={styles.alertAmber}>
            <Text style={styles.alertAmberTitle}>{t('weeklyFollowup')}</Text>
            <Text style={styles.alertAmberBody}>
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
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>
          {assignedPrograms.length > 1 ? t('yourPlans') : t('planDetails')}
        </Text>

        {!assignedPrograms.length ? (
          <Card title={t('noPlanTitle')}>
            <Text style={styles.muted}>{t('noPlanBody')}</Text>
          </Card>
        ) : null}

        {assignedPrograms.map(item => {
          const { plan, program, unlockedWeek } = item;
          const planImage = api.resolveMediaUrl(plan.imageUrl);
          const currentWeek =
            plan.weeks?.find(w => w.weekNumber === unlockedWeek) ?? null;
          const contentCount = currentWeek
            ? api.countWeekContents(currentWeek, plan.isDayWise)
            : 0;

          return (
            <View key={program} style={styles.planCard}>
              {planImage ? (
                <FullscreenImage
                  uri={planImage}
                  style={styles.planBanner}
                  resizeMode="cover"
                  fallback={
                    <View style={styles.planBannerEmpty}>
                      <Text style={styles.planBannerEmptyText}>
                        {t(programLabelKey(program))}
                      </Text>
                    </View>
                  }
                />
              ) : (
                <View style={styles.planBannerEmpty}>
                  <Text style={styles.planBannerEmptyText}>
                    {t(programLabelKey(program))}
                  </Text>
                </View>
              )}

              <View style={styles.planBody}>
                <Text style={styles.planProgram}>
                  {t(programLabelKey(program))}
                </Text>
                <Text style={styles.planTitle}>{plan.title}</Text>
                {plan.description ? (
                  <Text style={styles.planDesc}>{plan.description}</Text>
                ) : null}

                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>
                      {t('weekOf', {
                        current: Math.max(unlockedWeek, 0),
                        total: plan.totalWeeks,
                      })}
                    </Text>
                  </View>
                  {plan.isDayWise ? (
                    <View style={styles.metaChipWarm}>
                      <Text style={styles.metaChipWarmText}>
                        {t('dayWise')}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {unlockedWeek === 0 ? (
                  <View style={styles.notStarted}>
                    <Text style={styles.notStartedText}>
                      {t('planNotStartedBody', {
                        date: formatStartDate(item.startDate),
                      })}
                    </Text>
                  </View>
                ) : null}

                {currentWeek ? (
                  <Pressable
                    onPress={() =>
                      nav.navigate('WeekDetail', {
                        weekNumber: currentWeek.weekNumber,
                        program,
                      })
                    }
                    style={({ pressed }) => [
                      styles.weekRow,
                      pressed && { opacity: 0.88 },
                    ]}>
                    <View style={styles.weekBadge}>
                      <Text style={styles.weekBadgeText}>
                        {currentWeek.weekNumber}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.weekTitle} numberOfLines={2}>
                        {currentWeek.title || `Week ${currentWeek.weekNumber}`}
                      </Text>
                      <Text style={styles.weekMeta}>
                        {contentCount === 1
                          ? t('contentOne')
                          : t('contentMany', { count: contentCount })}
                        {` · ${t('current')}`}
                      </Text>
                    </View>
                    <Text style={styles.chev}>›</Text>
                  </Pressable>
                ) : null}

                <Button
                  title={t('viewPlanWeeks')}
                  variant="secondary"
                  onPress={() => nav.navigate('Plan', { program })}
                  style={{ marginTop: 14 }}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: layout.screen,
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: layout.scroll,

  welcome: {
    position: 'relative',
    overflow: 'hidden',
    ...layout.surfaceCard,
    paddingHorizontal: 22,
    paddingVertical: 22,
    marginBottom: 18,
  },
  welcomeGlowTop: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 180,
    top: -70,
    right: -40,
    backgroundColor: colors.primaryTint,
    opacity: 0.55,
  },
  welcomeGlowBottom: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 150,
    bottom: -60,
    left: 20,
    backgroundColor: colors.accentSoft,
    opacity: 0.8,
  },
  welcomeLogoWrap: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    backgroundColor: colors.surface,
    marginBottom: 6,
  },
  welcomeLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
  },
  hello: {
    marginTop: 2,
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.7,
    textAlign: 'center',
  },
  patientId: {
    marginTop: 6,
    color: colors.textSoft,
    fontSize: 13,
    textAlign: 'center',
  },
  welcomeProgress: { marginTop: 20 },
  welcomeProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  welcomeProgressTitle: {
    flex: 1,
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  welcomeProgressMeta: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  welcomeTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.primaryTint,
    overflow: 'hidden',
  },
  welcomeFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  welcomeUnlock: {
    marginTop: 8,
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
  },

  sectionTitle: layout.sectionTitle,
  errorCard: {
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerSoft,
  },
  errorText: { color: colors.danger, fontWeight: '600' },
  muted: { color: colors.textSoft, lineHeight: 20, fontSize: 14 },

  alertRose: {
    borderRadius: radius.xl,
    padding: 18,
    marginBottom: 14,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.warmBorder,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  alertBody: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  alertAmber: {
    borderRadius: radius.xl,
    padding: 18,
    marginBottom: 14,
    backgroundColor: colors.accentWarmSoft,
    borderWidth: 1,
    borderColor: colors.accentWarm,
  },
  alertAmberTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryHover,
    marginBottom: 8,
  },
  alertAmberBody: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },

  planCard: {
    ...layout.surfaceCard,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    marginBottom: 16,
    ...shadows.card,
  },
  planBanner: {
    width: '100%',
    height: 160,
    backgroundColor: colors.primarySoft,
  },
  planBannerEmpty: {
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  planBannerEmptyText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  planBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    backgroundColor: colors.surface,
  },
  planProgram: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  planTitle: {
    marginTop: 4,
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  planDesc: {
    marginTop: 6,
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  metaChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  metaChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  metaChipWarm: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  metaChipWarmText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  notStarted: {
    marginTop: 14,
    borderRadius: radius.lg,
    padding: 14,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  notStartedText: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.warmBorder,
  },
  weekBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekBadgeText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '800',
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  weekMeta: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSoft,
  },
  chev: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '300',
  },
});
