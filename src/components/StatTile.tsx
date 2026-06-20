import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { Card } from './Card';

interface StatTileProps {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

export function StatTile({ label, value, sub, subColor, icon }: StatTileProps) {
  const { colors } = useTheme();
  return (
    <Card style={styles.tile}>
      <View style={styles.labelRow}>
        {icon ? <Ionicons name={icon} size={13} color={colors.textTertiary} /> : null}
        <Text
          style={[typography.overline, { color: colors.textTertiary }]}
          numberOfLines={1}
        >
          {label.toUpperCase()}
        </Text>
      </View>
      <Text style={[typography.statValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
      {sub ? (
        <Text
          style={[typography.caption, { color: subColor ?? colors.textSecondary }]}
          numberOfLines={1}
        >
          {sub}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: spacing.xs },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
