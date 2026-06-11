import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createPersistStorage, makeId, storageKeys } from '@/data/repository';
import { ISODate, SetEntry, WorkoutHistoryEntry } from '@/data/types';

interface HistoryState {
  history: WorkoutHistoryEntry[];
  logWorkout: (workoutDayId: string, date: ISODate, entries: SetEntry[]) => void;
  removeWorkout: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      logWorkout: (workoutDayId, date, entries) =>
        set((s) => ({
          history: [
            { id: makeId(), date, workoutDayId, completed: true, entries },
            ...s.history,
          ],
        })),
      removeWorkout: (id) =>
        set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
    }),
    { name: storageKeys.history, storage: createPersistStorage() }
  )
);

/** Most recent logged weights for an exercise (max weight of that session). */
export function lastSessionMax(
  history: WorkoutHistoryEntry[],
  exerciseId: string
): number | null {
  for (const h of history) {
    const entry = h.entries.find((e) => e.exerciseId === exerciseId);
    if (entry) {
      const weights = entry.weightsKg.filter((w): w is number => w != null && w > 0);
      if (weights.length > 0) return Math.max(...weights);
    }
  }
  return null;
}
