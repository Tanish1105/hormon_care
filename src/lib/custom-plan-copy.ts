type ContentCopy = {
  section?: string | null;
  type: string;
  title: string;
  description: string | null;
  url: string | null;
  content: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  sortOrder: number;
};

type DayCopy = {
  dayNumber: number;
  title: string;
  description: string | null;
  contents: ContentCopy[];
};

type WeekCopy = {
  weekNumber: number;
  title: string;
  description: string | null;
  contents: ContentCopy[];
  days: DayCopy[];
};

function copyContent(c: ContentCopy, withSection: boolean) {
  return {
    ...(withSection
      ? { section: c.section || (c.type === "EXERCISE" ? "EXERCISE" : "RECIPE") }
      : {}),
    type: c.type,
    title: c.title,
    description: c.description,
    url: c.url,
    content: c.content,
    imageUrl: c.imageUrl,
    videoUrl: c.videoUrl,
    sortOrder: c.sortOrder,
  };
}

function createNested<T>(items: T[]) {
  return items.length ? { create: items } : undefined;
}

export function buildWeeksCreateData(
  weeks: WeekCopy[],
  isDayWise: boolean,
  withSection = true
) {
  return weeks.map((week) => ({
    weekNumber: week.weekNumber,
    title: week.title,
    description: week.description,
    contents: createNested(week.contents.map((c) => copyContent(c, withSection))),
    ...(isDayWise
      ? {
          days: {
            create: week.days.map((day) => ({
              dayNumber: day.dayNumber,
              title: day.title,
              description: day.description,
              contents: createNested(day.contents.map((c) => copyContent(c, withSection))),
            })),
          },
        }
      : {}),
  }));
}

export const weekCopyInclude = {
  contents: { orderBy: { sortOrder: "asc" as const } },
  days: {
    include: { contents: { orderBy: { sortOrder: "asc" as const } } },
    orderBy: { dayNumber: "asc" as const },
  },
};
