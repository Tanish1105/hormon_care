import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useLocale } from '../context/LocaleContext';
import type { TranslationKey } from '../i18n/translations';
import * as api from '../api/client';
import PillMark from '../components/PillMark';
import {
  groupSupplementItems,
  supplementTimeLabel,
} from '../lib/supplements';
import { colors, layout, radius, shadows, spacing } from '../theme';

function PlanBlock({
  plan,
  current,
  t,
}: {
  plan: api.SupplementPlan;
  current?: boolean;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}) {
  const groups = groupSupplementItems(plan.items || []);

  return (
    <View style={[styles.planCard, current && styles.planCardCurrent]}>
      <View style={[styles.planHead, current && styles.planHeadCurrent]}>
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>
            {current ? t('supplementsCurrent') : t('supplementsPrevious')}
          </Text>
        </View>
        <Text style={styles.planTitle}>{plan.title}</Text>
        {plan.notes ? <Text style={styles.planNotes}>{plan.notes}</Text> : null}
        <Text style={styles.planMeta}>
          {t('supplementsCount', { count: plan.items?.length || 0 })}
          {groups.length > 1
            ? ` · ${t('supplementsTimesADay', { count: groups.length })}`
            : ''}
        </Text>
      </View>

      {groups.map(group => (
        <View key={group.time} style={styles.group}>
          <Text style={styles.groupLabel}>
            {supplementTimeLabel(group.time, t)}
          </Text>
          {group.items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.item, index === 0 && styles.itemFirst]}>
              <PillMark size={38} iconSize={18} />
              <View style={styles.itemBody}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>
                      {supplementTimeLabel(item.time, t)}
                    </Text>
                  </View>
                  <View style={[styles.chip, styles.chipGold]}>
                    <Text style={[styles.chipText, styles.chipTextGold]}>
                      {item.quantity}
                    </Text>
                  </View>
                </View>
                {item.notes ? (
                  <Text style={styles.itemNotes}>{item.notes}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
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
      const plans = data.plans || [];
      const active =
        data.activePlan ?? plans.find(plan => plan.isActive) ?? plans[0] ?? null;
      setActivePlan(active);
      setHistory(plans.filter(plan => plan.id !== active?.id && !plan.isActive));
    } catch (e: any) {
      setError(e?.message || t('dataLoadFailed'));
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        setLoading(true);
        await load();
        if (alive) setLoading(false);
      })();
      return () => {
        alive = false;
      };
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading && !activePlan && history.length === 0) {
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

        {!error && !activePlan && history.length === 0 ? (
          <View style={styles.empty}>
            <PillMark size={56} iconSize={28} />
            <Text style={styles.emptyTitle}>{t('supplementsEmptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('supplementsEmptyBody')}</Text>
          </View>
        ) : null}

        {activePlan ? <PlanBlock plan={activePlan} current t={t} /> : null}

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
    paddingVertical: 36,
    paddingHorizontal: 22,
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    ...shadows.soft,
  },
  emptyTitle: {
    marginTop: 14,
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
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: 16,
    ...shadows.card,
  },
  planCardCurrent: {
    borderColor: colors.successBorder,
  },
  planHead: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: colors.bgSoft,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  planHeadCurrent: {
    backgroundColor: colors.primaryTint,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.35,
    color: colors.text,
  },
  planNotes: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSoft,
  },
  planMeta: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  group: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
    marginLeft: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  itemFirst: {
    borderTopWidth: 0,
    paddingTop: 4,
  },
  itemBody: { flex: 1, minWidth: 0 },
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
    paddingVertical: 6,
  },
  chipGold: {
    backgroundColor: colors.accentSoft,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  chipTextGold: {
    color: colors.accent,
  },
  itemNotes: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSoft,
  },
});
