import { Alert, Platform } from 'react-native';

export interface ConfirmOptions {
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * Cross-platform confirmation dialog. React Native's Alert.alert is a no-op on
 * web, so we fall back to window.confirm for PWA / browser usage.
 */
export function confirm(
  title: string,
  message: string,
  options: ConfirmOptions = {}
): Promise<boolean> {
  const confirmLabel = options.confirmLabel ?? 'OK';
  const cancelLabel = options.cancelLabel ?? 'Cancel';

  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    return Promise.resolve(window.confirm(text));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
