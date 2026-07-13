import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as api from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { labeledOptions } from '../i18n/translations';
import type { TranslationKey } from '../i18n/translations';
import Card from '../components/Card';
import Button from '../components/Button';
import TextField from '../components/TextField';
import RadioGroup from '../components/RadioGroup';
import CheckboxGroup from '../components/CheckboxGroup';
import { colors } from '../theme';

const STRESS_KEYS: {
  key: string;
  labelKey: TranslationKey;
}[] = [
  { key: 'stressQ1', labelKey: 'stressQ1' },
  { key: 'stressQ2', labelKey: 'stressQ2' },
  { key: 'stressQ3', labelKey: 'stressQ3' },
  { key: 'stressQ4', labelKey: 'stressQ4' },
  { key: 'stressQ5', labelKey: 'stressQ5' },
  { key: 'stressQ6', labelKey: 'stressQ6' },
  { key: 'stressQ7', labelKey: 'stressQ7' },
  { key: 'stressQ8', labelKey: 'stressQ8' },
  { key: 'stressQ9', labelKey: 'stressQ9' },
  { key: 'stressQ10', labelKey: 'stressQ10' },
];

type FormState = {
  exerciseFrequency: string;
  exerciseDuration: string;
  exerciseType: string[];
  heightCm: string;
  weightKg: string;
  sleepHours: string;
  sleepQuality: string;
  nightShift: string;
  [k: string]: any;
  dietType: string;
  breakfast: string;
  fastFood: string;
  waterIntake: string;
  teaCoffee: string;
  coldDrinks: string;
  sugarItems: string;
  knownConditions: string[];
  irregularMenses: string[];
  supplements: string[];
  motherFamilyHistory: string[];
  fatherFamilyHistory: string[];
  partnerSmoking: string;
  partnerAlcohol: string;
  partnerExercise: string;
};

const initialForm: FormState = {
  exerciseFrequency: '',
  exerciseDuration: '',
  exerciseType: [],
  heightCm: '',
  weightKg: '',
  sleepHours: '',
  sleepQuality: '',
  nightShift: '',
  stressQ1: '',
  stressQ2: '',
  stressQ3: '',
  stressQ4: '',
  stressQ5: '',
  stressQ6: '',
  stressQ7: '',
  stressQ8: '',
  stressQ9: '',
  stressQ10: '',
  dietType: '',
  breakfast: '',
  fastFood: '',
  waterIntake: '',
  teaCoffee: '',
  coldDrinks: '',
  sugarItems: '',
  knownConditions: [],
  irregularMenses: [],
  supplements: [],
  motherFamilyHistory: [],
  fatherFamilyHistory: [],
  partnerSmoking: '',
  partnerAlcohol: '',
  partnerExercise: '',
};

export default function LifestyleAssessmentScreen() {
  const nav = useNavigation();
  const { locale, t } = useLocale();
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    pending: boolean;
    submitted?: boolean;
    patientName: string;
  } | null>(null);

  const L = (values: string[]) => labeledOptions(locale, values);
  const yesNo = useMemo(
    () => [
      { value: 'Yes', label: t('yes') },
      { value: 'No', label: t('no') },
    ],
    [t],
  );
  const stressYesNo = useMemo(
    () => [
      { value: '1', label: t('yes') },
      { value: '0', label: t('no') },
    ],
    [t],
  );

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getLifestyleStatus();
        setStatus(s);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    nav.setOptions?.({ title: t('lifestyleTitle') } as any);
  }, [nav, t]);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const bmi = React.useMemo(() => {
    const h = parseFloat(form.heightCm);
    const w = parseFloat(form.weightKg);
    if (!h || !w) return '';
    const m = h / 100;
    return (w / (m * m)).toFixed(1);
  }, [form.heightCm, form.weightKg]);

  async function onSubmit() {
    const required: (keyof FormState)[] = [
      'exerciseFrequency',
      'exerciseDuration',
      'heightCm',
      'weightKg',
      'sleepHours',
      'sleepQuality',
      'nightShift',
      'dietType',
      'breakfast',
      'fastFood',
      'waterIntake',
      'teaCoffee',
      'coldDrinks',
      'sugarItems',
      'partnerSmoking',
      'partnerAlcohol',
      'partnerExercise',
    ];
    for (const k of required) {
      const v = (form as any)[k];
      if (!v || (Array.isArray(v) && v.length === 0)) {
        Alert.alert(t('missingField'), `${t('pleaseFill')} "${k}"`);
        return;
      }
    }
    for (const q of STRESS_KEYS) {
      if (!form[q.key]) {
        Alert.alert(
          t('missingAnswer'),
          `${t('pleaseAnswer')}: ${t(q.labelKey)}`,
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.submitLifestyleAssessment({ ...form, bmi });
      Alert.alert(t('success'), t('lifestyleSubmitSuccess'), [
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
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (status && status.submitted) {
    return (
      <View style={styles.centerPad}>
        <Card title={t('lifestyleSubmittedTitle')}>
          <Text style={{ color: colors.textSoft }}>
            {t('lifestyleSubmittedBody')}
          </Text>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
      testID="lifestyle-form">
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>{t('lifestyleTitle')}</Text>
        <Text style={styles.heroTitle}>{t('lifestyleHeroTitle')}</Text>
        <Text style={styles.heroDesc}>{t('lifestyleHeroDesc')}</Text>
      </View>

      <Card title={t('sectionPhysicalActivity')}>
        <RadioGroup
          label={t('exerciseFrequency')}
          required
          options={L(['Never', '1-2 Days/Week', '3-5 Days/Week', 'Daily'])}
          value={form.exerciseFrequency}
          onChange={v => setField('exerciseFrequency', v)}
        />
        <RadioGroup
          label={t('exerciseDuration')}
          required
          options={L(['<15 min', '15-30 min', '30-60 min', '>60 min'])}
          value={form.exerciseDuration}
          onChange={v => setField('exerciseDuration', v)}
        />
        <CheckboxGroup
          label={t('exerciseType')}
          options={L([
            'Walking',
            'Yoga',
            'Gym',
            'Running',
            'Cycling',
            'Swimming',
            'Other',
          ])}
          values={form.exerciseType}
          onChange={v => setField('exerciseType', v)}
        />
      </Card>

      <Card title={t('sectionBmi')}>
        <TextField
          label={t('heightCm')}
          required
          keyboardType="numeric"
          value={form.heightCm}
          onChangeText={v => setField('heightCm', v)}
        />
        <TextField
          label={t('weightKg')}
          required
          keyboardType="numeric"
          value={form.weightKg}
          onChangeText={v => setField('weightKg', v)}
        />
        <TextField
          label={t('bmi')}
          value={bmi}
          editable={false}
          hint={t('bmiAutoHint')}
        />
      </Card>

      <Card title={t('sectionSleep')}>
        <RadioGroup
          label={t('sleepHours')}
          required
          options={L(['<5', '5-6', '6-7', '7-8', '>8'])}
          value={form.sleepHours}
          onChange={v => setField('sleepHours', v)}
        />
        <RadioGroup
          label={t('sleepQuality')}
          required
          options={L(['Poor', 'Fair', 'Good', 'Excellent'])}
          value={form.sleepQuality}
          onChange={v => setField('sleepQuality', v)}
        />
        <RadioGroup
          label={t('nightShift')}
          required
          options={yesNo}
          value={form.nightShift}
          onChange={v => setField('nightShift', v)}
        />
      </Card>

      <Card title={t('sectionStress')}>
        <Text style={{ color: colors.textSoft, marginBottom: 10, fontSize: 12 }}>
          {t('stressHint')}
        </Text>
        {STRESS_KEYS.map((q, idx) => (
          <RadioGroup
            key={q.key}
            label={`${idx + 1}. ${t(q.labelKey)}`}
            required
            options={stressYesNo}
            value={form[q.key]}
            onChange={v => setField(q.key as any, v)}
          />
        ))}
      </Card>

      <Card title={t('sectionDiet')}>
        <RadioGroup
          label={t('dietType')}
          required
          options={L(['Vegetarian', 'Eggetarian', 'Vegan'])}
          value={form.dietType}
          onChange={v => setField('dietType', v)}
        />
        <RadioGroup
          label={t('breakfast')}
          required
          options={L(['Daily', 'Sometimes Skip', 'Always Skip'])}
          value={form.breakfast}
          onChange={v => setField('breakfast', v)}
        />
        <RadioGroup
          label={t('outsideFood')}
          required
          options={L(['Never', 'Weekly', '2-3 Times/Week', 'Daily'])}
          value={form.fastFood}
          onChange={v => setField('fastFood', v)}
        />
        <RadioGroup
          label={t('waterIntake')}
          required
          columns={1}
          options={L([
            '< 5 glasses',
            '5-10 glasses',
            '10-15 glasses',
            '15-20 glasses',
            '> 20 glasses',
          ])}
          value={form.waterIntake}
          onChange={v => setField('waterIntake', v)}
        />
      </Card>

      <Card title={t('sectionHabits')}>
        <RadioGroup
          label={t('teaCoffee')}
          required
          options={L(['None', '1 Cup', '2 Cups', '3+ Cups'])}
          value={form.teaCoffee}
          onChange={v => setField('teaCoffee', v)}
        />
        <RadioGroup
          label={t('coldDrinks')}
          required
          options={L(['None', 'Occasionally', 'Weekly', 'Daily'])}
          value={form.coldDrinks}
          onChange={v => setField('coldDrinks', v)}
        />
        <RadioGroup
          label={t('sugarItems')}
          required
          options={L(['None', 'Occasionally', 'Weekly', 'Daily'])}
          value={form.sugarItems}
          onChange={v => setField('sugarItems', v)}
        />
      </Card>

      <Card title={t('sectionMedical')}>
        <CheckboxGroup
          label={t('knownConditions')}
          options={L([
            'PCOD',
            'Thyroid',
            'Diabetes',
            'Endometriosis',
            'Hypertension',
            'Fibroids',
            'None',
          ])}
          values={form.knownConditions}
          onChange={v => setField('knownConditions', v)}
        />
        <CheckboxGroup
          label={t('irregularMenses')}
          options={L(['Heavy', 'Painful', 'None'])}
          values={form.irregularMenses}
          onChange={v => setField('irregularMenses', v)}
        />
        <CheckboxGroup
          label={t('supplements')}
          options={L([
            'Folic Acid',
            'Vitamin D',
            'Iron',
            'Calcium',
            'Vit B12',
            'Other',
            'None',
          ])}
          values={form.supplements}
          onChange={v => setField('supplements', v)}
        />
      </Card>

      <Card title={t('sectionFamily')}>
        <CheckboxGroup
          label={t('mother')}
          options={L(['Diabetes', 'Hypertension', 'Thyroid', 'None'])}
          values={form.motherFamilyHistory}
          onChange={v => setField('motherFamilyHistory', v)}
        />
        <CheckboxGroup
          label={t('father')}
          options={L(['Diabetes', 'BP', 'None'])}
          values={form.fatherFamilyHistory}
          onChange={v => setField('fatherFamilyHistory', v)}
        />
      </Card>

      <Card title={t('sectionPartner')}>
        <RadioGroup
          label={t('smoking')}
          required
          options={yesNo}
          value={form.partnerSmoking}
          onChange={v => setField('partnerSmoking', v)}
        />
        <RadioGroup
          label={t('alcohol')}
          required
          options={yesNo}
          value={form.partnerAlcohol}
          onChange={v => setField('partnerAlcohol', v)}
        />
        <RadioGroup
          label={t('exercise')}
          required
          options={L(['Regular', 'Occasional', 'None'])}
          value={form.partnerExercise}
          onChange={v => setField('partnerExercise', v)}
        />
      </Card>

      <Button
        title={t('lifestyleSubmit')}
        loading={submitting}
        onPress={onSubmit}
        fullWidth
        testID="lifestyle-submit-button"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  centerPad: { flex: 1, padding: 16, backgroundColor: colors.bg },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: -0.4,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
});
