import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { COLORS } from '@/constants/theme';

interface BarPoint {
  label: string;
  value: number;
}

interface StackedBarPoint {
  label: string;
  protein: number;
  fat: number;
  carbs: number;
}

interface LinePoint {
  label: string;
  value: number;
}

export function SimpleBarChart({
  data,
  target,
  color = COLORS.primary,
  height = 220,
}: {
  data: BarPoint[];
  target?: number;
  color?: string;
  height?: number;
}) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - 64, data.length * 46);
  const maxValue = Math.max(target ?? 0, ...data.map((item) => item.value), 1);
  const innerHeight = height - 36;
  const barWidth = 24;
  const gap = 22;

  return (
    <View style={{ overflow: 'hidden' }}>
      <Svg width={chartWidth} height={height}>
        {typeof target === 'number' && (
          <Line
            x1={0}
            y1={innerHeight - (target / maxValue) * (innerHeight - 20)}
            x2={chartWidth}
            y2={innerHeight - (target / maxValue) * (innerHeight - 20)}
            stroke={COLORS.primary}
            strokeDasharray="6 4"
            strokeWidth={1}
          />
        )}

        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (innerHeight - 20);
          const x = index * (barWidth + gap) + 16;
          const y = innerHeight - barHeight;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <Rect x={x} y={y} width={barWidth} height={barHeight} rx={6} fill={color} />
              <SvgText x={x + barWidth / 2} y={height - 10} fill={COLORS.textMuted} fontSize="10" textAnchor="middle">
                {item.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

export function SimpleLineChart({
  data,
  color = COLORS.primary,
  height = 220,
}: {
  data: LinePoint[];
  color?: string;
  height?: number;
}) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - 64, data.length * 54);
  const values = data.map((item) => item.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, max);
  const range = Math.max(max - min, 1);
  const innerHeight = height - 36;
  const stepX = data.length > 1 ? (chartWidth - 32) / (data.length - 1) : 0;

  const points = data
    .map((item, index) => {
      const x = 16 + index * stepX;
      const y = 12 + ((max - item.value) / range) * (innerHeight - 24);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={{ overflow: 'hidden' }}>
      <Svg width={chartWidth} height={height}>
        <Polyline points={points} fill="none" stroke={color} strokeWidth={3} />
        {data.map((item, index) => {
          const x = 16 + index * stepX;
          const y = 12 + ((max - item.value) / range) * (innerHeight - 24);
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <Circle cx={x} cy={y} r={4} fill={color} />
              <SvgText x={x} y={height - 10} fill={COLORS.textMuted} fontSize="10" textAnchor="middle">
                {item.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

export function SimpleMacroChart({ data, height = 220 }: { data: StackedBarPoint[]; height?: number }) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - 64, data.length * 48);
  const maxValue = Math.max(
    ...data.map((item) => item.protein + item.fat + item.carbs),
    1
  );
  const innerHeight = height - 36;
  const barWidth = 24;
  const gap = 22;

  return (
    <View style={{ overflow: 'hidden' }}>
      <Svg width={chartWidth} height={height}>
        {data.map((item, index) => {
          const x = index * (barWidth + gap) + 16;
          const total = item.protein + item.fat + item.carbs;
          const proteinHeight = (item.protein / maxValue) * (innerHeight - 20);
          const fatHeight = (item.fat / maxValue) * (innerHeight - 20);
          const carbsHeight = (item.carbs / maxValue) * (innerHeight - 20);
          const baseY = innerHeight;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <Rect x={x} y={baseY - carbsHeight} width={barWidth} height={carbsHeight} rx={4} fill={COLORS.orange} />
              <Rect x={x} y={baseY - carbsHeight - fatHeight} width={barWidth} height={fatHeight} rx={4} fill={COLORS.yellow} />
              <Rect
                x={x}
                y={baseY - carbsHeight - fatHeight - proteinHeight}
                width={barWidth}
                height={proteinHeight}
                rx={4}
                fill={COLORS.blue}
              />
              {total > 0 && (
                <SvgText x={x + barWidth / 2} y={height - 10} fill={COLORS.textMuted} fontSize="10" textAnchor="middle">
                  {item.label}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
