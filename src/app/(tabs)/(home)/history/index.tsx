import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useProgramStore } from '@/store/useProgramStore';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { formatWeight } from '@/utils/calc';
import { confirm } from '@/utils/confirm';
import { formatFriendly, todayISO } from '@/utils/date';

export default function WorkoutHistoryScreen() {
  const { colors } = useTheme();
  const history = useHistoryStore((s) => s.history);
  const removeWorkout = useHistoryStore((s) => s.removeWorkout);
  const days = useProgramStore((s) => s.days);

  const confirmDelete = async (id: string, name: string) => {
    const ok = await confirm(
      'Delete Workout',
      `Remove "${name}" from your history? This cannot be undone.`,
      { confirmLabel: 'Delete' }
    );
    if (ok) removeWorkout(id);
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      {history.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No workouts yet"
          message="Completed workouts will appear here with all your logged weights."
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const day = days.find((d) => d.id === item.workoutDayId);
            const name = day?.name ?? 'Workout';
            const loggedSets = item.entries.reduce(
              (sum, e) => sum + e.weightsKg.filter((w) => w != null && w > 0).length,
              0
            );
            const topWeight = Math.max(
              0,
              ...item.entries.flatMap((e) =>
                e.weightsKg.filter((w): w is number => w != null && w > 0)
              )
            );
            const isToday = item.date === todayISO();

            return (
              <Card style={styles.row}>
                <Pressable
                  style={styles.rowMain}
                  accessibilityRole="button"
                  accessibilityLabel={`${name}, ${formatFriendly(item.date)}`}
                  onPress={() =>
                    router.push({ pathname: '/history/[entryId]', params: { entryId: item.id } })
                  }
                >
                  <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
                    <Ionicons name="barbell" size={20} color={colors.accent} />
                  </View>
                  <View style={styles.rowText}>
                    <View style={styles.titleRow}>
                      <Text style={[typography.headline, { color: colors.text }]}>{name}</Text>
                      {isToday && (
                        <View style={[styles.todayBadge, { backgroundColor: colors.accent }]}>
                          <Text style={[styles.todayText, { color: colors.onAccent }]}>TODAY</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {formatFriendly(item.date)} · {item.entries.length} exercise
                      {item.entries.length === 1 ? '' : 's'} · {loggedSets} set
                      {loggedSets === 1 ? '' : 's'}
                      {topWeight > 0 ? ` · top ${formatWeight(topWeight)}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </Pressable>
                <Pressable
                  hitSlop={10}
                  onPress={() => void confirmDelete(item.id, name)}
                  style={styles.deleteBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${name}`}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  badge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  todayBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  todayText: { fontFamily: fontFamily.bold, fontSize: 10, letterSpacing: 1 },
  deleteBtn: { padding: spacing.sm },
});
