"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";
import { LocaleToggle } from "@/components/LocaleToggle";
import { LIFESTYLE_SECTIONS, calculateBmi } from "@/lib/lifestyle-assessment";
import {
  lifestyleFieldLabel,
  lifestyleFormUi,
  lifestyleOptionLabel,
  lifestyleSectionTitle,
} from "@/lib/lifestyle-assessment-i18n";
import type { PatientLocale } from "@/lib/patient-locale";
import {
  LIKERT_OPTIONS,
  STRESS_QUESTIONS,
  STRESS_QUESTION_KEYS,
  interpretStressScreening,
  stressLevelLabel,
  stressSectionSubtitle,
  stressSectionTitle,
  type StressQuestionKey,
} from "@/lib/stress-screening";
import { cn } from "@/lib/utils";

type LifestyleAssessmentFormProps = {
  patientName: string;
  accessToken?: string;
  onSubmitted?: () => void;
  locale?: PatientLocale;
  onLocaleChange?: (locale: PatientLocale) => void;
};

function GlassIcon({ className, filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 20 28" className={className} aria-hidden="true">
      <path
        d="M5 1h10l-1.5 24a3.5 3.5 0 0 1-7 0L5 1z"
        fill={filled ? "#bae6fd" : "#f8fafc"}
        stroke="#0ea5e9"
        strokeWidth="1.2"
      />
      {filled && (
        <path d="M6.5 9h7" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
      )}
    </svg>
  );
}

function glassesForOption(option: string) {
  if (option.startsWith("< 5")) return 3;
  if (option.startsWith("5-10")) return 5;
  if (option.startsWith("10-15")) return 8;
  if (option.startsWith("15-20")) return 10;
  return 12;
}

function WaterIntakeRow({
  locale,
  label,
  name,
  options,
  value,
  onChange,
  glassNote,
}: {
  locale: PatientLocale;
  label: string;
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  glassNote: string;
}) {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-3 py-3 align-top">
        <div className="flex items-start gap-2">
          <GlassIcon className="mt-0.5 h-7 w-5 shrink-0" filled />
          <span className="text-sm font-medium text-slate-700">
            {lifestyleFieldLabel(locale, label)}
          </span>
        </div>
        <p className="mt-1 pl-7 text-xs text-slate-500">{glassNote}</p>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const count = glassesForOption(option);
            return (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs transition",
                  value === option
                    ? "border-sky-500 bg-sky-50 text-sky-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={option}
                  checked={value === option}
                  onChange={() => onChange(option)}
                  className="sr-only"
                  required
                />
                <div className="flex items-end gap-0.5">
                  {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
                    <GlassIcon
                      key={i}
                      className="h-5 w-3.5"
                      filled={value === option}
                    />
                  ))}
                  {count > 6 && (
                    <span className="mb-0.5 text-[10px] font-semibold text-sky-600">+</span>
                  )}
                </div>
                <span className="text-center font-medium">
                  {lifestyleOptionLabel(locale, option)}
                </span>
              </label>
            );
          })}
        </div>
      </td>
    </tr>
  );
}

function RadioRow({
  locale,
  label,
  name,
  options,
  value,
  onChange,
}: {
  locale: PatientLocale;
  label: string;
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-3 py-3 text-sm font-medium text-slate-700 align-top w-1/3">
        {lifestyleFieldLabel(locale, label)}
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <label
              key={option}
              className={cn(
                "cursor-pointer rounded border px-2.5 py-1.5 text-xs transition",
                value === option
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-pink-200"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="sr-only"
                required
              />
              {lifestyleOptionLabel(locale, option)}
            </label>
          ))}
        </div>
      </td>
    </tr>
  );
}

function CheckboxRow({
  locale,
  label,
  options,
  values,
  onChange,
}: {
  locale: PatientLocale;
  label: string;
  options: readonly string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(option: string) {
    if (option === "None") {
      onChange(values.includes("None") ? [] : ["None"]);
      return;
    }
    const withoutNone = values.filter((v) => v !== "None");
    if (withoutNone.includes(option)) {
      onChange(withoutNone.filter((v) => v !== option));
    } else {
      onChange([...withoutNone, option]);
    }
  }

  return (
    <tr className="border-b border-slate-100">
      <td className="px-3 py-3 text-sm font-medium text-slate-700 align-top w-1/3">
        {lifestyleFieldLabel(locale, label)}
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <label
              key={option}
              className={cn(
                "cursor-pointer rounded border px-2.5 py-1.5 text-xs transition",
                values.includes(option)
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-pink-200"
              )}
            >
              <input
                type="checkbox"
                checked={values.includes(option)}
                onChange={() => toggle(option)}
                className="sr-only"
              />
              {lifestyleOptionLabel(locale, option)}
            </label>
          ))}
        </div>
      </td>
    </tr>
  );
}

function StressScreeningSection({
  locale,
  values,
  onChange,
}: {
  locale: PatientLocale;
  values: Record<StressQuestionKey, string>;
  onChange: (key: StressQuestionKey, value: string) => void;
}) {
  const numericAnswers = useMemo(() => {
    const answers: Partial<Record<StressQuestionKey, number>> = {};
    for (const key of STRESS_QUESTION_KEYS) {
      const raw = values[key];
      if (raw === "") continue;
      const num = Number(raw);
      if (Number.isInteger(num) && num >= 0 && num <= 4) answers[key] = num;
    }
    return answers;
  }, [values]);

  const result = interpretStressScreening(numericAnswers);

  return (
    <Card className="overflow-hidden !p-0">
      <div className="border-b border-blue-100 bg-blue-50 px-4 py-3">
        <h2 className="font-semibold text-blue-900">4. {stressSectionTitle(locale)}</h2>
        <p className="mt-1 text-sm text-blue-800/80">{stressSectionSubtitle(locale)}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <th className="px-3 py-2 w-[40%]">
                {locale === "gu" ? "પ્રશ્ન" : "Question"}
              </th>
              {LIKERT_OPTIONS.map((option) => (
                <th key={option.value} className="px-2 py-2 text-center">
                  <div>{option[locale]}</div>
                  <div className="font-normal normal-case text-slate-400">({option.value})</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STRESS_QUESTION_KEYS.map((key, index) => (
              <tr key={key} className="border-b border-slate-100">
                <td className="px-3 py-3 text-sm font-medium text-slate-700 align-top">
                  {index + 1}. {STRESS_QUESTIONS[key][locale]}
                </td>
                {LIKERT_OPTIONS.map((option) => (
                  <td key={option.value} className="px-2 py-3 text-center align-middle">
                    <label className="inline-flex cursor-pointer items-center justify-center">
                      <input
                        type="radio"
                        name={key}
                        value={option.value}
                        checked={values[key] === String(option.value)}
                        onChange={() => onChange(key, String(option.value))}
                        className="h-4 w-4 accent-pink-600"
                        required
                      />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result && (
        <div
          className={cn(
            "border-t px-4 py-4",
            result.level === "High Stress" && "border-red-200 bg-red-50",
            result.level === "Moderate Stress" && "border-amber-200 bg-amber-50",
            result.level === "Mild Stress" && "border-yellow-200 bg-yellow-50",
            result.level === "Low Stress" && "border-green-200 bg-green-50"
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-slate-900">
              {locale === "gu" ? "તમારો તણાવ સ્કોર:" : "Your Stress Score:"}{" "}
              <span className="text-lg">{result.score}/20</span>
            </p>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-sm font-semibold",
                result.level === "High Stress" && "bg-red-200 text-red-900",
                result.level === "Moderate Stress" && "bg-amber-200 text-amber-900",
                result.level === "Mild Stress" && "bg-yellow-200 text-yellow-900",
                result.level === "Low Stress" && "bg-green-200 text-green-900"
              )}
            >
              {stressLevelLabel(locale, result.level)}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-700">{result.recommendation[locale]}</p>
        </div>
      )}
    </Card>
  );
}

const initialForm = (): Record<string, string | string[]> => ({
  exerciseFrequency: "",
  exerciseDuration: "",
  exerciseType: [],
  heightCm: "",
  weightKg: "",
  sleepHours: "",
  sleepQuality: "",
  nightShift: "",
  stressQ1: "",
  stressQ2: "",
  stressQ3: "",
  stressQ4: "",
  stressQ5: "",
  dietType: "",
  breakfast: "",
  fastFood: "",
  waterIntake: "",
  teaCoffee: "",
  coldDrinks: "",
  sugarItems: "",
  knownConditions: [],
  irregularMenses: [],
  supplements: [],
  motherFamilyHistory: [],
  fatherFamilyHistory: [],
  partnerSmoking: "",
  partnerAlcohol: "",
  partnerExercise: "",
});

export function LifestyleAssessmentForm({
  patientName,
  accessToken,
  onSubmitted,
  locale: localeProp,
  onLocaleChange,
}: LifestyleAssessmentFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [internalLocale, setInternalLocale] = useState<PatientLocale>("gu");
  const locale = localeProp ?? internalLocale;
  const setLocale = onLocaleChange ?? setInternalLocale;
  const ui = lifestyleFormUi(locale);

  const bmi = useMemo(() => {
    const h = Number(form.heightCm);
    const w = Number(form.weightKg);
    if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) return null;
    return calculateBmi(h, w);
  }, [form.heightCm, form.weightKg]);

  function setField(key: string, value: string | string[]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(
      accessToken ? `/api/assessment/${accessToken}` : "/api/patient/lifestyle-assessment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || ui.submitError);
      return;
    }

    onSubmitted?.();
    if (!accessToken) {
      router.push("/patient");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{ui.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{ui.subtitle}</p>
          </div>
          {!localeProp && <LocaleToggle locale={locale} onChange={setLocale} />}
        </div>
        <div className="mt-4">
          <Input label={ui.patientName} value={patientName} readOnly className="bg-slate-50" />
        </div>
      </Card>

      {LIFESTYLE_SECTIONS.map((section) => {
        if ("type" in section && section.type === "stress-screening") {
          return (
            <StressScreeningSection
              key={section.id}
              locale={locale}
              values={{
                stressQ1: form.stressQ1 as string,
                stressQ2: form.stressQ2 as string,
                stressQ3: form.stressQ3 as string,
                stressQ4: form.stressQ4 as string,
                stressQ5: form.stressQ5 as string,
              }}
              onChange={(key, value) => setField(key, value)}
            />
          );
        }

        return (
          <Card key={section.id} className="overflow-hidden !p-0">
            <div className="border-b border-blue-100 bg-blue-50 px-4 py-3">
              <h2 className="font-semibold text-blue-900">
                {section.id}. {lifestyleSectionTitle(locale, section.title)}
              </h2>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <th className="px-3 py-2">{ui.question}</th>
                  <th className="px-3 py-2">{ui.options}</th>
                </tr>
              </thead>
              <tbody>
                {section.fields.map((field) => {
                  if (field.type === "computed") {
                    return (
                      <tr key={field.key} className="border-b border-slate-100">
                        <td className="px-3 py-3 text-sm font-medium text-slate-700">
                          {lifestyleFieldLabel(locale, field.label)}
                        </td>
                        <td className="px-3 py-3 text-sm font-semibold text-pink-700">
                          {bmi ?? ui.bmiAuto}
                        </td>
                      </tr>
                    );
                  }
                  if (field.type === "number") {
                    return (
                      <tr key={field.key} className="border-b border-slate-100">
                        <td className="px-3 py-3 text-sm font-medium text-slate-700">
                          {lifestyleFieldLabel(locale, field.label)}
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            required
                            value={form[field.key] as string}
                            onChange={(e) => setField(field.key, e.target.value)}
                            className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
                          />
                        </td>
                      </tr>
                    );
                  }
                  if (field.type === "checkbox") {
                    return (
                      <CheckboxRow
                        key={field.key}
                        locale={locale}
                        label={field.label}
                        options={field.options}
                        values={(form[field.key] as string[]) ?? []}
                        onChange={(v) => setField(field.key, v)}
                      />
                    );
                  }
                  if (field.type === "radio") {
                    return (
                      <RadioRow
                        key={field.key}
                        locale={locale}
                        label={field.label}
                        name={field.key}
                        options={field.options}
                        value={form[field.key] as string}
                        onChange={(v) => setField(field.key, v)}
                      />
                    );
                  }
                  if (field.type === "water-glasses") {
                    return (
                      <WaterIntakeRow
                        key={field.key}
                        locale={locale}
                        label={field.label}
                        name={field.key}
                        options={field.options}
                        value={form[field.key] as string}
                        onChange={(v) => setField(field.key, v)}
                        glassNote={ui.glassNote}
                      />
                    );
                  }
                  return null;
                })}
              </tbody>
            </table>
          </Card>
        );
      })}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-center pb-8">
        <Button type="submit" disabled={loading} className="min-w-48 px-8 py-3 text-base uppercase">
          {loading ? ui.submitting : ui.submit}
        </Button>
      </div>
    </form>
  );
}
