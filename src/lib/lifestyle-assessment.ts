import {
  STRESS_QUESTION_KEYS,
  calculateStressScreeningScore,
  getStressLevelFromScore,
  validateStressAnswers,
} from "./stress-screening";

export const LIFESTYLE_SECTIONS = [
  {
    id: 1,
    title: "Physical Activity",
    fields: [
      {
        key: "exerciseFrequency",
        label: "Exercise Frequency",
        type: "radio" as const,
        options: ["Never", "1-2 Days/Week", "3-5 Days/Week", "Daily"],
      },
      {
        key: "exerciseDuration",
        label: "Exercise Duration",
        type: "radio" as const,
        options: ["<15 min", "15-30 min", "30-60 min", ">60 min"],
      },
      {
        key: "exerciseType",
        label: "Exercise Type",
        type: "checkbox" as const,
        options: ["Walking", "Yoga", "Gym", "Running", "Cycling", "Swimming", "Other"],
      },
    ],
  },
  {
    id: 2,
    title: "BMI & Weight",
    fields: [
      { key: "heightCm", label: "Height (cm)", type: "number" as const },
      { key: "weightKg", label: "Weight (kg)", type: "number" as const },
      { key: "bmi", label: "BMI", type: "computed" as const },
    ],
  },
  {
    id: 3,
    title: "Sleep",
    fields: [
      {
        key: "sleepHours",
        label: "Sleep Hours",
        type: "radio" as const,
        options: ["<5", "5-6", "6-7", "7-8", ">8"],
      },
      {
        key: "sleepQuality",
        label: "Sleep Quality",
        type: "radio" as const,
        options: ["Poor", "Fair", "Good", "Excellent"],
      },
      {
        key: "nightShift",
        label: "Night Shift",
        type: "radio" as const,
        options: ["Yes", "No"],
      },
    ],
  },
  {
    id: 4,
    title: "Stress Assessment (Last 2 Weeks)",
    type: "stress-screening" as const,
    fields: STRESS_QUESTION_KEYS.map((key, index) => ({
      key,
      label: `Question ${index + 1}`,
      type: "likert" as const,
    })),
  },
  {
    id: 5,
    title: "Diet",
    fields: [
      {
        key: "dietType",
        label: "Diet Type",
        type: "radio" as const,
        options: ["Vegetarian", "Eggetarian", "Vegan"],
      },
      {
        key: "breakfast",
        label: "Breakfast",
        type: "radio" as const,
        options: ["Daily", "Sometimes Skip", "Always Skip"],
      },
      {
        key: "fastFood",
        label: "Outside Food",
        type: "radio" as const,
        options: ["Never", "Weekly", "2-3 Times/Week", "Daily"],
      },
      {
        key: "waterIntake",
        label: "Water Intake (glasses)",
        type: "water-glasses" as const,
        options: ["< 5 glasses", "5-10 glasses", "10-15 glasses", "15-20 glasses", "> 20 glasses"],
      },
    ],
  },
  {
    id: 6,
    title: "Habits",
    fields: [
      {
        key: "teaCoffee",
        label: "Tea/Coffee",
        type: "radio" as const,
        options: ["None", "1 Cup", "2 Cups", "3+ Cups"],
      },
      {
        key: "coldDrinks",
        label: "Cold Drinks",
        type: "radio" as const,
        options: ["None", "Occasionally", "Weekly", "Daily"],
      },
      {
        key: "sugarItems",
        label: "Sugar Items (Ice Cream, etc.)",
        type: "radio" as const,
        options: ["None", "Occasionally", "Weekly", "Daily"],
      },
    ],
  },
  {
    id: 7,
    title: "Medical History",
    fields: [
      {
        key: "knownConditions",
        label: "Known Conditions",
        type: "checkbox" as const,
        options: ["PCOD", "Thyroid", "Diabetes", "Endometriosis", "Hypertension", "Fibroids", "None"],
      },
      {
        key: "irregularMenses",
        label: "Irregular Menses",
        type: "checkbox" as const,
        options: ["Heavy", "Painful", "None"],
      },
      {
        key: "supplements",
        label: "Supplements",
        type: "checkbox" as const,
        options: ["Folic Acid", "Vitamin D", "Iron", "Calcium", "Vit B12", "Other", "None"],
      },
    ],
  },
  {
    id: 8,
    title: "Family History",
    fields: [
      {
        key: "motherFamilyHistory",
        label: "Mother",
        type: "checkbox" as const,
        options: ["Diabetes", "Hypertension", "Thyroid", "None"],
      },
      {
        key: "fatherFamilyHistory",
        label: "Father",
        type: "checkbox" as const,
        options: ["Diabetes", "BP", "None"],
      },
    ],
  },
  {
    id: 9,
    title: "Partner Lifestyle",
    fields: [
      {
        key: "partnerSmoking",
        label: "Smoking",
        type: "radio" as const,
        options: ["Yes", "No"],
      },
      {
        key: "partnerAlcohol",
        label: "Alcohol",
        type: "radio" as const,
        options: ["Yes", "No"],
      },
      {
        key: "partnerExercise",
        label: "Exercise",
        type: "radio" as const,
        options: ["Regular", "Occasional", "None"],
      },
    ],
  },
] as const;

export type LifestyleAssessmentData = {
  exerciseFrequency: string;
  exerciseDuration: string;
  exerciseType: string[];
  heightCm: number;
  weightKg: number;
  bmi: number;
  sleepHours: string;
  sleepQuality: string;
  nightShift: string;
  stressQ1: number;
  stressQ2: number;
  stressQ3: number;
  stressQ4: number;
  stressQ5: number;
  stressScreeningScore: number;
  stressLevel: string;
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

export type LifestyleHighlight = {
  field: string;
  label: string;
  reason: string;
  severity: "high" | "medium";
};

const CHECKBOX_FIELDS = new Set([
  "exerciseType",
  "knownConditions",
  "irregularMenses",
  "supplements",
  "motherFamilyHistory",
  "fatherFamilyHistory",
]);

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function stringifyJsonArray(values: string[]): string {
  return JSON.stringify(values);
}

export function calculateBmi(heightCm: number, weightKg: number) {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function calculateLifestyleScore(data: LifestyleAssessmentData) {
  let score = 100;
  if (data.exerciseFrequency === "Never") score -= 10;
  if (data.sleepHours === "<5" || data.sleepHours === "5-6") score -= 10;
  if (data.sleepQuality === "Poor" || data.sleepQuality === "Fair") score -= 8;
  if (data.stressLevel === "Moderate Stress") score -= 8;
  if (data.stressLevel === "High Stress") score -= 15;
  if (data.stressLevel === "Mild Stress") score -= 4;
  if (data.fastFood === "Daily" || data.fastFood === "2-3 Times/Week") score -= 8;
  if (data.waterIntake === "< 5 glasses") score -= 8;
  if (data.coldDrinks === "Weekly" || data.coldDrinks === "Daily") score -= 8;
  if (data.sugarItems === "Weekly" || data.sugarItems === "Daily") score -= 8;
  if (data.bmi < 18.5 || data.bmi > 25) score -= 8;
  if (data.partnerSmoking === "Yes") score -= 5;
  if (data.partnerAlcohol === "Yes") score -= 5;
  const mensesIssues = data.irregularMenses.filter((v) => v !== "None");
  if (mensesIssues.length > 0) score -= 5;
  const conditions = data.knownConditions.filter((c) => c !== "None");
  score -= Math.min(conditions.length * 5, 15);
  return Math.max(0, Math.min(100, score));
}

export function getLifestyleHighlights(data: Partial<LifestyleAssessmentData>): LifestyleHighlight[] {
  const highlights: LifestyleHighlight[] = [];

  const add = (field: string, label: string, reason: string, severity: "high" | "medium" = "high") => {
    highlights.push({ field, label, reason, severity });
  };

  if (data.exerciseFrequency === "Never") add("exerciseFrequency", "Exercise Frequency", "No exercise — plan should include activity", "high");
  if (data.bmi !== undefined && (data.bmi < 18.5 || data.bmi > 30))
    add("bmi", "BMI", data.bmi > 30 ? "Obesity range — weight management needed" : "Underweight — nutrition focus needed", "high");
  else if (data.bmi !== undefined && (data.bmi < 18.5 || data.bmi > 25))
    add("bmi", "BMI", "BMI outside ideal range", "medium");

  if (data.sleepHours === "<5" || data.sleepHours === "5-6")
    add("sleepHours", "Sleep Hours", "Insufficient sleep", "high");
  if (data.sleepQuality === "Poor" || data.sleepQuality === "Fair")
    add("sleepQuality", "Sleep Quality", "Poor sleep quality", "high");
  if (data.nightShift === "Yes") add("nightShift", "Night Shift", "Night shift affects hormones", "medium");

  if (data.stressLevel === "High Stress")
    add("stressLevel", "Stress Level", `High stress (score ${data.stressScreeningScore}/20)`, "high");
  if (data.stressLevel === "Moderate Stress")
    add("stressLevel", "Stress Level", `Moderate stress (score ${data.stressScreeningScore}/20)`, "medium");
  if (data.stressLevel === "Mild Stress")
    add("stressLevel", "Stress Level", `Mild stress (score ${data.stressScreeningScore}/20)`, "medium");

  if (data.breakfast === "Always Skip") add("breakfast", "Breakfast", "Always skips breakfast", "medium");
  if (data.fastFood === "Daily") add("fastFood", "Outside Food", "Daily outside food intake", "high");
  if (data.waterIntake === "< 5 glasses") add("waterIntake", "Water Intake", "Very low water intake", "high");

  if (data.coldDrinks === "Daily") add("coldDrinks", "Cold Drinks", "Daily cold drink intake", "high");
  else if (data.coldDrinks === "Weekly") add("coldDrinks", "Cold Drinks", "Regular cold drink intake", "medium");
  else if (data.coldDrinks === "Occasionally") add("coldDrinks", "Cold Drinks", "Occasional cold drink intake", "medium");
  if (data.sugarItems === "Daily") add("sugarItems", "Sugar Items", "Daily sugar item intake", "high");
  else if (data.sugarItems === "Weekly") add("sugarItems", "Sugar Items", "Regular sugar item intake", "medium");
  else if (data.sugarItems === "Occasionally") add("sugarItems", "Sugar Items", "Occasional sugar item intake", "medium");
  if (data.teaCoffee === "3+ Cups") add("teaCoffee", "Tea/Coffee", "High caffeine intake (3+ cups)", "medium");

  const conditions = (data.knownConditions ?? []).filter((c) => c !== "None");
  if (conditions.length > 0)
    add("knownConditions", "Known Conditions", conditions.join(", "), "high");
  const mensesIssues = (data.irregularMenses ?? []).filter((v) => v !== "None");
  if (mensesIssues.length > 0)
    add("irregularMenses", "Irregular Menses", mensesIssues.join(", "), "high");

  const motherHistory = (data.motherFamilyHistory ?? []).filter((v) => v !== "None");
  if (motherHistory.length > 0)
    add("motherFamilyHistory", "Mother Family History", motherHistory.join(", "), "medium");
  const fatherHistory = (data.fatherFamilyHistory ?? []).filter((v) => v !== "None");
  if (fatherHistory.length > 0)
    add("fatherFamilyHistory", "Father Family History", fatherHistory.join(", "), "medium");

  if (data.partnerSmoking === "Yes") add("partnerSmoking", "Partner Smoking", "Partner smokes", "high");
  if (data.partnerAlcohol === "Yes") add("partnerAlcohol", "Partner Alcohol", "Partner drinks alcohol", "medium");
  if (data.partnerExercise === "None") add("partnerExercise", "Partner Exercise", "Partner no exercise", "medium");

  return highlights;
}

export type LifestyleAnalyticsSummary = {
  riskLevel: "low" | "medium" | "high";
  highSeverityCount: number;
  mediumSeverityCount: number;
  lifestyleScore: number | null;
  stressScore: number | null;
  stressLevel: string | null;
  bmi: number | null;
  metrics: { label: string; value: string; section: string; flagged: boolean }[];
};

export function getLifestyleAnalyticsSummary(
  data: LifestyleAssessmentData | null,
  highlights: LifestyleHighlight[],
  lifestyleScore: number | null
): LifestyleAnalyticsSummary | null {
  if (!data) return null;

  const highSeverityCount = highlights.filter((h) => h.severity === "high").length;
  const mediumSeverityCount = highlights.filter((h) => h.severity === "medium").length;

  let riskLevel: "low" | "medium" | "high" = "low";
  if (highSeverityCount >= 2 || (lifestyleScore != null && lifestyleScore < 55)) {
    riskLevel = "high";
  } else if (
    highSeverityCount >= 1 ||
    mediumSeverityCount >= 3 ||
    (lifestyleScore != null && lifestyleScore < 70)
  ) {
    riskLevel = "medium";
  }

  const flagged = (field: string) => highlights.some((h) => h.field === field);

  const metrics = [
    {
      label: "Lifestyle Score",
      value: lifestyleScore != null ? `${lifestyleScore}/100` : "—",
      section: "Overall",
      flagged: lifestyleScore != null && lifestyleScore < 70,
    },
    {
      label: "BMI",
      value: data.bmi ? String(data.bmi) : "—",
      section: "BMI & Weight",
      flagged: flagged("bmi"),
    },
    {
      label: "Stress",
      value: data.stressLevel
        ? `${data.stressScreeningScore}/20 · ${data.stressLevel}`
        : "—",
      section: "Stress",
      flagged: flagged("stressLevel"),
    },
    {
      label: "Exercise",
      value: data.exerciseFrequency || "—",
      section: "Physical Activity",
      flagged: flagged("exerciseFrequency"),
    },
    {
      label: "Sleep",
      value: [data.sleepHours, data.sleepQuality].filter(Boolean).join(" · ") || "—",
      section: "Sleep",
      flagged: flagged("sleepHours") || flagged("sleepQuality"),
    },
    {
      label: "Diet",
      value: [data.dietType, data.fastFood, data.waterIntake].filter(Boolean).join(" · ") || "—",
      section: "Diet",
      flagged: flagged("fastFood") || flagged("waterIntake") || flagged("breakfast"),
    },
    {
      label: "Habits",
      value: [data.teaCoffee, data.coldDrinks, data.sugarItems].filter(Boolean).join(" · ") || "—",
      section: "Habits",
      flagged: flagged("teaCoffee") || flagged("coldDrinks") || flagged("sugarItems"),
    },
    {
      label: "Medical History",
      value:
        [
          ...(data.knownConditions ?? []).filter((c) => c !== "None"),
          ...(data.irregularMenses ?? []).filter((v) => v !== "None"),
        ].join(", ") || "—",
      section: "Medical History",
      flagged: flagged("knownConditions") || flagged("irregularMenses"),
    },
    {
      label: "Family History",
      value:
        [
          ...(data.motherFamilyHistory ?? []).filter((v) => v !== "None").map((v) => `Mother: ${v}`),
          ...(data.fatherFamilyHistory ?? []).filter((v) => v !== "None").map((v) => `Father: ${v}`),
        ].join(", ") || "—",
      section: "Family History",
      flagged: flagged("motherFamilyHistory") || flagged("fatherFamilyHistory"),
    },
    {
      label: "Partner",
      value: [data.partnerSmoking, data.partnerAlcohol, data.partnerExercise]
        .filter((v) => v && v !== "No" && v !== "Regular")
        .join(" · ") || "—",
      section: "Partner Lifestyle",
      flagged:
        flagged("partnerSmoking") || flagged("partnerAlcohol") || flagged("partnerExercise"),
    },
  ];

  return {
    riskLevel,
    highSeverityCount,
    mediumSeverityCount,
    lifestyleScore,
    stressScore: data.stressScreeningScore ?? null,
    stressLevel: data.stressLevel || null,
    bmi: data.bmi ?? null,
    metrics,
  };
}

function requireRadio(body: Record<string, unknown>, key: string, options: readonly string[]) {
  const value = body[key];
  if (typeof value !== "string" || !options.includes(value)) {
    return { error: `${key} is required` };
  }
  return { value };
}

function requireCheckbox(body: Record<string, unknown>, key: string, options: readonly string[]) {
  const raw = body[key];
  const values = Array.isArray(raw) ? raw.filter((v) => typeof v === "string") : [];
  if (values.length === 0) return { error: `${key} is required` };
  if (!values.every((v) => options.includes(v))) return { error: `Invalid ${key} selection` };
  if (key === "knownConditions" && values.includes("None") && values.length > 1) {
    return { error: "Select None OR other conditions, not both" };
  }
  if (key === "irregularMenses" && values.includes("None") && values.length > 1) {
    return { error: "Select None OR Heavy/Painful, not both" };
  }
  if (key === "motherFamilyHistory" && values.includes("None") && values.length > 1) {
    return { error: "Select None OR other mother history options, not both" };
  }
  if (key === "fatherFamilyHistory" && values.includes("None") && values.length > 1) {
    return { error: "Select None OR other father history options, not both" };
  }
  if (key === "supplements" && values.includes("None") && values.length > 1) {
    return { error: "Select None OR other supplements, not both" };
  }
  return { value: values };
}

export function validateLifestyleAssessment(body: Record<string, unknown>): {
  data?: LifestyleAssessmentData;
  error?: string;
} {
  const result: Record<string, unknown> = {};

  for (const section of LIFESTYLE_SECTIONS) {
    if (section.id === 4) continue;
    for (const field of section.fields) {
      if (field.type === "computed") continue;
      if (field.type === "number") {
        const num = Number(body[field.key]);
        if (!Number.isFinite(num) || num <= 0) {
          return { error: `${field.label} is required` };
        }
        result[field.key] = num;
        continue;
      }
      if (field.type === "radio") {
        const r = requireRadio(body, field.key, field.options);
        if (r.error) return { error: r.error };
        result[field.key] = r.value;
        continue;
      }
      if (field.type === "water-glasses") {
        const r = requireRadio(body, field.key, field.options);
        if (r.error) return { error: r.error };
        result[field.key] = r.value;
        continue;
      }
      if (field.type === "checkbox") {
        const r = requireCheckbox(body, field.key, field.options);
        if (r.error) return { error: r.error };
        result[field.key] = r.value;
      }
    }
  }

  const heightCm = result.heightCm as number;
  const weightKg = result.weightKg as number;
  const bmi = calculateBmi(heightCm, weightKg);

  const { answers: stressAnswers, error: stressError } = validateStressAnswers(body);
  if (!stressAnswers || stressError) return { error: stressError };

  const stressScreeningScore = calculateStressScreeningScore(stressAnswers);
  const stressLevel = getStressLevelFromScore(stressScreeningScore);

  const data: LifestyleAssessmentData = {
    exerciseFrequency: result.exerciseFrequency as string,
    exerciseDuration: result.exerciseDuration as string,
    exerciseType: result.exerciseType as string[],
    heightCm,
    weightKg,
    bmi,
    sleepHours: result.sleepHours as string,
    sleepQuality: result.sleepQuality as string,
    nightShift: result.nightShift as string,
    ...stressAnswers,
    stressScreeningScore,
    stressLevel,
    dietType: result.dietType as string,
    breakfast: result.breakfast as string,
    fastFood: result.fastFood as string,
    waterIntake: result.waterIntake as string,
    teaCoffee: result.teaCoffee as string,
    coldDrinks: result.coldDrinks as string,
    sugarItems: result.sugarItems as string,
    knownConditions: result.knownConditions as string[],
    irregularMenses: result.irregularMenses as string[],
    supplements: result.supplements as string[],
    motherFamilyHistory: result.motherFamilyHistory as string[],
    fatherFamilyHistory: result.fatherFamilyHistory as string[],
    partnerSmoking: result.partnerSmoking as string,
    partnerAlcohol: result.partnerAlcohol as string,
    partnerExercise: result.partnerExercise as string,
  };

  return { data };
}

export function assessmentToDisplayData(record: {
  exerciseFrequency: string | null;
  exerciseDuration: string | null;
  exerciseType: string | null;
  heightCm: number | null;
  weightKg: number | null;
  bmi: number | null;
  sleepHours: string | null;
  sleepQuality: string | null;
  nightShift: string | null;
  stressQ1: number | null;
  stressQ2: number | null;
  stressQ3: number | null;
  stressQ4: number | null;
  stressQ5: number | null;
  stressScreeningScore: number | null;
  stressLevel: string | null;
  dietType: string | null;
  breakfast: string | null;
  fastFood: string | null;
  waterIntake: string | null;
  teaCoffee: string | null;
  coldDrinks: string | null;
  sugarItems: string | null;
  knownConditions: string | null;
  irregularMenses: string | null;
  supplements: string | null;
  motherFamilyHistory: string | null;
  fatherFamilyHistory: string | null;
  partnerSmoking: string | null;
  partnerAlcohol: string | null;
  partnerExercise: string | null;
}): LifestyleAssessmentData | null {
  if (!record.exerciseFrequency || !record.heightCm || !record.weightKg) return null;
  if (record.stressQ1 == null) return null;

  return {
    exerciseFrequency: record.exerciseFrequency,
    exerciseDuration: record.exerciseDuration ?? "",
    exerciseType: parseJsonArray(record.exerciseType),
    heightCm: record.heightCm,
    weightKg: record.weightKg,
    bmi: record.bmi ?? calculateBmi(record.heightCm, record.weightKg),
    sleepHours: record.sleepHours ?? "",
    sleepQuality: record.sleepQuality ?? "",
    nightShift: record.nightShift ?? "",
    stressQ1: record.stressQ1 ?? 0,
    stressQ2: record.stressQ2 ?? 0,
    stressQ3: record.stressQ3 ?? 0,
    stressQ4: record.stressQ4 ?? 0,
    stressQ5: record.stressQ5 ?? 0,
    stressScreeningScore:
      record.stressScreeningScore ??
      calculateStressScreeningScore({
        stressQ1: record.stressQ1 ?? undefined,
        stressQ2: record.stressQ2 ?? undefined,
        stressQ3: record.stressQ3 ?? undefined,
        stressQ4: record.stressQ4 ?? undefined,
        stressQ5: record.stressQ5 ?? undefined,
      }),
    stressLevel:
      record.stressLevel ??
      getStressLevelFromScore(
        record.stressScreeningScore ??
          calculateStressScreeningScore({
            stressQ1: record.stressQ1 ?? undefined,
            stressQ2: record.stressQ2 ?? undefined,
            stressQ3: record.stressQ3 ?? undefined,
            stressQ4: record.stressQ4 ?? undefined,
            stressQ5: record.stressQ5 ?? undefined,
          })
      ),
    dietType: record.dietType ?? "",
    breakfast: record.breakfast ?? "",
    fastFood: record.fastFood ?? "",
    waterIntake: record.waterIntake ?? "",
    teaCoffee: record.teaCoffee ?? "",
    coldDrinks: record.coldDrinks ?? "",
    sugarItems: record.sugarItems ?? "",
    knownConditions: parseJsonArray(record.knownConditions),
    irregularMenses: parseJsonArray(record.irregularMenses),
    supplements: parseJsonArray(record.supplements),
    motherFamilyHistory: parseJsonArray(record.motherFamilyHistory),
    fatherFamilyHistory: parseJsonArray(record.fatherFamilyHistory),
    partnerSmoking: record.partnerSmoking ?? "",
    partnerAlcohol: record.partnerAlcohol ?? "",
    partnerExercise: record.partnerExercise ?? "",
  };
}

export function dataToDbFields(data: LifestyleAssessmentData) {
  return {
    exerciseFrequency: data.exerciseFrequency,
    exerciseDuration: data.exerciseDuration,
    exerciseType: stringifyJsonArray(data.exerciseType),
    heightCm: data.heightCm,
    weightKg: data.weightKg,
    bmi: data.bmi,
    sleepHours: data.sleepHours,
    sleepQuality: data.sleepQuality,
    nightShift: data.nightShift,
    stressQ1: data.stressQ1,
    stressQ2: data.stressQ2,
    stressQ3: data.stressQ3,
    stressQ4: data.stressQ4,
    stressQ5: data.stressQ5,
    stressScreeningScore: data.stressScreeningScore,
    stressLevel: data.stressLevel,
    dietType: data.dietType,
    breakfast: data.breakfast,
    fastFood: data.fastFood,
    waterIntake: data.waterIntake,
    teaCoffee: data.teaCoffee,
    coldDrinks: data.coldDrinks,
    sugarItems: data.sugarItems,
    knownConditions: stringifyJsonArray(data.knownConditions),
    irregularMenses: stringifyJsonArray(data.irregularMenses),
    supplements: stringifyJsonArray(data.supplements),
    motherFamilyHistory: stringifyJsonArray(data.motherFamilyHistory),
    fatherFamilyHistory: stringifyJsonArray(data.fatherFamilyHistory),
    partnerSmoking: data.partnerSmoking,
    partnerAlcohol: data.partnerAlcohol,
    partnerExercise: data.partnerExercise,
    lifestyleScore: calculateLifestyleScore(data),
  };
}

export { CHECKBOX_FIELDS };
