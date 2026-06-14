import { Platform, ViewStyle } from 'react-native';

/**
 * Cross-platform drop shadow. On web we emit a single `boxShadow` (RN Web
 * deprecates the individual `shadow*` props), on native we use the classic
 * shadow props plus an Android elevation.
 */
export function shadow(opacity: number, radius: number, offsetY: number): ViewStyle {
  if (opacity <= 0) return {};
  if (Platform.OS === 'web') {
    return { boxShadow: `0px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})` } as ViewStyle;
  }
  return {
    shadowColor: '#000',
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: offsetY },
    elevation: Math.max(1, Math.round(radius / 3)),
  };
}
