type ContentCopy = {
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

function copyContent(c: ContentCopy) {
  return {
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

export function buildWeeksCreateData(weeks: WeekCopy[], isDayWise: boolean) {
  return weeks.map((week) => ({
    weekNumber: week.weekNumber,
    title: week.title,
    description: week.description,
    contents: { create: week.contents.map(copyContent) },
    ...(isDayWise
      ? {
          days: {
            create: week.days.map((day) => ({
              dayNumber: day.dayNumber,
              title: day.title,
              description: day.description,
              contents: { create: day.contents.map(copyContent) },
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
