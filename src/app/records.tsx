import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useRecordsStore } from '@/store/useRecordsStore';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { formatWeight } from '@/utils/calc';
import { formatFriendly } from '@/utils/date';

type SortMode = 'recent' | 'weight' | 'name';

export default function RecordsScreen() {
  const { colors } = useTheme();
  const records = useRecordsStore((s) => s.records);
  const exercises = useExerciseStore((s) => s.exercises);
  const [sort, setSort] = useState<SortMode>('recent');

  const rows = useMemo(() => {
    const named = records.map((r) => ({
      ...r,
      exercise: exercises.find((e) => e.id === r.exerciseId),
    }));
    switch (sort) {
      case 'weight':
        return named.sort((a, b) => b.maxWeightKg - a.maxWeightKg);
      case 'name':
        return named.sort((a, b) =>
          (a.exercise?.name ?? '').localeCompare(b.exercise?.name ?? '')
        );
      default:
        return named.sort((a, b) => (a.dateAchieved < b.dateAchieved ? 1 : -1));
    }
  }, [records, exercises, sort]);

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <SegmentedControl<SortMode>
          options={[
            { value: 'recent', label: 'Most Recent' },
            { value: 'weight', label: 'Highest' },
            { value: 'name', label: 'Name' },
          ]}
          value={sort}
          onChange={setSort}
        />
      </View>

      {rows.length === 0 ? (
        <EmptyState
          icon="🏆"
          title="No records yet"
          message="Finish a workout with logged weights and your personal records will appear here."
        />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.row}>
              <Text style={{ fontSize: 24 }}>{item.exercise?.icon ?? '🏋️'}</Text>
              <View style={styles.rowText}>
                <Text style={[typography.headline, { color: colors.text }]}>
                  {item.exercise?.name ?? 'Unknown exercise'}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Achieved {formatFriendly(item.dateAchieved)}
                </Text>
              </View>
              <Text style={[typography.statValue, { color: colors.accent }]}>
                {formatWeight(item.maxWeightKg)}
              </Text>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  list: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowText: { flex: 1 },
});
