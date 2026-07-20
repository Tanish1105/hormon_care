import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as api from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { translate, type TranslationKey } from '../i18n/translations';
import type { Locale } from '../i18n/types';
import Card from '../components/Card';
import Button from '../components/Button';
import TextField from '../components/TextField';
import DayScaleField from '../components/DayScaleField';
import FeedbackPicker, {
  type PlanFeedback,
} from '../components/FeedbackPicker';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { colors, radius } from '../theme';
import type { RootStackParamList } from '../navigation/RootNavigator';

type RParam = RouteProp<RootStackParamList, 'Followup'>;

type State = {
  currentWeight: string;
  exerciseDays: string;
  lowWaterDays: string;
  shortSleepDays: string;
  missedSupplementDays: string;
  mealsDeviated: string;
  planFeedback: string;
  feedbackLikedNotes: string;
  feedbackDislikedNotes: string;
  feedbackBadNotes: string;
  feedbackGoodNotes: string;
};

const initial: State = {
  currentWeight: '',
  exerciseDays: '',
  lowWaterDays: '',
  shortSleepDays: '',
  missedSupplementDays: '',
  mealsDeviated: '',
  planFeedback: '',
  feedbackLikedNotes: '',
  feedbackDislikedNotes: '',
  feedbackBadNotes: '',
  feedbackGoodNotes: '',
};

function normalizeFeedback(value: string | null | undefined): string {
  if (!value) return '';
  if (value === 'excellent' || value === 'moderate' || value === 'poor') {
    return value;
  }
  const legacy: Record<string, PlanFeedback> = {
    liked: 'excellent',
    average: 'moderate',
    not_liked: 'poor',
    Excellent: 'excellent',
    Good: 'moderate',
    Okay: 'moderate',
    Difficult: 'poor',
  };
  return legacy[value] ?? '';
}

export default function FollowupScreen() {
  const route = useRoute<RParam>();
  const nav = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const { t: appT, locale: appLocale } = useLocale();
  const [formLocale, setFormLocale] = useState<Locale>(appLocale);
  const [form, setForm] = useState<State>(initial);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [week, setWeek] = useState<number>(route.params?.week || 1);
  const [status, setStatus] = useState<api.GateStatus['followup'] | null>(null);
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(formLocale, key, vars),
    [formLocale],
  );

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getFollowupStatus();
        setStatus(s);
        const w =
          route.params?.week || s.nextDueWeek || s.pendingWeeks?.[0] || 1;
        setWeek(w);
        const existing = await api.getFollowupForWeek(w);
        if (existing?.followup) {
          setForm({
            currentWeight: String(existing.followup.currentWeight ?? ''),
            exerciseDays: String(existing.followup.exerciseDays ?? ''),
            lowWaterDays: String(existing.followup.lowWaterDays ?? ''),
            shortSleepDays: String(existing.followup.shortSleepDays ?? ''),
            missedSupplementDays: String(
              existing.followup.missedSupplementDays ?? '',
            ),
            mealsDeviated: String(existing.followup.mealsDeviated ?? ''),
            planFeedback: normalizeFeedback(existing.followup.planFeedback),
            feedbackLikedNotes: existing.followup.feedbackLikedNotes ?? '',
            feedbackDislikedNotes:
              existing.followup.feedbackDislikedNotes ?? '',
            feedbackBadNotes: existing.followup.feedbackBadNotes ?? '',
            feedbackGoodNotes: existing.followup.feedbackGoodNotes ?? '',
          });
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params?.week]);

  useEffect(() => {
    nav.setOptions?.({ title: appT('followupNavTitle') } as any);
  }, [nav, appT]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, event => {
      setKeyboardPadding(event.endCoordinates.height + 48);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardPadding(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!form.planFeedback) return;
    scrollToFeedbackFields();
  }, [form.planFeedback]);

  function scrollToFeedbackFields() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }

  const setField = <K extends keyof State>(k: K, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  function setPlanFeedback(value: PlanFeedback) {
    setForm(prev => ({
      ...prev,
      planFeedback: value,
      feedbackLikedNotes:
        value === 'excellent' ? prev.feedbackLikedNotes : '',
      feedbackDislikedNotes:
        value === 'poor' ? prev.feedbackDislikedNotes : '',
      feedbackBadNotes: value === 'moderate' ? prev.feedbackBadNotes : '',
      feedbackGoodNotes: value === 'moderate' ? prev.feedbackGoodNotes : '',
    }));
  }

  async function onSubmit() {
    if (!form.currentWeight.trim()) {
      Alert.alert(t('missing'), t('currentWeightRequired'));
      return;
    }
    const requiredDays: (keyof State)[] = [
      'exerciseDays',
      'lowWaterDays',
      'shortSleepDays',
      'missedSupplementDays',
    ];
    const dayLabels: Record<string, string> = {
      exerciseDays: t('exerciseDaysQ'),
      lowWaterDays: t('lowWaterDaysQ'),
      shortSleepDays: t('shortSleepDaysQ'),
      missedSupplementDays: t('missedSupplementDaysQ'),
    };
    for (const k of requiredDays) {
      if (form[k] === '') {
        Alert.alert(
          t('missing'),
          t('fieldRequired', { field: dayLabels[k] || k }),
        );
        return;
      }
    }
    if (form.mealsDeviated.trim() === '') {
      Alert.alert(t('missing'), t('mealsRequired'));
      return;
    }
    if (
      form.planFeedback !== 'excellent' &&
      form.planFeedback !== 'moderate' &&
      form.planFeedback !== 'poor'
    ) {
      Alert.alert(t('missing'), t('feedbackRequired'));
      return;
    }
    if (
      form.planFeedback === 'excellent' &&
      !form.feedbackLikedNotes.trim()
    ) {
      Alert.alert(t('missing'), t('notesRequired'));
      return;
    }
    if (
      form.planFeedback === 'poor' &&
      !form.feedbackDislikedNotes.trim()
    ) {
      Alert.alert(t('missing'), t('notesRequired'));
      return;
    }
    if (
      form.planFeedback === 'moderate' &&
      (!form.feedbackBadNotes.trim() || !form.feedbackGoodNotes.trim())
    ) {
      Alert.alert(t('missing'), t('notesRequired'));
      return;
    }

    setSubmitting(true);
    try {
      await api.submitFollowup({ weekNumber: week, ...form });
      Alert.alert(t('success'), t('followupSubmitSuccess'), [
        { text: t('ok'), onPress: () => nav.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert(t('error'), e?.message || t('submitFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const notesStyle = {
    minHeight: 110,
    textAlignVertical: 'top' as const,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32 + keyboardPadding,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        testID="followup-form">
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroText}>
            <Text style={styles.kicker}>{t('followupNavTitle')}</Text>
            <Text style={styles.title}>{t('weekCheckIn', { week })}</Text>
          </View>
          <LanguageSwitcher
            compact
            value={formLocale}
            onChange={setFormLocale}
          />
        </View>
        <Text style={styles.desc}>{t('followupDesc')}</Text>
        {status?.pendingWeeks?.length ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              {t('pendingWeeks', { weeks: status.pendingWeeks.join(', ') })}
            </Text>
          </View>
        ) : null}
      </View>

      <Card title={t('weeklyHabits')}>
        <TextField
          label={t('currentWeight')}
          required
          keyboardType="decimal-pad"
          value={form.currentWeight}
          onChangeText={v => setField('currentWeight', v)}
          suffix={t('weightUnit')}
        />
        <DayScaleField
          label={t('exerciseDaysQ')}
          required
          locale={formLocale}
          value={form.exerciseDays}
          onChange={v => setField('exerciseDays', v)}
        />
        <DayScaleField
          label={t('lowWaterDaysQ')}
          required
          locale={formLocale}
          value={form.lowWaterDays}
          onChange={v => setField('lowWaterDays', v)}
        />
        <DayScaleField
          label={t('shortSleepDaysQ')}
          required
          locale={formLocale}
          value={form.shortSleepDays}
          onChange={v => setField('shortSleepDays', v)}
        />
        <DayScaleField
          label={t('missedSupplementDaysQ')}
          required
          locale={formLocale}
          value={form.missedSupplementDays}
          onChange={v => setField('missedSupplementDays', v)}
        />
        <TextField
          label={t('mealsDeviatedQ')}
          required
          keyboardType="number-pad"
          value={form.mealsDeviated}
          onChangeText={v => setField('mealsDeviated', v)}
          onFocus={scrollToFeedbackFields}
        />
      </Card>

      <Card title={t('feedbackTitle')}>
        <Text style={styles.prompt}>
          {t('planFeedbackTitle')}
          <Text style={{ color: colors.danger }}> *</Text>
        </Text>
        <FeedbackPicker
          value={form.planFeedback}
          onChange={setPlanFeedback}
          locale={formLocale}
        />

        {form.planFeedback === 'excellent' ? (
          <View style={[styles.notesBox, styles.notesExcellent]}>
            <TextField
              label={t('feedbackExcellentNotes')}
              required
              multiline
              numberOfLines={4}
              placeholder={t('feedbackPlaceholderExcellent')}
              value={form.feedbackLikedNotes}
              onChangeText={v => setField('feedbackLikedNotes', v)}
              onFocus={scrollToFeedbackFields}
              style={notesStyle}
            />
          </View>
        ) : null}

        {form.planFeedback === 'poor' ? (
          <View style={[styles.notesBox, styles.notesPoor]}>
            <TextField
              label={t('feedbackPoorNotes')}
              required
              multiline
              numberOfLines={4}
              placeholder={t('feedbackPlaceholderPoor')}
              value={form.feedbackDislikedNotes}
              onChangeText={v => setField('feedbackDislikedNotes', v)}
              onFocus={scrollToFeedbackFields}
              style={notesStyle}
            />
          </View>
        ) : null}

        {form.planFeedback === 'moderate' ? (
          <View style={[styles.notesBox, styles.notesModerate]}>
            <TextField
              label={t('feedbackBadNotes')}
              required
              multiline
              numberOfLines={4}
              placeholder={t('feedbackPlaceholderBad')}
              value={form.feedbackBadNotes}
              onChangeText={v => setField('feedbackBadNotes', v)}
              onFocus={scrollToFeedbackFields}
              style={notesStyle}
            />
            <TextField
              label={t('feedbackGoodNotes')}
              required
              multiline
              numberOfLines={4}
              placeholder={t('feedbackPlaceholderGood')}
              value={form.feedbackGoodNotes}
              onChangeText={v => setField('feedbackGoodNotes', v)}
              onFocus={scrollToFeedbackFields}
              style={notesStyle}
            />
          </View>
        ) : null}
      </Card>

      <Button
        title={submitting ? t('followupSubmitting') : t('followupSubmit')}
        loading={submitting}
        onPress={onSubmit}
        fullWidth
        testID="followup-submit-button"
      />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: -0.4,
  },
  desc: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  pill: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  prompt: {
    fontSize: 13,
    color: colors.textSoft,
    marginBottom: 10,
    lineHeight: 18,
  },
  notesBox: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  notesExcellent: {
    backgroundColor: colors.successSoft,
    borderColor: colors.successBorder,
  },
  notesPoor: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder,
  },
  notesModerate: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.accent,
  },
});
