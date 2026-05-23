import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { SimpleBarChart, SimpleLineChart, SimpleMacroChart } from '@/components/ui/SimpleCharts';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/contexts/i18nContext';
import { COLORS, SIZES, FONTS } from '@/constants/theme';

export default function AnalyticsScreen() {
  const { t } = useI18n();
  const { profile: authProfile } = useAuth();
  const [period, setPeriod] = React.useState<'week' | 'month'>('week');
  const dailyLogs = useAppStore((s) => s.dailyLogs);
  const weightEntries = useAppStore((s) => s.weightEntries);
  const storeProfile = useAppStore((s) => s.profile);
  const target = authProfile?.daily_calorie_target ?? storeProfile?.dailyCalorieTarget ?? 2000;
  const days = period === 'week' ? 7 : 30;

  const calorieData = React.useMemo(() => {
    return [...dailyLogs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-days)
      .map((log) => ({
        label: new Date(log.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        value: log.totalCalories,
        protein: log.totalProtein,
        fat: log.totalFat,
        carbs: log.totalCarbs,
      }));
  }, [dailyLogs, days]);

  const weightData = React.useMemo(() => {
    return [...weightEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-days)
      .map((entry) => ({
        label: new Date(entry.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        value: entry.weight,
      }));
  }, [days, weightEntries]);

  const avgCalories = calorieData.length > 0
    ? Math.round(calorieData.reduce((sum, item) => sum + item.value, 0) / calorieData.length)
    : 0;
  const weightChange = weightData.length >= 2 ? weightData[weightData.length - 1].value - weightData[0].value : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>{t('analytics')}</Text>
        <Text style={styles.subheader}>{t('track_nutrition')}</Text>

        <View style={styles.toggleWrap}>
          {(['week', 'month'] as const).map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.toggleButton, period === value && styles.toggleButtonActive]}
              onPress={() => setPeriod(value)}
            >
              <Text style={[styles.toggleText, period === value && styles.toggleTextActive]}>
                {value === 'week' ? t('seven_days') : t('thirty_days')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryGrid}>
          <GlassCard style={styles.summaryCard}>
            <Text style={styles.label}>{t('avg_calories')}</Text>
            <Text style={styles.bigNumber}>{avgCalories}</Text>
            <Text style={styles.unit}>{t('kcal')}</Text>
          </GlassCard>

          <GlassCard style={styles.summaryCard}>
            <Text style={styles.label}>{t('weight_change')}</Text>
            <Text style={[styles.bigNumber, weightChange <= 0 ? styles.good : styles.warn]}>
              {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(1)}
            </Text>
            <Text style={styles.unit}>{t('kg')}</Text>
          </GlassCard>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>{t('calorie_intake')}</Text>
          {calorieData.length > 0 ? (
            <SimpleBarChart data={calorieData.map(({ label, value }) => ({ label, value }))} target={target} />
          ) : (
            <Text style={styles.empty}>{t('no_data')}</Text>
          )}
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>{t('weight_trend')}</Text>
          {weightData.length > 0 ? (
            <SimpleLineChart data={weightData} />
          ) : (
            <Text style={styles.empty}>{t('no_data')}</Text>
          )}
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>{t('macros')}</Text>
          {calorieData.length > 0 ? (
            <SimpleMacroChart data={calorieData.map(({ label, protein, fat, carbs }) => ({ label, protein, fat, carbs }))} />
          ) : (
            <Text style={styles.empty}>{t('no_data')}</Text>
          )}
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.lg },
  header: { fontSize: 24, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: SIZES.lg },
  subheader: { fontSize: 13, color: COLORS.textMuted, marginTop: -12, marginBottom: SIZES.lg },
  toggleWrap: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16, padding: 4, marginBottom: SIZES.lg, borderWidth: 1, borderColor: COLORS.cardBorder },
  toggleButton: { flex: 1, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toggleButtonActive: { backgroundColor: COLORS.primary },
  toggleText: { fontSize: 13, color: COLORS.textMuted, fontWeight: FONTS.semibold },
  toggleTextActive: { color: '#fff' },
  summaryGrid: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.md },
  summaryCard: { flex: 1, padding: SIZES.lg },
  card: { padding: SIZES.lg, marginBottom: SIZES.md },
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4 },
  bigNumber: { fontSize: 32, fontWeight: FONTS.extrabold, color: COLORS.text },
  unit: { fontSize: 14, color: COLORS.textMuted },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20 },
  good: { color: COLORS.success },
  warn: { color: COLORS.primary },
});
