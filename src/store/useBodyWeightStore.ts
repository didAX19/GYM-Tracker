import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createPersistStorage, makeId, storageKeys } from '@/data/repository';
import { BodyWeightEntry, ISODate } from '@/data/types';
import { sortByDateDesc } from '@/utils/calc';

interface BodyWeightState {
  entries: BodyWeightEntry[];
  addEntry: (weightKg: number, date: ISODate) => void;
  removeEntry: (id: string) => void;
}

export const useBodyWeightStore = create<BodyWeightState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (weightKg, date) =>
        set((s) => {
          // One entry per day: replace any existing entry for the same date.
          const others = s.entries.filter((e) => e.date !== date);
          return { entries: sortByDateDesc([...others, { id: makeId(), date, weightKg }]) };
        }),
      removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    { name: storageKeys.bodyWeight, storage: createPersistStorage() }
  )
);
