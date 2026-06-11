import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useProgramStore } from '@/store/useProgramStore';
import { useRecordsStore } from '@/store/useRecordsStore';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { formatWeight } from '@/utils/calc';
import { formatFriendly } from '@/utils/date';

export default function WorkoutHistoryDetailScreen() {
  const { colors } = useTheme();
  const { entryId } = useLocalSearchParams<{ entryId: string }>();

  const entry = useHistoryStore((s) => s.history.find((h) => h.id === entryId));
  const removeWorkout = useHistoryStore((s) => s.removeWorkout);
  const days = useProgramStore((s) => s.days);
  const exercises = useExerciseStore((s) => s.exercises);
  const records = useRecordsStore((s) => s.records);

  if (!entry) {
    return (
      <View style={[styles.safe, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="❓"
          title="Workout not found"
          message="This history entry no longer exists."
        />
      </View>
    );
  }

  const day = days.find((d) => d.id === entry.workoutDayId);
  const name = day?.name ?? 'Workout';

  const totalSets = entry.entries.reduce(
    (sum, e) => sum + e.weightsKg.filter((w) => w != null && w > 0).length,
    0
  );
  const totalVolume = entry.entries.reduce(
    (sum, e) =>
      sum + e.weightsKg.reduce<number>((acc, w) => acc + (w != null && w > 0 ? w : 0), 0),
    0
  );

  const confirmDelete = () => {
    Alert.alert('Delete Workout', `Remove "${name}" from your history? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeWorkout(entry.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: name }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summary}>
          <Text style={[typography.title, { color: colors.text }]}>{name}</Text>
          <Text style={[typography.subhead, { color: colors.textSecondary }]}>
            {formatFriendly(entry.date)}
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={[typography.statValue, { color: colors.accent }]}>
                {entry.entries.length}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>exercises</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[typography.statValue, { color: colors.accent }]}>{totalSets}</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>sets logged</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[typography.statValue, { color: colors.accent }]}>
                {totalVolume > 0 ? formatWeight(totalVolume) : '—'}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>volume</Text>
            </View>
          </View>
        </Card>

        {entry.entries.map((e) => {
          const exercise = exercises.find((x) => x.id === e.exerciseId);
          const weights = e.weightsKg;
          const sessionMax = Math.max(
            0,
            ...weights.filter((w): w is number => w != null && w > 0)
          );
          const record = records.find((r) => r.exerciseId === e.exerciseId);
          const wasPr =
            record != null &&
            sessionMax > 0 &&
            record.maxWeightKg === sessionMax &&
            record.dateAchieved === entry.date;

          return (
            <Card key={e.exerciseId} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={{ fontSize: 22 }}>{exercise?.icon ?? '🏋️'}</Text>
                <Text style={[typography.headline, styles.exerciseName, { color: colors.text }]}>
                  {exercise?.name ?? 'Unknown exercise'}
                </Text>
                {wasPr && (
                  <View style={[styles.prBadge, { backgroundColor: colors.successSoft }]}>
                    <Text style={[typography.caption, { color: colors.success, fontWeight: '700' }]}>
                      🏆 PR
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.setsRow}>
                {weights.map((w, i) => (
                  <View
                    key={i}
                    style={[
                      styles.setPill,
                      {
                        backgroundColor:
                          w != null && w > 0 ? colors.accentSoft : colors.inputBackground,
                      },
                    ]}
                  >
                    <Text style={[typography.caption, { color: colors.textTertiary }]}>
                      Set {i + 1}
                    </Text>
                    <Text
                      style={[
                        typography.subhead,
                        {
                          color: w != null && w > 0 ? colors.accent : colors.textTertiary,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {w != null && w > 0 ? formatWeight(w) : '—'}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          );
        })}

        <Button label="Delete Workout" variant="danger" onPress={confirmDelete} style={styles.delete} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.md },
  summary: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
  summaryStat: { alignItems: 'center', gap: 2 },
  exerciseCard: { gap: spacing.md },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  exerciseName: { flex: 1 },
  prBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  setsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  setPill: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    minWidth: 72,
    gap: 2,
  },
  delete: { marginTop: spacing.lg },
});
