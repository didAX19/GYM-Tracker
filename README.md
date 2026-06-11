# Gym Tracker

A personal gym program tracker built with Expo (React Native) + TypeScript. Offline-first, all data stored locally on the device.

## Features

- **Dashboard** — today's workout (resolved from the weekly schedule), body weight + weekly change, workouts completed this week, PR count, and a weekly overview with the current day highlighted.
- **Program** — create workout days (Push, Pull, Legs, ...), assign them to weekdays, mark rest days, and edit each day's exercises (sets, reps, notes, ordering).
- **Workout Session** — per-set weight logging with your all-time best and last-session weights shown for every exercise. Automatic PR detection with a celebration animation and haptics.
- **Body Weight** — log weigh-ins, view week/month/year trend charts, and highest/lowest/average stats.
- **Personal Records** — all PRs, sortable by most recent, highest weight, or name.
- **Exercise database** — 50+ built-in exercises across Chest, Back, Shoulders, Arms, Legs, Core, and Cardio, plus custom exercises.
- Full dark mode support.

## Running on your iPhone (from Windows)

1. Install the **Expo Go** app from the App Store on your iPhone.
2. Make sure your phone and PC are on the same Wi-Fi network.
3. Start the dev server:

   ```bash
   npm install
   npx expo start
   ```

4. Scan the QR code shown in the terminal with the iPhone camera — it opens in Expo Go.

If the connection fails on restrictive networks, run `npx expo start --tunnel`.

## Tech stack

- Expo SDK 54 + Expo Router (file-based navigation)
- Zustand with `persist` over AsyncStorage (storage abstraction in `src/data/repository.ts`, ready to swap for SQLite/cloud sync later)
- react-native-gifted-charts for trend charts
- react-native-reanimated + expo-haptics for animations and feedback
- date-fns for date math

## Project structure

```
src/
  app/             # Expo Router screens
    (tabs)/        # Dashboard, Program, Body Weight tabs
    workout/       # Workout session (modal)
    edit-day.tsx   # Workout day editor
    pick-exercise.tsx
    records.tsx    # Personal records
  components/      # Reusable UI (cards, charts, PR celebration, ...)
  data/            # Types, built-in exercise database, storage layer
  store/           # Zustand stores (program, body weight, history, records, exercises)
  theme/           # Colors (light/dark), spacing, typography
  utils/           # Date and calculation helpers
```
