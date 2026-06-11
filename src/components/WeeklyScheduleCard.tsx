import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WeekdayKey, WeeklySchedule, WorkoutDay, WorkoutHistoryEntry } from '@/data/types';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import {
  dateOfWeekdayThisWeek,
  isInCurrentWeek,
  todayWeekdayKey,
  toISODate,
  WEEKDAY_KEYS,
  WEEKDAY_LABELS,
} from '@/utils/date';

interface WeeklyScheduleCardProps {
  schedule: WeeklySchedule;
  days: WorkoutDay[];
  history: WorkoutHistoryEntry[];
  onPressDay?: (weekday: WeekdayKey) => void;
}

export function WeeklyScheduleCard({ schedule, days, history, onPressDay }: WeeklyScheduleCardProps) {
  const { colors } = useTheme();
  const today = todayWeekdayKey();

  const completedDates = new Set(
    history.filter((h) => h.completed && isInCurrentWeek(h.date)).map((h) => h.date)
  );

  return (
    <View>
      {WEEKDAY_KEYS.map((key) => {
        const dayId = schedule[key];
        const day = dayId ? days.find((d) => d.id === dayId) : undefined;
        const isRest = !day || day.isRestDay;
        const isToday = key === today;
        const dateISO = toISODate(dateOfWeekdayThisWeek(key));
        const completed = completedDates.has(dateISO);

        const row = (
          <View
            key={key}
            style={[
              styles.row,
              { borderColor: colors.border },
              isToday && { backgroundColor: colors.accentSoft, borderColor: colors.accent, borderWidth: 1 },
            ]}
          >
            <Text
              style={[
                typography.subhead,
                styles.weekday,
                { color: isToday ? colors.accent : colors.textSecondary },
                isToday && { fontWeight: '800' },
              ]}
            >
              {WEEKDAY_LABELS[key]}
            </Text>
            <View style={styles.dayInfo}>
              {completed && !isRest ? (
                <Text style={[typography.subhead, { color: colors.success, marginRight: spacing.xs }]}>
                  ✓
                </Text>
              ) : null}
              <Text
                style={[
                  typography.subhead,
                  {
                    color: isRest ? colors.textTertiary : colors.text,
                    fontWeight: isRest ? '400' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {isRest ? 'Rest Day' : day!.name}
              </Text>
            </View>
          </View>
        );

        if (!onPressDay) return row;
        return (
          <Pressable key={key} onPress={() => onPressDay(key)}>
            {row}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 2,
  },
  weekday: { width: 100 },
  dayInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
});
