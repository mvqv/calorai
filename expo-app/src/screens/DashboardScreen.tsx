import React, { useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { CalorieProgress } from '@/components/ui/CalorieProgress';
import { MacroPanel } from '@/components/ui/MacroPanel';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/contexts/i18nContext';
import { COLORS, SIZES, FONTS, SHADOW } from '@/constants/theme';
import { Coffee, UtensilsCrossed, Moon, Cookie, Plus, BookOpen, Droplets } from 'lucide-react-native';
import type { MealType } from '@/types';

const WATER_GOAL = 8;
const TODAY = new Date().toISOString().split('T')[0];

export default function DashboardScreen({ navigation }: any) {
  const { t } = useI18n();
  const { profile: authProfile } = useAuth();
  const storeProfile = useAppStore((s) => s.profile);

  const todayLog = useAppStore((s) =>
    s.dailyLogs.find(l => l.date === TODAY) ?? {
      id: '', date: TODAY, totalCalories: 0,
      totalProtein: 0, totalFat: 0, totalCarbs: 0, items: [],
    }
  );
  const waterGlasses = useAppStore((s) => s.waterLog[TODAY] ?? 0);
  const addWaterGlass = useAppStore((s) => s.addWaterGlass);
  const removeWaterGlass = useAppStore((s) => s.removeWaterGlass);
  const getTodayLog = useAppStore((s) => s.getTodayLog);

  useEffect(() => { getTodayLog(); }, [getTodayLog]);

  const target = authProfile?.daily_calorie_target ?? storeProfile?.dailyCalorieTarget ?? 2000;
  const proteinTarget = authProfile?.protein_target ?? storeProfile?.proteinTarget ?? 150;
  const fatTarget = authProfile?.fat_target ?? storeProfile?.fatTarget ?? 67;
  const carbsTarget = authProfile?.carbs_target ?? storeProfile?.carbsTarget ?? 200;
  const displayName = authProfile?.display_name ?? 'there';

  const meals = useMemo(() => ({
    breakfast: todayLog.items.filter(i => i.mealType === 'breakfast'),
    lunch: todayLog.items.filter(i => i.mealType === 'lunch'),
    dinner: todayLog.items.filter(i => i.mealType === 'dinner'),
    snack: todayLog.items.filter(i => i.mealType === 'snack'),
  }), [todayLog.items]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('good_morning') : hour < 18 ? t('good_afternoon') : t('good_evening');

  const mealCards: { type: MealType; label: string; icon: React.ReactNode; color: string; bg: string; items: any[] }[] = [
    { type: 'breakfast', label: t('breakfast'), icon: <Coffee size={17} color={COLORS.warning} />, color: COLORS.warning, bg: '#fff8e7', items: meals.breakfast },
    { type: 'lunch', label: t('lunch'), icon: <UtensilsCrossed size={17} color={COLORS.primary} />, color: COLORS.primary, bg: '#fff0eb', items: meals.lunch },
    { type: 'dinner', label: t('dinner'), icon: <Moon size={17} color="#7c3aed" />, color: '#7c3aed', bg: '#f3e8ff', items: meals.dinner },
    { type: 'snack', label: t('snack'), icon: <Cookie size={17} color="#ec4899" />, color: '#ec4899', bg: '#fce7f3', items: meals.snack },
  ];

  const waterFraction = Math.min(waterGlasses / WATER_GOAL, 1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <GlassCard style={styles.greetingCard}>
          <Text style={styles.greetingLabel}>{greeting},</Text>
          <Text style={styles.greetingName}>{displayName} 👋</Text>
          <Text style={styles.goalText}>{t('goal_label')}: <Text style={styles.goalHighlight}>{target} {t('kcal')}</Text></Text>
        </GlassCard>

        {/* Calories */}
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>{t('calories')}</Text>
          <CalorieProgress consumed={todayLog.totalCalories} target={target} />
        </GlassCard>

        {/* Macros */}
        <GlassCard style={styles.macroCard}>
          <MacroPanel
            protein={todayLog.totalProtein} proteinMax={proteinTarget}
            fat={todayLog.totalFat} fatMax={fatTarget}
            carbs={todayLog.totalCarbs} carbsMax={carbsTarget}
          />
        </GlassCard>

        {/* Water */}
        <GlassCard style={styles.card}>
          <View style={styles.waterHeader}>
            <View style={styles.waterLabelRow}>
              <Droplets size={18} color={COLORS.blue} />
              <Text style={styles.cardTitle}>{t('water_today')}</Text>
            </View>
            <Text style={styles.waterCount}>
              <Text style={styles.waterHighlight}>{waterGlasses}</Text> / {WATER_GOAL} {t('glasses')}
            </Text>
          </View>

          <View style={styles.glassRow}>
            {Array.from({ length: WATER_GOAL }).map((_, i) => (
              <View key={i} style={[styles.glassIcon, i < waterGlasses && styles.glassFilled]}>
                <Text style={[styles.glassText, i < waterGlasses && { color: COLORS.blue }]}>💧</Text>
              </View>
            ))}
          </View>

          <View style={styles.waterProgressTrack}>
            <View style={[styles.waterProgressFill, { width: `${waterFraction * 100}%` }]} />
          </View>

          <View style={styles.waterButtons}>
            <TouchableOpacity onPress={removeWaterGlass} disabled={waterGlasses === 0} style={[styles.waterBtn, styles.waterBtnOutline]}>
              <Text style={styles.waterBtnOutlineText}>− {t('remove_glass')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addWaterGlass} disabled={waterGlasses >= 20} style={styles.waterBtn}>
              <Text style={styles.waterBtnText}>+ {t('add_glass')}</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Meal summary */}
        <GlassCard style={styles.card}>
          <View style={styles.mealHeader}>
            <Text style={styles.cardTitle}>{t('diary')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Diary')}>
              <Text style={styles.seeAll}>{t('diary')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mealGrid}>
            {mealCards.map(m => {
              const kcal = m.items.reduce((s, i) => s + i.calories, 0);
              return (
            <TouchableOpacity key={m.type} onPress={() => navigation.navigate('Diary')} style={[styles.mealCard, { backgroundColor: m.bg }]}>
                  <View style={styles.mealIconWrap}>{m.icon}</View>
                  <View>
                    <Text style={styles.mealLabel}>{m.label}</Text>
                    <Text style={[styles.mealKcal, kcal > 0 ? { color: m.color } : { color: COLORS.textMuted }]}>
                      {kcal > 0 ? `${kcal} ${t('kcal')}` : '—'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* Add Food CTA */}
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddFood')}>
          <Plus size={18} color="#fff" />
          <Text style={styles.addBtnText}>{t('add_food')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.lg, gap: SIZES.md },
  greetingCard: { padding: SIZES.lg },
  greetingLabel: { fontSize: 13, color: COLORS.textMuted, marginBottom: 2 },
  greetingName: { fontSize: 24, fontWeight: FONTS.bold, color: COLORS.text },
  goalText: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  goalHighlight: { color: COLORS.primary, fontWeight: FONTS.semibold },
  card: { padding: SIZES.lg },
  macroCard: { padding: 0 },
  cardTitle: { fontSize: 16, fontWeight: FONTS.semibold, color: COLORS.text, marginBottom: 4 },
  waterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  waterLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  waterCount: { fontSize: 13, color: COLORS.textMuted },
  waterHighlight: { fontWeight: FONTS.bold, color: COLORS.blue },
  glassRow: { flexDirection: 'row', gap: 6, marginBottom: SIZES.md, flexWrap: 'wrap' },
  glassIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.04)', justifyContent: 'center', alignItems: 'center' },
  glassFilled: { backgroundColor: '#e0f2fe' },
  glassText: { fontSize: 14, color: COLORS.textMuted },
  waterProgressTrack: { height: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4, marginBottom: SIZES.md, overflow: 'hidden' },
  waterProgressFill: { height: '100%', backgroundColor: COLORS.blue, borderRadius: 4 },
  waterButtons: { flexDirection: 'row', gap: SIZES.sm },
  waterBtn: { flex: 1, height: 44, borderRadius: 14, backgroundColor: COLORS.blue, justifyContent: 'center', alignItems: 'center' },
  waterBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#bfdbfe' },
  waterBtnText: { color: '#fff', fontWeight: FONTS.semibold, fontSize: 14 },
  waterBtnOutlineText: { color: COLORS.blue, fontWeight: FONTS.semibold, fontSize: 14 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  seeAll: { fontSize: 12, color: COLORS.primary, fontWeight: FONTS.semibold },
  mealGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  mealCard: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 10, padding: SIZES.md, borderRadius: 16 },
  mealIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  mealLabel: { fontSize: 13, fontWeight: FONTS.semibold, color: COLORS.text },
  mealKcal: { fontSize: 12, marginTop: 2 },
  addBtn: { backgroundColor: COLORS.primary, height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...SHADOW.medium },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: FONTS.semibold },
});
