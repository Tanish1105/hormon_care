export const SUPPLEMENT_TIME_OPTIONS = [
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
  "Empty stomach",
  "After breakfast",
  "After lunch",
  "After dinner",
  "Before sleep",
] as const;

export const supplementPlanInclude = {
  items: { orderBy: { sortOrder: "asc" as const } },
};

export type SupplementItemInput = {
  supplementId: string | null;
  name: string;
  time: string;
  quantity: string;
  notes: string | null;
};

export function normalizeSupplementItems(raw: unknown): SupplementItemInput[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const name = String(item.name ?? "").trim();
      if (!name) return null;
      const supplementId =
        typeof item.supplementId === "string" && item.supplementId.trim()
          ? item.supplementId.trim()
          : null;
      return {
        supplementId,
        name,
        time: String(item.time ?? "").trim() || "Morning",
        quantity: String(item.quantity ?? "").trim() || "1",
        notes:
          typeof item.notes === "string" && item.notes.trim()
            ? item.notes.trim()
            : null,
      };
    })
    .filter((item): item is SupplementItemInput => item !== null);
}
