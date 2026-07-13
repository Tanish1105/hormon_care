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
import { useLocale } from '../context/LocaleContext';
import * as api from '../api/client';
import {
  formatStartDate,
  usePatientDashboard,
} from '../hooks/usePatientDashboard';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { MainTabParamList } from '../navigation/MainTabs';
import Card from '../components/Card';
import { colors, radius, shadows } from '../theme';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Plan'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function PlanScreen() {
  const { t } = useLocale();
  const nav = useNavigation<Nav>();
  const {
    loading,
    refreshing,
    onRefresh,
    error,
    plan,
    unlockedWeek,
    currentWeek,
    historyWeeks,
    startDate,
  } = usePatientDashboard();

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']} testID="plan-screen">
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabPlan')}</Text>
        {plan ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {plan.title}
          </Text>
        ) : null}
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

        {!plan ? (
          <Card title={t('noPlanTitle')}>
            <Text style={styles.muted}>{t('noPlanBody')}</Text>
          </Card>
        ) : null}

        {plan && unlockedWeek === 0 ? (
          <Card accent="warm" title={t('planNotStartedTitle')}>
            <Text style={styles.muted}>
              {t('planNotStartedBody', {
                date: formatStartDate(startDate),
              })}
            </Text>
          </Card>
        ) : null}

        {plan && currentWeek ? (
          <>
            <Text style={styles.sectionTitle}>{t('thisWeek')}</Text>
            <Pressable
              onPress={() =>
                nav.navigate('WeekDetail', {
                  weekNumber: currentWeek.weekNumber,
                })
              }
              style={({ pressed }) => [
                styles.weekCard,
                styles.weekCardCurrent,
                pressed && { transform: [{ scale: 0.985 }] },
              ]}
              testID={`plan-week-${currentWeek.weekNumber}`}>
              <View style={styles.weekNumCurrent}>
                <Text style={styles.weekNumTextCurrent}>
                  {currentWeek.weekNumber}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>{t('current')}</Text>
                </View>
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
                </Text>
              </View>
              <View style={styles.openChip}>
                <Text style={styles.openChipText}>›</Text>
              </View>
            </Pressable>
          </>
        ) : null}

        {historyWeeks.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>{t('history')}</Text>
            {historyWeeks
              .slice()
              .sort((a, b) => b.weekNumber - a.weekNumber)
              .map(w => {
                const contentCount = api.countWeekContents(w, plan?.isDayWise);
                return (
                  <Pressable
                    key={w.id}
                    onPress={() =>
                      nav.navigate('WeekDetail', { weekNumber: w.weekNumber })
                    }
                    style={({ pressed }) => [
                      styles.weekCard,
                      pressed && { transform: [{ scale: 0.99 }] },
                    ]}
                    testID={`plan-week-${w.weekNumber}`}>
                    <View style={styles.weekNumDone}>
                      <Text style={styles.weekNumTextDone}>{w.weekNumber}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.weekTitle} numberOfLines={2}>
                        {w.title || `Week ${w.weekNumber}`}
                      </Text>
                      <Text style={styles.weekMeta}>
                        {contentCount === 1
                          ? t('contentOne')
                          : t('contentMany', { count: contentCount })}
                        {` • ${t('completed')}`}
                      </Text>
                    </View>
                    <Text style={styles.chev}>›</Text>
                  </Pressable>
                );
              })}
          </>
        ) : plan && unlockedWeek > 0 ? (
          <Card>
            <Text style={styles.muted}>{t('noHistoryYet')}</Text>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
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
  subtitle: {
    marginTop: 4,
    color: colors.textSoft,
    fontSize: 14,
  },
  scroll: { padding: 16, paddingBottom: 40 },
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
  muted: { color: colors.textSoft, lineHeight: 20, fontSize: 14 },
  weekCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
    ...shadows.soft,
  },
  weekCardCurrent: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: '#fff',
    ...shadows.glow,
  },
  weekNumCurrent: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNumTextCurrent: { fontSize: 17, fontWeight: '800', color: '#fff' },
  weekNumDone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNumTextDone: { fontSize: 15, fontWeight: '800', color: colors.success },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  liveBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  weekTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  weekMeta: { fontSize: 12, color: colors.textSoft, marginTop: 3 },
  openChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openChipText: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: '600',
    marginTop: -2,
  },
  chev: { fontSize: 24, color: colors.textMuted },
});
