import React, { useEffect, useMemo, useState } from 'react';
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
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
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
import Card from '../components/Card';
import WeekBannerCard from '../components/WeekBannerCard';
import { colors, layout, radius } from '../theme';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Plan'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type PlanRoute = RouteProp<MainTabParamList, 'Plan'>;

export default function PlanScreen() {
  const { t } = useLocale();
  const nav = useNavigation<Nav>();
  const route = useRoute<PlanRoute>();
  const {
    loading,
    refreshing,
    onRefresh,
    error,
    assignedPrograms,
  } = usePatientDashboard();

  const [selectedProgram, setSelectedProgram] = useState<api.PlanProgram>(
    route.params?.program || 'care',
  );

  useEffect(() => {
    if (route.params?.program) {
      setSelectedProgram(route.params.program);
    }
  }, [route.params?.program]);

  useEffect(() => {
    if (!assignedPrograms.length) return;
    const exists = assignedPrograms.some(p => p.program === selectedProgram);
    if (!exists) {
      setSelectedProgram(assignedPrograms[0].program);
    }
  }, [assignedPrograms, selectedProgram]);

  const active = useMemo(
    () =>
      assignedPrograms.find(p => p.program === selectedProgram) ??
      assignedPrograms[0] ??
      null,
    [assignedPrograms, selectedProgram],
  );

  const plan = active?.plan ?? null;
  const unlockedWeek = active?.unlockedWeek ?? 0;
  const currentWeek =
    plan?.weeks?.find(w => w.weekNumber === unlockedWeek) ?? null;
  const historyWeeks =
    plan?.weeks?.filter(w => w.weekNumber < unlockedWeek) ?? [];

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

        {assignedPrograms.length > 1 ? (
          <View style={styles.programRow}>
            {assignedPrograms.map(item => {
              const activeChip = item.program === selectedProgram;
              return (
                <Pressable
                  key={item.program}
                  onPress={() => setSelectedProgram(item.program)}
                  style={[
                    styles.programChip,
                    activeChip && styles.programChipActive,
                  ]}>
                  <Text
                    style={[
                      styles.programChipText,
                      activeChip && styles.programChipTextActive,
                    ]}
                    numberOfLines={1}>
                    {t(programLabelKey(item.program))}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
                date: formatStartDate(active?.startDate),
              })}
            </Text>
          </Card>
        ) : null}

        {plan && currentWeek ? (
          <>
            <Text style={styles.sectionTitle}>{t('thisWeek')}</Text>
            <WeekBannerCard
              week={currentWeek}
              isDayWise={plan.isDayWise}
              variant="current"
              style={styles.weekBanner}
              onPress={() =>
                nav.navigate('WeekDetail', {
                  weekNumber: currentWeek.weekNumber,
                  program: selectedProgram,
                })
              }
              testID={`plan-week-${currentWeek.weekNumber}`}
            />
          </>
        ) : null}

        {historyWeeks.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>{t('history')}</Text>
            {historyWeeks
              .slice()
              .sort((a, b) => b.weekNumber - a.weekNumber)
              .map(w => (
                <WeekBannerCard
                  key={w.id}
                  week={w}
                  isDayWise={plan?.isDayWise}
                  variant="history"
                  style={styles.weekBanner}
                  onPress={() =>
                    nav.navigate('WeekDetail', {
                      weekNumber: w.weekNumber,
                      program: selectedProgram,
                    })
                  }
                  testID={`plan-week-${w.weekNumber}`}
                />
              ))}
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
  safe: layout.screen,
  center: { alignItems: 'center', justifyContent: 'center' },
  header: layout.header,
  title: layout.headerTitle,
  subtitle: layout.headerSubtitle,
  scroll: layout.scroll,
  programRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  programChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  programChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  programChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSoft,
  },
  programChipTextActive: {
    color: colors.primary,
  },
  sectionTitle: layout.sectionTitle,
  errorCard: {
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerSoft,
  },
  errorText: { color: colors.danger, fontWeight: '600' },
  muted: { color: colors.textSoft, lineHeight: 20, fontSize: 14 },
  weekBanner: {
    marginTop: 0,
    marginBottom: 12,
  },
});
