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
import { PRCelebration, PRResult } from '@/components/PRCelebration';
import { SetEntry } from '@/data/types';
import { useExerciseStore } from '@/store/useExerciseStore';
import { lastSessionMax, useHistoryStore } from '@/store/useHistoryStore';
import { useProgramStore } from '@/store/useProgramStore';
import { useRecordsStore } from '@/store/useRecordsStore';
import { useSessionStore } from '@/store/useSessionStore';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { estimateDurationMin, formatWeight } from '@/utils/calc';
import { confirm } from '@/utils/confirm';
import { todayISO } from '@/utils/date';

export default function WorkoutSessionScreen() {
  const { colors } = useTheme();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();

  const day = useProgramStore((s) => s.days.find((d) => d.id === dayId));
  const exercises = useExerciseStore((s) => s.exercises);
  const records = useRecordsStore((s) => s.records);
  const submitWeight = useRecordsStore((s) => s.submitWeight);
  const history = useHistoryStore((s) => s.history);
  const logWorkout = useHistoryStore((s) => s.logWorkout);

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
        <EmptyState icon="❓" title="Workout not found" message="This workout day no longer exists." />
        <Button label="Close" onPress={() => router.back()} style={{ margin: spacing.lg }} />
      </SafeAreaView>
    );
  }

  const hasAnyInput = Object.values(weights).some((arr) => arr.some((v) => parseFloat(v) > 0));

  const finishWorkout = () => {
    const date = todayISO();
    const entries: SetEntry[] = [];
    const newPrs: PRResult[] = [];

    for (const we of day.exercises) {
      const inputs = weights[we.id] ?? [];
      const parsed = Array.from({ length: we.sets }, (_, i) => {
        const v = parseFloat(inputs[i]);
        return Number.isFinite(v) && v > 0 ? v : null;
      });
      entries.push({ exerciseId: we.exerciseId, weightsKg: parsed });

      const maxEntered = Math.max(...parsed.map((v) => v ?? 0));
      if (maxEntered > 0) {
        const isPr = submitWeight(we.exerciseId, maxEntered, date);
        if (isPr) {
          const exercise = exercises.find((e) => e.id === we.exerciseId);
          newPrs.push({ exerciseName: exercise?.name ?? 'Exercise', weightKg: maxEntered });
        }
      }
    }

    logWorkout(day.id, date, entries);
    clearSession();

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
        <Pressable onPress={() => router.back()} hitSlop={8}>
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
                    <Text style={{ fontSize: 24 }}>{exercise?.icon ?? '🏋️'}</Text>
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
                      <Text style={[typography.caption, { color: colors.success, fontWeight: '700' }]}>
                        Best: {record ? formatWeight(record.maxWeightKg) : '—'}
                      </Text>
                    </View>
                    <View style={[styles.statPill, { backgroundColor: colors.accentSoft }]}>
                      <Text style={[typography.caption, { color: colors.accent, fontWeight: '700' }]}>
                        Last: {lastMax != null ? formatWeight(lastMax) : '—'}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
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
    fontWeight: '600',
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
