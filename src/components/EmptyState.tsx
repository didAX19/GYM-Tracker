import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[typography.headline, { color: colors.text, marginTop: spacing.md }]}>
        {title}
      </Text>
      <Text
        style={[
          typography.subhead,
          { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  icon: { fontSize: 44 },
});
