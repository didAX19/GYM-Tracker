import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { BUILT_IN_EXERCISES, CATEGORY_ICONS } from '@/data/builtInExercises';
import { createPersistStorage, makeId, storageKeys } from '@/data/repository';
import { Exercise, ExerciseCategory } from '@/data/types';

interface ExerciseState {
  exercises: Exercise[];
  addCustom: (name: string, category: ExerciseCategory) => Exercise;
  removeCustom: (id: string) => void;
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set) => ({
      exercises: BUILT_IN_EXERCISES,
      addCustom: (name, category) => {
        const exercise: Exercise = {
          id: makeId(),
          name: name.trim(),
          category,
          icon: CATEGORY_ICONS[category],
          isCustom: true,
        };
        set((s) => ({ exercises: [...s.exercises, exercise] }));
        return exercise;
      },
      removeCustom: (id) =>
        set((s) => ({ exercises: s.exercises.filter((e) => !(e.id === id && e.isCustom)) })),
    }),
    {
      name: storageKeys.exercises,
      storage: createPersistStorage(),
      // Re-merge built-ins so new app versions can extend the database.
      merge: (persisted, current) => {
        const stored = (persisted as Partial<ExerciseState> | undefined)?.exercises ?? [];
        const custom = stored.filter((e) => e.isCustom);
        return { ...current, exercises: [...BUILT_IN_EXERCISES, ...custom] };
      },
    }
  )
);
