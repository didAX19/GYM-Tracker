import { Platform } from 'react-native';

/**
 * React Navigation and React Native Web internals emit noisy, harmless
 * deprecation warnings on web (e.g. passing `pointerEvents` as a prop, legacy
 * `shadow*` style props) that we cannot change at the source. Filter only those
 * exact messages in development so genuine warnings stay visible. No-op in
 * production and on native.
 */
if (Platform.OS === 'web' && __DEV__) {
  const IGNORED = [
    'props.pointerEvents is deprecated',
    'shadow*" style props are deprecated',
  ];

  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const first = args[0];
    if (typeof first === 'string' && IGNORED.some((msg) => first.includes(msg))) {
      return;
    }
    originalWarn(...args);
  };
}
