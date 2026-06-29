import { Stack } from 'expo-router';
import React from 'react';

import { useStackHeaderOptions } from '@/theme/headerOptions';

export default function HomeStackLayout() {
  const screenOptions = useStackHeaderOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="records" options={{ title: 'Personal Records' }} />
      <Stack.Screen name="history/index" options={{ title: 'Workout History' }} />
      <Stack.Screen name="history/[entryId]" options={{ title: 'Workout' }} />
    </Stack>
  );
}
