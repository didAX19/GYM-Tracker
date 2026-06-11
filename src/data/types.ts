export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type ExerciseCategory =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Arms'
  | 'Legs'
  | 'Core'
  | 'Cardio';

/** ISO date string, yyyy-MM-dd */
export type ISODate = string;

export interface BodyWeightEntry {
  id: string;
  date: ISODate;
  weightKg: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  icon: string;
  isCustom: boolean;
}

export interface ExerciseRecord {
  id: string;
  exerciseId: string;
  maxWeightKg: number;
  dateAchieved: ISODate;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
  notes?: string;
  order: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
  isRestDay: boolean;
  exercises: WorkoutExercise[];
}

/** Maps each weekday to a WorkoutDay id, or null for a Rest Day. */
export type WeeklySchedule = Record<WeekdayKey, string | null>;

export interface SetEntry {
  exerciseId: string;
  weightsKg: (number | null)[];
}

export interface WorkoutHistoryEntry {
  id: string;
  date: ISODate;
  workoutDayId: string;
  completed: boolean;
  entries: SetEntry[];
}
