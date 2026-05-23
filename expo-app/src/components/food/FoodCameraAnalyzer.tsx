import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Check, Plus, Minus, RefreshCw } from 'lucide-react-native';
import { analyzeFoodImage, type AnalyzedFood } from '@/services/groqService';
import { calculateFoodNutrients } from '@/lib/calorieCalculator';
import { COLORS, FONTS, SHADOW, SIZES } from '@/constants/theme';
import type { FoodItem } from '@/types';
import { useI18n } from '@/contexts/i18nContext';

interface Props {
  onAddFood: (food: FoodItem, quantityGrams: number) => void;
}

export function FoodCameraAnalyzer({ onAddFood }: Props) {
  const { t } = useI18n();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [foods, setFoods] = useState<AnalyzedFood[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo access to analyze food images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: false,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageBase64(asset.base64 ?? null);
    setFoods([]);
    setQuantities({});
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeFoodImage(imageBase64);
      setFoods(result.foods);

      const next: Record<number, number> = {};
      result.foods.forEach((food, index) => {
        next[index] = food.estimatedWeightGrams;
      });
      setQuantities(next);
    } catch (error) {
      Alert.alert('AI error', error instanceof Error ? error.message : 'Unable to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImageUri(null);
    setImageBase64(null);
    setFoods([]);
    setQuantities({});
    setIsAnalyzing(false);
  };

  const addFood = (food: AnalyzedFood, index: number) => {
    const quantity = quantities[index] ?? food.estimatedWeightGrams;
    const item: FoodItem = {
      id: `ai-${Date.now()}-${index}`,
      name: food.name,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      fatPer100g: food.fatPer100g,
      carbsPer100g: food.carbsPer100g,
      source: 'user',
    };
    onAddFood(item, quantity);
    Alert.alert('Done', t('food_added'));
  };

  return (
    <View style={styles.container}>
      {!imageUri && (
        <TouchableOpacity style={styles.uploadCard} onPress={pickImage}>
          <Camera size={36} color={COLORS.primary} />
          <Text style={styles.uploadTitle}>{t('tap_photo')}</Text>
          <Text style={styles.uploadSubtitle}>{t('ai_will_identify')}</Text>
        </TouchableOpacity>
      )}

      {imageUri && (
        <View style={styles.previewWrap}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          <TouchableOpacity style={styles.resetBadge} onPress={reset}>
            <RefreshCw size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {imageUri && foods.length === 0 && !isAnalyzing && (
        <TouchableOpacity style={styles.primaryButton} onPress={handleAnalyze}>
          <Text style={styles.primaryButtonText}>{t('analyze_ai')}</Text>
        </TouchableOpacity>
      )}

      {isAnalyzing && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t('analyzing')}</Text>
          <Text style={styles.infoSubtitle}>{t('ai_will_identify')}</Text>
        </View>
      )}

      {foods.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>{t('recognized')}</Text>
          {foods.map((food, index) => {
            const quantity = quantities[index] ?? food.estimatedWeightGrams;
            const nutrients = calculateFoodNutrients(
              food.caloriesPer100g,
              food.proteinPer100g,
              food.fatPer100g,
              food.carbsPer100g,
              quantity
            );

            return (
              <View key={`${food.name}-${index}`} style={styles.resultCard}>
                <View style={styles.resultTop}>
                  <Text style={styles.resultName}>{food.name}</Text>
                  <TouchableOpacity style={styles.addBadge} onPress={() => addFood(food, index)}>
                    <Check size={12} color="#fff" />
                    <Text style={styles.addBadgeText}>{t('add')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.nutritionGrid}>
                  {[
                    { label: t('kcal'), value: food.caloriesPer100g, color: COLORS.primary },
                    { label: t('protein'), value: food.proteinPer100g, color: COLORS.blue },
                    { label: t('fat'), value: food.fatPer100g, color: COLORS.yellow },
                    { label: t('carbs'), value: food.carbsPer100g, color: COLORS.orange },
                  ].map((item) => (
                    <View key={item.label} style={styles.nutritionCell}>
                      <Text style={[styles.nutritionValue, { color: item.color }]}>{item.value}</Text>
                      <Text style={styles.nutritionLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.quantityHeader}>
                  <Text style={styles.quantityLabel}>{t('portion_weight')}</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => setQuantities((prev) => ({ ...prev, [index]: Math.max(10, quantity - 10) }))}
                    >
                      <Minus size={14} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{quantity}{t('g')}</Text>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => setQuantities((prev) => ({ ...prev, [index]: quantity + 10 }))}
                    >
                      <Plus size={14} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.totalCard}>
                  <Text style={styles.totalLabel}>
                    {t('total_for')} {quantity}{t('g')}
                  </Text>
                  <Text style={styles.totalKcal}>
                    {nutrients.calories} <Text style={styles.totalUnit}>{t('kcal')}</Text>
                  </Text>
                  <Text style={styles.totalMacros}>
                    P {nutrients.protein}{t('g')} · F {nutrients.fat}{t('g')} · C {nutrients.carbs}{t('g')}
                  </Text>
                </View>
              </View>
            );
          })}

          <TouchableOpacity style={styles.secondaryButton} onPress={reset}>
            <Text style={styles.secondaryButtonText}>{t('take_another')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SIZES.md },
  uploadCard: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: `${COLORS.primary}55`,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  uploadTitle: { fontSize: 15, fontWeight: FONTS.semibold, color: COLORS.text, textAlign: 'center' },
  uploadSubtitle: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
  previewWrap: { borderRadius: 24, overflow: 'hidden', position: 'relative' },
  preview: { width: '100%', height: 220 },
  resetBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    height: 48,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: FONTS.semibold },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    ...SHADOW.light,
  },
  infoTitle: { fontSize: 15, fontWeight: FONTS.semibold, color: COLORS.text },
  infoSubtitle: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
  results: { gap: SIZES.md },
  resultsTitle: { fontSize: 14, fontWeight: FONTS.semibold, color: COLORS.text },
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOW.light,
  },
  resultTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  resultName: { flex: 1, fontSize: 15, fontWeight: FONTS.bold, color: COLORS.text },
  addBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },
  addBadgeText: { color: '#fff', fontSize: 12, fontWeight: FONTS.semibold },
  nutritionGrid: { flexDirection: 'row', gap: 8 },
  nutritionCell: { flex: 1, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 14, padding: 10, alignItems: 'center' },
  nutritionValue: { fontSize: 14, fontWeight: FONTS.extrabold },
  nutritionLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  quantityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantityLabel: { fontSize: 13, color: COLORS.textMuted },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyButton: { width: 32, height: 32, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  qtyValue: { minWidth: 56, textAlign: 'center', fontSize: 16, fontWeight: FONTS.bold, color: COLORS.primary },
  totalCard: {
    backgroundColor: `${COLORS.primary}12`,
    borderColor: `${COLORS.primary}20`,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },
  totalLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  totalKcal: { fontSize: 26, fontWeight: FONTS.extrabold, color: COLORS.primary },
  totalUnit: { fontSize: 13, fontWeight: FONTS.regular, color: COLORS.textMuted },
  totalMacros: { marginTop: 4, fontSize: 12, color: COLORS.textMuted },
  secondaryButton: {
    height: 46,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { fontSize: 14, fontWeight: FONTS.semibold, color: COLORS.text },
});
