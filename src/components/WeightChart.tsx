import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { BodyWeightEntry } from '@/data/types';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';
import { formatShort } from '@/utils/date';

interface WeightChartProps {
  /** Entries sorted ascending by date. */
  entries: BodyWeightEntry[];
}

export function WeightChart({ entries }: WeightChartProps) {
  const { colors } = useTheme();

  if (entries.length < 2) {
    return (
      <View style={styles.placeholder}>
        <Text style={[typography.subhead, { color: colors.textTertiary, textAlign: 'center' }]}>
          Log at least two weigh-ins to see your trend.
        </Text>
      </View>
    );
  }

  const labelEvery = Math.max(1, Math.ceil(entries.length / 4));
  const data = entries.map((e, i) => ({
    value: e.weightKg,
    label: i % labelEvery === 0 ? formatShort(e.date) : '',
  }));

  const weights = entries.map((e) => e.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const pad = Math.max((max - min) * 0.2, 1);
  const yOffset = Math.max(Math.floor(min - pad), 0);
  const chartWidth = Dimensions.get('window').width - spacing.lg * 4 - 36;

  return (
    <LineChart
      data={data}
      width={chartWidth}
      height={180}
      areaChart
      curved
      thickness={2.5}
      color={colors.chartLine}
      startFillColor={colors.chartFill}
      endFillColor="transparent"
      startOpacity={1}
      endOpacity={0}
      yAxisOffset={yOffset}
      maxValue={Math.ceil(max + pad) - yOffset}
      noOfSections={4}
      hideDataPoints={entries.length > 20}
      dataPointsColor={colors.chartLine}
      dataPointsRadius={3.5}
      yAxisColor="transparent"
      xAxisColor={colors.border}
      yAxisTextStyle={{ color: colors.textTertiary, fontSize: 11 }}
      xAxisLabelTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
      rulesColor={colors.border}
      rulesType="dashed"
      initialSpacing={10}
      spacing={Math.max(chartWidth / Math.max(entries.length - 1, 1), 12)}
      disableScroll
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
});
