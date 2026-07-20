"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminFollowupList, type AdminFollowupRow } from "@/components/AdminFollowupWeekCard";
import { PatientFollowupCharts } from "@/components/PatientFollowupCharts";
import { Badge, Button, Card } from "@/components/ui";
import { ShareFormLink } from "@/components/ShareFormLink";
import { formatDisplayDate } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type PatientAnalytics = {
  id: string;
  name: string;
  username: string;
  planTitle: string;
  totalWeeks: number;
  startDate: string;
  pendingWeeks: number[];
  nextDueWeek: number | null;
  formLink: string | null;
  submissionCount: number;
  latestWeight: number | null;
  weightChange: number | null;
  followups: AdminFollowupRow[];
};

type AnalyticsData = {
  patients: PatientAnalytics[];
  aggregate: {
    totalPatients: number;
    totalSubmissions: number;
    pendingCount: number;
  };
};

export default function AdminFollowupsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [compulsory, setCompulsory] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");

  async function load() {
    setLoadError("");
    try {
      const [analyticsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/followups"),
        fetch("/api/admin/settings/followup"),
      ]);
      const analytics = await analyticsRes.json();
      const settings = await settingsRes.json();
      if (!analyticsRes.ok) {
        setLoadError(analytics.error || "Could not load followups");
        return;
      }
      setData(analytics);
      setCompulsory(settings.compulsory ?? true);
    } catch {
      setLoadError("Could not load followup analytics");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleCompulsory() {
    setSettingsLoading(true);
    const next = !compulsory;
    const res = await fetch("/api/admin/settings/followup", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compulsory: next }),
    });
    if (res.ok) setCompulsory(next);
    setSettingsLoading(false);
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Weekly Followup Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track patient progress week-by-week with comparisons across all submissions.
          </p>
        </div>
        <Card className="flex items-center gap-4 !p-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Followup popup prompt</p>
            <p className="text-xs text-slate-500">
              {compulsory
                ? "Popup shows on app open until form is filled (plan still accessible)"
                : "No popup — patient uses Followup link only"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={compulsory}
            disabled={settingsLoading}
            onClick={toggleCompulsory}
            className={cn(
              "relative h-7 w-12 rounded-full transition",
              compulsory ? "bg-pink-600" : "bg-slate-300"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
                compulsory ? "left-5" : "left-0.5"
              )}
            />
          </button>
        </Card>
      </div>

      {loadError && <p className="mb-4 text-sm text-red-600">{loadError}</p>}

      {data && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <p className="text-sm text-slate-500">Patients on Care Plan</p>
              <p className="mt-1 text-2xl font-bold">{data.aggregate.totalPatients}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Total Submissions</p>
              <p className="mt-1 text-2xl font-bold">{data.aggregate.totalSubmissions}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Pending Followups</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{data.aggregate.pendingCount}</p>
            </Card>
          </div>

          <div className="space-y-4">
            {data.patients.length === 0 ? (
              <Card className="text-center text-slate-500">No patients with a Care Plan yet.</Card>
            ) : (
              data.patients.map((patient) => {
                const expanded = expandedPatient === patient.id;
                const latest = patient.followups[patient.followups.length - 1];
                return (
                  <Card key={patient.id}>
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-4 text-left"
                      onClick={() => setExpandedPatient(expanded ? null : patient.id)}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-slate-900">{patient.name}</h2>
                          <Badge color="slate">{patient.username}</Badge>
                          {patient.pendingWeeks.length > 0 && (
                            <Badge color="pink">{patient.pendingWeeks.length} pending</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {patient.planTitle} · Started {formatDisplayDate(patient.startDate)} ·{" "}
                          {patient.submissionCount}/{patient.totalWeeks} weeks submitted
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                          {patient.latestWeight !== null && (
                            <span>
                              Weight: <strong>{patient.latestWeight} kg</strong>
                              {patient.weightChange !== null && (
                                <span
                                  className={cn(
                                    "ml-1",
                                    patient.weightChange > 0
                                      ? "text-red-600"
                                      : patient.weightChange < 0
                                        ? "text-green-600"
                                        : ""
                                  )}
                                >
                                  ({patient.weightChange > 0 ? "+" : ""}
                                  {patient.weightChange} total)
                                </span>
                              )}
                            </span>
                          )}
                          {latest && (
                            <>
                              <span>Exercise: {latest.exerciseDays}/7</span>
                              <span>Water: {latest.lowWaterDays}/7</span>
                              <span>Sleep: {latest.shortSleepDays}/7</span>
                            </>
                          )}
                        </div>
                      </div>
                      {expanded ? (
                        <ChevronUp className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
                      ) : (
                        <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
                      )}
                    </button>

                    {expanded && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        {patient.pendingWeeks.length > 0 && (
                          <div className="mb-4 space-y-3">
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                              <p className="text-sm text-amber-900">
                                Week {patient.nextDueWeek ?? patient.pendingWeeks[0]} followup due —
                                share the direct link with the patient (stays due until submitted).
                              </p>
                              <p className="mt-2 text-xs text-amber-800">
                                Pending weeks: {patient.pendingWeeks.join(", ")}
                              </p>
                            </div>
                            {patient.formLink ? (
                              <ShareFormLink
                                url={patient.formLink}
                                label="Followup form link"
                                hint="Patient can open without login — Copy or WhatsApp."
                              />
                            ) : null}
                          </div>
                        )}
                        <PatientFollowupCharts followups={patient.followups} />
                        <AdminFollowupList followups={patient.followups} onUpdated={load} />
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </>
      )}

      {!data && !loadError && <p className="text-slate-500">Loading analytics...</p>}
    </AdminLayout>
  );
}
