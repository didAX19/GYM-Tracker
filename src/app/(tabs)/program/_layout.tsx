import { Stack } from 'expo-router';
import React from 'react';

import { useStackHeaderOptions } from '@/theme/headerOptions';

export default function ProgramStackLayout() {
  const screenOptions = useStackHeaderOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit-day" options={{ title: 'Edit Day' }} />
      <Stack.Screen name="pick-exercise" options={{ title: 'Add Exercise' }} />
    </Stack>
  );
}
