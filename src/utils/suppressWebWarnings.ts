import { Platform } from 'react-native';

/**
 * React Navigation, React Native Web, and react-native-svg (via
 * react-native-gifted-charts) emit noisy, harmless messages on web that we
 * cannot fix at the source:
 *   - `pointerEvents` / `shadow*` deprecation warnings (RN Web internals)
 *   - "Unknown event handler property `onResponder*` / `onPressOut`" errors,
 *     caused by react-native-svg passing RN responder props to SVG DOM nodes.
 * Filter only these exact messages in development so genuine warnings stay
 * visible. No-op in production and on native.
 */
if (Platform.OS === 'web' && __DEV__) {
  const IGNORED = [
    'props.pointerEvents is deprecated',
    'shadow*" style props are deprecated',
    'Unknown event handler property',
  ];

  const shouldIgnore = (args: unknown[]) => {
    const first = args[0];
    return typeof first === 'string' && IGNORED.some((msg) => first.includes(msg));
  };

  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (shouldIgnore(args)) return;
    originalWarn(...args);
  };

  const originalError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    if (shouldIgnore(args)) return;
    originalError(...args);
  };
}
