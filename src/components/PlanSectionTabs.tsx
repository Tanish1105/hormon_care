"use client";

import { ChefHat, Dumbbell, Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PLAN_CONTENT_SECTIONS,
  PLAN_SECTION_LABELS,
  PLAN_SECTION_LABELS_GU,
  type PlanContentSection,
} from "@/lib/plan-sections";

const sectionIcons = {
  RECIPE: ChefHat,
  EXERCISE: Dumbbell,
  MEDITATION: Flower2,
};

export function PlanSectionTabs({
  value,
  onChange,
  counts,
  hideEmpty = false,
  showGujarati = false,
}: {
  value: PlanContentSection;
  onChange: (section: PlanContentSection) => void;
  counts?: Record<PlanContentSection, number>;
  hideEmpty?: boolean;
  showGujarati?: boolean;
}) {
  const sections = PLAN_CONTENT_SECTIONS.filter(
    (section) => !hideEmpty || (counts?.[section] ?? 0) > 0
  );
  if (sections.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {sections.map((section) => {
        const Icon = sectionIcons[section];
        const active = value === section;
        const count = counts?.[section];
        return (
          <button
            key={section}
            type="button"
            onClick={() => onChange(section)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition",
              active
                ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>
              {PLAN_SECTION_LABELS[section]}
              {showGujarati ? (
                <span className={cn("ml-1.5 text-xs font-medium", active ? "text-white/80" : "text-slate-400")}>
                  {PLAN_SECTION_LABELS_GU[section]}
                </span>
              ) : null}
            </span>
            {typeof count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                )}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
