import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  largeTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  headline: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  subhead: { fontSize: 14, fontWeight: '500' },
  caption: { fontSize: 12, fontWeight: '500' },
  statValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
};
