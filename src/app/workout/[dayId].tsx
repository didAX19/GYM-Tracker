import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ExerciseIcon } from '@/components/ExerciseIcon';
import { PRCelebration, PRResult } from '@/components/PRCelebration';
import { useExerciseStore } from '@/store/useExerciseStore';
import { lastSessionMax, useHistoryStore } from '@/store/useHistoryStore';
import { useProgramStore } from '@/store/useProgramStore';
import { useRecordsStore } from '@/store/useRecordsStore';
import { useSessionStore } from '@/store/useSessionStore';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { estimateDurationMin, formatWeight } from '@/utils/calc';
import { confirm } from '@/utils/confirm';
import { todayISO } from '@/utils/date';
import { commitSession } from '@/utils/session';

export default function WorkoutSessionScreen() {
  const { colors } = useTheme();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();

  const day = useProgramStore((s) => s.days.find((d) => d.id === dayId));
  const exercises = useExerciseStore((s) => s.exercises);
  const records = useRecordsStore((s) => s.records);
  const history = useHistoryStore((s) => s.history);

  const session = useSessionStore((s) => s.session);
  const startSession = useSessionStore((s) => s.startSession);
  const setSessionWeight = useSessionStore((s) => s.setWeight);
  const clearSession = useSessionStore((s) => s.clearSession);

  const [prs, setPrs] = useState<PRResult[]>([]);
  const [celebrating, setCelebrating] = useState(false);

  // Ensure a persisted session exists for this day & today (resumes if one
  // is already active, otherwise starts fresh).
  useEffect(() => {
    if (!dayId) return;
    const today = todayISO();
    if (!session || session.workoutDayId !== dayId || session.date !== today) {
      startSession(dayId, today);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayId]);

  const weights = session?.weights ?? {};

  const lastMaxByExercise = useMemo(() => {
    const map: Record<string, number | null> = {};
    day?.exercises.forEach((we) => {
      map[we.exerciseId] = lastSessionMax(history, we.exerciseId);
    });
    return map;
  }, [day, history]);

  if (!day) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <EmptyState icon="help-circle-outline" title="Workout not found" message="This workout day no longer exists." />
        <Button label="Close" onPress={() => router.back()} style={{ margin: spacing.lg }} />
      </SafeAreaView>
    );
  }

  const hasAnyInput = Object.values(weights).some((arr) => arr.some((v) => parseFloat(v) > 0));

  const finishWorkout = () => {
    const current = useSessionStore.getState().session;
    if (!current) {
      router.back();
      return;
    }
    const newPrs = commitSession(current, day);
    if (newPrs.length > 0) {
      setPrs(newPrs);
      setCelebrating(true);
    } else {
      router.back();
    }
  };

  const confirmFinish = async () => {
    if (!hasAnyInput) {
      const ok = await confirm('Finish Workout', 'No weights entered yet. Finish anyway?', {
        confirmLabel: 'Finish',
        cancelLabel: 'Keep Training',
      });
      if (ok) finishWorkout();
    } else {
      finishWorkout();
    }
  };

  const confirmCancel = async () => {
    const ok = await confirm(
      'Cancel Workout',
      'This discards all weights entered in this session. You can start over afterwards.',
      { confirmLabel: 'Cancel Workout', cancelLabel: 'Keep Training' }
    );
    if (!ok) return;
    clearSession();
    router.back();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[typography.title, { color: colors.text }]}>{day.name}</Text>
          <Text style={[typography.subhead, { color: colors.textSecondary }]}>
            {day.exercises.length} exercises · ~{estimateDurationMin(day)} min
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close workout"
        >
          <Ionicons name="close-circle" size={32} color={colors.textTertiary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {day.exercises.map((we, idx) => {
            const exercise = exercises.find((e) => e.id === we.exerciseId);
            const record = records.find((r) => r.exerciseId === we.exerciseId);
            const lastMax = lastMaxByExercise[we.exerciseId];
            const inputs = weights[we.id] ?? [];

            return (
              <Animated.View key={we.id} entering={FadeInDown.delay(idx * 60).springify()}>
                <Card style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    {exercise ? (
                      <ExerciseIcon category={exercise.category} />
                    ) : (
                      <ExerciseIcon category="Chest" />
                    )}
                    <View style={styles.flex}>
                      <Text style={[typography.headline, { color: colors.text }]}>
                        {exercise?.name ?? 'Unknown exercise'}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        Target: {we.sets} × {we.reps}
                        {we.notes ? ` · ${we.notes}` : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={[styles.statPill, { backgroundColor: colors.successSoft }]}>
                      <Text style={[styles.statPillLabel, { color: colors.success }]}>BEST</Text>
                      <Text style={[styles.statPillValue, { color: colors.success }]}>
                        {record ? formatWeight(record.maxWeightKg) : '—'}
                      </Text>
                    </View>
                    <View style={[styles.statPill, { backgroundColor: colors.accentSoft }]}>
                      <Text style={[styles.statPillLabel, { color: colors.accent }]}>LAST</Text>
                      <Text style={[styles.statPillValue, { color: colors.accent }]}>
                        {lastMax != null ? formatWeight(lastMax) : '—'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.setsContainer}>
                    {Array.from({ length: we.sets }, (_, setIdx) => (
                      <View key={setIdx} style={styles.setRow}>
                        <Text style={[typography.subhead, styles.setLabel, { color: colors.textSecondary }]}>
                          Set {setIdx + 1}
                        </Text>
                        <TextInput
                          value={inputs[setIdx] ?? ''}
                          onChangeText={(t) => setSessionWeight(we.id, setIdx, we.sets, t)}
                          keyboardType="decimal-pad"
                          placeholder="0"
                          accessibilityLabel={`${exercise?.name ?? 'Exercise'} set ${setIdx + 1} weight in kilograms`}
                          placeholderTextColor={colors.textTertiary}
                          style={[
                            styles.weightInput,
                            {
                              backgroundColor: colors.inputBackground,
                              color: colors.text,
                              borderColor: colors.border,
                            },
                          ]}
                        />
                        <Text style={[typography.subhead, { color: colors.textTertiary }]}>kg</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </Animated.View>
            );
          })}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Button
            label="Cancel"
            variant="danger"
            onPress={confirmCancel}
            style={styles.cancelButton}
          />
          <Button label="Finish Workout" onPress={confirmFinish} style={styles.finishButton} />
        </View>
      </KeyboardAvoidingView>

      <PRCelebration
        visible={celebrating}
        prs={prs}
        onDismiss={() => {
          setCelebrating(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  content: { padding: spacing.lg, paddingTop: 0, paddingBottom: spacing.xl, gap: spacing.md },
  exerciseCard: { gap: spacing.md },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  statPillLabel: { fontFamily: fontFamily.bold, fontSize: 10, letterSpacing: 1 },
  statPillValue: { fontFamily: fontFamily.semibold, fontSize: 13 },
  setsContainer: { gap: spacing.sm },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  setLabel: { width: 50 },
  weightInput: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 17,
    fontFamily: fontFamily.semibold,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelButton: { flex: 1 },
  finishButton: { flex: 2 },
});
