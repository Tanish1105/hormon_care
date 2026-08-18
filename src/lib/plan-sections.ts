export const PLAN_CONTENT_SECTIONS = ["RECIPE", "EXERCISE", "MEDITATION"] as const;

export type PlanContentSection = (typeof PLAN_CONTENT_SECTIONS)[number];

export const PLAN_SECTION_LABELS: Record<PlanContentSection, string> = {
  RECIPE: "Recipes",
  EXERCISE: "Exercise",
  MEDITATION: "Meditation",
};

export const PLAN_SECTION_LABELS_GU: Record<PlanContentSection, string> = {
  RECIPE: "રેસિપી",
  EXERCISE: "કસરત",
  MEDITATION: "ધ્યાન",
};

export function isPlanContentSection(value: string | null | undefined): value is PlanContentSection {
  return PLAN_CONTENT_SECTIONS.includes(value as PlanContentSection);
}

export function parsePlanContentSection(value: unknown, fallback: PlanContentSection = "RECIPE"): PlanContentSection {
  return typeof value === "string" && isPlanContentSection(value) ? value : fallback;
}

export function contentSection(item: {
  section?: string | null;
  type?: string | null;
}): PlanContentSection {
  if (isPlanContentSection(item.section)) return item.section;
  if (item.type === "EXERCISE") return "EXERCISE";
  return "RECIPE";
}

export function groupContentsBySection<T extends { section?: string | null; type?: string | null }>(
  contents: T[]
): Record<PlanContentSection, T[]> {
  const grouped: Record<PlanContentSection, T[]> = {
    RECIPE: [],
    EXERCISE: [],
    MEDITATION: [],
  };
  for (const item of contents) {
    grouped[contentSection(item)].push(item);
  }
  return grouped;
}

export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
