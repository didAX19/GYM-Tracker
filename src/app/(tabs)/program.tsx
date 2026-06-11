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
    router.push({ pathname: '/edit-day', params: { dayId: day.id } });
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[typography.largeTitle, { color: colors.text }]}>Program</Text>

        <Text style={[styles.sectionTitle, typography.headline, { color: colors.textSecondary }]}>
          WEEKLY SCHEDULE
        </Text>
        <Card>
          <WeeklyScheduleCard
            schedule={schedule}
            days={days}
            history={history}
            onPressDay={(wk) => setPickerWeekday(wk)}
          />
          <Text style={[typography.caption, { color: colors.textTertiary, marginTop: spacing.sm }]}>
            Tap a weekday to assign a workout or set it as a rest day.
          </Text>
        </Card>

        <View style={styles.daysHeader}>
          <Text style={[typography.headline, { color: colors.textSecondary }]}>WORKOUT DAYS</Text>
          <Pressable onPress={() => setNewDayVisible(true)} hitSlop={8}>
            <Ionicons name="add-circle" size={28} color={colors.accent} />
          </Pressable>
        </View>

        {days.length === 0 ? (
          <Card>
            <EmptyState
              icon="🏋️"
              title="No workout days yet"
              message="Create your first workout day (e.g. Push, Pull, Legs) and add exercises to it."
            />
            <Button label="Create Workout Day" onPress={() => setNewDayVisible(true)} />
          </Card>
        ) : (
          days.map((day) => (
            <Pressable
              key={day.id}
              onPress={() => router.push({ pathname: '/edit-day', params: { dayId: day.id } })}
            >
              <Card style={styles.dayCard}>
                <View style={styles.dayCardLeft}>
                  <Text style={[typography.headline, { color: colors.text }]}>{day.name}</Text>
                  <Text style={[typography.subhead, { color: colors.textSecondary, marginTop: 2 }]}>
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
        <Pressable style={styles.sheetBackdrop} onPress={() => setPickerWeekday(null)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.cardElevated }]}>
            <Text style={[typography.title, { color: colors.text, marginBottom: spacing.md }]}>
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
                <Text style={{ fontSize: 20 }}>😴</Text>
                <Text style={[typography.headline, { color: colors.textSecondary }]}>Rest Day</Text>
                {pickerWeekday && schedule[pickerWeekday] === null ? (
                  <Ionicons name="checkmark" size={20} color={colors.accent} style={styles.check} />
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
                  <Text style={{ fontSize: 20 }}>💪</Text>
                  <Text style={[typography.headline, { color: colors.text }]}>{day.name}</Text>
                  {pickerWeekday && schedule[pickerWeekday] === day.id ? (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.accent}
                      style={styles.check}
                    />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
            <Button label="Cancel" variant="secondary" onPress={() => setPickerWeekday(null)} />
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
        <View style={styles.promptBackdrop}>
          <View style={[styles.promptCard, { backgroundColor: colors.cardElevated }]}>
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
                variant="secondary"
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
  sectionTitle: { marginTop: spacing.md, fontSize: 13, letterSpacing: 0.6 },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayCardLeft: { flex: 1 },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  check: { marginLeft: 'auto' },
  promptBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  promptCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xl,
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
