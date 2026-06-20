import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { shadow } from '@/theme/shadow';
import { radius, spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/useTheme';

interface CardProps {
  children: React.ReactNode;
  /** Show the signature ember accent rail down the left edge (hero cards). */
  rail?: boolean;
  /** Use the slightly lifted surface (modals, sheets). */
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, rail, elevated, style }: CardProps) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? colors.cardElevated : colors.card,
          borderColor: colors.border,
        },
        // Light mode leans on a soft shadow; dark mode on the border + surface.
        shadow(isDark ? 0 : 0.05, 14, 6),
        rail && [styles.rail, { borderLeftColor: colors.accent }],
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
  rail: {
    borderLeftWidth: 3,
    borderTopLeftRadius: radius.sm,
    borderBottomLeftRadius: radius.sm,
  },
});
