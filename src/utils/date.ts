import { addDays, format, isWithinInterval, parseISO, startOfWeek, subDays } from 'date-fns';

import { ISODate, WeekdayKey } from '@/data/types';

export const WEEKDAY_KEYS: WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export function toISODate(d: Date): ISODate {
  return format(d, 'yyyy-MM-dd');
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function weekdayKeyOf(d: Date): WeekdayKey {
  // getDay(): 0 = Sunday ... 6 = Saturday
  const map: WeekdayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[d.getDay()];
}

export function todayWeekdayKey(): WeekdayKey {
  return weekdayKeyOf(new Date());
}

/** Date of the given weekday within the current week (Monday-based). */
export function dateOfWeekdayThisWeek(key: WeekdayKey): Date {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return addDays(monday, WEEKDAY_KEYS.indexOf(key));
}

export function isInCurrentWeek(iso: ISODate): boolean {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return isWithinInterval(parseISO(iso), { start: monday, end: addDays(monday, 7) });
}

export function isWithinLastDays(iso: ISODate, days: number): boolean {
  const start = subDays(new Date(), days);
  return parseISO(iso) >= start;
}

export function formatFriendly(iso: ISODate): string {
  return format(parseISO(iso), 'MMM d, yyyy');
}

export function formatShort(iso: ISODate): string {
  return format(parseISO(iso), 'MMM d');
}
