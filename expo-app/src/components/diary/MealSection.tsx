import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/contexts/i18nContext';
import { COLORS, SIZES, FONTS } from '@/constants/theme';
import { Plus, Trash2 } from 'lucide-react-native';
import type { LogItem, MealType } from '@/types';

const TODAY = new Date().toISOString().split('T')[0];

interface Props {
  title: string;
  mealType: MealType;
  icon: React.ReactNode;
  color: string;
  items: LogItem[];
  onAdd: () => void;
}

export const MealSection: React.FC<Props> = React.memo(({ title, mealType, icon, color, items, onAdd }) => {
  const { t } = useI18n();
  const removeLogItem = useAppStore((s) => s.removeLogItem);
  const todayLogId = useAppStore((s) => s.dailyLogs.find(l => l.date === TODAY)?.id ?? '');

  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>{icon}</View>
          <View>
            <Text style={styles.title}>{title}</Text>
            {totalCalories > 0 && (
              <Text style={[styles.kcal, { color }]}>{totalCalories} {t('kcal')}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
          <Plus size={14} color={COLORS.primary} />
          <Text style={styles.addText}>{t('add')}</Text>
        </TouchableOpacity>
      </View>

      {items.length > 0 ? (
        <View style={styles.list}>
          {items.map(item => (
            <View key={item.id} style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.foodName} numberOfLines={1}>{item.foodItem?.name}</Text>
                <Text style={styles.foodMeta}>
                  {item.quantityGrams}{t('g')} · <Text style={{ color: COLORS.blue }}>P:{item.protein}{t('g')}</Text> · <Text style={{ color: COLORS.yellow }}>F:{item.fat}{t('g')}</Text> · <Text style={{ color: COLORS.orange }}>C:{item.carbs}{t('g')}</Text>
                </Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.cal}>{item.calories}</Text>
                <TouchableOpacity onPress={() => removeLogItem(todayLogId, item.id)} style={styles.delBtn}>
                  <Trash2 size={13} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>{t('nothing_logged')}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 20, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SIZES.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: FONTS.semibold, color: COLORS.text },
  kcal: { fontSize: 12, fontWeight: FONTS.semibold, marginTop: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary + '12', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  addText: { fontSize: 12, fontWeight: FONTS.semibold, color: COLORS.primary },
  list: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 12 },
  rowLeft: { flex: 1 },
  foodName: { fontSize: 13, fontWeight: FONTS.medium, color: COLORS.text },
  foodMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cal: { fontSize: 13, fontWeight: FONTS.bold, color: COLORS.primary },
  delBtn: { padding: 4 },
  empty: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, paddingVertical: 12 },
});
