import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { darkColors, lightColors } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';

export default function RootLayout() {
  const { isDark } = useTheme();
  const palette = isDark ? darkColors : lightColors;

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: palette.accent,
      background: palette.background,
      card: palette.tabBar,
      text: palette.text,
      border: palette.border,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <Stack
        screenOptions={{
          headerTintColor: palette.accent,
          headerTitleStyle: { color: palette.text, fontWeight: '700' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="workout/[dayId]"
          options={{ presentation: 'modal', title: 'Workout', headerShown: false }}
        />
        <Stack.Screen name="edit-day" options={{ title: 'Edit Day' }} />
        <Stack.Screen
          name="pick-exercise"
          options={{ presentation: 'modal', title: 'Add Exercise' }}
        />
        <Stack.Screen name="records" options={{ title: 'Personal Records' }} />
        <Stack.Screen name="history/index" options={{ title: 'Workout History' }} />
        <Stack.Screen name="history/[entryId]" options={{ title: 'Workout' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
