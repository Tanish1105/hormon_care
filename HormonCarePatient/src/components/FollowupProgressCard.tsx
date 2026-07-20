import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import * as api from '../api/client';
import { useLocale } from '../context/LocaleContext';
import Card from './Card';
import { colors, radius } from '../theme';

function formatDelta(
  delta: api.FollowupDelta,
  opts?: { invertGood?: boolean },
): { text: string; color: string } | null {
  if (!delta) return null;
  if (delta.direction === 'same') {
    return { text: '0', color: colors.textMuted };
  }
  const arrow = delta.direction === 'up' ? '↑' : '↓';
  const abs = Math.abs(delta.delta);
  const invert = opts?.invertGood ?? true;
  // For weight: down is good (green). For exercise: up is good.
  const good =
    invert
      ? delta.direction === 'down'
      : delta.direction === 'up';
  return {
    text: `${arrow}${abs}`,
    color: good ? colors.success : colors.danger,
  };
}

function StatChip({
  label,
  value,
  suffix,
  delta,
  invertGood = true,
}: {
  label: string;
  value: string | number | null | undefined;
  suffix?: string;
  delta?: api.FollowupDelta;
  invertGood?: boolean;
}) {
  const d = formatDelta(delta ?? null, { invertGood });
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>
        {value ?? '—'}
        {value != null && value !== '—' && suffix ? suffix : ''}
        {d ? (
          <Text style={{ color: d.color, fontWeight: '700' }}> ({d.text})</Text>
        ) : null}
      </Text>
    </View>
  );
}

function WeightSparkline({ weights }: { weights: number[] }) {
  if (weights.length < 2) return null;
  const w = 220;
  const h = 56;
  const pad = 8;
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const span = max - min || 1;
  const points = weights
    .map((v, i) => {
      const x =
        pad + (i * (w - pad * 2)) / Math.max(weights.length - 1, 1);
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');
  const last = weights[weights.length - 1];
  const lastX =
    pad +
    ((weights.length - 1) * (w - pad * 2)) / Math.max(weights.length - 1, 1);
  const lastY = h - pad - ((last - min) / span) * (h - pad * 2);

  return (
    <View style={styles.sparkWrap}>
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        <Polyline
          points={points}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Circle cx={lastX} cy={lastY} r={4} fill={colors.primary} />
      </Svg>
    </View>
  );
}

function WeekCard({ week }: { week: api.FollowupHistoryWeek }) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const weightDelta = formatDelta(week.comparison.weight);
  const feedback =
    week.planFeedback === 'excellent'
      ? t('feedbackExcellent')
      : week.planFeedback === 'moderate'
        ? t('feedbackModerate')
        : week.planFeedback === 'poor'
          ? t('feedbackPoor')
          : week.planFeedback || '—';

  const date = week.submittedAt
    ? new Date(week.submittedAt).toLocaleDateString(
        locale === 'gu' ? 'gu-IN' : 'en-IN',
        { day: 'numeric', month: 'short', year: 'numeric' },
      )
    : '—';

  const notes: string[] = [];
  if (week.feedbackLikedNotes) notes.push(week.feedbackLikedNotes);
  if (week.feedbackDislikedNotes) notes.push(week.feedbackDislikedNotes);
  if (week.feedbackBadNotes) notes.push(week.feedbackBadNotes);
  if (week.feedbackGoodNotes) notes.push(week.feedbackGoodNotes);

  return (
    <View style={styles.weekCard}>
      <Pressable onPress={() => setOpen(v => !v)} style={styles.weekHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.weekTitle}>
            {t('weekLabelShort', { week: week.weekNumber })}
          </Text>
          <Text style={styles.weekMeta}>{t('submittedOn', { date })}</Text>
        </View>
        <View style={styles.weekWeight}>
          <Text style={styles.weekWeightValue}>
            {week.currentWeight}
            <Text style={styles.kg}> {t('weightUnit')}</Text>
          </Text>
          {weightDelta ? (
            <Text style={[styles.weekDelta, { color: weightDelta.color }]}>
              {weightDelta.text} {t('vsPreviousWeek')}
            </Text>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.chipGrid}>
        <StatChip
          label={t('habitExercise')}
          value={week.exerciseDays}
          delta={week.comparison.exerciseDays}
          invertGood={false}
        />
        <StatChip
          label={t('habitLowWater')}
          value={week.lowWaterDays}
          delta={week.comparison.lowWaterDays}
        />
        <StatChip
          label={t('habitShortSleep')}
          value={week.shortSleepDays}
          delta={week.comparison.shortSleepDays}
        />
        <StatChip
          label={t('habitMissedSupp')}
          value={week.missedSupplementDays}
          delta={week.comparison.missedSupplementDays}
        />
        <StatChip
          label={t('habitMeals')}
          value={week.mealsDeviated ?? '—'}
        />
        <StatChip label={t('feedbackTitle')} value={feedback} />
      </View>

      <Pressable onPress={() => setOpen(v => !v)}>
        <Text style={styles.toggle}>
          {open ? t('hideDetails') : t('showDetails')}
        </Text>
      </Pressable>

      {open ? (
        <View style={styles.details}>
          {notes.length ? (
            notes.map((n, i) => (
              <Text key={i} style={styles.note}>
                {n}
              </Text>
            ))
          ) : (
            <Text style={styles.noteMuted}>{t('noNotes')}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

export default function FollowupProgressCard() {
  const { t } = useLocale();
  const [data, setData] = useState<api.FollowupHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getFollowupHistory();
      setData(res);
    } catch (e: any) {
      setError(e?.message || t('dataLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading && !data) {
    return (
      <Card title={t('myProgress')}>
        <View style={styles.centerRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>{t('loadingProgress')}</Text>
        </View>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card title={t('myProgress')}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={load}>
          <Text style={styles.reload}>{t('reload')}</Text>
        </Pressable>
      </Card>
    );
  }

  const followups = data?.followups ?? [];
  const weights = followups.map(f => f.currentWeight);
  const change = data?.weightChange;
  const changeColor =
    change == null
      ? colors.textMuted
      : change < 0
        ? colors.success
        : change > 0
          ? colors.danger
          : colors.textMuted;

  return (
    <Card
      title={t('myProgress')}
      subtitle={t('weeklyFollowupHistory')}>
      {!followups.length ? (
        <Text style={styles.empty}>{t('progressEmpty')}</Text>
      ) : (
        <>
          <Text style={styles.hint}>{t('compareHint')}</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>{t('latestWeight')}</Text>
              <Text style={styles.summaryValue}>
                {data?.latestWeight ?? '—'}
                {data?.latestWeight != null ? (
                  <Text style={styles.kg}> {t('weightUnit')}</Text>
                ) : null}
              </Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>{t('totalWeightChange')}</Text>
              <Text style={[styles.summaryValue, { color: changeColor }]}>
                {change == null
                  ? '—'
                  : `${change > 0 ? '+' : ''}${change} ${t('weightUnit')}`}
              </Text>
            </View>
          </View>

          <Text style={styles.submissions}>
            {t('submissionsCount', { count: data?.submissionCount ?? 0 })}
          </Text>

          {weights.length >= 2 ? (
            <View style={styles.trendBlock}>
              <Text style={styles.trendTitle}>{t('weightTrend')}</Text>
              <WeightSparkline weights={weights} />
            </View>
          ) : null}

          {[...followups].reverse().map(week => (
            <WeekCard key={week.id} week={week} />
          ))}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  loadingText: { color: colors.textSoft, fontSize: 13 },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: 8 },
  reload: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  empty: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 17,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  kg: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  submissions: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSoft,
    marginBottom: 12,
  },
  trendBlock: { marginBottom: 14 },
  trendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  sparkWrap: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.warmBorder,
  },
  weekCard: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.xl,
    padding: 12,
    marginBottom: 10,
    backgroundColor: colors.surface,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  weekMeta: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
  },
  weekWeight: { alignItems: 'flex-end' },
  weekWeightValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  weekDelta: { marginTop: 2, fontSize: 11, fontWeight: '700' },
  weekDeltaMuted: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    width: '47%' as any,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  chipValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  toggle: {
    marginTop: 10,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  details: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 6,
  },
  note: {
    fontSize: 13,
    color: colors.textSoft,
    lineHeight: 18,
  },
  noteMuted: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
