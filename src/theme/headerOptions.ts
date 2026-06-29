import { fontFamily } from './typography';
import { useTheme } from './useTheme';

/**
 * Shared native-stack header styling for the per-tab nested stacks, so detail
 * pages (records, history, edit day, ...) keep a consistent themed header with
 * a back button while the bottom tab bar stays visible.
 */
export function useStackHeaderOptions() {
  const { colors } = useTheme();
  return {
    headerStyle: { backgroundColor: colors.background },
    headerShadowVisible: false,
    headerTintColor: colors.accent,
    headerTitleStyle: {
      color: colors.text,
      fontFamily: fontFamily.display,
      fontSize: 22,
    },
    contentStyle: { backgroundColor: colors.background },
  };
}
