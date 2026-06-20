import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WeekdayKey, WeeklySchedule, WorkoutDay, WorkoutHistoryEntry } from '@/data/types';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, typography } from '@/theme/typography';
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
    <View style={styles.list}>
      {WEEKDAY_KEYS.map((key) => {
        const dayId = schedule[key];
        const day = dayId ? days.find((d) => d.id === dayId) : undefined;
        const isRest = !day || day.isRestDay;
        const isToday = key === today;
        const dateISO = toISODate(dateOfWeekdayThisWeek(key));
        const completed = completedDates.has(dateISO) && !isRest;

        const row = (
          <View
            style={[
              styles.row,
              {
                backgroundColor: isToday ? colors.accentSoft : 'transparent',
                borderColor: isToday ? colors.accent : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                typography.overline,
                styles.weekday,
                { color: isToday ? colors.accent : colors.textTertiary },
              ]}
            >
              {WEEKDAY_LABELS[key].slice(0, 3)}
            </Text>

            <Text
              style={[
                isRest ? styles.restName : styles.dayName,
                {
                  color: isRest ? colors.textTertiary : colors.text,
                  fontFamily: isRest ? fontFamily.medium : fontFamily.semibold,
                },
              ]}
              numberOfLines={1}
            >
              {isRest ? 'Rest' : day!.name}
            </Text>

            {completed ? (
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            ) : (
              <View style={[styles.dot, { backgroundColor: isRest ? colors.border : colors.borderStrong }]} />
            )}
          </View>
        );

        if (!onPressDay) return <View key={key}>{row}</View>;
        return (
          <Pressable
            key={key}
            onPress={() => onPressDay(key)}
            accessibilityRole="button"
            accessibilityLabel={`${WEEKDAY_LABELS[key]}: ${isRest ? 'Rest day' : day!.name}`}
          >
            {row}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 44,
  },
  weekday: { width: 38 },
  dayName: { flex: 1, fontSize: 15, letterSpacing: -0.1 },
  restName: { flex: 1, fontSize: 15 },
  dot: { width: 7, height: 7, borderRadius: 999 },
});
