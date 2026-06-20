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
import { CalendarPicker } from '@/components/CalendarPicker';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StatTile } from '@/components/StatTile';
import { WeightChart } from '@/components/WeightChart';
import { useBodyWeightStore } from '@/store/useBodyWeightStore';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily, typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { formatWeight, sortByDateDesc } from '@/utils/calc';
import { confirm } from '@/utils/confirm';
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
  const [calendarOpen, setCalendarOpen] = useState(false);

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

  const confirmRemove = async (id: string, date: string) => {
    const ok = await confirm(
      'Delete Weigh-In',
      `Remove your weigh-in from ${formatFriendly(date)}? This cannot be undone.`,
      { confirmLabel: 'Delete' }
    );
    if (ok) removeEntry(id);
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
          <Pressable
            onPress={() => setAdding(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Log body weight"
          >
            <Ionicons name="add-circle" size={32} color={colors.accent} />
          </Pressable>
        </View>

        <Card rail style={styles.currentCard}>
          <Text style={[typography.overline, { color: colors.accent }]}>CURRENT WEIGHT</Text>
          <View style={styles.currentValueRow}>
            <Text style={[typography.hero, { color: colors.text }]}>
              {current ? formatWeight(current.weightKg).replace(' kg', '') : '—'}
            </Text>
            {current ? (
              <Text style={[typography.title, { color: colors.textSecondary }]}>KG</Text>
            ) : null}
          </View>
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

        <Text style={[typography.overline, styles.sectionTitle, { color: colors.textTertiary }]}>
          HISTORY
        </Text>
        {sorted.length === 0 ? (
          <Card>
            <EmptyState
              icon="scale-outline"
              title="No weigh-ins yet"
              message="Log your first body weight entry to start tracking your progress."
            />
            <Button label="Add Weight" icon="add" onPress={() => setAdding(true)} />
          </Card>
        ) : (
          <Card style={styles.historyCard}>
            {sorted.slice(0, 30).map((e, i) => {
              const prev = sorted[i + 1];
              const delta = prev ? e.weightKg - prev.weightKg : null;
              const last = i === Math.min(sorted.length, 30) - 1;
              return (
                <View
                  key={e.id}
                  style={[
                    styles.historyRow,
                    { borderBottomColor: colors.border, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth },
                  ]}
                >
                  <Text style={[typography.subhead, { color: colors.textSecondary, flex: 1 }]}>
                    {formatFriendly(e.date)}
                  </Text>
                  {delta != null && delta !== 0 && (
                    <View style={styles.delta}>
                      <Ionicons
                        name={delta > 0 ? 'arrow-up' : 'arrow-down'}
                        size={13}
                        color={delta > 0 ? colors.warning : colors.success}
                      />
                      <Text
                        style={[
                          typography.caption,
                          { color: delta > 0 ? colors.warning : colors.success },
                        ]}
                      >
                        {Math.abs(Math.round(delta * 10) / 10)}
                      </Text>
                    </View>
                  )}
                  <Text style={[typography.headline, styles.tabular, { color: colors.text }]}>
                    {formatWeight(e.weightKg)}
                  </Text>
                  <Pressable
                    hitSlop={10}
                    onPress={() => void confirmRemove(e.id, e.date)}
                    style={styles.deleteBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete weigh-in from ${formatFriendly(e.date)}`}
                  >
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
        <View style={[styles.promptBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.promptCard, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}>
            <Text style={[typography.title, { color: colors.text }]}>Log Body Weight</Text>

            <View
              style={[
                styles.weightField,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="decimal-pad"
                placeholder="0.0"
                placeholderTextColor={colors.textTertiary}
                autoFocus
                style={[styles.weightInput, { color: colors.text }]}
              />
              <Text style={[typography.title, styles.weightUnit, { color: colors.textSecondary }]}>
                KG
              </Text>
            </View>

            <View style={styles.dateRow}>
              <Pressable onPress={() => shiftDate(-1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Previous day">
                <Ionicons name="chevron-back-circle" size={30} color={colors.accent} />
              </Pressable>
              <Pressable
                style={[styles.datePickerBtn, { backgroundColor: colors.inputBackground }]}
                onPress={() => setCalendarOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Pick date"
              >
                <Ionicons name="calendar-outline" size={18} color={colors.accent} />
                <Text style={[typography.subheadStrong, { color: colors.text }]}>
                  {dateInput === todayISO() ? 'Today' : formatFriendly(dateInput)}
                </Text>
              </Pressable>
              <Pressable onPress={() => shiftDate(1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Next day">
                <Ionicons
                  name="chevron-forward-circle"
                  size={30}
                  color={dateInput === todayISO() ? colors.border : colors.accent}
                />
              </Pressable>
            </View>

            <View style={styles.promptButtons}>
              <Button
                label="Cancel"
                variant="ghost"
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

      <CalendarPicker
        visible={calendarOpen}
        value={dateInput}
        onSelect={setDateInput}
        onClose={() => setCalendarOpen(false)}
        maxDate={new Date()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  currentCard: { alignItems: 'center', gap: spacing.xs },
  currentValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  sectionTitle: { marginTop: spacing.md },
  historyCard: { paddingVertical: spacing.xs },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  tabular: { fontVariant: ['tabular-nums'] },
  deleteBtn: { padding: spacing.xs },
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
    overflow: 'hidden',
  },
  weightField: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  weightInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 34,
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
  },
  weightUnit: {
    flexShrink: 0,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    minHeight: 40,
  },
  promptButtons: { flexDirection: 'row', gap: spacing.md },
  promptButton: { flex: 1 },
});
