import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '../context/LocaleContext';
import type { TranslationKey } from '../i18n/translations';
import * as api from '../api/client';
import Card from '../components/Card';
import { colors, layout, radius, spacing } from '../theme';

function PlanBlock({
  plan,
  current,
  t,
}: {
  plan: api.SupplementPlan;
  current?: boolean;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}) {
  return (
    <Card
      accent={current ? 'success' : 'default'}
      title={plan.title}
      subtitle={
        current
          ? t('supplementsCurrent')
          : t('supplementsCount', { count: plan.items.length })
      }>
      {plan.notes ? <Text style={styles.planNotes}>{plan.notes}</Text> : null}
      {plan.items.map((item, index) => (
        <View
          key={item.id}
          style={[styles.item, index === 0 && styles.itemFirst]}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>{t('supplementTime')}</Text>
              <Text style={styles.chipValue}>{item.time}</Text>
            </View>
            <View style={[styles.chip, styles.chipGold]}>
              <Text style={[styles.chipLabel, styles.chipLabelGold]}>
                {t('supplementQuantity')}
              </Text>
              <Text style={[styles.chipValue, styles.chipValueGold]}>
                {item.quantity}
              </Text>
            </View>
          </View>
          {item.notes ? (
            <Text style={styles.itemNotes}>{item.notes}</Text>
          ) : null}
        </View>
      ))}
    </Card>
  );
}

export default function SupplementsScreen() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<api.SupplementPlan | null>(null);
  const [history, setHistory] = useState<api.SupplementPlan[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getSupplements();
      setActivePlan(data.activePlan);
      setHistory((data.plans || []).filter(plan => !plan.isActive));
    } catch (e: any) {
      setError(e?.message || t('dataLoadFailed'));
    }
  }, [t]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={['top']}>
        <ActivityIndicator size="small" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']} testID="supplements-screen">
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
        <Text style={styles.eyebrow}>{t('tabSupplements')}</Text>
        <Text style={styles.title}>{t('supplementsTitle')}</Text>
        <Text style={styles.subtitle}>{t('supplementsSubtitle')}</Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!activePlan && history.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('supplementsEmptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('supplementsEmptyBody')}</Text>
          </View>
        ) : null}

        {activePlan ? (
          <PlanBlock plan={activePlan} current t={t} />
        ) : null}

        {history.length > 0 ? (
          <>
            <Text style={styles.section}>{t('supplementsPast')}</Text>
            {history.map(plan => (
              <PlanBlock key={plan.id} plan={plan} t={t} />
            ))}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: layout.screen,
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 18,
    fontSize: 14,
    color: colors.textSoft,
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
  section: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  planNotes: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSoft,
    marginBottom: 8,
  },
  item: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  itemFirst: {
    marginTop: 4,
    paddingTop: 0,
    borderTopWidth: 0,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipGold: {
    backgroundColor: colors.accentSoft,
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 2,
  },
  chipLabelGold: { color: colors.accent },
  chipValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  chipValueGold: { color: colors.text },
  itemNotes: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSoft,
  },
});
