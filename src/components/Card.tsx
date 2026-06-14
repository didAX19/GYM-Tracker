import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { shadow } from '@/theme/shadow';
import { radius, spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        shadow(isDark ? 0 : 0.06, 12, 4),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
});
