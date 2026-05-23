import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '@/constants/theme';
import { useI18n } from '@/contexts/i18nContext';

interface Props {
  consumed: number;
  target: number;
}

export const CalorieProgress: React.FC<Props> = ({ consumed, target }) => {
  const { t } = useI18n();
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const remaining = Math.max(0, target - consumed);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>{t('consumed')}</Text>
          <Text style={styles.bigNumber}>{consumed}</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.kcalLabel}>{t('kcal')}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.label}>{t('remaining')}</Text>
          <Text style={[styles.bigNumber, { color: remaining === 0 ? COLORS.danger : COLORS.textMuted }]}>
            {remaining}
          </Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: SIZES.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  label: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
  bigNumber: { fontSize: 28, fontWeight: FONTS.extrabold, color: COLORS.text },
  center: { alignItems: 'center' },
  kcalLabel: { fontSize: 13, color: COLORS.textMuted, marginTop: SIZES.md },
  right: { alignItems: 'flex-end' },
  track: { height: 10, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 5 },
});
