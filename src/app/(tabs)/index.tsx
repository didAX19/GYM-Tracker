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
import { spacing } from '@/theme/spacing';
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
        <Text style={[typography.subhead, { color: colors.textSecondary }]}>
          {format(new Date(), 'EEEE, MMMM d')}
        </Text>
        <Text style={[typography.largeTitle, { color: colors.text }]}>Dashboard</Text>

        {/* Today's workout / rest day card */}
        <Animated.View entering={FadeInDown.springify()}>
          {completedToday ? (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/history/[entryId]',
                  params: { entryId: completedToday.id },
                })
              }
            >
              <Card style={styles.completedCard}>
                <View style={styles.completedHeader}>
                  <Text style={{ fontSize: 28 }}>✅</Text>
                  <View style={styles.completedTitle}>
                    <Text style={[typography.headline, { color: colors.text }]}>
                      {completedTodayDay?.name ?? 'Workout'} Complete
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
                <View style={styles.completedPreview}>
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
                        <Text style={[typography.subhead, { color: colors.text, fontWeight: '700' }]}>
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
            <Card style={styles.todayCard}>
              <Text style={[typography.caption, { color: colors.warning, fontWeight: '700' }]}>
                WORKOUT IN PROGRESS
              </Text>
              <Text style={[typography.title, { color: colors.text }]}>
                {activeSessionDay?.name ?? 'Workout'}
              </Text>
              <Text style={[typography.subhead, { color: colors.textSecondary }]}>
                Your entered weights are saved — pick up where you left off.
              </Text>
              <Button
                label="Resume Workout"
                onPress={() =>
                  router.push({
                    pathname: '/workout/[dayId]',
                    params: { dayId: activeSession.workoutDayId },
                  })
                }
                style={styles.startButton}
              />
            </Card>
          ) : isRestToday ? (
            <Card style={styles.todayCard}>
              <Text style={styles.todayEmoji}>😴</Text>
              <Text style={[typography.title, { color: colors.text }]}>Today is a Rest Day</Text>
              <Text style={[typography.subhead, { color: colors.textSecondary, textAlign: 'center' }]}>
                Recovery is where the growth happens.
              </Text>
              <View style={styles.restStats}>
                {lastWorkout && (
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>
                    Last workout: {lastWorkout.name} · {formatFriendly(lastWorkout.date)}
                  </Text>
                )}
                {nextWorkout && (
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>
                    Next up: {nextWorkout.name} on {nextWorkout.weekday}
                  </Text>
                )}
              </View>
            </Card>
          ) : (
            <Card style={styles.todayCard}>
              <Text style={[typography.caption, { color: colors.accent, fontWeight: '700' }]}>
                TODAY&apos;S WORKOUT
              </Text>
              <Text style={[typography.title, { color: colors.text }]}>{todayDay!.name}</Text>
              <Text style={[typography.subhead, { color: colors.textSecondary }]}>
                {todayDay!.exercises.length} exercises · ~{estimateDurationMin(todayDay!)} min
              </Text>
              <Button
                label="Start Workout"
                onPress={() =>
                  router.push({ pathname: '/workout/[dayId]', params: { dayId: todayDay!.id } })
                }
                style={styles.startButton}
              />
            </Card>
          )}
        </Animated.View>

        {/* Stat tiles */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.tilesRow}>
          <StatTile
            label="Body Weight"
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
            value={`${workoutsThisWeek}`}
            sub={`workout${workoutsThisWeek === 1 ? '' : 's'} completed`}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.tilesRow}>
          <StatTile label="Exercises" value={`${exercisesTracked}`} sub="in your program" />
          <StatTile label="Records" value={`${records.length}`} sub="personal records" />
        </Animated.View>

        {/* Personal records link */}
        <Animated.View entering={FadeInDown.delay(240).springify()}>
          <Link href="/records" asChild>
            <Pressable>
              <Card style={styles.linkCard}>
                <Text style={{ fontSize: 22 }}>🏆</Text>
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
            <Pressable>
              <Card style={styles.linkCard}>
                <Text style={{ fontSize: 22 }}>📋</Text>
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
          <Text style={[typography.headline, styles.sectionTitle, { color: colors.textSecondary }]}>
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
  todayCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  todayEmoji: { fontSize: 40 },
  completedCard: { gap: spacing.md },
  completedHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  completedTitle: { flex: 1 },
  completedPreview: { gap: spacing.xs },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  restStats: { gap: spacing.xs, alignItems: 'center', marginTop: spacing.sm },
  startButton: { alignSelf: 'stretch', marginTop: spacing.md },
  tilesRow: { flexDirection: 'row', gap: spacing.md },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  linkText: { flex: 1 },
  sectionTitle: { fontSize: 13, letterSpacing: 0.6, marginBottom: spacing.sm },
});
