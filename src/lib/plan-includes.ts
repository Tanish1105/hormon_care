export const DAYS_PER_WEEK = 7;

export const planWeekInclude = {
  contents: { orderBy: { sortOrder: "asc" as const } },
  days: {
    include: { contents: { orderBy: { sortOrder: "asc" as const } } },
    orderBy: { dayNumber: "asc" as const },
  },
};

export const planInclude = {
  weeks: {
    include: planWeekInclude,
    orderBy: { weekNumber: "asc" as const },
  },
};

export const garbhaWeekInclude = {
  contents: { orderBy: { sortOrder: "asc" as const } },
  days: {
    include: { contents: { orderBy: { sortOrder: "asc" as const } } },
    orderBy: { dayNumber: "asc" as const },
  },
};

export const garbhaPlanInclude = {
  weeks: {
    include: garbhaWeekInclude,
    orderBy: { weekNumber: "asc" as const },
  },
};

export const childGuidanceWeekInclude = {
  contents: { orderBy: { sortOrder: "asc" as const } },
  days: {
    include: { contents: { orderBy: { sortOrder: "asc" as const } } },
    orderBy: { dayNumber: "asc" as const },
  },
};

export const childGuidancePlanInclude = {
  weeks: {
    include: childGuidanceWeekInclude,
    orderBy: { weekNumber: "asc" as const },
  },
};

export function createWeekDaysData() {
  return Array.from({ length: DAYS_PER_WEEK }, (_, di) => ({
    dayNumber: di + 1,
    title: `Day ${di + 1}`,
    description: null,
  }));
}

export function createSingleWeekData(weekNumber: number, isDayWise: boolean) {
  return {
    weekNumber,
    title: `Week ${weekNumber}`,
    description: null,
    ...(isDayWise ? { days: { create: createWeekDaysData() } } : {}),
  };
}

export function createWeeksData(totalWeeks: number, isDayWise: boolean) {
  return Array.from({ length: totalWeeks }, (_, wi) => ({
    weekNumber: wi + 1,
    title: `Week ${wi + 1}`,
    description: null,
    ...(isDayWise ? { days: { create: createWeekDaysData() } } : {}),
  }));
}
