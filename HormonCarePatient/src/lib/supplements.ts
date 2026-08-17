import type { SupplementItem } from '../api/client';
import type { TranslationKey } from '../i18n/translations';

export const SUPPLEMENT_TIME_ORDER = [
  'Empty stomach',
  'Morning',
  'After breakfast',
  'Afternoon',
  'After lunch',
  'Evening',
  'After dinner',
  'Night',
  'Before sleep',
] as const;

const TIME_LABEL: Record<string, TranslationKey> = {
  'Empty stomach': 'timeEmptyStomach',
  Morning: 'timeMorning',
  'After breakfast': 'timeAfterBreakfast',
  Afternoon: 'timeAfternoon',
  'After lunch': 'timeAfterLunch',
  Evening: 'timeEvening',
  'After dinner': 'timeAfterDinner',
  Night: 'timeNight',
  'Before sleep': 'timeBeforeSleep',
};

export function supplementTimeLabel(
  time: string,
  t: (key: TranslationKey) => string,
): string {
  const key = TIME_LABEL[time.trim()];
  return key ? t(key) : time;
}

export function groupSupplementItems(items: SupplementItem[]) {
  const groups = new Map<string, SupplementItem[]>();
  for (const item of items) {
    const time = (item.time || '').trim() || 'Morning';
    const list = groups.get(time) ?? [];
    list.push(item);
    groups.set(time, list);
  }

  const known = SUPPLEMENT_TIME_ORDER.filter(time => groups.has(time)).map(
    time => ({ time, items: groups.get(time)! }),
  );
  const extra = [...groups.keys()]
    .filter(
      time =>
        !(SUPPLEMENT_TIME_ORDER as readonly string[]).includes(time),
    )
    .sort((a, b) => a.localeCompare(b))
    .map(time => ({ time, items: groups.get(time)! }));

  return [...known, ...extra];
}
