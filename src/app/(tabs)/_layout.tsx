import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';

/**
 * Bottom inset for the tab bar on web PWAs.
 * React Navigation already applies `paddingBottom: insets.bottom` and sets
 * total height to 49 + inset — do NOT also set height/padding on tabBarStyle.
 */
function useWebTabBarBottomInset(): number {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== 'web') return 0;
  if (insets.bottom > 0) return insets.bottom;
  if (
    typeof navigator !== 'undefined' &&
    (navigator as Navigator & { standalone?: boolean }).standalone
  ) {
    return 34;
  }
  return 0;
}

const TAB_ICON_SIZE = 24;

export default function TabsLayout() {
  const { colors } = useTheme();
  const webBottomInset = useWebTabBarBottomInset();

  return (
    <Tabs
      {...(Platform.OS === 'web' && webBottomInset > 0
        ? {
            safeAreaInsets: { top: 0, left: 0, right: 0, bottom: webBottomInset },
          }
        : {})}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontFamily: fontFamily.semibold,
          fontSize: 10,
          lineHeight: 12,
        },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="program"
        options={{
          title: 'Program',
          tabBarIcon: ({ color }) => <Ionicons name="barbell" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="body-weight"
        options={{
          title: 'Weight',
          tabBarIcon: ({ color }) => <Ionicons name="scale" size={TAB_ICON_SIZE} color={color} />,
        }}
      />
    </Tabs>
  );
}
