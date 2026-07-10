export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

import { getYoutubeVideoId } from "./youtube";

export function getYoutubeEmbedUrl(url: string) {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

export { getYoutubeVideoId };

const DAYS_PER_WEEK = 7;

function getCalendarDaysSinceStart(startDate: Date): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// A week unlocks every 7 calendar days from the start date. So if a patient
// starts on a Monday, week 1 runs Mon→Sun and week 2 unlocks the next Monday.
export function getUnlockedWeek(
  startDate: Date,
  currentWeek: number,
  totalWeeks: number
) {
  const daysSinceStart = getCalendarDaysSinceStart(startDate);
  if (daysSinceStart < 0) return 0;
  const autoWeek = Math.floor(daysSinceStart / DAYS_PER_WEEK) + 1;
  return Math.min(totalWeeks, Math.max(currentWeek, autoWeek));
}

export function isWeekUnlocked(weekNumber: number, unlockedWeek: number) {
  return weekNumber <= unlockedWeek;
}

export function getUnlockedDay(startDate: Date) {
  const daysSinceStart = getCalendarDaysSinceStart(startDate);
  if (daysSinceStart < 0) return 0;
  return (daysSinceStart % DAYS_PER_WEEK) + 1;
}

export function formatDateInputValue(date?: string | Date) {
  const d = date ? new Date(date) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDisplayDate(date?: string | Date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isDayUnlocked(
  dayNumber: number,
  weekNumber: number,
  unlockedWeek: number,
  unlockedDay: number
) {
  if (!isWeekUnlocked(weekNumber, unlockedWeek)) return false;
  if (weekNumber < unlockedWeek) return true;
  return dayNumber <= unlockedDay;
}

/** Weeks fully elapsed on the calendar (used for weekly followup due dates). */
export function getCompletedWeeks(startDate: Date, totalWeeks: number) {
  const daysSinceStart = getCalendarDaysSinceStart(startDate);
  if (daysSinceStart < DAYS_PER_WEEK) return 0;
  return Math.min(totalWeeks, Math.floor(daysSinceStart / DAYS_PER_WEEK));
}
