import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { darkColors, lightColors } from '@/theme/colors';
import { useTheme } from '@/theme/useTheme';
import '@/utils/suppressWebWarnings';

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
    <SafeAreaProvider>
      <ThemeProvider value={navTheme}>
        <Stack
          screenOptions={{
            headerTintColor: palette.accent,
            headerTitleStyle: { color: palette.text, fontWeight: '700' },
            contentStyle: { backgroundColor: palette.background },
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
    </SafeAreaProvider>
  );
}
