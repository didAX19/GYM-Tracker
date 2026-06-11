import { Exercise, ExerciseCategory } from './types';

export const CATEGORY_ICONS: Record<ExerciseCategory, string> = {
  Chest: '🏋️',
  Back: '🚣',
  Shoulders: '🤸',
  Arms: '💪',
  Legs: '🦵',
  Core: '🧘',
  Cardio: '🏃',
};

export const CATEGORIES: ExerciseCategory[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Cardio',
];

function ex(id: string, name: string, category: ExerciseCategory): Exercise {
  return { id, name, category, icon: CATEGORY_ICONS[category], isCustom: false };
}

export const BUILT_IN_EXERCISES: Exercise[] = [
  // Chest
  ex('bi-bench-press', 'Bench Press', 'Chest'),
  ex('bi-incline-bench', 'Incline Bench Press', 'Chest'),
  ex('bi-db-bench', 'Dumbbell Bench Press', 'Chest'),
  ex('bi-incline-db-press', 'Incline Dumbbell Press', 'Chest'),
  ex('bi-chest-fly', 'Chest Fly', 'Chest'),
  ex('bi-cable-crossover', 'Cable Crossover', 'Chest'),
  ex('bi-dips', 'Dips', 'Chest'),
  ex('bi-push-up', 'Push-Up', 'Chest'),
  // Back
  ex('bi-deadlift', 'Deadlift', 'Back'),
  ex('bi-pull-up', 'Pull-Up', 'Back'),
  ex('bi-lat-pulldown', 'Lat Pulldown', 'Back'),
  ex('bi-barbell-row', 'Barbell Row', 'Back'),
  ex('bi-db-row', 'Dumbbell Row', 'Back'),
  ex('bi-seated-cable-row', 'Seated Cable Row', 'Back'),
  ex('bi-t-bar-row', 'T-Bar Row', 'Back'),
  ex('bi-face-pull', 'Face Pull', 'Back'),
  // Shoulders
  ex('bi-overhead-press', 'Overhead Press', 'Shoulders'),
  ex('bi-db-shoulder-press', 'Dumbbell Shoulder Press', 'Shoulders'),
  ex('bi-lateral-raise', 'Lateral Raise', 'Shoulders'),
  ex('bi-front-raise', 'Front Raise', 'Shoulders'),
  ex('bi-rear-delt-fly', 'Rear Delt Fly', 'Shoulders'),
  ex('bi-arnold-press', 'Arnold Press', 'Shoulders'),
  ex('bi-shrugs', 'Shrugs', 'Shoulders'),
  // Arms
  ex('bi-barbell-curl', 'Barbell Curl', 'Arms'),
  ex('bi-db-curl', 'Dumbbell Curl', 'Arms'),
  ex('bi-hammer-curl', 'Hammer Curl', 'Arms'),
  ex('bi-preacher-curl', 'Preacher Curl', 'Arms'),
  ex('bi-triceps-pushdown', 'Triceps Pushdown', 'Arms'),
  ex('bi-skull-crusher', 'Skull Crusher', 'Arms'),
  ex('bi-overhead-triceps', 'Overhead Triceps Extension', 'Arms'),
  ex('bi-close-grip-bench', 'Close-Grip Bench Press', 'Arms'),
  // Legs
  ex('bi-squat', 'Squat', 'Legs'),
  ex('bi-front-squat', 'Front Squat', 'Legs'),
  ex('bi-leg-press', 'Leg Press', 'Legs'),
  ex('bi-romanian-deadlift', 'Romanian Deadlift', 'Legs'),
  ex('bi-lunges', 'Lunges', 'Legs'),
  ex('bi-leg-extension', 'Leg Extension', 'Legs'),
  ex('bi-leg-curl', 'Leg Curl', 'Legs'),
  ex('bi-calf-raise', 'Calf Raise', 'Legs'),
  ex('bi-hip-thrust', 'Hip Thrust', 'Legs'),
  ex('bi-bulgarian-split-squat', 'Bulgarian Split Squat', 'Legs'),
  // Core
  ex('bi-plank', 'Plank', 'Core'),
  ex('bi-crunches', 'Crunches', 'Core'),
  ex('bi-leg-raise', 'Hanging Leg Raise', 'Core'),
  ex('bi-cable-crunch', 'Cable Crunch', 'Core'),
  ex('bi-russian-twist', 'Russian Twist', 'Core'),
  ex('bi-ab-wheel', 'Ab Wheel Rollout', 'Core'),
  // Cardio
  ex('bi-treadmill', 'Treadmill', 'Cardio'),
  ex('bi-rowing-machine', 'Rowing Machine', 'Cardio'),
  ex('bi-stationary-bike', 'Stationary Bike', 'Cardio'),
  ex('bi-stair-climber', 'Stair Climber', 'Cardio'),
  ex('bi-jump-rope', 'Jump Rope', 'Cardio'),
];
