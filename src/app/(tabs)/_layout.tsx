import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/useTheme';

const TAB_BAR_HEIGHT = 49;

function useTabBarBottomInset(): number {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== 'web') return 0;

  if (insets.bottom > 0) return insets.bottom;

  // iOS Home Screen PWA: env() insets are sometimes 0 until layout; use standalone fallback.
  if (typeof navigator !== 'undefined' && (navigator as Navigator & { standalone?: boolean }).standalone) {
    return 34;
  }

  return 0;
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const bottomInset = useTabBarBottomInset();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          ...(Platform.OS === 'web' && bottomInset > 0
            ? { paddingBottom: bottomInset, height: TAB_BAR_HEIGHT + bottomInset }
            : {}),
        },
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
