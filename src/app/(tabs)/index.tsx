import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Link, router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { StatTile } from '@/components/StatTile';
import { WeeklyScheduleCard } from '@/components/WeeklyScheduleCard';
import { useBodyWeightStore } from '@/store/useBodyWeightStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useProgramStore } from '@/store/useProgramStore';
import { useRecordsStore } from '@/store/useRecordsStore';
import { useSessionStore } from '@/store/useSessionStore';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { estimateDurationMin, formatWeight, sortByDateDesc, weeklyWeightChange } from '@/utils/calc';
import {
  formatFriendly,
  isInCurrentWeek,
  todayISO,
  todayWeekdayKey,
  WEEKDAY_KEYS,
  WEEKDAY_LABELS,
} from '@/utils/date';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const days = useProgramStore((s) => s.days);
  const schedule = useProgramStore((s) => s.schedule);
  const history = useHistoryStore((s) => s.history);
  const records = useRecordsStore((s) => s.records);
  const weightEntries = useBodyWeightStore((s) => s.entries);
  const exercises = useExerciseStore((s) => s.exercises);

  const session = useSessionStore((s) => s.session);
  const clearSession = useSessionStore((s) => s.clearSession);

  const todayKey = todayWeekdayKey();
  const todayDayId = schedule[todayKey];
  const todayDay = todayDayId ? days.find((d) => d.id === todayDayId) : undefined;
  const isRestToday = !todayDay || todayDay.isRestDay;
  const today = todayISO();

  // Discard sessions left over from a previous day.
  useEffect(() => {
    if (session && session.date !== today) clearSession();
  }, [session, today, clearSession]);

  // One workout per day: block starting again once any workout is completed today.
  const completedToday = useMemo(
    () => history.find((h) => h.completed && h.date === today),
    [history, today]
  );
  const completedTodayDay = completedToday
    ? days.find((d) => d.id === completedToday.workoutDayId)
    : undefined;

  const activeSession = session && session.date === today ? session : null;
  const activeSessionDay = activeSession
    ? days.find((d) => d.id === activeSession.workoutDayId)
    : undefined;

  const currentWeight = useMemo(() => sortByDateDesc(weightEntries)[0], [weightEntries]);
  const weekChange = useMemo(() => weeklyWeightChange(weightEntries), [weightEntries]);

  const workoutsThisWeek = useMemo(
    () => history.filter((h) => h.completed && isInCurrentWeek(h.date)).length,
    [history]
  );

  const exercisesTracked = useMemo(() => {
    const ids = new Set<string>();
    days.forEach((d) => d.exercises.forEach((e) => ids.add(e.exerciseId)));
    return ids.size;
  }, [days]);

  const lastWorkout = useMemo(() => {
    const h = history.find((x) => x.completed);
    if (!h) return null;
    const day = days.find((d) => d.id === h.workoutDayId);
    return { name: day?.name ?? 'Workout', date: h.date };
  }, [history, days]);

  let nextWorkout: { weekday: string; name: string } | null = null;
  const todayIdx = WEEKDAY_KEYS.indexOf(todayKey);
  for (let offset = 1; offset <= 7 && !nextWorkout; offset++) {
    const key = WEEKDAY_KEYS[(todayIdx + offset) % 7];
    const dayId = schedule[key];
    const day = dayId ? days.find((d) => d.id === dayId) : undefined;
    if (day && !day.isRestDay) nextWorkout = { weekday: WEEKDAY_LABELS[key], name: day.name };
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[typography.overline, { color: colors.accent }]}>
          {format(new Date(), 'EEEE, MMMM d').toUpperCase()}
        </Text>
        <Text style={[typography.largeTitle, { color: colors.text }]}>Dashboard</Text>

        {/* Today's workout / rest day card */}
        <Animated.View entering={FadeInDown.springify()}>
          {completedToday ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${completedTodayDay?.name ?? 'Workout'} complete, view details`}
              onPress={() =>
                router.push({
                  pathname: '/history/[entryId]',
                  params: { entryId: completedToday.id },
                })
              }
            >
              <Card rail style={styles.heroCard}>
                <View style={styles.completedHeader}>
                  <View style={[styles.iconBadge, { backgroundColor: colors.successSoft }]}>
                    <Ionicons name="checkmark-done" size={22} color={colors.success} />
                  </View>
                  <View style={styles.completedTitle}>
                    <Text style={[typography.overline, { color: colors.success }]}>COMPLETE</Text>
                    <Text style={[typography.title, { color: colors.text }]}>
                      {completedTodayDay?.name ?? 'Workout'}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {completedToday.entries.length} exercise
                      {completedToday.entries.length === 1 ? '' : 's'} ·{' '}
                      {completedToday.entries.reduce(
                        (sum, e) => sum + e.weightsKg.filter((w) => w != null && w > 0).length,
                        0
                      )}{' '}
                      sets logged
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </View>
                <View style={[styles.completedPreview, { borderTopColor: colors.border }]}>
                  {completedToday.entries.slice(0, 3).map((e) => {
                    const max = Math.max(
                      0,
                      ...e.weightsKg.filter((w): w is number => w != null && w > 0)
                    );
                    return (
                      <View key={e.exerciseId} style={styles.completedRow}>
                        <Text
                          style={[typography.subhead, { color: colors.textSecondary, flex: 1 }]}
                          numberOfLines={1}
                        >
                          {exercises.find((x) => x.id === e.exerciseId)?.name ?? 'Exercise'}
                        </Text>
                        <Text style={[typography.subheadStrong, { color: colors.text }]}>
                          {max > 0 ? formatWeight(max) : '—'}
                        </Text>
                      </View>
                    );
                  })}
                  {completedToday.entries.length > 3 && (
                    <Text style={[typography.caption, { color: colors.textTertiary }]}>
                      +{completedToday.entries.length - 3} more — tap for details
                    </Text>
                  )}
                </View>
              </Card>
            </Pressable>
          ) : activeSession ? (
            <Card rail style={styles.heroCard}>
              <View style={styles.heroTextBlock}>
                <Text style={[typography.overline, { color: colors.warning }]}>
                  WORKOUT IN PROGRESS
                </Text>
                <Text style={[typography.largeTitle, { color: colors.text }]}>
                  {activeSessionDay?.name ?? 'Workout'}
                </Text>
                <Text style={[typography.subhead, { color: colors.textSecondary }]}>
                  Your entered weights are saved — pick up where you left off.
                </Text>
              </View>
              <Button
                label="Resume Workout"
                icon="play"
                size="lg"
                onPress={() =>
                  router.push({
                    pathname: '/workout/[dayId]',
                    params: { dayId: activeSession.workoutDayId },
                  })
                }
                style={styles.heroButton}
              />
            </Card>
          ) : isRestToday ? (
            <Card style={styles.restCard}>
              <View style={[styles.iconBadge, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="moon" size={22} color={colors.accent} />
              </View>
              <Text style={[typography.title, { color: colors.text }]}>Rest Day</Text>
              <Text
                style={[typography.subhead, { color: colors.textSecondary, textAlign: 'center' }]}
              >
                Recovery is where the growth happens.
              </Text>
              <View style={styles.restStats}>
                {lastWorkout && (
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>
                    Last: {lastWorkout.name} · {formatFriendly(lastWorkout.date)}
                  </Text>
                )}
                {nextWorkout && (
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>
                    Next: {nextWorkout.name} on {nextWorkout.weekday}
                  </Text>
                )}
              </View>
            </Card>
          ) : (
            <Card rail style={styles.heroCard}>
              <View style={styles.heroTextBlock}>
                <Text style={[typography.overline, { color: colors.accent }]}>
                  TODAY&apos;S WORKOUT
                </Text>
                <Text style={[typography.largeTitle, { color: colors.text }]}>{todayDay!.name}</Text>
                <Text style={[typography.subhead, { color: colors.textSecondary }]}>
                  {todayDay!.exercises.length} exercises · ~{estimateDurationMin(todayDay!)} min
                </Text>
              </View>
              <Button
                label="Start Workout"
                icon="barbell"
                size="lg"
                onPress={() =>
                  router.push({ pathname: '/workout/[dayId]', params: { dayId: todayDay!.id } })
                }
                style={styles.heroButton}
              />
            </Card>
          )}
        </Animated.View>

        {/* Stat tiles */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.tilesRow}>
          <StatTile
            label="Body Weight"
            icon="scale-outline"
            value={currentWeight ? formatWeight(currentWeight.weightKg) : '—'}
            sub={
              weekChange != null
                ? `${weekChange > 0 ? '+' : ''}${Math.round(weekChange * 10) / 10} kg this week`
                : 'No trend yet'
            }
            subColor={
              weekChange == null
                ? undefined
                : weekChange > 0
                  ? colors.warning
                  : weekChange < 0
                    ? colors.success
                    : undefined
            }
          />
          <StatTile
            label="This Week"
            icon="flame-outline"
            value={`${workoutsThisWeek}`}
            sub={`workout${workoutsThisWeek === 1 ? '' : 's'} done`}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.tilesRow}>
          <StatTile label="Exercises" icon="list-outline" value={`${exercisesTracked}`} sub="in your program" />
          <StatTile label="Records" icon="trophy-outline" value={`${records.length}`} sub="personal records" />
        </Animated.View>

        {/* Personal records link */}
        <Animated.View entering={FadeInDown.delay(240).springify()}>
          <Link href="/records" asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Personal records">
              <Card style={styles.linkCard}>
                <View style={[styles.iconBadge, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name="trophy" size={20} color={colors.accent} />
                </View>
                <View style={styles.linkText}>
                  <Text style={[typography.headline, { color: colors.text }]}>
                    Personal Records
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {records.length === 0
                      ? 'Complete workouts to set your first PR'
                      : `${records.length} record${records.length === 1 ? '' : 's'} achieved`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </Card>
            </Pressable>
          </Link>
        </Animated.View>

        {/* Workout history link */}
        <Animated.View entering={FadeInDown.delay(280).springify()}>
          <Link href="/history" asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Workout history">
              <Card style={styles.linkCard}>
                <View style={[styles.iconBadge, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name="time" size={20} color={colors.accent} />
                </View>
                <View style={styles.linkText}>
                  <Text style={[typography.headline, { color: colors.text }]}>
                    Workout History
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {history.length === 0
                      ? 'Your completed workouts will appear here'
                      : `${history.length} workout${history.length === 1 ? '' : 's'} logged`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </Card>
            </Pressable>
          </Link>
        </Animated.View>

        {/* Weekly overview */}
        <Animated.View entering={FadeInDown.delay(320).springify()}>
          <Text style={[typography.overline, styles.sectionTitle, { color: colors.textTertiary }]}>
            THIS WEEK
          </Text>
          <Card>
            <WeeklyScheduleCard schedule={schedule} days={days} history={history} />
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  heroCard: { gap: spacing.lg },
  heroTextBlock: { gap: spacing.xs },
  heroButton: { alignSelf: 'stretch' },
  restCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  completedTitle: { flex: 1, gap: 2 },
  completedPreview: { gap: spacing.xs, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: spacing.md },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  restStats: { gap: spacing.xs, alignItems: 'center', marginTop: spacing.sm },
  tilesRow: { flexDirection: 'row', gap: spacing.md },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  linkText: { flex: 1, gap: 2 },
  sectionTitle: { marginBottom: spacing.sm, marginTop: spacing.sm },
});
