import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { shadow } from '@/theme/shadow';
import { radius, spacing } from '@/theme/spacing';
import { fontFamily } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: colors.inputBackground }]}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.segment,
              selected && { backgroundColor: colors.card, ...styles.selectedShadow },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: selected ? colors.text : colors.textSecondary,
                  fontFamily: selected ? fontFamily.semibold : fontFamily.medium,
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm + 1,
    borderRadius: radius.md - 4,
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
  },
  selectedShadow: shadow(0.08, 4, 1),
  label: { fontSize: 13 },
});
