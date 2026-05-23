import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FoodCameraAnalyzer } from '@/components/food/FoodCameraAnalyzer';
import { GlassCard } from '@/components/ui/GlassCard';
import { searchFoodItems } from '@/data/mockFoodDatabase';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/contexts/i18nContext';
import { calculateFoodNutrients } from '@/lib/calorieCalculator';
import { COLORS, SIZES, FONTS } from '@/constants/theme';
import { Search, ArrowLeft, Plus, Minus, Check, Camera } from 'lucide-react-native';
import type { FoodItem, MealType } from '@/types';

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: '#f59e0b', lunch: '#ff6b35', dinner: '#7c3aed', snack: '#ec4899',
};

export default function AddFoodScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { t } = useI18n();
  const addLogItem = useAppStore((s) => s.addLogItem);

  const initialMealType = route.params?.mealType || 'breakfast';
  const initialTab = route.params?.tab === 'camera' ? 'camera' : 'search';
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [activeTab, setActiveTab] = useState<'search' | 'camera'>(initialTab);
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(100);

  const searchResults = useMemo(() => searchFoodItems(query), [query]);
  const displayedItems = query.trim() ? searchResults : [];

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealLabels: Record<MealType, string> = {
    breakfast: t('breakfast'), lunch: t('lunch'), dinner: t('dinner'), snack: t('snack'),
  };

  const handleSave = () => {
    if (!selectedFood) return;
    addLogItem({ foodItem: selectedFood, mealType, quantityGrams: quantity });
    Alert.alert('Done', t('food_added'));
    navigation.goBack();
  };

  const handleAddAIFood = (food: FoodItem, qtyGrams: number) => {
    addLogItem({ foodItem: food, mealType, quantityGrams: qtyGrams });
  };

  const nutrients = selectedFood
    ? calculateFoodNutrients(selectedFood.caloriesPer100g, selectedFood.proteinPer100g, selectedFood.fatPer100g, selectedFood.carbsPer100g, quantity)
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeTab === 'camera' ? t('ai_recognition') : t('add_food_title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {mealTypes.map(type => (
            <TouchableOpacity key={type} onPress={() => setMealType(type)} style={[styles.pill, mealType === type && { backgroundColor: MEAL_COLORS[type] + '15', borderColor: MEAL_COLORS[type] }]}>
              <Text style={[styles.pillText, mealType === type && { color: MEAL_COLORS[type], fontWeight: FONTS.semibold }]}>{mealLabels[type]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'search' && styles.tabButtonActive]}
            onPress={() => { setActiveTab('search'); setSelectedFood(null); }}
          >
            <Search size={14} color={activeTab === 'search' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.tabButtonText, activeTab === 'search' && styles.tabButtonTextActive]}>{t('search_food')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'camera' && styles.tabButtonActive]}
            onPress={() => { setActiveTab('camera'); setSelectedFood(null); }}
          >
            <Camera size={14} color={activeTab === 'camera' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.tabButtonText, activeTab === 'camera' && styles.tabButtonTextActive]}>{t('ai_camera')}</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'camera' ? (
          <FoodCameraAnalyzer onAddFood={handleAddAIFood} />
        ) : selectedFood ? (
          <GlassCard style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.foodName}>{selectedFood.name}</Text>
              <TouchableOpacity onPress={() => setSelectedFood(null)}>
                <Text style={styles.changeText}>{t('back')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.nutriGrid}>
              {[
                { val: selectedFood.caloriesPer100g, label: t('kcal'), color: COLORS.primary },
                { val: `${selectedFood.proteinPer100g}${t('g')}`, label: t('protein'), color: COLORS.blue },
                { val: `${selectedFood.fatPer100g}${t('g')}`, label: t('fat'), color: COLORS.yellow },
                { val: `${selectedFood.carbsPer100g}${t('g')}`, label: t('carbs'), color: COLORS.orange },
              ].map(n => (
                <View key={n.label} style={styles.nutriCell}>
                  <Text style={[styles.nutriVal, { color: n.color }]}>{n.val}</Text>
                  <Text style={styles.nutriLbl}>{n.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>{t('quantity')}</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(10, quantity - 10))} style={styles.qtyBtn}>
                  <Minus size={16} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}{t('g')}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 10)} style={styles.qtyBtn}>
                  <Plus size={16} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>

            {nutrients && (
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>{t('total_for')} {quantity}{t('g')}</Text>
                <Text style={styles.totalKcal}>{nutrients.calories} <Text style={styles.totalUnit}>{t('kcal')}</Text></Text>
                <View style={styles.totalMacros}>
                  <Text style={[styles.totalMacro, { color: COLORS.blue }]}>P: {nutrients.protein}{t('g')}</Text>
                  <Text style={[styles.totalMacro, { color: COLORS.yellow }]}>F: {nutrients.fat}{t('g')}</Text>
                  <Text style={[styles.totalMacro, { color: COLORS.orange }]}>C: {nutrients.carbs}{t('g')}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Check size={18} color="#fff" />
              <Text style={styles.saveBtnText}>{t('add_to')} {mealLabels[mealType]}</Text>
            </TouchableOpacity>
          </GlassCard>
        ) : (
          <>
            <View style={styles.searchWrap}>
              <Search size={16} color={COLORS.textMuted} style={styles.searchIcon} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('search_foods')}
                style={styles.searchInput}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {query.trim() && (
              <Text style={styles.resultsCount}>{searchResults.length} {t('results')}</Text>
            )}

            <View style={styles.results}>
              {displayedItems.map(food => (
                <TouchableOpacity key={food.id} onPress={() => { setSelectedFood(food); setQuantity(100); }} style={styles.resultRow}>
                  <View style={styles.resultLeft}>
                    <Text style={styles.resultName}>{food.name}</Text>
                    <Text style={styles.resultMeta}>
                      <Text style={{ color: COLORS.blue }}>P:{food.proteinPer100g}{t('g')}</Text> · <Text style={{ color: COLORS.yellow }}>F:{food.fatPer100g}{t('g')}</Text> · <Text style={{ color: COLORS.orange }}>C:{food.carbsPer100g}{t('g')}</Text>
                    </Text>
                  </View>
                  <View style={styles.resultRight}>
                    <Text style={styles.resultKcal}>{food.caloriesPer100g}</Text>
                    <Text style={styles.resultUnit}>{t('kcal')}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {query.trim() && searchResults.length === 0 && (
                <Text style={styles.noResults}>{t('no_foods_found')}</Text>
              )}
              {!query.trim() && (
                <View style={styles.emptySearch}>
                  <Search size={40} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>{t('search_foods')}</Text>
                  <Text style={styles.emptySub}>45+ {t('results')}</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: FONTS.bold, color: COLORS.text },
  scroll: { padding: SIZES.lg },
  pills: { flexDirection: 'row', gap: 8, marginBottom: SIZES.lg },
  tabSwitcher: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16, padding: 4, marginBottom: SIZES.lg, borderWidth: 1, borderColor: COLORS.cardBorder },
  tabButton: { flex: 1, height: 42, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tabButtonActive: { backgroundColor: COLORS.primary },
  tabButtonText: { fontSize: 12, color: COLORS.textMuted, fontWeight: FONTS.semibold },
  tabButtonTextActive: { color: '#fff' },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', backgroundColor: COLORS.card },
  pillText: { fontSize: 12, color: COLORS.textMuted },
  detailCard: { padding: SIZES.lg },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.lg },
  foodName: { fontSize: 18, fontWeight: FONTS.bold, color: COLORS.text, flex: 1, marginRight: SIZES.md },
  changeText: { fontSize: 13, color: COLORS.primary, fontWeight: FONTS.medium },
  nutriGrid: { flexDirection: 'row', gap: 8, marginBottom: SIZES.lg },
  nutriCell: { flex: 1, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 14, padding: SIZES.md, alignItems: 'center' },
  nutriVal: { fontSize: 15, fontWeight: FONTS.extrabold },
  nutriLbl: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.lg },
  quantityLabel: { fontSize: 14, fontWeight: FONTS.medium, color: COLORS.text },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.04)', justifyContent: 'center', alignItems: 'center' },
  qtyValue: { fontSize: 18, fontWeight: FONTS.bold, color: COLORS.primary, minWidth: 60, textAlign: 'center' },
  totalBox: { backgroundColor: COLORS.primary + '10', borderWidth: 1, borderColor: COLORS.primary + '20', borderRadius: 16, padding: SIZES.lg, alignItems: 'center', marginBottom: SIZES.lg },
  totalLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  totalKcal: { fontSize: 32, fontWeight: FONTS.extrabold, color: COLORS.primary },
  totalUnit: { fontSize: 14, fontWeight: FONTS.regular, color: COLORS.textMuted },
  totalMacros: { flexDirection: 'row', gap: 16, marginTop: 6 },
  totalMacro: { fontSize: 12, fontWeight: FONTS.semibold },
  saveBtn: { backgroundColor: COLORS.primary, height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: FONTS.semibold },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, paddingHorizontal: SIZES.md, marginBottom: SIZES.md, borderWidth: 1, borderColor: COLORS.cardBorder },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 15, color: COLORS.text },
  resultsCount: { fontSize: 12, color: COLORS.textMuted, marginBottom: SIZES.sm },
  results: { gap: 8 },
  resultRow: { backgroundColor: COLORS.card, borderRadius: 16, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.cardBorder, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLeft: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: FONTS.semibold, color: COLORS.text },
  resultMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  resultRight: { alignItems: 'flex-end' },
  resultKcal: { fontSize: 16, fontWeight: FONTS.extrabold, color: COLORS.primary },
  resultUnit: { fontSize: 10, color: COLORS.textMuted },
  noResults: { textAlign: 'center', color: COLORS.textMuted, paddingVertical: 40, fontSize: 14 },
  emptySearch: { alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 15, color: COLORS.textMuted, marginTop: 12, fontWeight: FONTS.medium },
  emptySub: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, opacity: 0.7 },
});
