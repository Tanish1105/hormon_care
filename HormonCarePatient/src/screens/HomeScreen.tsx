import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
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
import { useLocale } from '../context/LocaleContext';
import * as api from '../api/client';
import {
  formatStartDate,
  programLabelKey,
  usePatientDashboard,
} from '../hooks/usePatientDashboard';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { MainTabParamList } from '../navigation/MainTabs';
import Button from '../components/Button';
import FullscreenImage from '../components/FullscreenImage';
import BrandTitle from '../components/BrandTitle';
import { brandLogo } from '../assets/brand';
import { colors, layout, radius, shadows, spacing } from '../theme';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

function useRise(active: boolean, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) return;
    v.setValue(0);
    Animated.timing(v, {
      toValue: 1,
      duration: 700,
      delay,
      useNativeDriver: true,
    }).start();
  }, [active, v, delay]);
  return {
    opacity: v,
    transform: [
      {
        translateY: v.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };
}

export default function HomeScreen() {
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
  const heroAnim = useRise(!loading, 0);
  const bodyAnim = useRise(!loading, 90);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <View style={styles.loadingMark}>
          <Image source={brandLogo} style={styles.loadingLogo} resizeMode="contain" />
        </View>
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  const pendingLifestyle = gate?.blocked && gate.blockType === 'lifestyle';
  const pendingFollowup = Boolean(gate?.followup?.showPrompt && !gate.blocked);
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
      <View style={styles.mistA} pointerEvents="none" />
      <View style={styles.mistB} pointerEvents="none" />
      <View style={styles.mistC} pointerEvents="none" />

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
        <Animated.View style={[styles.hero, heroAnim]}>
          <View style={styles.topRow}>
            <Image
              source={brandLogo}
              style={styles.logo}
              resizeMode="contain"
            />
            <BrandTitle size="compact" showTagline />
          </View>

          {primaryPlan && primaryPlan.unlockedWeek > 0 ? (
            <View style={styles.progressShell}>
              <View style={styles.progressTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.progressLabel}>{t('myProgress')}</Text>
                  <Text style={styles.progressPlan} numberOfLines={1}>
                    {primaryPlan.plan.title}
                  </Text>
                </View>
                <View style={styles.percentBadge}>
                  <Text style={styles.percentText}>{primaryProgress}%</Text>
                </View>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${primaryProgress}%` }]} />
                <View
                  style={[
                    styles.fillGold,
                    { width: `${Math.min(primaryProgress, 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressFoot}>
                {t('weekOf', {
                  current: primaryPlan.unlockedWeek,
                  total: primaryPlan.plan.totalWeeks,
                })}
              </Text>
            </View>
          ) : (
            <Text style={styles.support}>
              {assignedPrograms.length ? t('planDetails') : t('noPlanBody')}
            </Text>
          )}
        </Animated.View>

        <Animated.View style={bodyAnim}>
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {pendingLifestyle ? (
            <View style={styles.priority}>
              <Text style={styles.priorityEyebrow}>{t('pendingForms')}</Text>
              <Text style={styles.priorityTitle}>{t('lifestylePendingTitle')}</Text>
              <Text style={styles.priorityCopy}>{gate?.blockMessage}</Text>
              <Button
                title={t('fillForm')}
                onPress={() => nav.navigate('LifestyleAssessment')}
                testID="lifestyle-cta-button"
              />
            </View>
          ) : null}

          {pendingFollowup ? (
            <View style={[styles.priority, styles.priorityGold]}>
              <Text style={[styles.priorityEyebrow, styles.priorityEyebrowGold]}>
                {t('weeklyFollowup')}
              </Text>
              <Text style={styles.priorityTitle}>
                {t('followupDue', { week: gate?.followup?.nextDueWeek ?? '' })}
              </Text>
              <Button
                title={t('fillFollowup')}
                onPress={() =>
                  nav.navigate('Followup', {
                    week: gate?.followup?.nextDueWeek || 1,
                  })
                }
                testID="followup-cta-button"
              />
            </View>
          ) : null}

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>
              {assignedPrograms.length > 1 ? t('yourPlans') : t('planDetails')}
            </Text>
            <View style={styles.sectionRule} />
          </View>

          {!assignedPrograms.length ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{t('noPlanTitle')}</Text>
              <Text style={styles.emptyBody}>{t('noPlanBody')}</Text>
            </View>
          ) : null}

          {assignedPrograms.map((item, index) => {
            const { plan, program, unlockedWeek } = item;
            const planImage = api.resolveMediaUrl(plan.imageUrl);
            const currentWeek =
              plan.weeks?.find(w => w.weekNumber === unlockedWeek) ?? null;
            const contentCount = currentWeek
              ? api.countWeekContents(currentWeek, plan.isDayWise)
              : 0;
            const canContinue = Boolean(currentWeek && unlockedWeek > 0);

            return (
              <View
                key={program}
                style={[styles.plan, index === 0 && styles.planPrimary]}>
                <View style={styles.bannerWrap}>
                  {planImage ? (
                    <FullscreenImage
                      uri={planImage}
                      style={styles.banner}
                      resizeMode="cover"
                      fallback={
                        <View style={styles.bannerFallback}>
                          <Text style={styles.programTag}>
                            {t(programLabelKey(program))}
                          </Text>
                        </View>
                      }
                    />
                  ) : (
                    <View style={styles.bannerFallback}>
                      <Text style={styles.programTag}>
                        {t(programLabelKey(program))}
                      </Text>
                    </View>
                  )}
                  <View style={styles.bannerScrim} />
                  <Text style={styles.bannerTag}>
                    {t(programLabelKey(program))}
                  </Text>
                </View>

                <View style={styles.planBody}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  {plan.description ? (
                    <Text style={styles.planDesc} numberOfLines={2}>
                      {plan.description}
                    </Text>
                  ) : null}

                  <View style={styles.metaBar}>
                    <Text style={styles.metaText}>
                      {t('weekOf', {
                        current: Math.max(unlockedWeek, 0),
                        total: plan.totalWeeks,
                      })}
                    </Text>
                    {plan.isDayWise ? (
                      <Text style={styles.metaDot}>·</Text>
                    ) : null}
                    {plan.isDayWise ? (
                      <Text style={styles.metaTextGold}>{t('dayWise')}</Text>
                    ) : null}
                  </View>

                  {unlockedWeek === 0 ? (
                    <View style={styles.waitBox}>
                      <Text style={styles.waitText}>
                        {t('planNotStartedBody', {
                          date: formatStartDate(item.startDate),
                        })}
                      </Text>
                    </View>
                  ) : null}

                  {canContinue && currentWeek ? (
                    <Pressable
                      onPress={() =>
                        nav.navigate('WeekDetail', {
                          weekNumber: currentWeek.weekNumber,
                          program,
                        })
                      }
                      style={({ pressed }) => [
                        styles.continueRow,
                        pressed && { transform: [{ scale: 0.985 }], opacity: 0.94 },
                      ]}>
                      <View style={styles.weekMark}>
                        <Text style={styles.weekMarkText}>
                          {currentWeek.weekNumber}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.continueLabel}>{t('current')}</Text>
                        <Text style={styles.continueTitle} numberOfLines={1}>
                          {currentWeek.title ||
                            `Week ${currentWeek.weekNumber}`}
                        </Text>
                        <Text style={styles.continueMeta}>
                          {contentCount === 1
                            ? t('contentOne')
                            : t('contentMany', { count: contentCount })}
                        </Text>
                      </View>
                      <Text style={styles.continueArrow}>→</Text>
                    </Pressable>
                  ) : null}

                  <Button
                    title={t('viewPlanWeeks')}
                    variant={canContinue ? 'ghost' : 'secondary'}
                    onPress={() => nav.navigate('Plan', { program })}
                    style={{ marginTop: 12 }}
                  />
                </View>
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: layout.screen,
  center: { alignItems: 'center', justifyContent: 'center' },
  loadingMark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.soft,
  },
  loadingLogo: { width: 72, height: 72 },

  mistA: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 200,
    backgroundColor: 'rgba(31,107,69,0.11)',
  },
  mistB: {
    position: 'absolute',
    top: 20,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 200,
    backgroundColor: 'rgba(201,162,39,0.12)',
  },
  mistC: {
    position: 'absolute',
    top: 220,
    left: '30%',
    width: 180,
    height: 180,
    borderRadius: 200,
    backgroundColor: 'rgba(31,107,69,0.05)',
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 56,
  },

  hero: {
    paddingTop: 4,
    paddingBottom: 8,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  support: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSoft,
  },

  progressShell: {
    width: '100%',
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 4,
  },
  progressPlan: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  percentBadge: {
    minWidth: 52,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  track: {
    height: 8,
    borderRadius: 6,
    backgroundColor: colors.primaryTint,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  fillGold: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(184,137,45,0.35)',
    borderRadius: 6,
  },
  progressFoot: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },

  errorBanner: {
    marginBottom: 14,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  errorText: { color: colors.danger, fontWeight: '600', fontSize: 13 },

  priority: {
    marginBottom: 14,
    padding: 18,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  priorityGold: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.warmBorder,
  },
  priorityEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 8,
  },
  priorityEyebrowGold: { color: colors.accent },
  priorityTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  priorityCopy: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSoft,
    marginBottom: 14,
  },

  sectionHead: {
    marginTop: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
  },
  sectionRule: {
    height: 1,
    backgroundColor: colors.borderLight,
  },

  empty: {
    padding: 22,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSoft,
    textAlign: 'center',
  },

  plan: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: 18,
    ...shadows.soft,
  },
  planPrimary: {
    borderColor: 'rgba(31,107,69,0.22)',
  },
  bannerWrap: {
    height: 176,
    position: 'relative',
    backgroundColor: colors.primaryTint,
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  bannerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,32,26,0.18)',
  },
  bannerTag: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  programTag: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  planBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: colors.text,
  },
  planDesc: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSoft,
  },
  metaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  metaTextGold: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: 12,
  },
  waitBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  waitText: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 19,
  },
  continueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  weekMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekMarkText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  continueLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 2,
  },
  continueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  continueMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSoft,
  },
  continueArrow: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '600',
  },
});
