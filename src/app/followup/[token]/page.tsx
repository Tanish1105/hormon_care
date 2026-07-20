"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WeeklyFollowupForm } from "@/components/WeeklyFollowupForm";
import { LocaleToggle } from "@/components/LocaleToggle";
import { BrandLogo } from "@/components/BrandLogo";
import { Card } from "@/components/ui";
import type { PatientLocale } from "@/lib/patient-locale";
import { followupUi } from "@/lib/weekly-followup-i18n";

function PublicFollowupContent({
  locale,
  onLocaleChange,
}: {
  locale: PatientLocale;
  onLocaleChange: (locale: PatientLocale) => void;
}) {
  const params = useParams();
  const token = params.token as string;
  const ui = followupUi(locale);
  const [patientName, setPatientName] = useState("");
  const [weekNumber, setWeekNumber] = useState<number | null>(null);
  const [pending, setPending] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setError("");
    fetch(`/api/followup/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          setPending(false);
          return;
        }
        setPending(d.pending ?? false);
        setPatientName(d.patientName ?? "");
        setWeekNumber(d.nextDueWeek ?? null);
        if (!d.pending) setSubmitted(true);
      })
      .catch(() => setError(ui.loadError));
  }, [token, ui.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <Card className="text-center text-red-600">
        <p>{error}</p>
      </Card>
    );
  }

  if (pending === null) {
    return <p className="text-center text-slate-500">{ui.loading}</p>;
  }

  if (!pending && submitted) {
    return (
      <Card className="text-center">
        <h2 className="text-xl font-semibold text-green-800">{ui.thankYou}</h2>
        <p className="mt-2 text-slate-600">{ui.thankYouBody}</p>
      </Card>
    );
  }

  if (!weekNumber) {
    return (
      <Card className="text-center text-slate-500">
        <p>{ui.noFollowupDue}</p>
      </Card>
    );
  }

  return (
    <WeeklyFollowupForm
      weekNumber={weekNumber}
      patientName={patientName}
      accessToken={token}
      locale={locale}
      onLocaleChange={onLocaleChange}
      onSubmitted={load}
    />
  );
}

export default function PublicFollowupPage() {
  const [locale, setLocale] = useState<PatientLocale>("gu");
  const ui = followupUi(locale);

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#fff1f5_0%,#f8fafc_42%,#ffffff_100%)]">
      <header className="border-b border-pink-100/80 bg-white/90 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">Hormone care</p>
              <h1 className="truncate text-base font-bold text-slate-700">{ui.title}</h1>
            </div>
          </div>
          <LocaleToggle locale={locale} onChange={setLocale} />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Suspense fallback={<p className="text-center text-slate-500">{ui.loading}</p>}>
          <PublicFollowupContent locale={locale} onLocaleChange={setLocale} />
        </Suspense>
      </main>
    </div>
  );
}
