import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { formatWeight } from '@/utils/calc';
import { Button } from './Button';

export interface PRResult {
  exerciseName: string;
  weightKg: number;
}

interface PRCelebrationProps {
  visible: boolean;
  prs: PRResult[];
  onDismiss: () => void;
}

const CONFETTI_COLORS = ['#FF6A2B', '#9BE564', '#F2B705', '#FF8A5B', '#C2410C', '#E8F7CF'];
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Deterministic pseudo-random in [0, 1) so render stays pure. */
function seeded(index: number, salt: number): number {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function ConfettiPiece({ index }: { index: number }) {
  const fall = useSharedValue(-60);
  const sway = useSharedValue(0);
  const startX = (index / 14) * SCREEN_WIDTH + seeded(index, 1) * 24;
  const size = 8 + seeded(index, 2) * 6;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const duration = 2200 + seeded(index, 3) * 1400;

  useEffect(() => {
    fall.value = withDelay(
      seeded(index, 4) * 600,
      withTiming(700, { duration, easing: Easing.in(Easing.quad) })
    );
    sway.value = withRepeat(
      withSequence(
        withTiming(18, { duration: 420, easing: Easing.inOut(Easing.sin) }),
        withTiming(-18, { duration: 420, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: fall.value },
      { translateX: sway.value },
      { rotate: `${fall.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          top: 0,
          left: startX,
          width: size,
          height: size * 1.6,
          borderRadius: 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

export function PRCelebration({ visible, prs, onDismiss }: PRCelebrationProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        {visible &&
          !reduceMotion &&
          Array.from({ length: 14 }).map((_, i) => <ConfettiPiece key={`${i}`} index={i} />)}
        <Animated.View
          entering={ZoomIn.springify().damping(12)}
          style={[styles.card, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}
        >
          <Animated.View
            entering={ZoomIn.delay(150).springify().damping(8)}
            style={[styles.trophy, { backgroundColor: colors.successSoft }]}
          >
            <Ionicons name="trophy" size={40} color={colors.success} />
          </Animated.View>
          <Animated.Text
            entering={FadeInDown.delay(250)}
            style={[typography.title, { color: colors.text, textAlign: 'center' }]}
          >
            New Personal Record
          </Animated.Text>
          <View style={styles.prList}>
            {prs.map((pr, i) => (
              <Animated.View
                key={pr.exerciseName}
                entering={FadeIn.delay(350 + i * 120)}
                style={styles.prRow}
              >
                <Text style={[typography.headline, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                  {pr.exerciseName}
                </Text>
                <Text style={[typography.statValue, { color: colors.success }]}>
                  {formatWeight(pr.weightKg)}
                </Text>
              </Animated.View>
            ))}
          </View>
          <Button label="Awesome!" onPress={onDismiss} style={styles.button} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  trophy: {
    width: 80,
    height: 80,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  prList: { width: '100%', marginTop: spacing.lg, gap: spacing.sm },
  prRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  button: { marginTop: spacing.xl, alignSelf: 'stretch' },
});
