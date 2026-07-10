"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminLifestyleAssessmentCard } from "@/components/AdminLifestyleAssessmentCard";
import { Card } from "@/components/ui";
import type { LifestyleAnalyticsSummary } from "@/lib/lifestyle-assessment";

type AssessmentItem = {
  id: string;
  patientProfileId: string;
  patientName: string;
  username: string;
  requestedAt: string;
  submittedAt: string | null;
  pending: boolean;
  lifestyleScore: number | null;
  doctorRecommendation: string | null;
  formLink: string | null;
  data: Record<string, unknown> | null;
  highlights: { field: string; label: string; reason: string; severity: "high" | "medium" }[];
  highlightCount: number;
  analytics: LifestyleAnalyticsSummary | null;
};

type Filter = "all" | "pending" | "submitted" | "high-risk";

export default function AdminLifestyleAssessmentsPage() {
  const [items, setItems] = useState<AssessmentItem[]>([]);
  const [aggregate, setAggregate] = useState({
    totalSent: 0,
    pending: 0,
    submitted: 0,
    highRisk: 0,
    mediumRisk: 0,
  });
  const [filter, setFilter] = useState<Filter>("all");
  const [loadError, setLoadError] = useState("");

  async function load() {
    setLoadError("");
    try {
      const res = await fetch("/api/admin/lifestyle-assessments");
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error || "Could not load assessments");
        return;
      }
      setItems(data.items);
      setAggregate(data.aggregate);
    } catch {
      setLoadError("Could not load lifestyle assessments");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((item) => {
    if (filter === "pending") return item.pending;
    if (filter === "submitted") return !item.pending;
    if (filter === "high-risk") return item.analytics?.riskLevel === "high";
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "submitted", label: "Submitted" },
    { key: "high-risk", label: "High Risk" },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Lifestyle Assessments</h1>
        <p className="mt-1 text-sm text-slate-500">
          Full lifestyle analytics across 9 sections. Share the form link with patients or they can
          complete after login.
        </p>
      </div>

      {loadError && <p className="mb-4 text-sm text-red-600">{loadError}</p>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <p className="text-sm text-slate-500">Sent</p>
          <p className="mt-1 text-2xl font-bold">{aggregate.totalSent}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{aggregate.pending}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Submitted</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{aggregate.submitted}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">High Risk</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{aggregate.highRisk}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Medium Risk</p>
          <p className="mt-1 text-2xl font-bold text-orange-600">{aggregate.mediumRisk}</p>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === f.key
                ? "bg-pink-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card className="text-center text-slate-500">
            {items.length === 0
              ? 'No assessments sent yet. Go to Patients and click "Send Assessment".'
              : "No assessments match this filter."}
          </Card>
        ) : (
          filtered.map((item) => (
            <AdminLifestyleAssessmentCard key={item.id} item={item} onUpdated={load} />
          ))
        )}
      </div>
    </AdminLayout>
  );
}
