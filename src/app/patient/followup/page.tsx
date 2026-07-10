"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PatientLayout } from "@/components/PatientLayout";
import { WeeklyFollowupForm } from "@/components/WeeklyFollowupForm";
import { Card } from "@/components/ui";

type FollowupStatus = {
  hasCarePlan: boolean;
  pendingWeeks: number[];
  nextDueWeek: number | null;
  patientName: string;
  compulsory: boolean;
};

function FollowupPageContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<FollowupStatus | null>(null);

  const loadStatus = useCallback(() => {
    fetch("/api/patient/followup/status")
      .then((r) => r.json())
      .then(setStatus);
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  if (!status) {
    return <p className="text-slate-500">Loading...</p>;
  }

  if (!status.hasCarePlan) {
    return (
      <Card className="text-center">
        <p className="text-slate-500">Weekly followup is only available with an active Care Plan.</p>
      </Card>
    );
  }

  const requestedWeek = Number(searchParams.get("week"));
  const weekNumber =
    status.pendingWeeks.includes(requestedWeek)
      ? requestedWeek
      : status.nextDueWeek ?? status.pendingWeeks[0] ?? null;

  if (!weekNumber) {
    return (
      <Card className="text-center">
        <h1 className="text-xl font-semibold text-slate-900">Weekly Followup</h1>
        <p className="mt-3 text-slate-500">
          No followup is due right now. Complete your current week first.
        </p>
      </Card>
    );
  }

  return (
    <WeeklyFollowupForm
      weekNumber={weekNumber}
      patientName={status.patientName}
      onSubmitted={loadStatus}
    />
  );
}

export default function PatientFollowupPage() {
  return (
    <PatientLayout>
      <Suspense fallback={<p className="text-slate-500">Loading...</p>}>
        <FollowupPageContent />
      </Suspense>
    </PatientLayout>
  );
}
