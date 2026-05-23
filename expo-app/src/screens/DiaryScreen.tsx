import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { MealSection } from '@/components/diary/MealSection';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/contexts/i18nContext';
import { COLORS, SIZES, FONTS } from '@/constants/theme';
import { Coffee, UtensilsCrossed, Moon, Cookie, Plus } from 'lucide-react-native';

const TODAY = new Date().toISOString().split('T')[0];

export default function DiaryScreen({ navigation }: any) {
  const { t } = useI18n();
  const { profile: authProfile } = useAuth();
  const storeProfile = useAppStore((s) => s.profile);
  const todayLog = useAppStore((s) =>
    s.dailyLogs.find(l => l.date === TODAY) ?? {
      id: '', date: TODAY, totalCalories: 0,
      totalProtein: 0, totalFat: 0, totalCarbs: 0, items: [],
    }
  );
  const getTodayLog = useAppStore((s) => s.getTodayLog);

  React.useEffect(() => { getTodayLog(); }, [getTodayLog]);
  const target = authProfile?.daily_calorie_target ?? storeProfile?.dailyCalorieTarget ?? 2000;
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const meals = useMemo(() => ({
    breakfast: todayLog.items.filter(i => i.mealType === 'breakfast'),
    lunch: todayLog.items.filter(i => i.mealType === 'lunch'),
    dinner: todayLog.items.filter(i => i.mealType === 'dinner'),
    snack: todayLog.items.filter(i => i.mealType === 'snack'),
  }), [todayLog.items]);

  const mealDefs = [
    { type: 'breakfast' as const, title: t('breakfast'), icon: <Coffee size={16} color={COLORS.warning} />, color: COLORS.warning },
    { type: 'lunch' as const, title: t('lunch'), icon: <UtensilsCrossed size={16} color={COLORS.primary} />, color: COLORS.primary },
    { type: 'dinner' as const, title: t('dinner'), icon: <Moon size={16} color="#7c3aed" />, color: '#7c3aed' },
    { type: 'snack' as const, title: t('snack'), icon: <Cookie size={16} color="#ec4899" />, color: '#ec4899' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>{t('food_diary')}</Text>
        <Text style={styles.headerDate}>{today}</Text>

        <GlassCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('todays_summary')}</Text>
          <Text style={styles.summaryKcal}>{todayLog.totalCalories} <Text style={styles.summaryUnit}>{t('kcal')}</Text></Text>
          <Text style={styles.summaryTarget}>/ {target} {t('kcal')}</Text>
          <View style={styles.macroRow}>
            <Text style={styles.macroItem}><Text style={{ color: COLORS.blue }}>P:</Text> {todayLog.totalProtein}{t('g')}</Text>
            <Text style={styles.macroItem}><Text style={{ color: COLORS.yellow }}>F:</Text> {todayLog.totalFat}{t('g')}</Text>
            <Text style={styles.macroItem}><Text style={{ color: COLORS.orange }}>C:</Text> {todayLog.totalCarbs}{t('g')}</Text>
          </View>
        </GlassCard>

        {mealDefs.map(m => (
          <MealSection
            key={m.type}
            title={m.title}
            mealType={m.type}
            icon={m.icon}
            color={m.color}
            items={meals[m.type]}
            onAdd={() => navigation.navigate('AddFood', { mealType: m.type })}
          />
        ))}

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
  scroll: { padding: SIZES.lg },
  headerTitle: { fontSize: 24, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: SIZES.lg },
  headerDate: { fontSize: 12, color: COLORS.textMuted, marginTop: -12, marginBottom: SIZES.lg },
  summaryCard: { padding: SIZES.lg, marginBottom: SIZES.lg, alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4 },
  summaryKcal: { fontSize: 36, fontWeight: FONTS.extrabold, color: COLORS.text },
  summaryUnit: { fontSize: 18, fontWeight: FONTS.regular, color: COLORS.textMuted },
  summaryTarget: { fontSize: 12, color: COLORS.textMuted, marginTop: -2 },
  macroRow: { flexDirection: 'row', gap: SIZES.lg, marginTop: SIZES.sm },
  macroItem: { fontSize: 13, color: COLORS.textMuted, fontWeight: FONTS.medium },
  addBtn: { backgroundColor: COLORS.primary, height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: FONTS.semibold },
});
