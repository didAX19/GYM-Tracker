import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createPersistStorage, makeId, storageKeys } from '@/data/repository';
import { ExerciseRecord, ISODate } from '@/data/types';

interface RecordsState {
  records: ExerciseRecord[];
  /** Returns true when the submitted weight set a new personal record. */
  submitWeight: (exerciseId: string, weightKg: number, date: ISODate) => boolean;
}

export const useRecordsStore = create<RecordsState>()(
  persist(
    (set, get) => ({
      records: [],
      submitWeight: (exerciseId, weightKg, date) => {
        const existing = get().records.find((r) => r.exerciseId === exerciseId);
        if (existing && existing.maxWeightKg >= weightKg) return false;
        set((s) => {
          if (existing) {
            return {
              records: s.records.map((r) =>
                r.exerciseId === exerciseId
                  ? { ...r, maxWeightKg: weightKg, dateAchieved: date }
                  : r
              ),
            };
          }
          return {
            records: [
              ...s.records,
              { id: makeId(), exerciseId, maxWeightKg: weightKg, dateAchieved: date },
            ],
          };
        });
        return true;
      },
    }),
    { name: storageKeys.records, storage: createPersistStorage() }
  )
);
