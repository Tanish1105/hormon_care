"use client";

import { useCallback, useEffect, useState } from "react";
import { LifestyleAssessmentForm } from "@/components/LifestyleAssessmentForm";
import { LocaleToggle } from "@/components/LocaleToggle";
import { BrandLogo } from "@/components/BrandLogo";
import { Card } from "@/components/ui";
import { lifestyleFormUi } from "@/lib/lifestyle-assessment-i18n";
import type { PatientLocale } from "@/lib/patient-locale";
import { useParams } from "next/navigation";

export default function PublicAssessmentPage() {
  const params = useParams();
  const token = params.token as string;
  const [patientName, setPatientName] = useState("");
  const [pending, setPending] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [locale, setLocale] = useState<PatientLocale>("gu");
  const ui = lifestyleFormUi(locale);

  const load = useCallback(() => {
    setError("");
    fetch(`/api/assessment/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          setPending(false);
          return;
        }
        setPending(d.pending ?? false);
        setSubmitted(d.submitted ?? false);
        setPatientName(d.patientName ?? "");
      })
      .catch(() => setError(ui.loadError));
  }, [token, ui.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-full bg-gradient-to-b from-pink-50 to-white">
      <header className="border-b border-pink-100 bg-white/90 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">Hormon Care</p>
              <h1 className="truncate text-base font-bold text-slate-700">{ui.title}</h1>
            </div>
          </div>
          <LocaleToggle locale={locale} onChange={setLocale} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {error && (
          <Card className="text-center text-red-600">
            <p>{error}</p>
          </Card>
        )}

        {!error && pending === null && (
          <p className="text-center text-slate-500">{ui.loading}</p>
        )}

        {!error && pending === false && submitted && (
          <Card className="text-center">
            <h2 className="text-xl font-semibold text-green-800">{ui.thankYou}</h2>
            <p className="mt-2 text-slate-600">
              {ui.thankYouBody} {ui.thankYouDoctor}
            </p>
          </Card>
        )}

        {!error && pending && (
          <LifestyleAssessmentForm
            patientName={patientName}
            accessToken={token}
            locale={locale}
            onLocaleChange={setLocale}
            onSubmitted={() => {
              setSubmitted(true);
              setPending(false);
            }}
          />
        )}
      </main>
    </div>
  );
}
