import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  renewalStatus,
  useSubscriptionStore,
} from '@/store/useSubscriptionStore';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { formatFriendly, todayISO } from '@/utils/date';
import { Button } from './Button';
import { CalendarPicker } from './CalendarPicker';
import { Card } from './Card';

export function MembershipCard() {
  const { colors } = useTheme();
  const startDate = useSubscriptionStore((s) => s.startDate);
  const setStartDate = useSubscriptionStore((s) => s.setStartDate);
  const renew = useSubscriptionStore((s) => s.renew);

  const [calendarOpen, setCalendarOpen] = useState(false);

  const status = startDate ? renewalStatus(startDate) : null;
  const due = status?.isDue ?? false;

  const tintBg = due ? colors.warning : colors.accent;
  const tintSoft = due ? colors.dangerSoft : colors.accentSoft;

  let headline = 'Gym Membership';
  let detail = 'Set your start date for monthly renewal reminders.';
  if (status) {
    if (due) {
      headline = 'Renewal Due';
      detail =
        status.daysUntilDue === 0
          ? `Due today · started ${formatFriendly(startDate!)}`
          : `Overdue by ${-status.daysUntilDue} day${status.daysUntilDue === -1 ? '' : 's'}`;
    } else {
      headline = 'Membership Active';
      detail =
        status.daysUntilDue === 1
          ? `Renews tomorrow · ${formatFriendly(status.dueDate)}`
          : `Renews in ${status.daysUntilDue} days · ${formatFriendly(status.dueDate)}`;
    }
  }

  return (
    <>
      <Card rail={due} style={styles.card}>
        <Pressable
          style={styles.header}
          onPress={() => setCalendarOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={
            startDate ? 'Edit membership start date' : 'Set membership start date'
          }
        >
          <View style={[styles.iconBadge, { backgroundColor: tintSoft }]}>
            <Ionicons
              name={due ? 'alert-circle' : 'card'}
              size={20}
              color={tintBg}
            />
          </View>
          <View style={styles.text}>
            <Text style={[typography.headline, { color: colors.text }]}>{headline}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{detail}</Text>
          </View>
          <Ionicons
            name={startDate ? 'pencil' : 'chevron-forward'}
            size={startDate ? 16 : 20}
            color={colors.textTertiary}
          />
        </Pressable>

        {!startDate ? (
          <Button
            label="Set Start Date"
            icon="calendar-outline"
            onPress={() => setCalendarOpen(true)}
          />
        ) : due ? (
          <Button
            label="Mark as Renewed"
            icon="checkmark-circle"
            onPress={() => renew(todayISO())}
          />
        ) : null}
      </Card>

      <CalendarPicker
        visible={calendarOpen}
        value={startDate ?? todayISO()}
        onSelect={setStartDate}
        onClose={() => setCalendarOpen(false)}
        maxDate={new Date()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
});
