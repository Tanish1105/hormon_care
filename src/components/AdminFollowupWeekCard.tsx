"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { DAY_SCALE_OPTIONS, PLAN_FEEDBACK_OPTIONS, normalizePlanFeedback } from "@/lib/weekly-followup";
import { formatDisplayDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus, Pencil, Trash2, X, Check } from "lucide-react";

type ComparisonDelta = {
  delta: number;
  direction: "up" | "down" | "same";
} | null;

export type AdminFollowupRow = {
  id: string;
  weekNumber: number;
  currentWeight: number;
  exerciseDays: number;
  lowWaterDays: number;
  shortSleepDays: number;
  missedSupplementDays: number;
  mealsDeviated: string | null;
  planFeedback: string | null;
  feedbackLikedNotes: string | null;
  feedbackDislikedNotes: string | null;
  feedbackBadNotes: string | null;
  feedbackGoodNotes: string | null;
  submittedAt: string;
  comparison: {
    weight: ComparisonDelta;
  };
};

function DeltaBadge({ value }: { value: ComparisonDelta }) {
  if (!value) return null;
  if (value.direction === "same") {
    return (
      <span className="ml-1 inline-flex items-center gap-0.5 text-xs text-slate-400">
        (<Minus className="h-3 w-3" />0)
      </span>
    );
  }
  const up = value.direction === "up";
  return (
    <span
      className={cn(
        "ml-1 inline-flex items-center gap-0.5 text-xs font-medium",
        up ? "text-red-600" : "text-green-600"
      )}
    >
      ({up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value.delta)})
    </span>
  );
}

function DataCell({
  label,
  value,
  suffix,
  delta,
}: {
  label: string;
  value: string | number | null;
  suffix?: string;
  delta?: ComparisonDelta;
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 font-medium text-slate-900">
        {value ?? "—"}
        {value !== null && value !== undefined && value !== "—" && suffix}
        {delta && <DeltaBadge value={delta} />}
      </p>
    </div>
  );
}

function planFeedbackLabel(value: string | null) {
  if (!value) return "—";
  const normalized = normalizePlanFeedback(value);
  return PLAN_FEEDBACK_OPTIONS.find((o) => o.value === normalized)?.label ?? value;
}

function followupToForm(f: AdminFollowupRow) {
  return {
    currentWeight: String(f.currentWeight),
    exerciseDays: String(f.exerciseDays),
    lowWaterDays: String(f.lowWaterDays),
    shortSleepDays: String(f.shortSleepDays),
    missedSupplementDays: String(f.missedSupplementDays),
    mealsDeviated: f.mealsDeviated ?? "",
    planFeedback: normalizePlanFeedback(f.planFeedback) ?? "",
    feedbackLikedNotes: f.feedbackLikedNotes ?? "",
    feedbackDislikedNotes: f.feedbackDislikedNotes ?? "",
    feedbackBadNotes: f.feedbackBadNotes ?? "",
    feedbackGoodNotes: f.feedbackGoodNotes ?? "",
  };
}

export function AdminFollowupWeekCard({
  followup,
  onUpdated,
}: {
  followup: AdminFollowupRow;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => followupToForm(followup));

  function startEdit() {
    setForm(followupToForm(followup));
    setError("");
    setEditing(true);
  }

  async function save() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/followups/${followup.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        mealsDeviated: form.mealsDeviated || null,
        planFeedback: form.planFeedback || null,
        feedbackLikedNotes: form.feedbackLikedNotes || null,
        feedbackDislikedNotes: form.feedbackDislikedNotes || null,
        feedbackBadNotes: form.feedbackBadNotes || null,
        feedbackGoodNotes: form.feedbackGoodNotes || null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not save");
      return;
    }
    setEditing(false);
    onUpdated();
  }

  async function remove() {
    if (!confirm(`Delete Week ${followup.weekNumber} followup?`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/followups/${followup.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not delete");
      return;
    }
    onUpdated();
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-pink-200 bg-pink-50/30 p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-900">Edit Week {followup.weekNumber}</h3>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditing(false)} disabled={loading}>
              <X className="h-4 w-4" />
            </Button>
            <Button onClick={save} disabled={loading}>
              <Check className="h-4 w-4" />
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Current Weight"
            type="number"
            step="0.1"
            min="0"
            value={form.currentWeight}
            onChange={(e) => setForm({ ...form, currentWeight: e.target.value })}
          />
          <Input
            label="Meals Deviated"
            type="number"
            min="0"
            required
            value={form.mealsDeviated}
            onChange={(e) => setForm({ ...form, mealsDeviated: e.target.value })}
          />
          <Select
            label="Plan Feedback"
            value={form.planFeedback}
            onChange={(e) => setForm({ ...form, planFeedback: e.target.value })}
          >
            <option value="">—</option>
            {PLAN_FEEDBACK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          {form.planFeedback === "excellent" && (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">What was excellent</label>
              <textarea
                rows={2}
                value={form.feedbackLikedNotes}
                onChange={(e) => setForm({ ...form, feedbackLikedNotes: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          )}
          {form.planFeedback === "poor" && (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">What was poor</label>
              <textarea
                rows={2}
                value={form.feedbackDislikedNotes}
                onChange={(e) => setForm({ ...form, feedbackDislikedNotes: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          )}
          {form.planFeedback === "moderate" && (
            <>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">What felt bad</label>
                <textarea
                  rows={2}
                  value={form.feedbackBadNotes}
                  onChange={(e) => setForm({ ...form, feedbackBadNotes: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">What felt good</label>
                <textarea
                  rows={2}
                  value={form.feedbackGoodNotes}
                  onChange={(e) => setForm({ ...form, feedbackGoodNotes: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </>
          )}
          {(
            [
              ["exerciseDays", "Exercise Days"],
              ["lowWaterDays", "Low Water Days"],
              ["shortSleepDays", "Short Sleep Days"],
              ["missedSupplementDays", "Missed Supplements Days"],
            ] as const
          ).map(([key, label]) => (
            <Select
              key={key}
              label={label}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            >
              {DAY_SCALE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">Week {followup.weekNumber}</h3>
          <p className="text-xs text-slate-500">Submitted {formatDisplayDate(followup.submittedAt)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={startEdit} className="!px-2">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="ghost" onClick={remove} disabled={loading} className="!px-2 text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Weekly Habits</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <DataCell label="Weight (kg)" value={followup.currentWeight} delta={followup.comparison.weight} />
        <DataCell label="Exercise" value={`${followup.exerciseDays}/7 days`} />
        <DataCell label="Low Water" value={`${followup.lowWaterDays}/7 days`} />
        <DataCell label="Sleep <6 hrs" value={`${followup.shortSleepDays}/7 days`} />
        <DataCell label="Missed Supplements" value={`${followup.missedSupplementDays}/7 days`} />
        <DataCell label="Meals Deviated" value={followup.mealsDeviated ?? "—"} />
      </div>

      {(followup.planFeedback ||
        followup.feedbackLikedNotes ||
        followup.feedbackDislikedNotes ||
        followup.feedbackBadNotes ||
        followup.feedbackGoodNotes) && (
        <>
          <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
            Plan Feedback
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <DataCell label="Experience" value={planFeedbackLabel(followup.planFeedback)} />
            {followup.feedbackLikedNotes && (
              <DataCell label="Excellent" value={followup.feedbackLikedNotes} />
            )}
            {followup.feedbackDislikedNotes && (
              <DataCell label="Poor" value={followup.feedbackDislikedNotes} />
            )}
            {followup.feedbackBadNotes && (
              <DataCell label="Felt Bad" value={followup.feedbackBadNotes} />
            )}
            {followup.feedbackGoodNotes && (
              <DataCell label="Felt Good" value={followup.feedbackGoodNotes} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function AdminFollowupList({
  followups,
  onUpdated,
}: {
  followups: AdminFollowupRow[];
  onUpdated: () => void;
}) {
  if (followups.length === 0) {
    return <p className="py-4 text-sm text-slate-500">No submissions yet.</p>;
  }

  return (
    <div className="space-y-3">
      {followups.map((f) => (
        <AdminFollowupWeekCard key={f.id} followup={f} onUpdated={onUpdated} />
      ))}
    </div>
  );
}
