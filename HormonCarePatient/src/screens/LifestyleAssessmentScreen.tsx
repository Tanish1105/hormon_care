import React, { useEffect, useState } from 'react';
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
import Card from '../components/Card';
import Button from '../components/Button';
import TextField from '../components/TextField';
import RadioGroup from '../components/RadioGroup';
import CheckboxGroup from '../components/CheckboxGroup';
import { colors } from '../theme';

/**
 * Section definitions mirror those from the web app (Physical Activity, BMI,
 * Sleep, Stress Screening, Diet, Habits, Medical History, Family History,
 * Partner Lifestyle).
 */

const STRESS_QUESTIONS: { key: string; text: string }[] = [
  {
    key: 'stressQ1',
    text: 'શું તમે નાની-નાની વાતોમાં ચિડાઈ જાવ છો અથવા ગુસ્સે થઈ જાવ છો?',
  },
  {
    key: 'stressQ2',
    text: 'શું તમને કોઈ પણ કારણ વગર સતત ચિંતા અથવા ગભરામણ અનુભવાય છે?',
  },
  {
    key: 'stressQ3',
    text: 'શું તમને એવું લાગે છે કે તમે તમારી પરિસ્થિતિઓ પર નિયંત્રણ ગુમાવી રહ્યા છો?',
  },
  {
    key: 'stressQ4',
    text: 'શું તણાવને કારણે તમને વારંવાર માથાનો દુખાવો કે સ્નાયુઓમાં દુખાવો થાય છે?',
  },
  {
    key: 'stressQ5',
    text: 'શું તમને પૂરતી ઊંઘ લેવામાં તકલીફ પડે છે અથવા સવારે ઉઠતી વખતે થાક લાગે છે?',
  },
  {
    key: 'stressQ6',
    text: 'શું તમને વારંવાર ખૂબ જ થાક અથવા શરીરમાં નબળાઈ અનુભવાય છે?',
  },
  {
    key: 'stressQ7',
    text: 'શું તમને કામ પર ધ્યાન કેન્દ્રિત કરવામાં મુશ્કેલી પડે છે?',
  },
  {
    key: 'stressQ8',
    text: 'શું તણાવના કારણે તમારી ભૂખમાં ફેરફાર થયો છે?',
  },
  {
    key: 'stressQ9',
    text: 'શું તમે લોકો સાથે મળવાનું ટાળો છો અને એકલા રહેવાનું પસંદ કરો છો?',
  },
  {
    key: 'stressQ10',
    text: 'શું તમને એવું લાગે છે કે જવાબદારીઓનો બોજ સંભાળી શકતા નથી?',
  },
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
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    pending: boolean;
    submitted?: boolean;
    patientName: string;
  } | null>(null);

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
    // Simple validation on required radios
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
        Alert.alert('Missing field', `Please fill "${k}"`);
        return;
      }
    }
    for (const q of STRESS_QUESTIONS) {
      if (!form[q.key]) {
        Alert.alert('Missing answer', `Please answer: ${q.text}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.submitLifestyleAssessment({ ...form, bmi });
      Alert.alert(
        'સફળ',
        'તમારું જીવનશૈલી મૂલ્યાંકન સફળતાપૂર્વક સબમિટ થયું.',
        [{ text: 'OK', onPress: () => nav.goBack() }],
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Submit failed');
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
        <Card title="સબમિટ થઈ ગયું">
          <Text style={{ color: colors.textSoft }}>
            તમારું જીવનશૈલી મૂલ્યાંકન સફળતાપૂર્વક સબમિટ થયું.
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
        <Text style={styles.heroKicker}>Lifestyle Assessment</Text>
        <Text style={styles.heroTitle}>જીવનશૈલી મૂલ્યાંકન</Text>
        <Text style={styles.heroDesc}>
          તમારા ડૉક્ટરને શ્રેષ્ઠ સારવાર planning માટે નીચેની માહિતી ભરો.
        </Text>
      </View>

      <Card title="1. Physical Activity">
        <RadioGroup
          label="Exercise Frequency"
          required
          options={['Never', '1-2 Days/Week', '3-5 Days/Week', 'Daily']}
          value={form.exerciseFrequency}
          onChange={v => setField('exerciseFrequency', v)}
        />
        <RadioGroup
          label="Exercise Duration"
          required
          options={['<15 min', '15-30 min', '30-60 min', '>60 min']}
          value={form.exerciseDuration}
          onChange={v => setField('exerciseDuration', v)}
        />
        <CheckboxGroup
          label="Exercise Type"
          options={[
            'Walking',
            'Yoga',
            'Gym',
            'Running',
            'Cycling',
            'Swimming',
            'Other',
          ]}
          values={form.exerciseType}
          onChange={v => setField('exerciseType', v)}
        />
      </Card>

      <Card title="2. BMI & Weight">
        <TextField
          label="Height (cm)"
          required
          keyboardType="numeric"
          value={form.heightCm}
          onChangeText={v => setField('heightCm', v)}
        />
        <TextField
          label="Weight (kg)"
          required
          keyboardType="numeric"
          value={form.weightKg}
          onChangeText={v => setField('weightKg', v)}
        />
        <TextField
          label="BMI"
          value={bmi}
          editable={false}
          hint="ઊંચાઈ અને વજન પછી આપમેળે ગણાશે"
        />
      </Card>

      <Card title="3. Sleep">
        <RadioGroup
          label="Sleep Hours"
          required
          options={['<5', '5-6', '6-7', '7-8', '>8']}
          value={form.sleepHours}
          onChange={v => setField('sleepHours', v)}
        />
        <RadioGroup
          label="Sleep Quality"
          required
          options={['Poor', 'Fair', 'Good', 'Excellent']}
          value={form.sleepQuality}
          onChange={v => setField('sleepQuality', v)}
        />
        <RadioGroup
          label="Night Shift"
          required
          options={['Yes', 'No']}
          value={form.nightShift}
          onChange={v => setField('nightShift', v)}
        />
      </Card>

      <Card title="4. તણાવ મૂલ્યાંકન (છેલ્લા એક મહિના)">
        <Text style={{ color: colors.textSoft, marginBottom: 10, fontSize: 12 }}>
          કૃપા કરીને છેલ્લા એક મહિનાના તમારા અનુભવના આધારે «હા» અથવા «ના» માં જવાબ આપો.
        </Text>
        {STRESS_QUESTIONS.map((q, idx) => (
          <RadioGroup
            key={q.key}
            label={`${idx + 1}. ${q.text}`}
            required
            options={['હા', 'ના']}
            value={form[q.key]}
            onChange={v => setField(q.key as any, v)}
          />
        ))}
      </Card>

      <Card title="5. Diet">
        <RadioGroup
          label="Diet Type"
          required
          options={['Vegetarian', 'Eggetarian', 'Vegan']}
          value={form.dietType}
          onChange={v => setField('dietType', v)}
        />
        <RadioGroup
          label="Breakfast"
          required
          options={['Daily', 'Sometimes Skip', 'Always Skip']}
          value={form.breakfast}
          onChange={v => setField('breakfast', v)}
        />
        <RadioGroup
          label="Outside Food"
          required
          options={['Never', 'Weekly', '2-3 Times/Week', 'Daily']}
          value={form.fastFood}
          onChange={v => setField('fastFood', v)}
        />
        <RadioGroup
          label="Water Intake (glasses)"
          required
          columns={1}
          options={[
            '< 5 glasses',
            '5-10 glasses',
            '10-15 glasses',
            '15-20 glasses',
            '> 20 glasses',
          ]}
          value={form.waterIntake}
          onChange={v => setField('waterIntake', v)}
        />
      </Card>

      <Card title="6. Habits">
        <RadioGroup
          label="Tea/Coffee"
          required
          options={['None', '1 Cup', '2 Cups', '3+ Cups']}
          value={form.teaCoffee}
          onChange={v => setField('teaCoffee', v)}
        />
        <RadioGroup
          label="Cold Drinks"
          required
          options={['None', 'Occasionally', 'Weekly', 'Daily']}
          value={form.coldDrinks}
          onChange={v => setField('coldDrinks', v)}
        />
        <RadioGroup
          label="શુગર આઇટમ્સ (આઇસ ક્રીમ વગેરે)"
          required
          options={['None', 'Occasionally', 'Weekly', 'Daily']}
          value={form.sugarItems}
          onChange={v => setField('sugarItems', v)}
        />
      </Card>

      <Card title="7. Medical History">
        <CheckboxGroup
          label="Known Conditions"
          options={[
            'PCOD',
            'Thyroid',
            'Diabetes',
            'Endometriosis',
            'Hypertension',
            'Fibroids',
            'None',
          ]}
          values={form.knownConditions}
          onChange={v => setField('knownConditions', v)}
        />
        <CheckboxGroup
          label="Irregular Menses"
          options={['Heavy', 'Painful', 'None']}
          values={form.irregularMenses}
          onChange={v => setField('irregularMenses', v)}
        />
        <CheckboxGroup
          label="Supplements"
          options={[
            'Folic Acid',
            'Vitamin D',
            'Iron',
            'Calcium',
            'Vit B12',
            'Other',
            'None',
          ]}
          values={form.supplements}
          onChange={v => setField('supplements', v)}
        />
      </Card>

      <Card title="8. Family History">
        <CheckboxGroup
          label="Mother"
          options={['Diabetes', 'Hypertension', 'Thyroid', 'None']}
          values={form.motherFamilyHistory}
          onChange={v => setField('motherFamilyHistory', v)}
        />
        <CheckboxGroup
          label="Father"
          options={['Diabetes', 'BP', 'None']}
          values={form.fatherFamilyHistory}
          onChange={v => setField('fatherFamilyHistory', v)}
        />
      </Card>

      <Card title="9. Partner Lifestyle">
        <RadioGroup
          label="Smoking"
          required
          options={['Yes', 'No']}
          value={form.partnerSmoking}
          onChange={v => setField('partnerSmoking', v)}
        />
        <RadioGroup
          label="Alcohol"
          required
          options={['Yes', 'No']}
          value={form.partnerAlcohol}
          onChange={v => setField('partnerAlcohol', v)}
        />
        <RadioGroup
          label="Exercise"
          required
          options={['Regular', 'Occasional', 'None']}
          value={form.partnerExercise}
          onChange={v => setField('partnerExercise', v)}
        />
      </Card>

      <Button
        title="ફોર્મ સબમિટ કરો"
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  heroDesc: { color: 'rgba(255,255,255,0.9)', marginTop: 8, fontSize: 13 },
});
