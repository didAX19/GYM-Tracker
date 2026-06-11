import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { radius, spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/useTheme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  const { colors } = useTheme();
  const background =
    variant === 'primary' ? colors.accent : variant === 'danger' ? colors.danger : colors.accentSoft;
  const textColor = variant === 'secondary' ? colors.accent : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 16, fontWeight: '700' },
});
