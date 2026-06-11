import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '@/theme/spacing';
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
            style={[styles.segment, selected && { backgroundColor: colors.card, ...styles.selectedShadow }]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? colors.text : colors.textSecondary },
                selected && { fontWeight: '700' },
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
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md - 3,
    alignItems: 'center',
  },
  selectedShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  label: { fontSize: 13, fontWeight: '500' },
});
