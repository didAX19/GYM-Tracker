import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ExerciseCategory } from '@/data/types';
import { radius } from '@/theme/spacing';
import { useTheme } from '@/theme/useTheme';

/** Each muscle group gets a distinct, consistent vector glyph (no emoji). */
const CATEGORY_GLYPH: Record<
  ExerciseCategory,
  React.ComponentProps<typeof MaterialCommunityIcons>['name']
> = {
  Chest: 'weight-lifter',
  Back: 'rowing',
  Shoulders: 'human-handsup',
  Arms: 'arm-flex',
  Legs: 'run-fast',
  Core: 'yoga',
  Cardio: 'heart-pulse',
};

interface ExerciseIconProps {
  category: ExerciseCategory;
  /** Render inside a rounded tinted tile (used in list rows). */
  badge?: boolean;
  size?: number;
  color?: string;
}

export function ExerciseIcon({ category, badge = true, size = 20, color }: ExerciseIconProps) {
  const { colors } = useTheme();
  const glyph = CATEGORY_GLYPH[category] ?? 'dumbbell';
  const tint = color ?? colors.accent;

  const icon = <MaterialCommunityIcons name={glyph} size={size} color={tint} />;
  if (!badge) return icon;

  return (
    <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>{icon}</View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
