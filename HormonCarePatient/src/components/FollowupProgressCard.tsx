import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Line,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import * as api from '../api/client';
import { useLocale } from '../context/LocaleContext';
import Button from './Button';
import { colors, radius, shadows } from '../theme';

const PREVIEW_WEEK_COUNT = 2;
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
  const good = invert
    ? delta.direction === 'down'
    : delta.direction === 'up';
  return {
    text: `${arrow}${abs}`,
    color: good ? colors.success : colors.danger,
  };
}

function StatRow({
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
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {value ?? '—'}
        {value != null && value !== '—' && suffix ? suffix : ''}
        {d ? (
          <Text style={{ color: d.color, fontWeight: '700' }}> {d.text}</Text>
        ) : null}
      </Text>
    </View>
  );
}

function WeightTrendChart({
  points,
  unit,
  title,
}: {
  points: { week: number; weight: number }[];
  unit: string;
  title: string;
}) {
  if (points.length < 2) return null;

  const w = 320;
  const h = 168;
  const padL = 36;
  const padR = 14;
  const padT = 18;
  const padB = 28;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const weights = points.map(p => p.weight);
  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  const padY = Math.max((rawMax - rawMin) * 0.18, 0.8);
  const min = rawMin - padY;
  const max = rawMax + padY;
  const span = max - min || 1;

  const coords = points.map((p, i) => {
    const x =
      padL + (i * chartW) / Math.max(points.length - 1, 1);
    const y = padT + chartH - ((p.weight - min) / span) * chartH;
    return { ...p, x, y };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`)
    .join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${
    padT + chartH
  } L ${coords[0].x} ${padT + chartH} Z`;

  const gridYs = [0, 0.5, 1].map(frac => padT + chartH * (1 - frac));
  const yLabels = [max, (min + max) / 2, min].map(v =>
    Number(v.toFixed(1)),
  );
  const first = coords[0];
  const last = coords[coords.length - 1];
  const delta = last.weight - first.weight;
  const deltaColor =
    delta < 0 ? colors.success : delta > 0 ? colors.danger : colors.textMuted;

  // Avoid crowding week labels when many points
  const labelEvery =
    points.length <= 6 ? 1 : points.length <= 10 ? 2 : 3;

  return (
    <View style={styles.trendCard}>
      <View style={styles.trendHeader}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.trendEyebrow}>{title}</Text>
          <Text style={styles.trendRange}>
            {first.weight} → {last.weight} {unit}
          </Text>
        </View>
        <View style={styles.trendDeltaPill}>
          <Text style={[styles.trendDeltaText, { color: deltaColor }]}>
            {delta > 0 ? '+' : ''}
            {Number(delta.toFixed(1))} {unit}
          </Text>
        </View>
      </View>

      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        <Defs>
          <LinearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.22} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

        {gridYs.map((y, i) => (
          <React.Fragment key={`g-${i}`}>
            <Line
              x1={padL}
              y1={y}
              x2={w - padR}
              y2={y}
              stroke={colors.borderLight}
              strokeWidth={1}
              strokeDasharray={i === 1 ? '4 4' : undefined}
            />
            <SvgText
              x={padL - 6}
              y={y + 3}
              fontSize="9"
              fill={colors.textMuted}
              fontWeight="600"
              textAnchor="end">
              {yLabels[i]}
            </SvgText>
          </React.Fragment>
        ))}

        <Path d={areaPath} fill="url(#weightFill)" />
        <Path
          d={linePath}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.8}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {coords.map((c, i) => {
          const isLast = i === coords.length - 1;
          const showLabel =
            i === 0 || isLast || i % labelEvery === 0;
          return (
            <React.Fragment key={`p-${c.week}-${i}`}>
              <Circle
                cx={c.x}
                cy={c.y}
                r={isLast ? 5.5 : 4}
                fill={isLast ? colors.accent : colors.surface}
                stroke={isLast ? colors.accent : colors.primary}
                strokeWidth={2}
              />
              {showLabel ? (
                <SvgText
                  x={c.x}
                  y={h - 8}
                  fontSize="9"
                  fill={colors.textMuted}
                  fontWeight="700"
                  textAnchor="middle">
                  {`W${c.week}`}
                </SvgText>
              ) : null}
            </React.Fragment>
          );
        })}
      </Svg>

      <View style={styles.trendFooter}>
        <Text style={styles.trendFootText}>
          Min {rawMin} {unit}
        </Text>
        <Text style={styles.trendFootDot}>·</Text>
        <Text style={styles.trendFootText}>
          Max {rawMax} {unit}
        </Text>
      </View>
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
      <Pressable
        onPress={() => setOpen(v => !v)}
        style={({ pressed }) => [
          styles.weekHeader,
          pressed && { opacity: 0.9 },
        ]}>
        <View style={styles.weekBadge}>
          <Text style={styles.weekBadgeText}>{week.weekNumber}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
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
              {weightDelta.text}
            </Text>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.statList}>
        <StatRow
          label={t('habitExercise')}
          value={week.exerciseDays}
          delta={week.comparison.exerciseDays}
          invertGood={false}
        />
        <StatRow
          label={t('habitLowWater')}
          value={week.lowWaterDays}
          delta={week.comparison.lowWaterDays}
        />
        <StatRow
          label={t('habitShortSleep')}
          value={week.shortSleepDays}
          delta={week.comparison.shortSleepDays}
        />
        <StatRow
          label={t('habitMissedSupp')}
          value={week.missedSupplementDays}
          delta={week.comparison.missedSupplementDays}
        />
        <StatRow label={t('habitMeals')} value={week.mealsDeviated ?? '—'} />
        <StatRow label={t('feedbackTitle')} value={feedback} />
      </View>

      <Pressable onPress={() => setOpen(v => !v)} hitSlop={8}>
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
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [data, setData] = useState<api.FollowupHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullOpen, setFullOpen] = useState(false);

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

  const followups = data?.followups ?? [];
  const newestFirst = useMemo(
    () => [...followups].reverse(),
    [followups],
  );
  const previewWeeks = newestFirst.slice(0, PREVIEW_WEEK_COUNT);
  const hasMore = newestFirst.length > PREVIEW_WEEK_COUNT;
  const trendPoints = useMemo(
    () =>
      followups.map(f => ({
        week: f.weekNumber,
        weight: f.currentWeight,
      })),
    [followups],
  );
  const change = data?.weightChange;
  const changeColor =
    change == null
      ? colors.textMuted
      : change < 0
        ? colors.success
        : change > 0
          ? colors.danger
          : colors.textMuted;

  const summaryBlock = (
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
        <View style={[styles.summaryBox, styles.summaryBoxGold]}>
          <Text style={[styles.summaryLabel, styles.summaryLabelGold]}>
            {t('totalWeightChange')}
          </Text>
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

      {trendPoints.length >= 2 ? (
        <View style={styles.trendBlock}>
          <WeightTrendChart
            points={trendPoints}
            unit={t('weightUnit')}
            title={t('weightTrend')}
          />
        </View>
      ) : null}
    </>
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>{t('myProgress')}</Text>
      <Text style={styles.sectionSub}>{t('weeklyFollowupHistory')}</Text>

      <View style={styles.panel}>
        {loading && !data ? (
          <View style={styles.centerRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>{t('loadingProgress')}</Text>
          </View>
        ) : null}

        {error && !data ? (
          <View>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={load} hitSlop={8}>
              <Text style={styles.reload}>{t('reload')}</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && !followups.length ? (
          <Text style={styles.empty}>{t('progressEmpty')}</Text>
        ) : null}

        {followups.length ? (
          <>
            {summaryBlock}

            {hasMore ? (
              <Text style={styles.recentHint}>{t('recentWeeksHint')}</Text>
            ) : null}

            {previewWeeks.map(week => (
              <WeekCard key={week.id} week={week} />
            ))}

            {hasMore ? (
              <Button
                title={t('moreWeeks')}
                variant="secondary"
                onPress={() => setFullOpen(true)}
                fullWidth
                testID="progress-more-button"
                style={{ marginTop: 4 }}
              />
            ) : null}
          </>
        ) : null}
      </View>

      <Modal
        visible={fullOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setFullOpen(false)}
        testID="progress-full-modal">
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setFullOpen(false)}
          />
          <View
            style={[
              styles.modalSheet,
              {
                maxHeight: height * 0.88,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.modalTitle}>{t('viewFullProgress')}</Text>
                <Text style={styles.modalSub}>{t('weeklyFollowupHistory')}</Text>
              </View>
              <Pressable
                onPress={() => setFullOpen(false)}
                hitSlop={10}
                style={styles.modalCloseBtn}
                testID="progress-modal-close">
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}>
              {summaryBlock}
              {newestFirst.map(week => (
                <WeekCard key={`full-${week.id}`} week={week} />
              ))}
            </ScrollView>

            <Button
              title={t('closeProgress')}
              variant="primary"
              onPress={() => setFullOpen(false)}
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: colors.textSoft,
    marginBottom: 10,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    marginBottom: 16,
    ...shadows.soft,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
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
    paddingVertical: 4,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 17,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  summaryBoxGold: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.warmBorder,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: colors.primary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  summaryLabelGold: {
    color: colors.accent,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  kg: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  submissions: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSoft,
    marginBottom: 14,
  },
  trendBlock: { marginBottom: 14 },
  trendCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgAlt,
    paddingTop: 12,
    paddingHorizontal: 10,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  trendEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 3,
  },
  trendRange: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  trendDeltaPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.warmBorder,
  },
  trendDeltaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trendFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
    paddingTop: 2,
  },
  trendFootText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  trendFootDot: {
    color: colors.textMuted,
    fontSize: 11,
  },
  weekCard: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.xl,
    padding: 14,
    marginBottom: 10,
    backgroundColor: colors.bgAlt,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  weekBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekBadgeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  weekMeta: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
  },
  weekWeight: { alignItems: 'flex-end' },
  weekWeightValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  weekDelta: { marginTop: 2, fontSize: 11, fontWeight: '700' },
  statList: {
    gap: 0,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  statLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.textSoft,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  toggle: {
    marginTop: 12,
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
  recentHint: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 10,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,32,26,0.45)',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    ...shadows.card,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  modalSub: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  modalCloseText: {
    fontSize: 14,
    color: colors.textSoft,
    fontWeight: '700',
  },
  modalScroll: {
    paddingBottom: 12,
  },
});
