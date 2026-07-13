import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as api from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import TextField from '../components/TextField';
import RadioGroup from '../components/RadioGroup';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/RootNavigator';

type RParam = RouteProp<RootStackParamList, 'Followup'>;

const DAY_OPTIONS = ['0', '1', '2', '3', '4', '5', '6', '7'];
const FEEDBACK_OPTIONS = ['Excellent', 'Good', 'Okay', 'Difficult'];

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

export default function FollowupScreen() {
  const route = useRoute<RParam>();
  const nav = useNavigation();
  const [form, setForm] = useState<State>(initial);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [week, setWeek] = useState<number>(route.params?.week || 1);
  const [status, setStatus] = useState<api.GateStatus['followup'] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getFollowupStatus();
        setStatus(s);
        const w =
          route.params?.week ||
          s.nextDueWeek ||
          s.pendingWeeks?.[0] ||
          1;
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
            planFeedback: String(existing.followup.planFeedback ?? ''),
            feedbackLikedNotes: existing.followup.feedbackLikedNotes ?? '',
            feedbackDislikedNotes: existing.followup.feedbackDislikedNotes ?? '',
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

  const setField = <K extends keyof State>(k: K, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  async function onSubmit() {
    if (!form.currentWeight) {
      Alert.alert('Missing', 'Current Weight જરૂરી છે');
      return;
    }
    const requiredDays: (keyof State)[] = [
      'exerciseDays',
      'lowWaterDays',
      'shortSleepDays',
      'missedSupplementDays',
    ];
    for (const k of requiredDays) {
      if (!form[k]) {
        Alert.alert('Missing', `${k} જરૂરી છે`);
        return;
      }
    }
    setSubmitting(true);
    try {
      await api.submitFollowup({ weekNumber: week, ...form });
      Alert.alert(
        'સફળ',
        'તમારો સાપ્તાહિક ફોલોઅપ સફળતાપૂર્વક સબમિટ થયો.',
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
      testID="followup-form">
      <View style={styles.hero}>
        <Text style={styles.kicker}>Weekly Check-in</Text>
        <Text style={styles.title}>સપ્તાહ {week} ફોલોઅપ</Text>
        <Text style={styles.desc}>
          ટૂંકું સાપ્તાહિક ચેક-ઇન. તૈયાર હો ત્યારે સબમિટ કરો.
        </Text>
        {status?.pendingWeeks?.length ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              Pending: Week {status.pendingWeeks.join(', ')}
            </Text>
          </View>
        ) : null}
      </View>

      <Card title="Weekly Habits">
        <TextField
          label="Current Weight (kg)"
          required
          keyboardType="numeric"
          value={form.currentWeight}
          onChangeText={v => setField('currentWeight', v)}
        />
        <RadioGroup
          label="ગયા સપ્તાહે તમે કેટલા દિવસ વ્યાયામ કર્યું?"
          required
          columns={4}
          options={DAY_OPTIONS}
          value={form.exerciseDays}
          onChange={v => setField('exerciseDays', v)}
        />
        <RadioGroup
          label="ગયા સપ્તાહે કેટલા દિવસ પાણીની માત્રા ઓછી પીધી?"
          required
          columns={4}
          options={DAY_OPTIONS}
          value={form.lowWaterDays}
          onChange={v => setField('lowWaterDays', v)}
        />
        <RadioGroup
          label="ગયા સપ્તાહે કેટલા દિવસ ૬ કલાકથી ઓછી ઊંઘ લીધી?"
          required
          columns={4}
          options={DAY_OPTIONS}
          value={form.shortSleepDays}
          onChange={v => setField('shortSleepDays', v)}
        />
        <RadioGroup
          label="કેટલા દિવસ સપ્લિમેન્ટ ચૂકી ગયા?"
          required
          columns={4}
          options={DAY_OPTIONS}
          value={form.missedSupplementDays}
          onChange={v => setField('missedSupplementDays', v)}
        />
        <TextField
          label="ગયા સપ્તાહે કેટલા ભોજન સહમતિ મુજબ નહોતા?"
          keyboardType="numeric"
          value={form.mealsDeviated}
          onChangeText={v => setField('mealsDeviated', v)}
        />
      </Card>

      <Card title="આ સપ્તાહના પ્લાન વિશે તમને કેવું લાગ્યું?">
        <RadioGroup
          label=""
          options={FEEDBACK_OPTIONS}
          value={form.planFeedback}
          onChange={v => setField('planFeedback', v)}
        />
        <TextField
          label="શું ઉત્તમ લાગ્યું? (લખો)"
          multiline
          numberOfLines={3}
          value={form.feedbackGoodNotes}
          onChangeText={v => setField('feedbackGoodNotes', v)}
          style={{ height: 90, textAlignVertical: 'top' }}
        />
        <TextField
          label="શું ગમ્યું?"
          multiline
          numberOfLines={3}
          value={form.feedbackLikedNotes}
          onChangeText={v => setField('feedbackLikedNotes', v)}
          style={{ height: 90, textAlignVertical: 'top' }}
        />
        <TextField
          label="શું ના ગમ્યું?"
          multiline
          numberOfLines={3}
          value={form.feedbackDislikedNotes}
          onChangeText={v => setField('feedbackDislikedNotes', v)}
          style={{ height: 90, textAlignVertical: 'top' }}
        />
        <TextField
          label="કઈ વસ્તુ મુશ્કેલ લાગી?"
          multiline
          numberOfLines={3}
          value={form.feedbackBadNotes}
          onChangeText={v => setField('feedbackBadNotes', v)}
          style={{ height: 90, textAlignVertical: 'top' }}
        />
      </Card>

      <Button
        title="Followup સબમિટ કરો"
        loading={submitting}
        onPress={onSubmit}
        fullWidth
        testID="followup-submit-button"
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
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  kicker: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  desc: { color: 'rgba(255,255,255,0.9)', marginTop: 8, fontSize: 13 },
  pill: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
