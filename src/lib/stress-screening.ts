export type StressLocale = "en" | "gu";
export type { PatientLocale } from "@/lib/patient-locale";

export const STRESS_QUESTION_KEYS = [
  "stressQ1",
  "stressQ2",
  "stressQ3",
  "stressQ4",
  "stressQ5",
  "stressQ6",
  "stressQ7",
  "stressQ8",
  "stressQ9",
  "stressQ10",
] as const;

export type StressQuestionKey = (typeof STRESS_QUESTION_KEYS)[number];

export const STRESS_MAX_SCORE = 10;

export type StressCategoryId = "emotional" | "physical" | "behavioral";

export const STRESS_CATEGORIES: {
  id: StressCategoryId;
  keys: readonly StressQuestionKey[];
  en: string;
  gu: string;
}[] = [
  {
    id: "emotional",
    keys: ["stressQ1", "stressQ2", "stressQ3"],
    en: "Emotional Symptoms",
    gu: "ભાવનાત્મક લક્ષણો",
  },
  {
    id: "physical",
    keys: ["stressQ4", "stressQ5", "stressQ6"],
    en: "Physical Symptoms",
    gu: "શારીરિક લક્ષણો",
  },
  {
    id: "behavioral",
    keys: ["stressQ7", "stressQ8", "stressQ9", "stressQ10"],
    en: "Behavioral Symptoms",
    gu: "વર્તણૂક સંબંધિત લક્ષણો",
  },
];

export const STRESS_QUESTIONS: Record<
  StressQuestionKey,
  { en: string; gu: string }
> = {
  stressQ1: {
    en: "Do you get irritated or angry over small things? (in the last one month)",
    gu: "શું તમે નાની-નાની વાતોમાં ચિડાઈ જાવ છો અથવા ગુસ્સે થઈ જાવ છો? (છેલ્લા એક મહિનામાં)",
  },
  stressQ2: {
    en: "Do you feel constant worry or anxiety without any reason?",
    gu: "શું તમને કોઈ પણ કારણ વગર સતત ચિંતા અથવા ગભરામણ અનુભવાય છે?",
  },
  stressQ3: {
    en: "Do you feel like you are losing control over your situations?",
    gu: "શું તમને એવું લાગે છે કે તમે તમારી પરિસ્થિતિઓ પર નિયંત્રણ ગુમાવી રહ્યા છો?",
  },
  stressQ4: {
    en: "Do you often get headaches or muscle tension/pain due to stress?",
    gu: "શું તણાવને કારણે તમને વારંવાર માથાનો દુખાવો કે સ્નાયુઓમાં ખેંચાણ/દુખાવો થાય છે?",
  },
  stressQ5: {
    en: "Do you have trouble getting enough sleep, or still feel tired when you wake up in the morning?",
    gu: "શું તમને પૂરતી ઊંઘ લેવામાં તકલીફ પડે છે અથવા સવારે ઉઠતી વખતે પણ થાક લાગે છે?",
  },
  stressQ6: {
    en: "Do you often feel extreme fatigue or weakness in the body?",
    gu: "શું તમને વારંવાર ખૂબ જ વધારે થાક અથવા શરીરમાં નબળાઈ અનુભવાય છે?",
  },
  stressQ7: {
    en: "Do you find it difficult to concentrate at work or in any one place?",
    gu: "શું તમને કામ પર અથવા કોઈ પણ એક જગ્યાએ ધ્યાન કેન્દ્રિત કરવામાં મુશ્કેલી પડે છે?",
  },
  stressQ8: {
    en: "Has your appetite changed due to stress (eating too little or more than needed)?",
    gu: "શું તણાવના કારણે તમારી ભૂખમાં ફેરફાર થયો છે (ખૂબ ઓછું ખાવું અથવા જરૂર કરતાં વધારે ખાવું)?",
  },
  stressQ9: {
    en: "Do you avoid meeting or talking to people and prefer to stay alone?",
    gu: "શું તમે લોકો સાથે મળવાનું કે વાત કરવાનું ટાળો છો અને એકલા રહેવાનું વધુ પસંદ કરો છો?",
  },
  stressQ10: {
    en: "Do you feel that the burden of your responsibilities has become so heavy that you cannot manage it?",
    gu: "શું તમને એવું લાગે છે કે તમારી જવાબદારીઓનો બોજ એટલો વધી ગયો છે કે તમે તેને સંભાળી શકતા નથી?",
  },
};

/** Yes = 1, No = 0 — score is the count of "Yes" answers. */
export const YES_NO_OPTIONS = [
  { value: 1, en: "Yes", gu: "હા" },
  { value: 0, en: "No", gu: "ના" },
] as const;

export const STRESS_LEVELS = {
  low: "Low Stress",
  moderate: "Moderate Stress",
  high: "High Stress",
} as const;

export type StressLevelLabel = (typeof STRESS_LEVELS)[keyof typeof STRESS_LEVELS];

export const STRESS_RECOMMENDATIONS: Record<StressLevelLabel, { en: string; gu: string }> = {
  [STRESS_LEVELS.low]: {
    en: "Life is normal; stress level is under control. Continue healthy habits.",
    gu: "જીવન સામાન્ય છે, તણાવનું સ્તર નિયંત્રણમાં છે. સ્વસ્થ આદતો ચાલુ રાખો.",
  },
  [STRESS_LEVELS.moderate]: {
    en: "You are under some stress. Yoga, exercise, or relaxation techniques can help.",
    gu: "તમે થોડા તણાવમાં છો. યોગા, કસરત અથવા હળવાશ મેળવવાની જરૂર છે.",
  },
  [STRESS_LEVELS.high]: {
    en: "You are experiencing high stress. Consider lifestyle changes or seeking advice from a counselor/doctor.",
    gu: "તમે ખૂબ જ વધારે તણાવ અનુભવી રહ્યા છો. લાઈફસ્ટાઈલમાં ફેરફાર અથવા કાઉન્સિલર/ડૉક્ટરની સલાહ લેવાની જરૂર પડી શકે છે.",
  },
};

export type StressScreeningAnswers = Record<StressQuestionKey, number>;

export function calculateStressScreeningScore(answers: Partial<StressScreeningAnswers>) {
  return STRESS_QUESTION_KEYS.reduce((sum, key) => sum + (answers[key] ?? 0), 0);
}

export function getStressLevelFromScore(score: number): StressLevelLabel {
  if (score <= 3) return STRESS_LEVELS.low;
  if (score <= 7) return STRESS_LEVELS.moderate;
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
    if (!Number.isInteger(value) || (value !== 0 && value !== 1)) {
      return { error: "Please answer all stress screening questions" };
    }
    answers[key] = value;
  }

  return { answers };
}

export function stressSectionTitle(locale: StressLocale) {
  return locale === "gu"
    ? "તણાવ માપવા માટેની પ્રશ્નાવલી (છેલ્લા એક મહિના)"
    : "Stress Assessment Questionnaire (Last One Month)";
}

export function stressSectionSubtitle(locale: StressLocale) {
  return locale === "gu"
    ? "કૃપા કરીને નીચેના પ્રશ્નો વાંચો અને છેલ્લા એક મહિનાના તમારા અનુભવના આધારે «હા» અથવા «ના» માં જવાબ આપો."
    : "Please read the questions below and answer Yes or No based on your experience in the last one month.";
}

const STRESS_LEVEL_LABELS_GU: Record<StressLevelLabel, string> = {
  "Low Stress": "ઓછો તણાવ",
  "Moderate Stress": "મધ્યમ તણાવ",
  "High Stress": "વધારે તણાવ",
};

export function stressLevelLabel(locale: StressLocale, level: StressLevelLabel) {
  if (locale === "en") return level;
  return STRESS_LEVEL_LABELS_GU[level] ?? level;
}
