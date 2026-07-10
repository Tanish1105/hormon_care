export type StressLocale = "en" | "gu";
export type { PatientLocale } from "@/lib/patient-locale";

export const STRESS_QUESTION_KEYS = [
  "stressQ1",
  "stressQ2",
  "stressQ3",
  "stressQ4",
  "stressQ5",
] as const;

export type StressQuestionKey = (typeof STRESS_QUESTION_KEYS)[number];

export const STRESS_QUESTIONS: Record<
  StressQuestionKey,
  { en: string; gu: string }
> = {
  stressQ1: {
    en: "How often have you felt stressed or overwhelmed?",
    gu: "તમે કેટલી વાર તણાવ અથવા વધુ પડતું ભારણ અનુભવ્યું?",
  },
  stressQ2: {
    en: "How often have you had trouble relaxing?",
    gu: "તમે કેટલી વાર આરામ કરવામાં મુશ્કેલી અનુભવી?",
  },
  stressQ3: {
    en: "How often have you felt anxious or worried about your health or fertility?",
    gu: "તમે કેટલી વાર તમારા સ્વાસ્થ્ય અથવા ફર્ટિલિટી વિશે ચિંતિત અથવા ચિંતાગ્રસ્ત અનુભવ્યું?",
  },
  stressQ4: {
    en: "How often has stress affected your sleep?",
    gu: "તણાવે તમારી ઊંઘને કેટલી વાર અસર કરી?",
  },
  stressQ5: {
    en: "How often have you found it difficult to cope with daily responsibilities because of stress?",
    gu: "તણાવને કારણે દૈનિક જવાબદારીઓ સંભાળવી કેટલી વાર મુશ્કેલ લાગી?",
  },
};

export const LIKERT_OPTIONS = [
  { value: 0, en: "Never", gu: "ક્યારેય નહીં" },
  { value: 1, en: "Rarely", gu: "ભાગ્યે જ" },
  { value: 2, en: "Sometimes", gu: "ક્યારેક" },
  { value: 3, en: "Often", gu: "વારંવાર" },
  { value: 4, en: "Always", gu: "હંમેશા" },
] as const;

export const STRESS_LEVELS = {
  low: "Low Stress",
  mild: "Mild Stress",
  moderate: "Moderate Stress",
  high: "High Stress",
} as const;

export type StressLevelLabel = (typeof STRESS_LEVELS)[keyof typeof STRESS_LEVELS];

export const STRESS_RECOMMENDATIONS: Record<StressLevelLabel, { en: string; gu: string }> = {
  [STRESS_LEVELS.low]: {
    en: "No significant stress. Continue healthy lifestyle.",
    gu: "ગંભીર તણાવ નથી. સ્વસ્થ જીવનશૈલી ચાલુ રાખો.",
  },
  [STRESS_LEVELS.mild]: {
    en: "Encourage relaxation techniques and healthy habits.",
    gu: "આરામની તકનીકો અને સ્વસ્થ આદતો અપનાવવાની સલાહ આપો.",
  },
  [STRESS_LEVELS.moderate]: {
    en: "Consider stress management counseling and lifestyle modifications.",
    gu: "તણાવ વ્યવસ્થાપન સલાહ અને જીવનશૈલીમાં ફેરફાર વિચારો.",
  },
  [STRESS_LEVELS.high]: {
    en: "Discuss with the clinician. Consider psychological evaluation, counseling, or mental health referral if appropriate.",
    gu: "ડૉક્ટર સાથે ચર્ચા કરો. જરૂર હોય તો માનસિક સલાહ અથવા રેફરલ વિચારો.",
  },
};

export type StressScreeningAnswers = Record<StressQuestionKey, number>;

export function calculateStressScreeningScore(answers: Partial<StressScreeningAnswers>) {
  return STRESS_QUESTION_KEYS.reduce((sum, key) => sum + (answers[key] ?? 0), 0);
}

export function getStressLevelFromScore(score: number): StressLevelLabel {
  if (score <= 4) return STRESS_LEVELS.low;
  if (score <= 9) return STRESS_LEVELS.mild;
  if (score <= 14) return STRESS_LEVELS.moderate;
  return STRESS_LEVELS.high;
}

export function interpretStressScreening(answers: Partial<StressScreeningAnswers>) {
  const answered = STRESS_QUESTION_KEYS.every((key) => typeof answers[key] === "number");
  if (!answered) return null;

  const score = calculateStressScreeningScore(answers as StressScreeningAnswers);
  const level = getStressLevelFromScore(score);
  return { score, level, recommendation: STRESS_RECOMMENDATIONS[level] };
}

export function validateStressAnswers(body: Record<string, unknown>): {
  answers?: StressScreeningAnswers;
  error?: string;
} {
  const answers = {} as StressScreeningAnswers;

  for (const key of STRESS_QUESTION_KEYS) {
    const raw = body[key];
    const value = typeof raw === "string" ? Number(raw) : typeof raw === "number" ? raw : NaN;
    if (!Number.isInteger(value) || value < 0 || value > 4) {
      return { error: "Please answer all stress screening questions" };
    }
    answers[key] = value;
  }

  return { answers };
}

export function stressSectionTitle(locale: StressLocale) {
  return locale === "gu"
    ? "તણાવ મૂલ્યાંકન (છેલ્લા ૨ અઠવાડિયા)"
    : "Stress Assessment (Last 2 Weeks)";
}

export function stressSectionSubtitle(locale: StressLocale) {
  return locale === "gu"
    ? "દરેક પ્રશ્ન માટે એક જવાબ પસંદ કરો."
    : "Please select one answer for each question.";
}

const STRESS_LEVEL_LABELS_GU: Record<StressLevelLabel, string> = {
  "Low Stress": "ઓછો તણાવ",
  "Mild Stress": "હળવો તણાવ",
  "Moderate Stress": "મધ્યમ તણાવ",
  "High Stress": "ઉચ્ચ તણાવ",
};

export function stressLevelLabel(locale: StressLocale, level: StressLevelLabel) {
  if (locale === "en") return level;
  return STRESS_LEVEL_LABELS_GU[level] ?? level;
}
