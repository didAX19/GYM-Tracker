import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createPersistStorage, storageKeys } from '@/data/repository';
import { ISODate } from '@/data/types';

/**
 * The single in-progress workout session. Persisted so entered weights
 * survive app restarts; only one session can exist at a time.
 */
export interface ActiveSession {
  workoutDayId: string;
  date: ISODate;
  /** weights[workoutExerciseId][setIndex] = raw text input */
  weights: Record<string, string[]>;
}

interface SessionState {
  session: ActiveSession | null;
  startSession: (workoutDayId: string, date: ISODate) => void;
  setWeight: (workoutExerciseId: string, setIndex: number, sets: number, value: string) => void;
  /** Discard the session (cancel, or finished and logged elsewhere). */
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      startSession: (workoutDayId, date) =>
        set({ session: { workoutDayId, date, weights: {} } }),
      setWeight: (workoutExerciseId, setIndex, sets, value) =>
        set((s) => {
          if (!s.session) return s;
          const arr = [...(s.session.weights[workoutExerciseId] ?? Array(sets).fill(''))];
          arr[setIndex] = value.replace(',', '.');
          return {
            session: {
              ...s.session,
              weights: { ...s.session.weights, [workoutExerciseId]: arr },
            },
          };
        }),
      clearSession: () => set({ session: null }),
    }),
    { name: storageKeys.session, storage: createPersistStorage() }
  )
);
