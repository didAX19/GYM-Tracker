import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

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
          shadowOpacity: isDark ? 0 : 0.06,
        },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
});
