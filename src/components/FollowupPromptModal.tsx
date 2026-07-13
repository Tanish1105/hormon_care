"use client";

import { useEffect, useState } from "react";
import { WeeklyFollowupForm } from "@/components/WeeklyFollowupForm";
import { LocaleToggle } from "@/components/LocaleToggle";
import { Button } from "@/components/ui";
import type { PatientLocale } from "@/lib/patient-locale";
import { followupUi } from "@/lib/weekly-followup-i18n";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

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
  const [entered, setEntered] = useState(false);
  const ui = followupUi(locale);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4",
        "transition-opacity duration-300",
        entered ? "opacity-100" : "opacity-0"
      )}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onViewPlan}
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="followup-modal-title"
        className={cn(
          "relative z-10 flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden",
          "rounded-t-[1.5rem] bg-white shadow-[0_-8px_40px_rgba(15,23,42,0.18)]",
          "sm:max-h-[90vh] sm:rounded-[1.5rem] sm:shadow-2xl",
          "transition-transform duration-300 ease-out",
          entered ? "translate-y-0" : "translate-y-8 sm:translate-y-4 sm:scale-[0.98]"
        )}
      >
        <div className="relative shrink-0 overflow-hidden border-b border-pink-100/80 bg-[linear-gradient(160deg,#fff1f5_0%,#ffffff_55%,#fff7ed_100%)] px-5 pb-4 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300/80 sm:hidden" />

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-pink-700/80">
                Hormon Care
              </p>
              <h2
                id="followup-modal-title"
                className="mt-1 text-xl font-bold tracking-tight text-slate-900"
              >
                {ui.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {ui.weekLabel(weekNumber)}
                {patientName ? (
                  <>
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="font-medium text-slate-800">{patientName}</span>
                  </>
                ) : null}
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                {ui.modalHint}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <button
                type="button"
                onClick={onViewPlan}
                className="rounded-full p-2 text-slate-500 transition hover:bg-white/80 hover:text-slate-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <LocaleToggle locale={locale} onChange={setLocale} />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
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

        <div className="shrink-0 border-t border-slate-100 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <Button
            type="submit"
            form={FORM_ID}
            disabled={submitting}
            className="w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide shadow-sm shadow-pink-600/20"
          >
            {submitting ? ui.submitting : ui.submit}
          </Button>
          <button
            type="button"
            onClick={onViewPlan}
            className="mt-2 w-full py-2.5 text-center text-sm font-medium text-slate-500 transition hover:text-pink-700"
          >
            {ui.viewPlanFirst}
          </button>
        </div>
      </div>
    </div>
  );
}
