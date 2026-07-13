"use client";

import { useState } from "react";
import { Badge, Button, Card, Input, Textarea } from "@/components/ui";
import {
  CHECKBOX_FIELDS,
  LIFESTYLE_SECTIONS,
  parseJsonArray,
  type LifestyleAnalyticsSummary,
} from "@/lib/lifestyle-assessment";
import {
  STRESS_MAX_SCORE,
  STRESS_QUESTIONS,
  STRESS_QUESTION_KEYS,
  STRESS_RECOMMENDATIONS,
  YES_NO_OPTIONS,
} from "@/lib/stress-screening";
import { formatDisplayDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronDown, ChevronUp, Copy, Check, Pencil } from "lucide-react";

type Highlight = { field: string; label: string; reason: string; severity: "high" | "medium" };

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
  highlights: Highlight[];
  highlightCount: number;
  analytics: LifestyleAnalyticsSummary | null;
};

function getFieldValue(data: Record<string, unknown>, key: string): string {
  const val = data[key];
  if (Array.isArray(val)) return val.join(", ");
  if (val === null || val === undefined) return "—";
  return String(val);
}

function isHighlighted(highlights: Highlight[], field: string) {
  return highlights.find((h) => h.field === field);
}

const riskColors = {
  high: "bg-red-100 text-red-800 ring-red-200",
  medium: "bg-amber-100 text-amber-800 ring-amber-200",
  low: "bg-green-100 text-green-800 ring-green-200",
};

export function AdminLifestyleAssessmentCard({
  item,
  onUpdated,
}: {
  item: AssessmentItem;
  onUpdated: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingRec, setEditingRec] = useState(false);
  const [rec, setRec] = useState(item.doctorRecommendation ?? "");
  const [saving, setSaving] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  async function saveRecommendation() {
    setSaving(true);
    await fetch(`/api/admin/lifestyle-assessments/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorRecommendation: rec }),
    });
    setSaving(false);
    setEditingRec(false);
    onUpdated();
  }

  async function copyFormLink() {
    if (!item.formLink) return;
    await navigator.clipboard.writeText(item.formLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const data = item.data as Record<string, unknown> | null;
  const analytics = item.analytics;
  const riskLevel = analytics?.riskLevel ?? (item.pending ? null : "low");

  return (
    <Card>
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">{item.patientName}</h2>
            <Badge color="slate">{item.username}</Badge>
            {item.pending ? (
              <Badge color="pink">Pending</Badge>
            ) : (
              <Badge color="green">Submitted</Badge>
            )}
            {riskLevel && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset capitalize",
                  riskColors[riskLevel]
                )}
              >
                {riskLevel} risk
              </span>
            )}
            {item.highlightCount > 0 && (
              <Badge color="purple">{item.highlightCount} flags</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Sent {formatDisplayDate(item.requestedAt)}
            {item.submittedAt && ` · Submitted ${formatDisplayDate(item.submittedAt)}`}
            {item.lifestyleScore != null && ` · Score ${item.lifestyleScore}/100`}
            {analytics?.stressLevel && ` · ${analytics.stressLevel}`}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          {item.pending && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-900">
                Patient has not submitted yet. Share the form link below — no login required.
              </p>
              {item.formLink ? (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    readOnly
                    value={item.formLink}
                    className="bg-white font-mono text-xs"
                  />
                  <Button type="button" variant="secondary" onClick={copyFormLink}>
                    {linkCopied ? (
                      <Check className="mr-1 h-4 w-4" />
                    ) : (
                      <Copy className="mr-1 h-4 w-4" />
                    )}
                    {linkCopied ? "Copied!" : "Copy Link"}
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-amber-700">
                  Re-send assessment from Patients to generate a shareable link.
                </p>
              )}
            </div>
          )}

          {analytics && !item.pending && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-800">Analytics Summary</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {analytics.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className={cn(
                      "rounded-lg border bg-white px-3 py-2 text-sm",
                      metric.flagged
                        ? "border-red-200 bg-red-50/50"
                        : "border-slate-200"
                    )}
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {metric.section}
                    </p>
                    <p className="font-medium text-slate-800">{metric.label}</p>
                    <p className={cn("mt-0.5 text-slate-600", metric.flagged && "font-medium text-red-800")}>
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {analytics.highSeverityCount} high · {analytics.mediumSeverityCount} medium severity
                flags
              </p>
            </div>
          )}

          {item.pending ? null : (
            <>
              {item.highlights.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-red-900">
                    <AlertTriangle className="h-4 w-4" />
                    Important for plan creation
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {item.highlights.map((h) => (
                      <li
                        key={h.field}
                        className={cn(
                          "text-sm",
                          h.severity === "high" ? "font-medium text-red-800" : "text-red-700"
                        )}
                      >
                        <strong>{h.label}:</strong> {h.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data && (
                <div className="space-y-4">
                  {LIFESTYLE_SECTIONS.map((section) => {
                    if ("type" in section && section.type === "stress-screening") {
                      const score = data.stressScreeningScore as number | undefined;
                      const level = data.stressLevel as string | undefined;
                      return (
                        <div key={section.id} className="overflow-hidden rounded-xl border border-slate-200">
                          <div className="border-b border-blue-100 bg-blue-50 px-4 py-2">
                            <h4 className="text-sm font-semibold text-blue-900">
                              {section.id}. {section.title}
                            </h4>
                          </div>
                          <div className="divide-y divide-slate-100">
                            {STRESS_QUESTION_KEYS.map((key, index) => {
                              const answer = data[key] as number | undefined;
                              const option = YES_NO_OPTIONS.find((o) => o.value === answer);
                              return (
                                <div key={key} className="flex flex-wrap justify-between gap-2 px-4 py-2.5 text-sm">
                                  <span className="font-medium text-slate-700">
                                    {index + 1}. {STRESS_QUESTIONS[key].en}
                                  </span>
                                  <span className="text-slate-900">{option ? option.en : "—"}</span>
                                </div>
                              );
                            })}
                            <div
                              className={cn(
                                "flex flex-wrap justify-between gap-2 px-4 py-3 text-sm",
                                isHighlighted(item.highlights, "stressLevel") &&
                                  "bg-red-50 ring-1 ring-inset ring-red-200"
                              )}
                            >
                              <span className="font-semibold text-slate-800">Stress Score</span>
                              <span className="font-semibold text-slate-900">
                                {score != null ? `${score}/${STRESS_MAX_SCORE}` : "—"}
                                {level && ` · ${level}`}
                              </span>
                            </div>
                            {level && STRESS_RECOMMENDATIONS[level as keyof typeof STRESS_RECOMMENDATIONS] && (
                              <div className="px-4 py-2.5 text-sm text-slate-600">
                                {STRESS_RECOMMENDATIONS[level as keyof typeof STRESS_RECOMMENDATIONS].en}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={section.id} className="overflow-hidden rounded-xl border border-slate-200">
                        <div className="border-b border-blue-100 bg-blue-50 px-4 py-2">
                          <h4 className="text-sm font-semibold text-blue-900">
                            {section.id}. {section.title}
                          </h4>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {section.fields.map((field) => {
                            const highlight = isHighlighted(item.highlights, field.key);
                            const display = CHECKBOX_FIELDS.has(field.key)
                              ? getFieldValue(
                                  {
                                    ...data,
                                    [field.key]: Array.isArray(data[field.key])
                                      ? data[field.key]
                                      : parseJsonArray(data[field.key] as string),
                                  },
                                  field.key
                                )
                              : field.key === "bmi"
                                ? String(data.bmi ?? "—")
                                : getFieldValue(data, field.key);

                            return (
                              <div
                                key={field.key}
                                className={cn(
                                  "flex flex-wrap justify-between gap-2 px-4 py-2.5 text-sm",
                                  highlight &&
                                    (highlight.severity === "high"
                                      ? "bg-red-50 ring-1 ring-inset ring-red-200"
                                      : "bg-amber-50 ring-1 ring-inset ring-amber-200")
                                )}
                              >
                                <span className="font-medium text-slate-700">{field.label}</span>
                                <span className={cn("text-slate-900", highlight && "font-semibold")}>
                                  {display}
                                  {highlight && (
                                    <span className="ml-2 text-xs text-red-600">⚠ {highlight.reason}</span>
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-800">Doctor Recommendation</h4>
                  {!editingRec && (
                    <Button variant="ghost" className="!px-2" onClick={() => setEditingRec(true)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {editingRec ? (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      rows={3}
                      value={rec}
                      onChange={(e) => setRec(e.target.value)}
                      placeholder="Plan notes for this patient..."
                    />
                    <div className="flex gap-2">
                      <Button onClick={saveRecommendation} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="ghost" onClick={() => setEditingRec(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {item.doctorRecommendation || "No recommendation added yet."}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
