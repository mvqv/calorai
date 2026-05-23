import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import type { LogItem, MealType } from '@/types';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/contexts/i18nContext';

const TODAY = new Date().toISOString().split('T')[0];

interface MealSectionProps {
  title: string;
  mealType: MealType;
  icon: React.ReactNode;
  color: string;
  items: LogItem[];
}

/** Individual food row — memoised so it only re-renders when its own item changes */
const FoodRow = React.memo(({ item, logId, onRemove, unit }: {
  item: LogItem;
  logId: string;
  onRemove: (logId: string, itemId: string) => void;
  unit: string;
}) => {
  const handleRemove = useCallback(() => onRemove(logId, item.id), [onRemove, logId, item.id]);
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/60 dark:border-white/10 animate-fade-in">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm truncate">{item.foodItem?.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.quantityGrams}{unit}
          <span className="mx-1 opacity-40">·</span>
          <span className="text-blue-500">P:{item.protein}{unit}</span>
          <span className="mx-0.5 opacity-40">·</span>
          <span className="text-yellow-500">F:{item.fat}{unit}</span>
          <span className="mx-0.5 opacity-40">·</span>
          <span className="text-orange-500">C:{item.carbs}{unit}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="text-sm font-extrabold text-primary tabular-nums">{item.calories}</span>
        <button
          onClick={handleRemove}
          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors btn-press rounded-lg hover:bg-destructive/10"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
});
FoodRow.displayName = 'FoodRow';

export const MealSection: React.FC<MealSectionProps> = React.memo(({ title, mealType, icon, color, items }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const removeLogItem = useAppStore((s) => s.removeLogItem);
  // ─── Reactive selector — no function call, direct data ─────────────
  const todayLogId = useAppStore((s) => s.dailyLogs.find(l => l.date === TODAY)?.id ?? '');

  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
  const handleAdd = useCallback(() => navigate(`/add-food?mealType=${mealType}`), [navigate, mealType]);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{title}</h3>
            {totalCalories > 0 && (
              <span className="text-xs text-primary font-semibold tabular-nums animate-fade-in">
                {totalCalories} {t('kcal')}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-colors btn-press ripple-container"
        >
          <Plus size={13} /> {t('add')}
        </button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map(item => (
            <FoodRow
              key={item.id}
              item={item}
              logId={todayLogId}
              onRemove={removeLogItem}
              unit={t('g')}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-3 text-muted-foreground text-xs">
          {t('no_foods_found_today')}
        </div>
      )}
    </div>
  );
});
MealSection.displayName = 'MealSection';
