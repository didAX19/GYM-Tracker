import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createPersistStorage, makeId, storageKeys } from '@/data/repository';
import { WeekdayKey, WeeklySchedule, WorkoutDay, WorkoutExercise } from '@/data/types';

const EMPTY_SCHEDULE: WeeklySchedule = {
  mon: null,
  tue: null,
  wed: null,
  thu: null,
  fri: null,
  sat: null,
  sun: null,
};

interface ProgramState {
  days: WorkoutDay[];
  schedule: WeeklySchedule;
  addDay: (name: string) => WorkoutDay;
  renameDay: (dayId: string, name: string) => void;
  deleteDay: (dayId: string) => void;
  setRestDay: (dayId: string, isRestDay: boolean) => void;
  addExerciseToDay: (dayId: string, exerciseId: string, sets?: number, reps?: number) => void;
  updateWorkoutExercise: (
    dayId: string,
    workoutExerciseId: string,
    patch: Partial<Pick<WorkoutExercise, 'sets' | 'reps' | 'notes'>>
  ) => void;
  removeExerciseFromDay: (dayId: string, workoutExerciseId: string) => void;
  moveExercise: (dayId: string, workoutExerciseId: string, direction: -1 | 1) => void;
  assignDay: (weekday: WeekdayKey, dayId: string | null) => void;
}

function updateDay(days: WorkoutDay[], dayId: string, fn: (d: WorkoutDay) => WorkoutDay) {
  return days.map((d) => (d.id === dayId ? fn(d) : d));
}

function reindex(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return exercises.map((e, i) => ({ ...e, order: i }));
}

export const useProgramStore = create<ProgramState>()(
  persist(
    (set) => ({
      days: [],
      schedule: EMPTY_SCHEDULE,

      addDay: (name) => {
        const day: WorkoutDay = { id: makeId(), name: name.trim(), isRestDay: false, exercises: [] };
        set((s) => ({ days: [...s.days, day] }));
        return day;
      },

      renameDay: (dayId, name) =>
        set((s) => ({ days: updateDay(s.days, dayId, (d) => ({ ...d, name: name.trim() })) })),

      deleteDay: (dayId) =>
        set((s) => {
          const schedule = { ...s.schedule };
          (Object.keys(schedule) as WeekdayKey[]).forEach((k) => {
            if (schedule[k] === dayId) schedule[k] = null;
          });
          return { days: s.days.filter((d) => d.id !== dayId), schedule };
        }),

      setRestDay: (dayId, isRestDay) =>
        set((s) => ({ days: updateDay(s.days, dayId, (d) => ({ ...d, isRestDay })) })),

      addExerciseToDay: (dayId, exerciseId, sets = 3, reps = 10) =>
        set((s) => ({
          days: updateDay(s.days, dayId, (d) => ({
            ...d,
            exercises: reindex([
              ...d.exercises,
              { id: makeId(), exerciseId, sets, reps, order: d.exercises.length },
            ]),
          })),
        })),

      updateWorkoutExercise: (dayId, workoutExerciseId, patch) =>
        set((s) => ({
          days: updateDay(s.days, dayId, (d) => ({
            ...d,
            exercises: d.exercises.map((e) => (e.id === workoutExerciseId ? { ...e, ...patch } : e)),
          })),
        })),

      removeExerciseFromDay: (dayId, workoutExerciseId) =>
        set((s) => ({
          days: updateDay(s.days, dayId, (d) => ({
            ...d,
            exercises: reindex(d.exercises.filter((e) => e.id !== workoutExerciseId)),
          })),
        })),

      moveExercise: (dayId, workoutExerciseId, direction) =>
        set((s) => ({
          days: updateDay(s.days, dayId, (d) => {
            const idx = d.exercises.findIndex((e) => e.id === workoutExerciseId);
            const target = idx + direction;
            if (idx < 0 || target < 0 || target >= d.exercises.length) return d;
            const exercises = [...d.exercises];
            [exercises[idx], exercises[target]] = [exercises[target], exercises[idx]];
            return { ...d, exercises: reindex(exercises) };
          }),
        })),

      assignDay: (weekday, dayId) =>
        set((s) => ({ schedule: { ...s.schedule, [weekday]: dayId } })),
    }),
    { name: storageKeys.program, storage: createPersistStorage() }
  )
);
