import { getCompletedWeeks, getUnlockedWeek } from "@/lib/utils";

export type PlanFeedbackType = "excellent" | "moderate" | "poor";

export const PLAN_FEEDBACK_OPTIONS = [
  { value: "excellent" as const, label: "Excellent" },
  { value: "moderate" as const, label: "Moderate" },
  { value: "poor" as const, label: "Poor" },
] as const;

/** Legacy values saved before Excellent / Moderate / Poor labels */
export const LEGACY_PLAN_FEEDBACK = {
  liked: "excellent",
  average: "moderate",
  not_liked: "poor",
} as const;

export function normalizePlanFeedback(value: string | null | undefined): PlanFeedbackType | null {
  if (!value) return null;
  if (value === "excellent" || value === "moderate" || value === "poor") return value;
  const legacy = LEGACY_PLAN_FEEDBACK[value as keyof typeof LEGACY_PLAN_FEEDBACK];
  return legacy ?? null;
}

export type WeeklyFollowupPayload = {
  weekNumber: number;
  currentWeight: number;
  exerciseDays: number;
  lowWaterDays: number;
  shortSleepDays: number;
  missedSupplementDays: number;
  mealsDeviated: string;
  planFeedback: PlanFeedbackType;
  feedbackLikedNotes?: string | null;
  feedbackDislikedNotes?: string | null;
  feedbackBadNotes?: string | null;
  feedbackGoodNotes?: string | null;
  waist?: number | null;
  chest?: number | null;
  thigh?: number | null;
  hip?: number | null;
  arm?: number | null;
  neck?: number | null;
  consentAgreed: boolean;
};

export type WeeklyFollowupRecord = WeeklyFollowupPayload & {
  id: string;
  submittedAt: Date;
};

export const DAY_SCALE_OPTIONS = [
  { value: 0, label: "None" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
] as const;

export function getCompletedFollowupWeeks(
  startDate: Date,
  currentWeek: number,
  totalWeeks: number
) {
  const unlockedWeek = getUnlockedWeek(startDate, currentWeek, totalWeeks);
  const calendarCompleted = getCompletedWeeks(startDate, totalWeeks);
  return Math.max(unlockedWeek > 0 ? unlockedWeek - 1 : 0, calendarCompleted);
}

export function getDueFollowupWeeks(
  startDate: Date,
  currentWeek: number,
  totalWeeks: number,
  submittedWeekNumbers: number[]
) {
  const completedWeeks = getCompletedFollowupWeeks(startDate, currentWeek, totalWeeks);
  const submitted = new Set(submittedWeekNumbers);
  const pending: number[] = [];
  for (let week = 1; week <= completedWeeks; week++) {
    if (!submitted.has(week)) pending.push(week);
  }
  return pending;
}

export function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export type WeeklyFollowupUpdatePayload = {
  currentWeight: number;
  exerciseDays: number;
  lowWaterDays: number;
  shortSleepDays: number;
  missedSupplementDays: number;
  mealsDeviated: string;
  planFeedback?: PlanFeedbackType | null;
  feedbackLikedNotes?: string | null;
  feedbackDislikedNotes?: string | null;
  feedbackBadNotes?: string | null;
  feedbackGoodNotes?: string | null;
  waist?: number | null;
  chest?: number | null;
  thigh?: number | null;
  hip?: number | null;
  arm?: number | null;
  neck?: number | null;
};

function trimOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
}

function validateHabitsFields(body: Record<string, unknown>): {
  data?: Omit<
    WeeklyFollowupUpdatePayload,
    "planFeedback" | "feedbackLikedNotes" | "feedbackDislikedNotes" | "feedbackBadNotes" | "feedbackGoodNotes"
  >;
  error?: string;
} {
  const currentWeight = Number(body.currentWeight);
  const exerciseDays = Number(body.exerciseDays);
  const lowWaterDays = Number(body.lowWaterDays);
  const shortSleepDays = Number(body.shortSleepDays);
  const missedSupplementDays = Number(body.missedSupplementDays);

  if (!Number.isFinite(currentWeight) || currentWeight <= 0) {
    return { error: "Current weight is required" };
  }
  for (const [value, label] of [
    [exerciseDays, "Exercise days"],
    [lowWaterDays, "Water days"],
    [shortSleepDays, "Sleep days"],
    [missedSupplementDays, "Supplement days"],
  ] as const) {
    if (!Number.isInteger(value) || value < 0 || value > 7) {
      return { error: `${label} must be between 0 and 7` };
    }
  }

  const measurements = {
    waist: parseOptionalNumber(body.waist),
    chest: parseOptionalNumber(body.chest),
    thigh: parseOptionalNumber(body.thigh),
    hip: parseOptionalNumber(body.hip),
    arm: parseOptionalNumber(body.arm),
    neck: parseOptionalNumber(body.neck),
  };

  for (const [key, value] of Object.entries(measurements)) {
    if (value !== null && value <= 0) {
      return { error: `${key} must be a positive number` };
    }
  }

  const mealsRaw = body.mealsDeviated;
  if (mealsRaw === null || mealsRaw === undefined || mealsRaw === "") {
    return { error: "Meals deviated is required" };
  }
  const mealsNum = Number(mealsRaw);
  if (!Number.isInteger(mealsNum) || mealsNum < 0) {
    return { error: "Meals deviated must be 0 or more" };
  }
  const mealsDeviated = String(mealsNum);

  return {
    data: {
      currentWeight,
      exerciseDays,
      lowWaterDays,
      shortSleepDays,
      missedSupplementDays,
      mealsDeviated,
      ...measurements,
    },
  };
}

function validateFeedbackFields(
  body: Record<string, unknown>,
  required: boolean
): {
  data?: Pick<
    WeeklyFollowupUpdatePayload,
    | "planFeedback"
    | "feedbackLikedNotes"
    | "feedbackDislikedNotes"
    | "feedbackBadNotes"
    | "feedbackGoodNotes"
  >;
  error?: string;
} {
  const planFeedback = body.planFeedback;
  const hasFeedback =
    planFeedback === "excellent" || planFeedback === "moderate" || planFeedback === "poor";

  if (!hasFeedback) {
    if (required) {
      return { error: "Please select how you felt about this week's plan" };
    }
    return { data: {} };
  }

  const feedbackLikedNotes = trimOptionalText(body.feedbackLikedNotes);
  const feedbackDislikedNotes = trimOptionalText(body.feedbackDislikedNotes);
  const feedbackBadNotes = trimOptionalText(body.feedbackBadNotes);
  const feedbackGoodNotes = trimOptionalText(body.feedbackGoodNotes);

  if (planFeedback === "excellent" && !feedbackLikedNotes) {
    return { error: "Please describe what was excellent" };
  }
  if (planFeedback === "poor" && !feedbackDislikedNotes) {
    return { error: "Please describe what was poor" };
  }
  if (planFeedback === "moderate") {
    if (!feedbackBadNotes) {
      return { error: "Please describe what felt bad" };
    }
    if (!feedbackGoodNotes) {
      return { error: "Please describe what felt good" };
    }
  }

  return {
    data: {
      planFeedback,
      feedbackLikedNotes: planFeedback === "excellent" ? feedbackLikedNotes : null,
      feedbackDislikedNotes: planFeedback === "poor" ? feedbackDislikedNotes : null,
      feedbackBadNotes: planFeedback === "moderate" ? feedbackBadNotes : null,
      feedbackGoodNotes: planFeedback === "moderate" ? feedbackGoodNotes : null,
    },
  };
}

function mergeFollowupFields(
  habits: NonNullable<ReturnType<typeof validateHabitsFields>["data"]>,
  feedback: NonNullable<ReturnType<typeof validateFeedbackFields>["data"]>
): WeeklyFollowupUpdatePayload {
  return { ...habits, ...feedback };
}

export function validateFollowupUpdatePayload(body: Record<string, unknown>): {
  data?: WeeklyFollowupUpdatePayload;
  error?: string;
} {
  const habits = validateHabitsFields(body);
  if (!habits.data || habits.error) return { error: habits.error };

  const feedback = validateFeedbackFields(body, false);
  if (feedback.error) return { error: feedback.error };

  return { data: mergeFollowupFields(habits.data, feedback.data ?? {}) };
}

export function validateFollowupPayload(body: Record<string, unknown>): {
  data?: WeeklyFollowupPayload;
  error?: string;
} {
  const weekNumber = Number(body.weekNumber);

  if (!Number.isInteger(weekNumber) || weekNumber < 1) {
    return { error: "Invalid week number" };
  }

  const habits = validateHabitsFields(body);
  if (!habits.data || habits.error) return { error: habits.error };

  const feedback = validateFeedbackFields(body, true);
  if (!feedback.data || feedback.error) return { error: feedback.error };

  const merged = mergeFollowupFields(habits.data, feedback.data);
  if (!merged.planFeedback) {
    return { error: "Please select how you felt about this week's plan" };
  }

  return {
    data: {
      weekNumber,
      ...merged,
      planFeedback: merged.planFeedback,
      consentAgreed: true,
    },
  };
}

export function formatFollowupDelta(current: number | null, previous: number | null) {
  if (current === null || previous === null) return null;
  const delta = current - previous;
  if (delta === 0) return { delta: 0, direction: "same" as const };
  return {
    delta: Math.round(delta * 10) / 10,
    direction: delta > 0 ? ("up" as const) : ("down" as const),
  };
}
