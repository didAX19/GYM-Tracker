import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { darkColors, lightColors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import '@/utils/suppressWebWarnings';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isDark } = useTheme();
  const palette = isDark ? darkColors : lightColors;

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  // Keep the static HTML shell (status bar / safe-area paint) in sync with the app theme.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const bg = palette.background;
    document.documentElement.style.setProperty('--app-bg', bg);
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
    const themeMeta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (themeMeta) themeMeta.setAttribute('content', bg);
    const statusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (statusMeta) statusMeta.setAttribute('content', isDark ? 'black-translucent' : 'default');
  }, [palette.background, isDark]);

  if (!fontsLoaded) return null;

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
            headerStyle: { backgroundColor: palette.background },
            headerShadowVisible: false,
            headerTitleStyle: {
              color: palette.text,
              fontFamily: fontFamily.display,
              fontSize: 22,
            },
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
