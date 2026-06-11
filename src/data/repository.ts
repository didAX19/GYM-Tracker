import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Central storage abstraction: every persisted store goes through this module,
 * so swapping AsyncStorage for SQLite (or adding cloud sync) later only
 * requires changes here.
 */

export const storageKeys = {
  exercises: 'gym-tracker/exercises',
  program: 'gym-tracker/program',
  bodyWeight: 'gym-tracker/body-weight',
  records: 'gym-tracker/records',
  history: 'gym-tracker/history',
  session: 'gym-tracker/active-session',
} as const;

export const createPersistStorage = <T>() => createJSONStorage<T>(() => AsyncStorage);

export function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
