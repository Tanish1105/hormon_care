import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type WeekRow = { id: string; imageUrl?: string | null };

async function loadImageMap(table: "PlanWeek" | "GarbhaWeek" | "ChildGuidanceWeek", ids: string[]) {
  if (!ids.length) return new Map<string, string | null>();

  try {
    const rows =
      table === "PlanWeek"
        ? await prisma.$queryRaw<{ id: string; imageUrl: string | null }[]>`
            SELECT id, imageUrl FROM PlanWeek WHERE id IN (${Prisma.join(ids)})
          `
        : table === "GarbhaWeek"
          ? await prisma.$queryRaw<{ id: string; imageUrl: string | null }[]>`
              SELECT id, imageUrl FROM GarbhaWeek WHERE id IN (${Prisma.join(ids)})
            `
          : await prisma.$queryRaw<{ id: string; imageUrl: string | null }[]>`
              SELECT id, imageUrl FROM ChildGuidanceWeek WHERE id IN (${Prisma.join(ids)})
            `;

    return new Map(rows.map((row) => [row.id, row.imageUrl]));
  } catch (error) {
    console.error(`week image lookup failed (${table}):`, error);
    return new Map<string, string | null>();
  }
}

export async function attachWeekImageUrls<T extends { weeks: WeekRow[] }>(
  plan: T | null,
  table: "PlanWeek" | "GarbhaWeek" | "ChildGuidanceWeek",
): Promise<T | null> {
  if (!plan?.weeks?.length) return plan;

  const map = await loadImageMap(
    table,
    plan.weeks.map((week) => week.id),
  );

  return {
    ...plan,
    weeks: plan.weeks.map((week) => ({
      ...week,
      imageUrl: map.get(week.id) ?? week.imageUrl ?? null,
    })),
  };
}
