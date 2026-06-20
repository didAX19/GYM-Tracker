import { Ionicons } from '@expo/vector-icons';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { ISODate } from '@/data/types';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { toISODate } from '@/utils/date';

const WEEKDAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface CalendarPickerProps {
  visible: boolean;
  value: ISODate;
  onSelect: (date: ISODate) => void;
  onClose: () => void;
  /** Latest selectable day (inclusive). Defaults to today. */
  maxDate?: Date;
  /** Earliest selectable day (inclusive). */
  minDate?: Date;
}

export function CalendarPicker({
  visible,
  value,
  onSelect,
  onClose,
  maxDate = new Date(),
  minDate,
}: CalendarPickerProps) {
  const { colors } = useTheme();
  const selected = useMemo(() => parseISO(value), [value]);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selected));

  const max = useMemo(() => startOfDay(maxDate), [maxDate]);
  const min = useMemo(() => (minDate ? startOfDay(minDate) : null), [minDate]);

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth]);

  const canGoNext = useMemo(
    () => isBefore(startOfMonth(viewMonth), startOfMonth(max)),
    [viewMonth, max]
  );
  const canGoPrev = useMemo(() => {
    if (!min) return true;
    return isAfter(startOfMonth(viewMonth), startOfMonth(min));
  }, [viewMonth, min]);

  const isDisabled = (day: Date) => {
    if (isAfter(startOfDay(day), max)) return true;
    if (min && isBefore(startOfDay(day), min)) return true;
    return false;
  };

  const handleSelect = (day: Date) => {
    if (isDisabled(day)) return;
    onSelect(toISODate(day));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => canGoPrev && setViewMonth((m) => subMonths(m, 1))}
              hitSlop={10}
              disabled={!canGoPrev}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={canGoPrev ? colors.accent : colors.border}
              />
            </Pressable>
            <Text style={[typography.headline, { color: colors.text }]}>
              {format(viewMonth, 'MMMM yyyy')}
            </Text>
            <Pressable
              onPress={() => canGoNext && setViewMonth((m) => addMonths(m, 1))}
              hitSlop={10}
              disabled={!canGoNext}
              accessibilityRole="button"
              accessibilityLabel="Next month"
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={canGoNext ? colors.accent : colors.border}
              />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAY_HEADERS.map((d, i) => (
              <View key={i} style={styles.cell}>
                <Text style={[typography.caption, { color: colors.textTertiary }]}>{d}</Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {days.map((day) => {
              const inMonth = isSameMonth(day, viewMonth);
              const isSelected = isSameDay(day, selected);
              const isToday = isSameDay(day, new Date());
              const disabled = isDisabled(day);
              return (
                <Pressable
                  key={day.toISOString()}
                  style={styles.cell}
                  onPress={() => handleSelect(day)}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected, disabled }}
                  accessibilityLabel={format(day, 'EEEE, MMMM d, yyyy')}
                >
                  <View
                    style={[
                      styles.dayPill,
                      isSelected && { backgroundColor: colors.accent },
                      !isSelected && isToday && { borderColor: colors.accent, borderWidth: 1 },
                    ]}
                  >
                    <Text
                      style={[
                        typography.subhead,
                        {
                          color: isSelected
                            ? colors.onAccent
                            : disabled
                              ? colors.textTertiary
                              : inMonth
                                ? colors.text
                                : colors.textTertiary,
                          opacity: disabled ? 0.4 : 1,
                          fontFamily: isSelected ? fontFamily.bold : fontFamily.medium,
                        },
                      ]}
                    >
                      {format(day, 'd')}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.todayBtn}
            accessibilityRole="button"
            accessibilityLabel="Jump to today"
            onPress={() => {
              const today = startOfDay(new Date());
              if (!isDisabled(today)) {
                setViewMonth(startOfMonth(today));
                handleSelect(today);
              }
            }}
          >
            <Text style={[typography.headline, { color: colors.accent }]}>Today</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  weekRow: { flexDirection: 'row' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPill: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBtn: { alignSelf: 'center', paddingVertical: spacing.xs },
});
