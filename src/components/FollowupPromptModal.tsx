"use client";

import { useState } from "react";
import { WeeklyFollowupForm } from "@/components/WeeklyFollowupForm";
import { LocaleToggle } from "@/components/LocaleToggle";
import { Button } from "@/components/ui";
import type { PatientLocale } from "@/lib/patient-locale";
import { followupUi } from "@/lib/weekly-followup-i18n";
import { CalendarCheck, X } from "lucide-react";

const FORM_ID = "weekly-followup-modal-form";

type FollowupPromptModalProps = {
  weekNumber: number;
  patientName: string;
  onSubmitted: () => void;
  onViewPlan: () => void;
};

export function FollowupPromptModal({
  weekNumber,
  patientName,
  onSubmitted,
  onViewPlan,
}: FollowupPromptModalProps) {
  const [locale, setLocale] = useState<PatientLocale>("gu");
  const [submitting, setSubmitting] = useState(false);
  const ui = followupUi(locale);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="relative flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="followup-modal-title"
      >
        <div className="shrink-0 bg-gradient-to-br from-pink-600 via-pink-500 to-rose-500 px-5 pb-4 pt-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                <CalendarCheck className="h-3.5 w-3.5" />
                {ui.weekLabel(weekNumber)}
              </div>
              <h2 id="followup-modal-title" className="mt-2 truncate text-lg font-bold">
                {patientName}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-pink-100">{ui.modalHint}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <LocaleToggle locale={locale} onChange={setLocale} variant="onDark" />
              <button
                type="button"
                onClick={onViewPlan}
                className="rounded-lg p-1.5 text-white/90 transition hover:bg-white/15"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <WeeklyFollowupForm
            formId={FORM_ID}
            weekNumber={weekNumber}
            patientName={patientName}
            compact
            hideSubmit
            locale={locale}
            onLocaleChange={setLocale}
            onSubmittingChange={setSubmitting}
            onSubmitted={onSubmitted}
          />
        </div>

        <div className="shrink-0 space-y-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 backdrop-blur-sm">
          <Button
            type="submit"
            form={FORM_ID}
            disabled={submitting}
            className="w-full py-3 text-sm font-semibold uppercase tracking-wide"
          >
            {submitting ? ui.submitting : ui.submit}
          </Button>
          <button
            type="button"
            onClick={onViewPlan}
            className="w-full py-2 text-center text-sm font-medium text-slate-500 transition hover:text-pink-600"
          >
            {ui.viewPlanFirst}
          </button>
        </div>
      </div>
    </div>
  );
}
