import { BodyWeightEntry, WorkoutDay } from '@/data/types';
import { isWithinLastDays } from './date';

const MINUTES_PER_SET = 3;

export function estimateDurationMin(day: WorkoutDay): number {
  const totalSets = day.exercises.reduce((sum, e) => sum + e.sets, 0);
  return Math.max(totalSets * MINUTES_PER_SET, 10);
}

export function formatWeight(kg: number): string {
  const rounded = Math.round(kg * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)} kg`;
}

/** Entries sorted by date descending. */
export function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Change vs the most recent entry that is at least ~a week old. */
export function weeklyWeightChange(entries: BodyWeightEntry[]): number | null {
  const sorted = sortByDateDesc(entries);
  if (sorted.length < 2) return null;
  const current = sorted[0];
  const older = sorted.find((e) => !isWithinLastDays(e.date, 7));
  const baseline = older ?? sorted[sorted.length - 1];
  if (baseline.id === current.id) return null;
  return current.weightKg - baseline.weightKg;
}
