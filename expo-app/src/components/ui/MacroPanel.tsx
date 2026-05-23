import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '@/constants/theme';
import { useI18n } from '@/contexts/i18nContext';

interface Props {
  protein: number; proteinMax: number;
  fat: number; fatMax: number;
  carbs: number; carbsMax: number;
}

const MacroBar: React.FC<{
  label: string; value: number; max: number; unit: string;
  barColor: string; icon: string; delay?: number;
}> = ({ label, value, max, unit, barColor }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const remaining = Math.max(0, max - value);
  const isOver = value > max;

  return (
    <View style={styles.barRow}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <View style={styles.barValues}>
          <Text style={styles.barValue}>{value}{unit}</Text>
          <Text style={styles.barMax}> / {max}{unit}</Text>
        </View>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: isOver ? COLORS.danger : barColor }]} />
      </View>
      <Text style={[styles.barHint, isOver && { color: COLORS.danger }]}>
        {isOver ? `+${Math.round(value - max)}${unit} over` : `${Math.round(remaining)}${unit} remaining`}
      </Text>
    </View>
  );
};

export const MacroPanel: React.FC<Props> = ({ protein, proteinMax, fat, fatMax, carbs, carbsMax }) => {
  const { t } = useI18n();
  const total = protein + fat + carbs;
  const pBar = total > 0 ? (protein / total) * 100 : 33.3;
  const fBar = total > 0 ? (fat / total) * 100 : 33.3;
  const cBar = total > 0 ? (carbs / total) * 100 : 33.4;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('macros')}</Text>
        <Text style={styles.totalBadge}>{total}{t('g')} total</Text>
      </View>

      <View style={styles.splitBar}>
        <View style={[styles.splitSegment, { width: `${pBar}%`, backgroundColor: COLORS.blue }]} />
        <View style={[styles.splitSegment, { width: `${fBar}%`, backgroundColor: COLORS.yellow }]} />
        <View style={[styles.splitSegment, { width: `${cBar}%`, backgroundColor: COLORS.orange }]} />
      </View>

      <MacroBar label={t('protein')} value={protein} max={proteinMax} unit={t('g')} barColor={COLORS.blue} icon="🥩" />
      <MacroBar label={t('fat')} value={fat} max={fatMax} unit={t('g')} barColor={COLORS.yellow} icon="🧈" />
      <MacroBar label={t('carbs')} value={carbs} max={carbsMax} unit={t('g')} barColor={COLORS.orange} icon="🌾" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: SIZES.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  title: { fontSize: 16, fontWeight: FONTS.semibold, color: COLORS.text },
  totalBadge: { fontSize: 12, color: COLORS.textMuted, backgroundColor: 'rgba(0,0,0,0.04)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  splitBar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: SIZES.lg, backgroundColor: 'rgba(0,0,0,0.04)' },
  splitSegment: { height: '100%' },
  barRow: { marginBottom: SIZES.md },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  barLabel: { fontSize: 13, fontWeight: FONTS.semibold, color: COLORS.text },
  barValues: { flexDirection: 'row', alignItems: 'baseline' },
  barValue: { fontSize: 15, fontWeight: FONTS.extrabold, color: COLORS.text },
  barMax: { fontSize: 12, color: COLORS.textMuted },
  barTrack: { height: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barHint: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
});
