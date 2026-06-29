import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ExerciseIcon } from '@/components/ExerciseIcon';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useProgramStore } from '@/store/useProgramStore';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { confirm } from '@/utils/confirm';

function Stepper({
  value,
  onChange,
  min = 1,
  max = 20,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const { colors } = useTheme();
  return (
    <View style={[stepperStyles.container, { backgroundColor: colors.inputBackground }]}>
      <Pressable
        hitSlop={6}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={stepperStyles.button}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
      >
        <Ionicons name="remove" size={18} color={colors.accent} />
      </Pressable>
      <Text style={[typography.headline, { color: colors.text, minWidth: 26, textAlign: 'center' }]}>
        {value}
      </Text>
      <Pressable
        hitSlop={6}
        onPress={() => onChange(Math.min(max, value + 1))}
        style={stepperStyles.button}
        accessibilityRole="button"
        accessibilityLabel="Increase"
      >
        <Ionicons name="add" size={18} color={colors.accent} />
      </Pressable>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.sm,
    paddingHorizontal: 4,
  },
  button: { padding: 10 },
});

export default function EditDayScreen() {
  const { colors } = useTheme();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();

  const day = useProgramStore((s) => s.days.find((d) => d.id === dayId));
  const renameDay = useProgramStore((s) => s.renameDay);
  const deleteDay = useProgramStore((s) => s.deleteDay);
  const setRestDay = useProgramStore((s) => s.setRestDay);
  const updateWorkoutExercise = useProgramStore((s) => s.updateWorkoutExercise);
  const removeExerciseFromDay = useProgramStore((s) => s.removeExerciseFromDay);
  const moveExercise = useProgramStore((s) => s.moveExercise);
  const exercises = useExerciseStore((s) => s.exercises);

  if (!day) {
    return (
      <View style={[styles.safe, { backgroundColor: colors.background }]}>
        <EmptyState icon="help-circle-outline" title="Day not found" message="This workout day no longer exists." />
      </View>
    );
  }

  const confirmDelete = async () => {
    const ok = await confirm(
      'Delete Workout Day',
      `Delete "${day.name}"? This cannot be undone.`,
      { confirmLabel: 'Delete' }
    );
    if (!ok) return;
    deleteDay(day.id);
    router.back();
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: day.name }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <Text style={[typography.overline, { color: colors.textTertiary }]}>DAY NAME</Text>
          <TextInput
            value={day.name}
            onChangeText={(t) => renameDay(day.id, t)}
            style={[
              styles.nameInput,
              {
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Day name"
            placeholderTextColor={colors.textTertiary}
          />
          <View style={styles.restRow}>
            <View>
              <Text style={[typography.headline, { color: colors.text }]}>Rest Day</Text>
              <Text style={[typography.caption, { color: colors.textTertiary }]}>
                No exercises, recovery only
              </Text>
            </View>
            <Switch
              value={day.isRestDay}
              onValueChange={(v) => setRestDay(day.id, v)}
              trackColor={{ true: colors.accent }}
            />
          </View>
        </Card>

        {!day.isRestDay && (
          <>
            <View style={styles.exercisesHeader}>
              <Text style={[typography.overline, { color: colors.textTertiary }]}>EXERCISES</Text>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/program/pick-exercise', params: { dayId: day.id } })
                }
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Add exercise"
              >
                <Ionicons name="add-circle" size={28} color={colors.accent} />
              </Pressable>
            </View>

            {day.exercises.length === 0 ? (
              <Card>
                <EmptyState
                  icon="barbell"
                  title="No exercises yet"
                  message="Add exercises from the database or create your own."
                />
                <Button
                  label="Add Exercise"
                  onPress={() =>
                    router.push({ pathname: '/program/pick-exercise', params: { dayId: day.id } })
                  }
                />
              </Card>
            ) : (
              day.exercises.map((we, idx) => {
                const exercise = exercises.find((e) => e.id === we.exerciseId);
                return (
                  <Card key={we.id} style={styles.exerciseCard}>
                    <View style={styles.exerciseTop}>
                      <ExerciseIcon category={exercise?.category ?? 'Chest'} />
                      <View style={styles.exerciseName}>
                        <Text style={[typography.headline, { color: colors.text }]}>
                          {exercise?.name ?? 'Unknown exercise'}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textTertiary }]}>
                          {we.sets} × {we.reps}
                        </Text>
                      </View>
                      <View style={styles.exerciseActions}>
                        <Pressable
                          hitSlop={10}
                          disabled={idx === 0}
                          onPress={() => moveExercise(day.id, we.id, -1)}
                          accessibilityRole="button"
                          accessibilityLabel="Move up"
                        >
                          <Ionicons
                            name="chevron-up"
                            size={22}
                            color={idx === 0 ? colors.border : colors.textSecondary}
                          />
                        </Pressable>
                        <Pressable
                          hitSlop={10}
                          disabled={idx === day.exercises.length - 1}
                          onPress={() => moveExercise(day.id, we.id, 1)}
                          accessibilityRole="button"
                          accessibilityLabel="Move down"
                        >
                          <Ionicons
                            name="chevron-down"
                            size={22}
                            color={
                              idx === day.exercises.length - 1
                                ? colors.border
                                : colors.textSecondary
                            }
                          />
                        </Pressable>
                        <Pressable
                          hitSlop={10}
                          onPress={() => removeExerciseFromDay(day.id, we.id)}
                          accessibilityRole="button"
                          accessibilityLabel="Remove exercise"
                        >
                          <Ionicons name="trash-outline" size={20} color={colors.danger} />
                        </Pressable>
                      </View>
                    </View>
                    <View style={styles.steppersRow}>
                      <View style={styles.stepperGroup}>
                        <Text style={[typography.overline, { color: colors.textTertiary }]}>
                          SETS
                        </Text>
                        <Stepper
                          value={we.sets}
                          onChange={(v) => updateWorkoutExercise(day.id, we.id, { sets: v })}
                          min={1}
                          max={12}
                        />
                      </View>
                      <View style={styles.stepperGroup}>
                        <Text style={[typography.overline, { color: colors.textTertiary }]}>
                          REPS
                        </Text>
                        <Stepper
                          value={we.reps}
                          onChange={(v) => updateWorkoutExercise(day.id, we.id, { reps: v })}
                          min={1}
                          max={50}
                        />
                      </View>
                    </View>
                    <TextInput
                      value={we.notes ?? ''}
                      onChangeText={(t) => updateWorkoutExercise(day.id, we.id, { notes: t })}
                      placeholder="Notes (tempo, grip, machine setting...)"
                      placeholderTextColor={colors.textTertiary}
                      style={[
                        styles.notesInput,
                        {
                          backgroundColor: colors.inputBackground,
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                    />
                  </Card>
                );
              })
            )}
          </>
        )}

        <Button label="Delete Day" variant="danger" onPress={confirmDelete} style={styles.delete} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.md },
  section: { gap: spacing.md },
  nameInput: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 17,
    fontFamily: fontFamily.semibold,
  },
  restRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  exerciseCard: { gap: spacing.md },
  exerciseTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  exerciseName: { flex: 1 },
  exerciseActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  steppersRow: { flexDirection: 'row', gap: spacing.xl },
  stepperGroup: { gap: spacing.xs, alignItems: 'flex-start' },
  notesInput: {
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
  },
  delete: { marginTop: spacing.lg },
});
