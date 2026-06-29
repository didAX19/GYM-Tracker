import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { WeeklyScheduleCard } from '@/components/WeeklyScheduleCard';
import { WeekdayKey } from '@/data/types';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useProgramStore } from '@/store/useProgramStore';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { WEEKDAY_LABELS } from '@/utils/date';

export default function ProgramScreen() {
  const { colors } = useTheme();
  const days = useProgramStore((s) => s.days);
  const schedule = useProgramStore((s) => s.schedule);
  const assignDay = useProgramStore((s) => s.assignDay);
  const addDay = useProgramStore((s) => s.addDay);
  const history = useHistoryStore((s) => s.history);

  const [pickerWeekday, setPickerWeekday] = useState<WeekdayKey | null>(null);
  const [newDayVisible, setNewDayVisible] = useState(false);
  const [newDayName, setNewDayName] = useState('');

  const createDay = () => {
    const name = newDayName.trim();
    if (!name) return;
    const day = addDay(name);
    setNewDayVisible(false);
    setNewDayName('');
    router.push({ pathname: '/program/edit-day', params: { dayId: day.id } });
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[typography.largeTitle, { color: colors.text }]}>Program</Text>

        <Text style={[styles.sectionTitle, typography.overline, { color: colors.textTertiary }]}>
          WEEKLY SCHEDULE
        </Text>
        <Card>
          <WeeklyScheduleCard
            schedule={schedule}
            days={days}
            history={history}
            onPressDay={(wk) => setPickerWeekday(wk)}
          />
          <Text style={[typography.caption, { color: colors.textTertiary, marginTop: spacing.md }]}>
            Tap a weekday to assign a workout or set it as a rest day.
          </Text>
        </Card>

        <View style={styles.daysHeader}>
          <Text style={[typography.overline, { color: colors.textTertiary }]}>WORKOUT DAYS</Text>
          <Pressable
            onPress={() => setNewDayVisible(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Add workout day"
          >
            <Ionicons name="add-circle" size={30} color={colors.accent} />
          </Pressable>
        </View>

        {days.length === 0 ? (
          <Card>
            <EmptyState
              icon="barbell"
              title="No workout days yet"
              message="Create your first workout day (e.g. Push, Pull, Legs) and add exercises to it."
            />
            <Button label="Create Workout Day" icon="add" onPress={() => setNewDayVisible(true)} />
          </Card>
        ) : (
          days.map((day) => (
            <Pressable
              key={day.id}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${day.name}`}
              onPress={() => router.push({ pathname: '/program/edit-day', params: { dayId: day.id } })}
            >
              <Card style={styles.dayCard}>
                <View style={[styles.dayBadge, { backgroundColor: day.isRestDay ? colors.inputBackground : colors.accentSoft }]}>
                  <Ionicons
                    name={day.isRestDay ? 'moon' : 'barbell'}
                    size={20}
                    color={day.isRestDay ? colors.textTertiary : colors.accent}
                  />
                </View>
                <View style={styles.dayCardLeft}>
                  <Text style={[typography.headline, { color: colors.text }]}>{day.name}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {day.isRestDay
                      ? 'Rest Day'
                      : `${day.exercises.length} exercise${day.exercises.length === 1 ? '' : 's'}`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Weekday assignment picker */}
      <Modal
        visible={pickerWeekday != null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerWeekday(null)}
      >
        <Pressable style={[styles.sheetBackdrop, { backgroundColor: colors.overlay }]} onPress={() => setPickerWeekday(null)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.cardElevated }]}>
            <View style={[styles.grabber, { backgroundColor: colors.borderStrong }]} />
            <Text style={[typography.title, { color: colors.text, marginBottom: spacing.sm }]}>
              {pickerWeekday ? WEEKDAY_LABELS[pickerWeekday] : ''}
            </Text>
            <ScrollView style={{ maxHeight: 420 }}>
              <Pressable
                style={[styles.sheetRow, { borderColor: colors.border }]}
                onPress={() => {
                  if (pickerWeekday) assignDay(pickerWeekday, null);
                  setPickerWeekday(null);
                }}
              >
                <View style={[styles.sheetIcon, { backgroundColor: colors.inputBackground }]}>
                  <Ionicons name="moon" size={18} color={colors.textSecondary} />
                </View>
                <Text style={[typography.headline, { color: colors.textSecondary, flex: 1 }]}>Rest Day</Text>
                {pickerWeekday && schedule[pickerWeekday] === null ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                ) : null}
              </Pressable>
              {days.map((day) => (
                <Pressable
                  key={day.id}
                  style={[styles.sheetRow, { borderColor: colors.border }]}
                  onPress={() => {
                    if (pickerWeekday) assignDay(pickerWeekday, day.id);
                    setPickerWeekday(null);
                  }}
                >
                  <View style={[styles.sheetIcon, { backgroundColor: colors.accentSoft }]}>
                    <Ionicons name="barbell" size={18} color={colors.accent} />
                  </View>
                  <Text style={[typography.headline, { color: colors.text, flex: 1 }]}>{day.name}</Text>
                  {pickerWeekday && schedule[pickerWeekday] === day.id ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
            <Button label="Cancel" variant="ghost" onPress={() => setPickerWeekday(null)} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* New day name prompt */}
      <Modal
        visible={newDayVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNewDayVisible(false)}
      >
        <View style={[styles.promptBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.promptCard, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}>
            <Text style={[typography.title, { color: colors.text }]}>New Workout Day</Text>
            <TextInput
              value={newDayName}
              onChangeText={setNewDayName}
              placeholder="e.g. Push Day"
              placeholderTextColor={colors.textTertiary}
              autoFocus
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              onSubmitEditing={createDay}
              returnKeyType="done"
            />
            <View style={styles.promptButtons}>
              <Button
                label="Cancel"
                variant="ghost"
                onPress={() => setNewDayVisible(false)}
                style={styles.promptButton}
              />
              <Button
                label="Create"
                onPress={createDay}
                disabled={!newDayName.trim()}
                style={styles.promptButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  sectionTitle: { marginTop: spacing.sm },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dayBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCardLeft: { flex: 1 },
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  promptCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  promptButtons: { flexDirection: 'row', gap: spacing.md },
  promptButton: { flex: 1 },
});
