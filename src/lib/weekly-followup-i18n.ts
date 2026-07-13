import type { PatientLocale } from "@/lib/patient-locale";
import { pickLocale } from "@/lib/patient-locale";
import { normalizePlanFeedback } from "@/lib/weekly-followup";

const DAY_LABELS_GU: Record<string, string> = {
  None: "કોઈ નહીં",
  "1": "૧",
  "2": "૨",
  "3": "૩",
  "4": "૪",
  "5": "૫",
  "6": "૬",
  "7": "૭",
};

export function followupDayLabel(locale: PatientLocale, label: string) {
  if (locale === "en") return label;
  return DAY_LABELS_GU[label] ?? label;
}

export function followupUi(locale: PatientLocale) {
  return {
    title: pickLocale(locale, "Weekly Followup", "સાપ્તાહિક ફોલોઅપ"),
    weekCheckIn: (week: number) =>
      pickLocale(locale, `Week ${week} completion check-in`, `સપ્તાહ ${week} પૂર્ણતા ચેક-ઇન`),
    patientName: pickLocale(locale, "Patient Name", "દર્દીનું નામ"),
    weeklyHabits: pickLocale(locale, "Weekly Habits", "સાપ્તાહિક આદતો"),
    currentWeight: pickLocale(locale, "Current Weight", "વર્તમાન વજન"),
    exerciseDays: pickLocale(
      locale,
      "How many days did you exercise last week?",
      "ગયા સપ્તાહે તમે કેટલા દિવસ વ્યાયામ કર્યું?"
    ),
    lowWaterDays: pickLocale(
      locale,
      "How many days did you drink less than agreed quantity of water last week?",
      "ગયા સપ્તાહે કેટલા દિવસ પાણીની માત્રા ઓછી પીધી?"
    ),
    shortSleepDays: pickLocale(
      locale,
      "How many days did you sleep <6 hours last week?",
      "ગયા સપ્તાહે કેટલા દિવસ ૬ કલાકથી ઓછી ઊંઘ લીધી?"
    ),
    missedSupplementDays: pickLocale(
      locale,
      "How many days did you miss your supplements?",
      "કેટલા દિવસ સપ્લિમેન્ટ ચૂકી ગયા?"
    ),
    mealsDeviated: pickLocale(
      locale,
      "How many meals did you deviate last week from what was agreed?",
      "ગયા સપ્તાહે કેટલા ભોજન પ્લાન મુજબ નહોતા?"
    ),
    submit: pickLocale(locale, "Submit", "સબમિટ"),
    submitting: pickLocale(locale, "Submitting...", "સબમિટ થઈ રહ્યું છે..."),
    modalTitle: (week: number) =>
      pickLocale(locale, `Week ${week} followup due`, `સપ્તાહ ${week} ફોલોઅપ બાકી છે`),
    modalHint: pickLocale(
      locale,
      "A short weekly check-in. Submit when ready — you can still open your plan anytime.",
      "ટૂંકું સાપ્તાહિક ચેક-ઇન. તૈયાર હો ત્યારે સબમિટ કરો — પ્લાન ક્યારેય પણ જોઈ શકો છો."
    ),
    viewPlanFirst: pickLocale(locale, "View my plan first", "પહેલા મારો પ્લાન જુઓ"),
    thankYou: pickLocale(locale, "Thank you!", "આભાર!"),
    thankYouBody: pickLocale(
      locale,
      "Your weekly followup has been submitted successfully.",
      "તમારો સાપ્તાહિક ફોલોઅપ સફળતાપૂર્વક સબમિટ થયો."
    ),
    loading: pickLocale(locale, "Loading...", "લોડ થઈ રહ્યું છે..."),
    loadError: pickLocale(locale, "Could not load followup", "ફોલોઅપ લોડ થઈ શક્યો નહીં"),
    submitError: pickLocale(locale, "Could not submit followup", "ફોલોઅપ સબમિટ થઈ શક્યો નહીં"),
    noFollowupDue: pickLocale(
      locale,
      "No followup is due right now.",
      "હાલમાં કોઈ ફોલોઅપ બાકી નથી."
    ),
    weekLabel: (week: number) => pickLocale(locale, `Week ${week}`, `સપ્તાહ ${week}`),
    feedbackTitle: pickLocale(locale, "Plan Feedback", "પ્લાન ફીડબેક"),
    feedbackPrompt: pickLocale(
      locale,
      "How did you feel about this week's plan?",
      "આ સપ્તાહના પ્લાન વિશે તમને કેવું લાગ્યું?"
    ),
    feedbackExcellent: pickLocale(locale, "Excellent", "ઉત્તમ"),
    feedbackModerate: pickLocale(locale, "Moderate", "મધ્યમ"),
    feedbackPoor: pickLocale(locale, "Poor", "ખરાબ"),
    feedbackExcellentNotes: pickLocale(
      locale,
      "What was excellent?",
      "શું ઉત્તમ લાગ્યું? (લખો)"
    ),
    feedbackPoorNotes: pickLocale(
      locale,
      "What felt bad?",
      "શું ખરાબ લાગ્યું?"
    ),
    feedbackBadNotes: pickLocale(
      locale,
      "What felt bad?",
      "શું ખરાબ લાગ્યું?"
    ),
    feedbackGoodNotes: pickLocale(
      locale,
      "What felt good?",
      "શું સારું લાગ્યું?"
    ),
  };
}

export function followupFeedbackLabel(locale: PatientLocale, value: string | null | undefined) {
  const normalized = normalizePlanFeedback(value);
  if (!normalized) return "—";
  if (locale === "en") {
    if (normalized === "excellent") return "Excellent";
    if (normalized === "moderate") return "Moderate";
    if (normalized === "poor") return "Poor";
    return value ?? "—";
  }
  if (normalized === "excellent") return "ઉત્તમ";
  if (normalized === "moderate") return "મધ્યમ";
  if (normalized === "poor") return "ખરાબ";
  return value ?? "—";
}
