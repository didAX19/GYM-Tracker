import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { useTheme } from '@/theme/useTheme';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="program"
        options={{
          title: 'Program',
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="body-weight"
        options={{
          title: 'Body Weight',
          tabBarIcon: ({ color, size }) => <Ionicons name="scale" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
