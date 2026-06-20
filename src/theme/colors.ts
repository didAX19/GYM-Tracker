export interface ThemeColors {
  background: string;
  card: string;
  cardElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentSoft: string;
  /** Text/icon color that sits on top of a solid `accent` fill. */
  onAccent: string;
  success: string;
  successSoft: string;
  warning: string;
  danger: string;
  dangerSoft: string;
  border: string;
  /** A heavier border for emphasis (dividers under headers, key cards). */
  borderStrong: string;
  inputBackground: string;
  chartLine: string;
  chartFill: string;
  tabBar: string;
  /** Scrim behind modals / sheets. */
  overlay: string;
}

/**
 * "Iron & Ember" — a warm, high-contrast strength-training palette.
 * Molten ember orange against near-black charcoal, with a lime-green
 * reserved exclusively for personal records and positive progress.
 */
export const lightColors: ThemeColors = {
  background: '#F4F2EE',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  text: '#15171C',
  textSecondary: '#565C66',
  textTertiary: '#6E747C',
  // Ember deepens for daylight so it keeps a 4.5:1+ contrast on white.
  accent: '#C2410C',
  accentSoft: '#FBE7DC',
  onAccent: '#FFFFFF',
  success: '#2F8F2A',
  successSoft: '#E3F5DC',
  warning: '#B7791F',
  danger: '#D33A3F',
  dangerSoft: '#FBE3E4',
  border: '#E6E2DB',
  borderStrong: '#D7D2C9',
  inputBackground: '#EFEDE7',
  chartLine: '#C2410C',
  chartFill: 'rgba(194, 65, 12, 0.14)',
  tabBar: '#FFFFFF',
  overlay: 'rgba(20, 18, 14, 0.45)',
};

export const darkColors: ThemeColors = {
  background: '#0C0D10',
  card: '#15171C',
  cardElevated: '#1C1F26',
  text: '#F4F2EF',
  textSecondary: '#A2A8B2',
  textTertiary: '#868D96',
  // Full-strength molten ember on the dark canvas.
  accent: '#FF6A2B',
  accentSoft: '#2A1710',
  // Ink text on the bright ember fill reads far better than white (8:1+).
  onAccent: '#0C0D10',
  success: '#9BE564',
  successSoft: '#1B2A12',
  warning: '#F2B705',
  danger: '#FF5A5F',
  dangerSoft: '#2C1416',
  border: '#262A31',
  borderStrong: '#333944',
  inputBackground: '#111318',
  chartLine: '#FF6A2B',
  chartFill: 'rgba(255, 106, 43, 0.18)',
  tabBar: '#0E1014',
  overlay: 'rgba(0, 0, 0, 0.62)',
};
