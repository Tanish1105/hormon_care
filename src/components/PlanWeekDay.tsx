import { cn } from "@/lib/utils";
import { Lock, CheckCircle2 } from "lucide-react";

type ContentRef = { id: string };

type DayInfo = {
  id: string;
  dayNumber: number;
  title: string;
  contents?: ContentRef[];
};

type WeekInfo = {
  id: string;
  weekNumber: number;
  title: string;
  contents?: ContentRef[];
  days?: DayInfo[];
};

type WeekSelectorProps = {
  weeks: WeekInfo[];
  activeWeek: number;
  onSelectWeek: (week: number) => void;
  isWeekLocked?: (weekNumber: number) => boolean;
  variant?: "admin" | "patient";
  isDayWise?: boolean;
};

function getWeekContentCount(week: WeekInfo, isDayWise?: boolean) {
  if (isDayWise && week.days) {
    return week.days.reduce((sum, day) => sum + (day.contents?.length ?? 0), 0);
  }
  return week.contents?.length ?? 0;
}

export function WeekSelector({
  weeks,
  activeWeek,
  onSelectWeek,
  isWeekLocked,
  variant = "admin",
  isDayWise = false,
}: WeekSelectorProps) {
  return (
    <div className="space-y-2">
      {weeks.map((w) => {
        const locked = isWeekLocked?.(w.weekNumber) ?? false;
        const active = activeWeek === w.weekNumber;
        const contentCount = getWeekContentCount(w, isDayWise);
        const hasContent = contentCount > 0;

        return (
          <button
            key={w.id}
            type="button"
            disabled={locked}
            onClick={() => onSelectWeek(w.weekNumber)}
            className={cn(
              "relative flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition",
              locked && "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60",
              !locked && active && variant === "admin" && "border-pink-500 bg-pink-50",
              !locked && active && variant === "patient" && "border-purple-500 bg-purple-50",
              !locked && !active && "border-slate-200 bg-white hover:border-pink-200"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold",
                active && variant === "admin" && "bg-pink-600 text-white",
                active && variant === "patient" && "bg-purple-600 text-white",
                !active && "bg-slate-100 text-slate-700"
              )}
            >
              W{w.weekNumber}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{w.title}</p>
              <p className="text-xs text-slate-500">
                {isDayWise
                  ? `${w.days?.length ?? 7} days · ${contentCount} item${contentCount !== 1 ? "s" : ""}`
                  : `${contentCount} item${contentCount !== 1 ? "s" : ""}`}
              </p>
            </div>
            {locked && <Lock className="h-4 w-4 shrink-0 text-slate-400" />}
            {!locked && hasContent && variant === "admin" && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}

type DaySelectorProps = {
  days: DayInfo[];
  activeDay: number;
  onSelectDay: (day: number) => void;
  isDayLocked?: (dayNumber: number) => boolean;
  variant?: "admin" | "patient";
};

export function DaySelector({
  days,
  activeDay,
  onSelectDay,
  isDayLocked,
  variant = "admin",
}: DaySelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((d) => {
        const locked = isDayLocked?.(d.dayNumber) ?? false;
        const active = activeDay === d.dayNumber;
        const contentCount = d.contents?.length ?? 0;

        return (
          <button
            key={d.id}
            type="button"
            disabled={locked}
            onClick={() => onSelectDay(d.dayNumber)}
            className={cn(
              "shrink-0 rounded-xl border-2 px-3 py-2 text-left transition sm:px-4",
              locked && "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60",
              !locked && active && variant === "admin" && "border-pink-500 bg-pink-50",
              !locked && active && variant === "patient" && "border-purple-500 bg-purple-50",
              !locked && !active && "border-slate-200 bg-white hover:border-pink-200"
            )}
          >
            <p className="text-sm font-semibold text-slate-900">Day {d.dayNumber}</p>
            <p className="text-[10px] text-slate-500">
              {locked ? "Locked" : `${contentCount} item${contentCount !== 1 ? "s" : ""}`}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export function PlanBreadcrumb({
  planTitle,
  weekNumber,
  dayNumber,
}: {
  planTitle: string;
  weekNumber: number;
  dayNumber?: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
      <span className="font-medium text-slate-700">{planTitle}</span>
      <span>/</span>
      <span className="rounded bg-pink-100 px-2 py-0.5 font-medium text-pink-700">
        Week {weekNumber}
      </span>
      {dayNumber != null && (
        <>
          <span>/</span>
          <span className="rounded bg-purple-100 px-2 py-0.5 font-medium text-purple-700">
            Day {dayNumber}
          </span>
        </>
      )}
    </div>
  );
}

export function PatientWeekPicker({
  weeks,
  activeWeek,
  unlockedWeek,
  onSelectWeek,
  isDayWise,
}: {
  weeks: WeekInfo[];
  activeWeek: number;
  unlockedWeek: number;
  onSelectWeek: (week: number) => void;
  isDayWise?: boolean;
}) {
  const unlockedWeeks = weeks.filter((w) => w.weekNumber <= unlockedWeek);

  if (unlockedWeeks.length <= 1) return null;

  return (
    <div className="rounded-xl border border-purple-100 bg-white p-3 shadow-sm sm:p-4">
      <p className="mb-2 text-xs font-medium text-slate-500">સપ્તાહ પસંદ કરો</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {unlockedWeeks.map((w) => {
          const active = activeWeek === w.weekNumber;
          const isCurrent = w.weekNumber === unlockedWeek;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onSelectWeek(w.weekNumber)}
              className={cn(
                "shrink-0 rounded-full border-2 px-4 py-2 text-sm font-medium transition",
                active
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-purple-200"
              )}
            >
              Week {w.weekNumber}
              {isCurrent && <span className="ml-1 text-[10px] text-green-600">●</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PatientDayPicker({
  days,
  activeDay,
  unlockedDay,
  unlockedWeek,
  activeWeek,
  onSelectDay,
}: {
  days: DayInfo[];
  activeDay: number;
  unlockedDay: number;
  unlockedWeek: number;
  activeWeek: number;
  onSelectDay: (day: number) => void;
}) {
  const maxDay = activeWeek < unlockedWeek ? 7 : unlockedDay;
  const unlockedDays = days.filter((d) => d.dayNumber <= maxDay);

  if (unlockedDays.length <= 1) return null;

  return (
    <div className="rounded-xl border border-pink-100 bg-white p-3 shadow-sm sm:p-4">
      <p className="mb-2 text-xs font-medium text-slate-500">દિવસ પસંદ કરો</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {unlockedDays.map((d) => {
          const active = activeDay === d.dayNumber;
          const isCurrent = d.dayNumber === unlockedDay && activeWeek === unlockedWeek;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelectDay(d.dayNumber)}
              className={cn(
                "shrink-0 rounded-full border-2 px-3 py-2 text-sm font-medium transition sm:px-4",
                active
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-pink-200"
              )}
            >
              Day {d.dayNumber}
              {isCurrent && <span className="ml-1 text-[10px] text-green-600">●</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
