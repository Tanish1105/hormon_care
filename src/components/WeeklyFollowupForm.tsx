"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { LocaleToggle } from "@/components/LocaleToggle";
import type { PatientLocale } from "@/lib/patient-locale";
import { DAY_SCALE_OPTIONS, type PlanFeedbackType } from "@/lib/weekly-followup";
import { followupDayLabel, followupUi } from "@/lib/weekly-followup-i18n";
import { cn } from "@/lib/utils";
import { ClipboardList, MessageSquare } from "lucide-react";

type WeeklyFollowupFormProps = {
  weekNumber: number;
  patientName: string;
  accessToken?: string;
  compact?: boolean;
  hideSubmit?: boolean;
  formId?: string;
  onSubmitted?: () => void;
  onSubmittingChange?: (loading: boolean) => void;
  locale?: PatientLocale;
  onLocaleChange?: (locale: PatientLocale) => void;
};

const FEEDBACK_STYLES = {
  excellent: {
    active: "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200",
    idle: "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50",
  },
  moderate: {
    active: "border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-200",
    idle: "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/50",
  },
  poor: {
    active: "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-200",
    idle: "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50/50",
  },
} as const;

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <span>
      {children} <span className="text-red-500">*</span>
    </span>
  );
}

function FormSection({
  compact,
  icon: Icon,
  title,
  children,
  className,
}: {
  compact?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (compact) {
    return (
      <section className={cn("space-y-4 border-b border-slate-100 pb-6 last:border-0 last:pb-0", className)}>
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>
        {children}
      </section>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-6">{children}</div>
    </Card>
  );
}

function DayScaleField({
  compact,
  locale,
  label,
  name,
  value,
  onChange,
  required,
}: {
  compact?: boolean;
  locale: PatientLocale;
  label: string;
  name: string;
  value: number | "";
  onChange: (value: number) => void;
  required?: boolean;
}) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-sm font-medium leading-snug text-slate-700">
        {required ? <RequiredLabel>{label}</RequiredLabel> : label}
      </legend>
      <div
        className={cn(
          "grid gap-1.5",
          compact ? "grid-cols-4 sm:grid-cols-8" : "flex flex-wrap gap-2"
        )}
      >
        {DAY_SCALE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-lg border text-center font-medium transition",
              compact ? "px-1 py-2 text-xs" : "px-3 py-2 text-sm",
              value === option.value
                ? "border-pink-500 bg-pink-50 text-pink-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-pink-200"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
              required={required}
            />
            {followupDayLabel(locale, option.label)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FeedbackOptions({
  compact,
  value,
  onChange,
  ui,
}: {
  compact?: boolean;
  value: PlanFeedbackType | "";
  onChange: (v: PlanFeedbackType) => void;
  ui: ReturnType<typeof followupUi>;
}) {
  const options = [
    { value: "excellent" as const, label: ui.feedbackExcellent },
    { value: "moderate" as const, label: ui.feedbackModerate },
    { value: "poor" as const, label: ui.feedbackPoor },
  ];

  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-3" : "flex flex-wrap")}>
      {options.map((option) => {
        const styles = FEEDBACK_STYLES[option.value];
        const selected = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-xl border px-2 py-3 text-center text-sm font-semibold transition",
              compact && "min-h-[3rem]",
              selected ? styles.active : styles.idle
            )}
          >
            <input
              type="radio"
              name="planFeedback"
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="sr-only"
              required
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}

export function WeeklyFollowupForm({
  weekNumber,
  patientName,
  accessToken,
  compact,
  hideSubmit,
  formId,
  onSubmitted,
  onSubmittingChange,
  locale: localeProp,
  onLocaleChange,
}: WeeklyFollowupFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [internalLocale, setInternalLocale] = useState<PatientLocale>("gu");
  const locale = localeProp ?? internalLocale;
  const setLocale = onLocaleChange ?? setInternalLocale;
  const ui = followupUi(locale);
  const [form, setForm] = useState({
    currentWeight: "",
    exerciseDays: "" as number | "",
    lowWaterDays: "" as number | "",
    shortSleepDays: "" as number | "",
    missedSupplementDays: "" as number | "",
    mealsDeviated: "",
    planFeedback: "" as PlanFeedbackType | "",
    feedbackLikedNotes: "",
    feedbackDislikedNotes: "",
    feedbackBadNotes: "",
    feedbackGoodNotes: "",
  });

  function setPlanFeedback(value: PlanFeedbackType) {
    setForm((prev) => ({
      ...prev,
      planFeedback: value,
      feedbackLikedNotes: value === "excellent" ? prev.feedbackLikedNotes : "",
      feedbackDislikedNotes: value === "poor" ? prev.feedbackDislikedNotes : "",
      feedbackBadNotes: value === "moderate" ? prev.feedbackBadNotes : "",
      feedbackGoodNotes: value === "moderate" ? prev.feedbackGoodNotes : "",
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    onSubmittingChange?.(true);

    const res = await fetch(
      accessToken ? `/api/followup/${accessToken}` : "/api/patient/followup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNumber,
          currentWeight: form.currentWeight,
          exerciseDays: form.exerciseDays,
          lowWaterDays: form.lowWaterDays,
          shortSleepDays: form.shortSleepDays,
          missedSupplementDays: form.missedSupplementDays,
          mealsDeviated: form.mealsDeviated,
          planFeedback: form.planFeedback,
          feedbackLikedNotes: form.feedbackLikedNotes,
          feedbackDislikedNotes: form.feedbackDislikedNotes,
          feedbackBadNotes: form.feedbackBadNotes,
          feedbackGoodNotes: form.feedbackGoodNotes,
        }),
      }
    );

    const data = await res.json();
    setLoading(false);
    onSubmittingChange?.(false);

    if (!res.ok) {
      setError(data.error || ui.submitError);
      return;
    }

    onSubmitted?.();
    if (!accessToken && !compact) {
      router.push("/patient");
      router.refresh();
    }
  }

  const habitsFields = (
    <>
      <Input
        label={<RequiredLabel>{ui.currentWeight}</RequiredLabel>}
        type="number"
        step="0.1"
        min="0"
        required
        value={form.currentWeight}
        onChange={(e) => setForm({ ...form, currentWeight: e.target.value })}
      />

      <DayScaleField
        compact={compact}
        locale={locale}
        label={ui.exerciseDays}
        name="exerciseDays"
        value={form.exerciseDays}
        onChange={(v) => setForm({ ...form, exerciseDays: v })}
        required
      />

      <DayScaleField
        compact={compact}
        locale={locale}
        label={ui.lowWaterDays}
        name="lowWaterDays"
        value={form.lowWaterDays}
        onChange={(v) => setForm({ ...form, lowWaterDays: v })}
        required
      />

      <DayScaleField
        compact={compact}
        locale={locale}
        label={ui.shortSleepDays}
        name="shortSleepDays"
        value={form.shortSleepDays}
        onChange={(v) => setForm({ ...form, shortSleepDays: v })}
        required
      />

      <DayScaleField
        compact={compact}
        locale={locale}
        label={ui.missedSupplementDays}
        name="missedSupplementDays"
        value={form.missedSupplementDays}
        onChange={(v) => setForm({ ...form, missedSupplementDays: v })}
        required
      />

      <Input
        label={<RequiredLabel>{ui.mealsDeviated}</RequiredLabel>}
        type="number"
        min="0"
        required
        value={form.mealsDeviated}
        onChange={(e) => setForm({ ...form, mealsDeviated: e.target.value })}
      />
    </>
  );

  const feedbackFields = (
    <>
      <p className="text-sm leading-relaxed text-slate-600">
        <RequiredLabel>{ui.feedbackPrompt}</RequiredLabel>
      </p>

      <FeedbackOptions
        compact={compact}
        value={form.planFeedback}
        onChange={setPlanFeedback}
        ui={ui}
      />

      {form.planFeedback === "excellent" && (
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition">
          <Textarea
            label={<RequiredLabel>{ui.feedbackExcellentNotes}</RequiredLabel>}
            required
            rows={compact ? 2 : 3}
            value={form.feedbackLikedNotes}
            onChange={(e) => setForm({ ...form, feedbackLikedNotes: e.target.value })}
            placeholder={locale === "gu" ? "તમારો અનુભવ લખો..." : "Share your experience..."}
          />
        </div>
      )}

      {form.planFeedback === "poor" && (
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition">
          <Textarea
            label={<RequiredLabel>{ui.feedbackPoorNotes}</RequiredLabel>}
            required
            rows={compact ? 2 : 3}
            value={form.feedbackDislikedNotes}
            onChange={(e) => setForm({ ...form, feedbackDislikedNotes: e.target.value })}
            placeholder={locale === "gu" ? "શું સુધારવું જોઈએ તે લખો..." : "What could be improved..."}
          />
        </div>
      )}

      {form.planFeedback === "moderate" && (
        <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition">
          <Textarea
            label={<RequiredLabel>{ui.feedbackBadNotes}</RequiredLabel>}
            required
            rows={compact ? 2 : 3}
            value={form.feedbackBadNotes}
            onChange={(e) => setForm({ ...form, feedbackBadNotes: e.target.value })}
            placeholder={locale === "gu" ? "શું ખરાબ લાગ્યું..." : "What felt difficult..."}
          />
          <Textarea
            label={<RequiredLabel>{ui.feedbackGoodNotes}</RequiredLabel>}
            required
            rows={compact ? 2 : 3}
            value={form.feedbackGoodNotes}
            onChange={(e) => setForm({ ...form, feedbackGoodNotes: e.target.value })}
            placeholder={locale === "gu" ? "શું સારું લાગ્યું..." : "What worked well..."}
          />
        </div>
      )}
    </>
  );

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className={compact ? "space-y-6" : "space-y-8"}
    >
      {!compact && (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{ui.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{ui.weekCheckIn(weekNumber)}</p>
            </div>
            {!localeProp && <LocaleToggle locale={locale} onChange={setLocale} />}
          </div>

          <div className="mt-6">
            <Input label={ui.patientName} value={patientName} readOnly className="bg-slate-50" />
          </div>
        </Card>
      )}

      <FormSection compact={compact} icon={ClipboardList} title={ui.weeklyHabits}>
        {compact ? <div className="space-y-5">{habitsFields}</div> : habitsFields}
      </FormSection>

      <FormSection compact={compact} icon={MessageSquare} title={ui.feedbackTitle}>
        {compact ? <div className="space-y-4">{feedbackFields}</div> : feedbackFields}
      </FormSection>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!hideSubmit && (
        <div className={compact ? "flex justify-center pb-2" : "flex justify-center pb-8"}>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-40 px-8 py-3 text-base font-semibold uppercase tracking-wide"
          >
            {loading ? ui.submitting : ui.submit}
          </Button>
        </div>
      )}
    </form>
  );
}
