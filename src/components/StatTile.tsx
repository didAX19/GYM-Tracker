import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { Card } from './Card';

interface StatTileProps {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}

export function StatTile({ label, value, sub, subColor }: StatTileProps) {
  const { colors } = useTheme();
  return (
    <Card style={styles.tile}>
      <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
        {label.toUpperCase()}
      </Text>
      <Text style={[typography.statValue, { color: colors.text, marginTop: spacing.xs }]}>
        {value}
      </Text>
      {sub ? (
        <Text
          style={[typography.caption, { color: subColor ?? colors.textTertiary, marginTop: 2 }]}
          numberOfLines={1}
        >
          {sub}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, padding: spacing.lg },
});
