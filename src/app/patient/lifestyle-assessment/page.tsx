"use client";

import { useEffect, useState, useCallback } from "react";
import { PatientLayout } from "@/components/PatientLayout";
import { LifestyleAssessmentForm } from "@/components/LifestyleAssessmentForm";
import { Card } from "@/components/ui";

export default function PatientLifestyleAssessmentPage() {
  const [patientName, setPatientName] = useState("");
  const [pending, setPending] = useState<boolean | null>(null);

  const load = useCallback(() => {
    fetch("/api/patient/lifestyle-assessment")
      .then((r) => r.json())
      .then((d) => {
        setPending(d.pending ?? false);
        setPatientName(d.patientName ?? "");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (pending === null) {
    return (
      <PatientLayout>
        <p className="text-slate-500">Loading...</p>
      </PatientLayout>
    );
  }

  if (!pending) {
    return (
      <PatientLayout>
        <Card className="text-center">
          <p className="text-slate-500">No lifestyle assessment is pending right now.</p>
        </Card>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <LifestyleAssessmentForm patientName={patientName} onSubmitted={load} />
    </PatientLayout>
  );
}
