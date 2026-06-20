import { TextStyle } from 'react-native';

/**
 * Font families loaded in the root layout via expo-font.
 *
 * Display = Bebas Neue: a condensed, all-caps athletic face used for
 * headlines, day names, and the big weight numerals (the app's signature).
 * Body = Inter, loaded per-weight because React Native selects a font by
 * family name rather than synthesising weight from a single file.
 */
export const fontFamily = {
  display: 'BebasNeue_400Regular',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography: Record<string, TextStyle> = {
  // --- Display (Bebas Neue, inherently uppercase) ---
  hero: { fontFamily: fontFamily.display, fontSize: 60, letterSpacing: 1, fontVariant: ['tabular-nums'] },
  largeTitle: { fontFamily: fontFamily.display, fontSize: 40, letterSpacing: 0.8 },
  title: { fontFamily: fontFamily.display, fontSize: 28, letterSpacing: 0.6 },
  statValue: { fontFamily: fontFamily.display, fontSize: 34, letterSpacing: 0.5, fontVariant: ['tabular-nums'] },

  // --- Body (Inter) ---
  headline: { fontFamily: fontFamily.semibold, fontSize: 16, letterSpacing: -0.1 },
  body: { fontFamily: fontFamily.regular, fontSize: 15, letterSpacing: -0.1 },
  bodyStrong: { fontFamily: fontFamily.semibold, fontSize: 15, letterSpacing: -0.1 },
  subhead: { fontFamily: fontFamily.medium, fontSize: 14 },
  subheadStrong: { fontFamily: fontFamily.semibold, fontSize: 14 },
  caption: { fontFamily: fontFamily.medium, fontSize: 12, letterSpacing: 0.1 },

  // Eyebrow / label: small, tracked-out, bold. Pair with textTransform:'uppercase'.
  overline: { fontFamily: fontFamily.bold, fontSize: 11, letterSpacing: 1.6 },
};
