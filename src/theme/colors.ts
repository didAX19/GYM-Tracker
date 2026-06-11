export interface ThemeColors {
  background: string;
  card: string;
  cardElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  danger: string;
  border: string;
  inputBackground: string;
  chartLine: string;
  chartFill: string;
  tabBar: string;
}

export const lightColors: ThemeColors = {
  background: '#F2F4F8',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  text: '#0B1220',
  textSecondary: '#5B6472',
  textTertiary: '#8C94A3',
  accent: '#2F6BFF',
  accentSoft: '#E4ECFF',
  success: '#1FA75C',
  successSoft: '#E2F6EA',
  warning: '#E8A11B',
  danger: '#E5484D',
  border: '#E3E7EE',
  inputBackground: '#F2F4F8',
  chartLine: '#2F6BFF',
  chartFill: 'rgba(47, 107, 255, 0.16)',
  tabBar: '#FFFFFF',
};

export const darkColors: ThemeColors = {
  background: '#0B0F16',
  card: '#161C26',
  cardElevated: '#1D2533',
  text: '#F2F5FA',
  textSecondary: '#9AA4B5',
  textTertiary: '#6C7686',
  accent: '#4D82FF',
  accentSoft: '#1B2942',
  success: '#34C77B',
  successSoft: '#13301F',
  warning: '#F0B03F',
  danger: '#F2555A',
  border: '#242D3C',
  inputBackground: '#0F141D',
  chartLine: '#4D82FF',
  chartFill: 'rgba(77, 130, 255, 0.20)',
  tabBar: '#10151E',
};
