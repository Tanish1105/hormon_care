"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { LocaleToggle } from "@/components/LocaleToggle";
import type { PatientLocale } from "@/lib/patient-locale";
import { DAY_SCALE_OPTIONS, type PlanFeedbackType } from "@/lib/weekly-followup";
import { followupDayLabel, followupUi } from "@/lib/weekly-followup-i18n";
import { cn } from "@/lib/utils";
import { ClipboardList, Frown, Meh, MessageSquare, Smile } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

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

const FEEDBACK_OPTIONS = [
  {
    value: "excellent" as const,
    icon: Smile,
    active: "border-emerald-400 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100",
    idle: "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40",
    iconActive: "text-emerald-600",
  },
  {
    value: "moderate" as const,
    icon: Meh,
    active: "border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-100",
    idle: "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/40",
    iconActive: "text-amber-600",
  },
  {
    value: "poor" as const,
    icon: Frown,
    active: "border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-100",
    idle: "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50/40",
    iconActive: "text-rose-600",
  },
] as const;

function RequiredMark() {
  return <span className="text-pink-600">*</span>;
}

function FormSection({
  compact,
  icon: Icon,
  title,
  children,
}: {
  compact?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  if (compact) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-700">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
            <div className="mt-1 h-0.5 w-8 rounded-full bg-pink-400/80" />
          </div>
        </div>
        <div className="space-y-5">{children}</div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-pink-50/80 to-white px-5 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-pink-700 shadow-sm ring-1 ring-pink-100">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-6 px-5 py-5">{children}</div>
    </section>
  );
}

function DayScaleField({
  locale,
  label,
  name,
  value,
  onChange,
  required,
}: {
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
        {label}
        {required ? (
          <>
            {" "}
            <RequiredMark />
          </>
        ) : null}
      </legend>
      <div className="grid grid-cols-8 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 p-1">
        {DAY_SCALE_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-lg py-2.5 text-center text-[11px] font-semibold transition sm:text-xs",
                selected
                  ? "bg-pink-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
                required={required}
              />
              {followupDayLabel(locale, option.label)}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function FeedbackOptions({
  value,
  onChange,
  ui,
}: {
  value: PlanFeedbackType | "";
  onChange: (v: PlanFeedbackType) => void;
  ui: ReturnType<typeof followupUi>;
}) {
  const labels = {
    excellent: ui.feedbackExcellent,
    moderate: ui.feedbackModerate,
    poor: ui.feedbackPoor,
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {FEEDBACK_OPTIONS.map((option) => {
        const selected = value === option.value;
        const Icon = option.icon;
        return (
          <label
            key={option.value}
            className={cn(
              "flex min-h-[4.5rem] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition",
              selected ? option.active : option.idle
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
            <Icon
              className={cn("h-5 w-5", selected ? option.iconActive : "text-slate-400")}
              strokeWidth={1.75}
            />
            <span className="text-xs font-semibold leading-tight sm:text-sm">
              {labels[option.value]}
            </span>
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
      <div className="relative">
        <Input
          label={
            <>
              {ui.currentWeight} <RequiredMark />
            </>
          }
          type="number"
          step="0.1"
          min="0"
          required
          value={form.currentWeight}
          onChange={(e) => setForm({ ...form, currentWeight: e.target.value })}
          className="pr-12"
        />
        <span className="pointer-events-none absolute bottom-2.5 right-3 text-xs font-medium text-slate-400">
          kg
        </span>
      </div>

      <DayScaleField
        locale={locale}
        label={ui.exerciseDays}
        name="exerciseDays"
        value={form.exerciseDays}
        onChange={(v) => setForm({ ...form, exerciseDays: v })}
        required
      />

      <DayScaleField
        locale={locale}
        label={ui.lowWaterDays}
        name="lowWaterDays"
        value={form.lowWaterDays}
        onChange={(v) => setForm({ ...form, lowWaterDays: v })}
        required
      />

      <DayScaleField
        locale={locale}
        label={ui.shortSleepDays}
        name="shortSleepDays"
        value={form.shortSleepDays}
        onChange={(v) => setForm({ ...form, shortSleepDays: v })}
        required
      />

      <DayScaleField
        locale={locale}
        label={ui.missedSupplementDays}
        name="missedSupplementDays"
        value={form.missedSupplementDays}
        onChange={(v) => setForm({ ...form, missedSupplementDays: v })}
        required
      />

      <Input
        label={
          <>
            {ui.mealsDeviated} <RequiredMark />
          </>
        }
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
        {ui.feedbackPrompt} <RequiredMark />
      </p>

      <FeedbackOptions value={form.planFeedback} onChange={setPlanFeedback} ui={ui} />

      {form.planFeedback === "excellent" && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5">
          <Textarea
            label={
              <>
                {ui.feedbackExcellentNotes} <RequiredMark />
              </>
            }
            required
            rows={compact ? 2 : 3}
            value={form.feedbackLikedNotes}
            onChange={(e) => setForm({ ...form, feedbackLikedNotes: e.target.value })}
            placeholder={locale === "gu" ? "તમારો અનુભવ લખો..." : "Share your experience..."}
            className="bg-white"
          />
        </div>
      )}

      {form.planFeedback === "poor" && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-3.5">
          <Textarea
            label={
              <>
                {ui.feedbackPoorNotes} <RequiredMark />
              </>
            }
            required
            rows={compact ? 2 : 3}
            value={form.feedbackDislikedNotes}
            onChange={(e) => setForm({ ...form, feedbackDislikedNotes: e.target.value })}
            placeholder={locale === "gu" ? "શું સુધારવું જોઈએ તે લખો..." : "What could be improved..."}
            className="bg-white"
          />
        </div>
      )}

      {form.planFeedback === "moderate" && (
        <div className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50/40 p-3.5">
          <Textarea
            label={
              <>
                {ui.feedbackBadNotes} <RequiredMark />
              </>
            }
            required
            rows={compact ? 2 : 3}
            value={form.feedbackBadNotes}
            onChange={(e) => setForm({ ...form, feedbackBadNotes: e.target.value })}
            placeholder={locale === "gu" ? "શું ખરાબ લાગ્યું..." : "What felt difficult..."}
            className="bg-white"
          />
          <Textarea
            label={
              <>
                {ui.feedbackGoodNotes} <RequiredMark />
              </>
            }
            required
            rows={compact ? 2 : 3}
            value={form.feedbackGoodNotes}
            onChange={(e) => setForm({ ...form, feedbackGoodNotes: e.target.value })}
            placeholder={locale === "gu" ? "શું સારું લાગ્યું..." : "What worked well..."}
            className="bg-white"
          />
        </div>
      )}
    </>
  );

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className={compact ? "space-y-8" : "space-y-6"}
    >
      {!compact && (
        <Card className="!overflow-hidden !p-0">
          <div className="bg-[linear-gradient(160deg,#fff1f5_0%,#ffffff_60%,#fff7ed_100%)] px-5 py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <BrandLogo size="md" className="mb-3" />
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {ui.title}
                </h1>
                <p className="mt-1 text-sm text-slate-600">{ui.weekCheckIn(weekNumber)}</p>
              </div>
              {!localeProp && <LocaleToggle locale={locale} onChange={setLocale} />}
            </div>
            <div className="mt-5">
              <Input label={ui.patientName} value={patientName} readOnly className="bg-white" />
            </div>
          </div>
        </Card>
      )}

      <FormSection compact={compact} icon={ClipboardList} title={ui.weeklyHabits}>
        {habitsFields}
      </FormSection>

      {compact ? <div className="h-px bg-slate-100" /> : null}

      <FormSection compact={compact} icon={MessageSquare} title={ui.feedbackTitle}>
        {feedbackFields}
      </FormSection>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {!hideSubmit && (
        <div className="flex justify-center pb-6 pt-1">
          <Button
            type="submit"
            disabled={loading}
            className="min-w-44 rounded-xl px-8 py-3.5 text-sm font-semibold tracking-wide shadow-sm shadow-pink-600/20"
          >
            {loading ? ui.submitting : ui.submit}
          </Button>
        </div>
      )}
    </form>
  );
}
