import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { ExerciseIcon } from '@/components/ExerciseIcon';
import { CATEGORIES } from '@/data/builtInExercises';
import { Exercise, ExerciseCategory } from '@/data/types';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useProgramStore } from '@/store/useProgramStore';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';

export default function PickExerciseScreen() {
  const { colors } = useTheme();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();

  const exercises = useExerciseStore((s) => s.exercises);
  const addCustom = useExerciseStore((s) => s.addCustom);
  const addExerciseToDay = useProgramStore((s) => s.addExerciseToDay);
  const day = useProgramStore((s) => s.days.find((d) => d.id === dayId));

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<ExerciseCategory>('Chest');

  const alreadyAdded = useMemo(
    () => new Set(day?.exercises.map((e) => e.exerciseId) ?? []),
    [day]
  );

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = exercises.filter(
      (e) =>
        (!q || e.name.toLowerCase().includes(q)) &&
        (!categoryFilter || e.category === categoryFilter)
    );
    return CATEGORIES.map((cat) => ({
      title: cat,
      data: filtered.filter((e) => e.category === cat),
    })).filter((s) => s.data.length > 0);
  }, [exercises, search, categoryFilter]);

  const pick = (exercise: Exercise) => {
    if (!dayId) return;
    addExerciseToDay(dayId, exercise.id);
    router.back();
  };

  const createCustom = () => {
    const name = customName.trim();
    if (!name) return;
    const exercise = addCustom(name, customCategory);
    pick(exercise);
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.inputBackground, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search exercises"
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {CATEGORIES.map((cat) => {
            const selected = categoryFilter === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategoryFilter(selected ? null : cat)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.accent : colors.card,
                    borderColor: selected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.subheadStrong,
                    { color: selected ? colors.onAccent : colors.textSecondary },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          onPress={() => setCreating((c) => !c)}
          style={[styles.customToggle, { borderColor: colors.accent }]}
        >
          <Ionicons name={creating ? 'chevron-up' : 'add'} size={18} color={colors.accent} />
          <Text style={[typography.subheadStrong, { color: colors.accent }]}>
            Create custom exercise
          </Text>
        </Pressable>

        {creating && (
          <View style={[styles.customForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              value={customName}
              onChangeText={setCustomName}
              placeholder="Exercise name"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.customInput,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chips}>
                {CATEGORIES.map((cat) => {
                  const selected = customCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setCustomCategory(cat)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected ? colors.accent : colors.inputBackground,
                          borderColor: selected ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          typography.caption,
                          { color: selected ? colors.onAccent : colors.textSecondary },
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <Button label="Create & Add" onPress={createCustom} disabled={!customName.trim()} />
          </View>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <Text
            style={[
              typography.overline,
              styles.sectionHeader,
              { color: colors.textTertiary },
            ]}
          >
            {section.title.toUpperCase()}
          </Text>
        )}
        renderItem={({ item }) => {
          const added = alreadyAdded.has(item.id);
          return (
            <Pressable
              onPress={() => pick(item)}
              accessibilityRole="button"
              accessibilityLabel={`${added ? 'Already added: ' : 'Add '}${item.name}`}
              style={[
                styles.row,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <ExerciseIcon category={item.category} size={18} />
              <View style={styles.rowText}>
                <Text style={[typography.headline, { color: colors.text }]}>{item.name}</Text>
                {item.isCustom && (
                  <Text style={[typography.caption, { color: colors.accent }]}>Custom</Text>
                )}
              </View>
              {added ? (
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              ) : (
                <Ionicons name="add-circle-outline" size={24} color={colors.accent} />
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { padding: spacing.lg, gap: spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontSize: 16 },
  chips: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  customToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
  },
  customForm: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  customInput: {
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  sectionHeader: { marginTop: spacing.md, marginBottom: spacing.xs, letterSpacing: 0.6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  rowText: { flex: 1 },
});
