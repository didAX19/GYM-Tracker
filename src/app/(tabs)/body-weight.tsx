import { Ionicons } from '@expo/vector-icons';
import { addDays, parseISO } from 'date-fns';
import React, { useMemo, useState } from 'react';
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
import { SegmentedControl } from '@/components/SegmentedControl';
import { StatTile } from '@/components/StatTile';
import { WeightChart } from '@/components/WeightChart';
import { useBodyWeightStore } from '@/store/useBodyWeightStore';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { formatWeight, sortByDateDesc } from '@/utils/calc';
import { formatFriendly, isWithinLastDays, todayISO, toISODate } from '@/utils/date';

type Range = 'week' | 'month' | 'year';
const RANGE_DAYS: Record<Range, number> = { week: 7, month: 30, year: 365 };

export default function BodyWeightScreen() {
  const { colors } = useTheme();
  const entries = useBodyWeightStore((s) => s.entries);
  const addEntry = useBodyWeightStore((s) => s.addEntry);
  const removeEntry = useBodyWeightStore((s) => s.removeEntry);

  const [range, setRange] = useState<Range>('month');
  const [adding, setAdding] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [dateInput, setDateInput] = useState(todayISO());

  const sorted = useMemo(() => sortByDateDesc(entries), [entries]);
  const current = sorted[0];

  const rangeEntries = useMemo(
    () =>
      [...entries]
        .filter((e) => isWithinLastDays(e.date, RANGE_DAYS[range]))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
    [entries, range]
  );

  const stats = useMemo(() => {
    if (rangeEntries.length === 0) return null;
    const weights = rangeEntries.map((e) => e.weightKg);
    return {
      highest: Math.max(...weights),
      lowest: Math.min(...weights),
      average: weights.reduce((a, b) => a + b, 0) / weights.length,
    };
  }, [rangeEntries]);

  const saveEntry = () => {
    const w = parseFloat(weightInput.replace(',', '.'));
    if (!Number.isFinite(w) || w <= 0) return;
    addEntry(Math.round(w * 10) / 10, dateInput);
    setAdding(false);
    setWeightInput('');
    setDateInput(todayISO());
  };

  const shiftDate = (delta: number) => {
    const next = addDays(parseISO(dateInput), delta);
    if (next > new Date()) return;
    setDateInput(toISODate(next));
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={[typography.largeTitle, { color: colors.text }]}>Body Weight</Text>
          <Pressable onPress={() => setAdding(true)} hitSlop={8}>
            <Ionicons name="add-circle" size={32} color={colors.accent} />
          </Pressable>
        </View>

        <Card style={styles.currentCard}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>CURRENT WEIGHT</Text>
          <Text style={[styles.currentValue, { color: colors.text }]}>
            {current ? formatWeight(current.weightKg) : '—'}
          </Text>
          {current && (
            <Text style={[typography.caption, { color: colors.textTertiary }]}>
              Logged {formatFriendly(current.date)}
            </Text>
          )}
        </Card>

        <SegmentedControl<Range>
          options={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
          value={range}
          onChange={setRange}
        />

        <Card>
          <WeightChart entries={rangeEntries} />
        </Card>

        {stats && (
          <View style={styles.statsRow}>
            <StatTile label="Highest" value={formatWeight(stats.highest)} />
            <StatTile label="Lowest" value={formatWeight(stats.lowest)} />
            <StatTile label="Average" value={formatWeight(stats.average)} />
          </View>
        )}

        <Text style={[typography.headline, styles.sectionTitle, { color: colors.textSecondary }]}>
          HISTORY
        </Text>
        {sorted.length === 0 ? (
          <Card>
            <EmptyState
              icon="⚖️"
              title="No weigh-ins yet"
              message="Log your first body weight entry to start tracking your progress."
            />
            <Button label="Add Weight" onPress={() => setAdding(true)} />
          </Card>
        ) : (
          <Card style={styles.historyCard}>
            {sorted.slice(0, 30).map((e, i) => {
              const prev = sorted[i + 1];
              const delta = prev ? e.weightKg - prev.weightKg : null;
              return (
                <View
                  key={e.id}
                  style={[styles.historyRow, { borderBottomColor: colors.border }]}
                >
                  <Text style={[typography.subhead, { color: colors.textSecondary, flex: 1 }]}>
                    {formatFriendly(e.date)}
                  </Text>
                  {delta != null && delta !== 0 && (
                    <Text
                      style={[
                        typography.caption,
                        {
                          color: delta > 0 ? colors.warning : colors.success,
                          marginRight: spacing.md,
                        },
                      ]}
                    >
                      {delta > 0 ? '▲' : '▼'} {Math.abs(Math.round(delta * 10) / 10)}
                    </Text>
                  )}
                  <Text style={[typography.headline, { color: colors.text }]}>
                    {formatWeight(e.weightKg)}
                  </Text>
                  <Pressable hitSlop={8} onPress={() => removeEntry(e.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
                  </Pressable>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      <Modal
        visible={adding}
        transparent
        animationType="fade"
        onRequestClose={() => setAdding(false)}
      >
        <View style={styles.promptBackdrop}>
          <View style={[styles.promptCard, { backgroundColor: colors.cardElevated }]}>
            <Text style={[typography.title, { color: colors.text }]}>Log Body Weight</Text>

            <View style={styles.weightInputRow}>
              <TextInput
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="decimal-pad"
                placeholder="0.0"
                placeholderTextColor={colors.textTertiary}
                autoFocus
                style={[
                  styles.weightInput,
                  {
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />
              <Text style={[typography.title, { color: colors.textSecondary }]}>kg</Text>
            </View>

            <View style={styles.dateRow}>
              <Pressable onPress={() => shiftDate(-1)} hitSlop={8}>
                <Ionicons name="chevron-back-circle" size={28} color={colors.accent} />
              </Pressable>
              <Text style={[typography.headline, { color: colors.text }]}>
                {dateInput === todayISO() ? 'Today' : formatFriendly(dateInput)}
              </Text>
              <Pressable onPress={() => shiftDate(1)} hitSlop={8}>
                <Ionicons
                  name="chevron-forward-circle"
                  size={28}
                  color={dateInput === todayISO() ? colors.border : colors.accent}
                />
              </Pressable>
            </View>

            <View style={styles.promptButtons}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => setAdding(false)}
                style={styles.promptButton}
              />
              <Button
                label="Save"
                onPress={saveEntry}
                disabled={!(parseFloat(weightInput.replace(',', '.')) > 0)}
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
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  currentCard: { alignItems: 'center', gap: spacing.xs },
  currentValue: { fontSize: 44, fontWeight: '800', letterSpacing: -1 },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  sectionTitle: { marginTop: spacing.md, fontSize: 13, letterSpacing: 0.6 },
  historyCard: { paddingVertical: spacing.xs },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  deleteBtn: { marginLeft: spacing.md },
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
  weightInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  weightInput: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promptButtons: { flexDirection: 'row', gap: spacing.md },
  promptButton: { flex: 1 },
});
