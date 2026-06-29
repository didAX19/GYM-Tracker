import type { PRResult } from '@/components/PRCelebration';
import { SetEntry, WorkoutDay } from '@/data/types';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useRecordsStore } from '@/store/useRecordsStore';
import { ActiveSession, useSessionStore } from '@/store/useSessionStore';

/** Convert the raw text inputs of a session into typed set entries for a day. */
export function sessionToEntries(session: ActiveSession, day: WorkoutDay): SetEntry[] {
  return day.exercises.map((we) => {
    const inputs = session.weights[we.id] ?? [];
    const weightsKg = Array.from({ length: we.sets }, (_, i) => {
      const v = parseFloat(inputs[i]);
      return Number.isFinite(v) && v > 0 ? v : null;
    });
    return { exerciseId: we.exerciseId, weightsKg };
  });
}

/** True when at least one set has a usable (> 0) weight entered. */
export function sessionHasInput(session: ActiveSession): boolean {
  return Object.values(session.weights).some((arr) =>
    arr.some((v) => parseFloat(v) > 0)
  );
}

/**
 * Persist a session as a completed workout: logs history under the session's
 * own date, submits weights for PR detection, then clears the session.
 * Returns any new personal records (empty when none). Shared by the manual
 * "Finish" action and the automatic day-rollover completion.
 */
export function commitSession(session: ActiveSession, day: WorkoutDay): PRResult[] {
  const entries = sessionToEntries(session, day);
  const submitWeight = useRecordsStore.getState().submitWeight;
  const exercises = useExerciseStore.getState().exercises;

  const newPrs: PRResult[] = [];
  for (const entry of entries) {
    const max = Math.max(
      0,
      ...entry.weightsKg.filter((w): w is number => w != null && w > 0)
    );
    if (max > 0 && submitWeight(entry.exerciseId, max, session.date)) {
      newPrs.push({
        exerciseName: exercises.find((e) => e.id === entry.exerciseId)?.name ?? 'Exercise',
        weightKg: max,
      });
    }
  }

  useHistoryStore.getState().logWorkout(day.id, session.date, entries);
  useSessionStore.getState().clearSession();
  return newPrs;
}
