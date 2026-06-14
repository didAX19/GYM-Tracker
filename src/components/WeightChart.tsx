import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
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
  // Measure the actual container so the chart fits the card on any screen
  // size (including the capped-width web frame and on resize/rotation).
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && Math.abs(w - containerWidth) > 1) setContainerWidth(w);
  };

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
  // Reserve room for the y-axis labels; render nothing until measured.
  const chartWidth = containerWidth > 0 ? Math.max(containerWidth - 40, 100) : 0;

  if (chartWidth === 0) {
    return <View style={styles.measure} onLayout={onLayout} />;
  }

  return (
    <View onLayout={onLayout}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  measure: { height: 180, width: '100%' },
});
