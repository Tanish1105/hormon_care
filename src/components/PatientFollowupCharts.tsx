"use client";

import { useMemo } from "react";
import type { AdminFollowupRow } from "@/components/AdminFollowupWeekCard";
import { Card } from "@/components/ui";

type ChartPoint = { week: number; value: number };

type ChartSeries = {
  id: string;
  label: string;
  color: string;
  points: ChartPoint[];
};

const CHART_W = 560;
const CHART_H = 200;
const PAD = { top: 16, right: 16, bottom: 32, left: 44 };

function buildSeries(
  followups: AdminFollowupRow[],
  id: string,
  label: string,
  color: string,
  getValue: (row: AdminFollowupRow) => number | null
): ChartSeries | null {
  const points = followups
    .map((row) => {
      const value = getValue(row);
      return value === null ? null : { week: row.weekNumber, value };
    })
    .filter((p): p is ChartPoint => p !== null);

  if (points.length === 0) return null;
  return { id, label, color, points };
}

function FollowupLineChart({
  title,
  series,
  yMax,
  unit,
}: {
  title: string;
  series: ChartSeries[];
  yMax?: number;
  unit?: string;
}) {
  const plotW = CHART_W - PAD.left - PAD.right;
  const plotH = CHART_H - PAD.top - PAD.bottom;

  const { minY, maxY, weeks, paths, dots } = useMemo(() => {
    const allValues = series.flatMap((s) => s.points.map((p) => p.value));
    const allWeeks = [...new Set(series.flatMap((s) => s.points.map((p) => p.week)))].sort(
      (a, b) => a - b
    );

    let min = Math.min(...allValues);
    let max = Math.max(...allValues);
    if (yMax !== undefined) {
      min = 0;
      max = yMax;
    } else if (min === max) {
      min = min - 1;
      max = max + 1;
    } else {
      const pad = (max - min) * 0.12 || 1;
      min = Math.max(0, min - pad);
      max = max + pad;
    }

    const weekMin = allWeeks[0] ?? 1;
    const weekMax = allWeeks[allWeeks.length - 1] ?? 1;
    const weekSpan = Math.max(weekMax - weekMin, 1);

    const xForWeek = (week: number) =>
      PAD.left + ((week - weekMin) / weekSpan) * plotW;
    const yForValue = (value: number) =>
      PAD.top + plotH - ((value - min) / (max - min)) * plotH;

    const linePaths = series.map((s) => {
      const sorted = [...s.points].sort((a, b) => a.week - b.week);
      const d = sorted
        .map((p, i) => `${i === 0 ? "M" : "L"} ${xForWeek(p.week)} ${yForValue(p.value)}`)
        .join(" ");
      const dotEls = sorted.map((p) => ({
        cx: xForWeek(p.week),
        cy: yForValue(p.value),
        value: p.value,
        week: p.week,
        color: s.color,
      }));
      return { id: s.id, color: s.color, d, dots: dotEls };
    });

    return { minY: min, maxY: max, weeks: allWeeks, paths: linePaths, dots: linePaths };
  }, [series, yMax, plotW, plotH]);

  if (series.length === 0) return null;

  const gridLines = 4;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => {
    const value = minY + ((maxY - minY) * i) / gridLines;
    const y = PAD.top + plotH - (i / gridLines) * plotH;
    return { value, y };
  });

  const weekMin = weeks[0] ?? 1;
  const weekMax = weeks[weeks.length - 1] ?? 1;
  const weekSpan = Math.max(weekMax - weekMin, 1);
  const xForWeek = (week: number) =>
    PAD.left + ((week - weekMin) / weekSpan) * plotW;

  return (
    <Card className="!p-4">
      <h4 className="mb-3 text-sm font-semibold text-slate-800">{title}</h4>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full min-w-[320px]"
          role="img"
          aria-label={title}
        >
          {yTicks.map((tick) => (
            <g key={tick.y}>
              <line
                x1={PAD.left}
                y1={tick.y}
                x2={CHART_W - PAD.right}
                y2={tick.y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
              <text
                x={PAD.left - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px]"
              >
                {Math.round(tick.value * 10) / 10}
                {unit && tick.value === maxY ? ` ${unit}` : ""}
              </text>
            </g>
          ))}

          {weeks.map((week) => (
            <text
              key={week}
              x={xForWeek(week)}
              y={CHART_H - 8}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] font-medium"
            >
              W{week}
            </text>
          ))}

          {paths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              fill="none"
              stroke={path.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {dots.flatMap((path) =>
            path.dots.map((dot) => (
              <g key={`${path.id}-${dot.week}`}>
                <circle cx={dot.cx} cy={dot.cy} r={5} fill="white" stroke={dot.color} strokeWidth={2} />
                <title>{`Week ${dot.week}: ${dot.value}${unit ? ` ${unit}` : ""}`}</title>
              </g>
            ))
          )}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {series.map((s) => (
          <span key={s.id} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

function FollowupBarChart({
  title,
  followups,
  metrics,
}: {
  title: string;
  followups: AdminFollowupRow[];
  metrics: { id: string; label: string; color: string; getValue: (row: AdminFollowupRow) => number }[];
}) {
  const weeks = followups.map((f) => f.weekNumber);
  if (weeks.length === 0) return null;

  const barGroupW = plotGroupWidth(weeks.length, metrics.length);
  const totalW = Math.max(CHART_W, PAD.left + PAD.right + barGroupW * weeks.length);
  const plotH = CHART_H - PAD.top - PAD.bottom;
  const yMax = 7;

  function yForValue(value: number) {
    return PAD.top + plotH - (value / yMax) * plotH;
  }

  return (
    <Card className="!p-4">
      <h4 className="mb-3 text-sm font-semibold text-slate-800">{title}</h4>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${totalW} ${CHART_H}`} className="w-full min-w-[320px]" role="img" aria-label={title}>
          {[0, 2, 4, 6, 7].map((tick) => {
            const y = yForValue(tick);
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={totalW - PAD.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text x={PAD.left - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
                  {tick}
                </text>
              </g>
            );
          })}

          {followups.map((row, wi) => {
            const groupX = PAD.left + wi * barGroupW + barGroupW * 0.15;
            const barW = (barGroupW * 0.7) / metrics.length;

            return (
              <g key={row.weekNumber}>
                <text
                  x={PAD.left + wi * barGroupW + barGroupW / 2}
                  y={CHART_H - 8}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px] font-medium"
                >
                  W{row.weekNumber}
                </text>
                {metrics.map((m, mi) => {
                  const value = m.getValue(row);
                  const barH = (value / yMax) * plotH;
                  const x = groupX + mi * barW;
                  const y = PAD.top + plotH - barH;
                  return (
                    <rect
                      key={m.id}
                      x={x}
                      y={y}
                      width={Math.max(barW - 2, 4)}
                      height={barH}
                      rx={2}
                      fill={m.color}
                      opacity={0.85}
                    >
                      <title>{`${m.label} W${row.weekNumber}: ${value}/7`}</title>
                    </rect>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {metrics.map((m) => (
          <span key={m.id} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
            {m.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

function plotGroupWidth(weekCount: number, metricCount: number) {
  const total = CHART_W - PAD.left - PAD.right;
  return Math.max(total / Math.max(weekCount, 1), metricCount * 14);
}

export function PatientFollowupCharts({ followups }: { followups: AdminFollowupRow[] }) {
  const sorted = useMemo(
    () => [...followups].sort((a, b) => a.weekNumber - b.weekNumber),
    [followups]
  );

  if (sorted.length < 1) {
    return (
      <p className="mb-4 text-sm text-slate-500">
        At least 1 week submission needed to show comparison charts.
      </p>
    );
  }

  const weightSeries = buildSeries(sorted, "weight", "Weight (kg)", "#db2777", (r) => r.currentWeight);
  const measurementSeries = [
    buildSeries(sorted, "waist", "Waist", "#9333ea", (r) => r.waist),
    buildSeries(sorted, "chest", "Chest", "#2563eb", (r) => r.chest),
    buildSeries(sorted, "thigh", "Thigh", "#16a34a", (r) => r.thigh),
    buildSeries(sorted, "hip", "Hip", "#d97706", (r) => r.hip),
    buildSeries(sorted, "arm", "Arm", "#0891b2", (r) => r.arm),
    buildSeries(sorted, "neck", "Neck", "#64748b", (r) => r.neck),
  ].filter((s): s is ChartSeries => s !== null);

  const habitMetrics = [
    { id: "exercise", label: "Exercise", color: "#db2777", getValue: (r: AdminFollowupRow) => r.exerciseDays },
    { id: "water", label: "Low Water", color: "#2563eb", getValue: (r: AdminFollowupRow) => r.lowWaterDays },
    { id: "sleep", label: "Sleep <6h", color: "#4f46e5", getValue: (r: AdminFollowupRow) => r.shortSleepDays },
    {
      id: "supplements",
      label: "Missed Supplements",
      color: "#ea580c",
      getValue: (r: AdminFollowupRow) => r.missedSupplementDays,
    },
  ];

  return (
    <div className="mb-6 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Week-by-week comparison charts
      </h3>
      <div className="grid gap-4 lg:grid-cols-2">
        {weightSeries && (
          <FollowupLineChart
            title="Weight trend"
            series={[weightSeries]}
            unit="kg"
          />
        )}
        {measurementSeries.length > 0 && (
          <FollowupLineChart title="Body measurements (cms)" series={measurementSeries} unit="cms" />
        )}
        <div className={measurementSeries.length > 0 && weightSeries ? "lg:col-span-2" : ""}>
          <FollowupBarChart title="Weekly habits (days per week)" followups={sorted} metrics={habitMetrics} />
        </div>
      </div>
      {sorted.length === 1 && (
        <p className="text-xs text-slate-400">
          More weeks will show clearer trend lines as patient submits followups.
        </p>
      )}
    </div>
  );
}
