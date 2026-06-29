import { addMonths, differenceInCalendarDays, parseISO } from 'date-fns';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createPersistStorage, storageKeys } from '@/data/repository';
import { ISODate } from '@/data/types';
import { todayISO, toISODate } from '@/utils/date';

/**
 * Tracks the gym membership billing anchor. The membership is assumed to renew
 * monthly; `startDate` is the day the current cycle began. Confirming a renewal
 * moves the anchor forward to the renewal day so the next reminder is a month out.
 */
interface SubscriptionState {
  startDate: ISODate | null;
  setStartDate: (date: ISODate) => void;
  /** Confirm a renewal; the cycle restarts from `date` (defaults to today). */
  renew: (date?: ISODate) => void;
  clear: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      startDate: null,
      setStartDate: (date) => set({ startDate: date }),
      renew: (date) => set({ startDate: date ?? todayISO() }),
      clear: () => set({ startDate: null }),
    }),
    { name: storageKeys.subscription, storage: createPersistStorage() }
  )
);

export interface RenewalStatus {
  /** Next monthly renewal date (one month after the start anchor). */
  dueDate: ISODate;
  /** Whole days until the renewal; negative when overdue. */
  daysUntilDue: number;
  /** True when the renewal date has arrived or passed. */
  isDue: boolean;
}

/** Derive the renewal status from a billing anchor, relative to today. */
export function renewalStatus(startDate: ISODate): RenewalStatus {
  const due = addMonths(parseISO(startDate), 1);
  const daysUntilDue = differenceInCalendarDays(due, new Date());
  return {
    dueDate: toISODate(due),
    daysUntilDue,
    isDue: daysUntilDue <= 0,
  };
}
