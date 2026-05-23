import React, { useEffect } from 'react';
import { MealSection } from '@/components/diary/MealSection';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/i18nContext';
import { Coffee, UtensilsCrossed, Moon, Cookie, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TODAY = new Date().toISOString().split('T')[0];

const DiaryPage: React.FC = () => {
  const navigate    = useNavigate();
  const { t }       = useI18n();
  const storeProfile = useAppStore((s) => s.profile);
  const { profile: authProfile } = useAuth();

  // ─── Reactive selectors ───────────────────────────────────────────────
  const todayLog = useAppStore((s) =>
    s.dailyLogs.find(l => l.date === TODAY) ?? {
      id: '', date: TODAY, totalCalories: 0,
      totalProtein: 0, totalFat: 0, totalCarbs: 0, items: [],
    }
  );
  const getTodayLog = useAppStore((s) => s.getTodayLog);
  useEffect(() => { getTodayLog(); }, [getTodayLog]);

  const target = authProfile?.daily_calorie_target ?? storeProfile?.dailyCalorieTarget ?? 2000;
  const today  = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const meals = [
    { title: t('breakfast'), mealType: 'breakfast' as const, icon: <Coffee size={15} />,           color: 'bg-amber-50 text-amber-600',   items: todayLog.items.filter(i => i.mealType === 'breakfast') },
    { title: t('lunch'),     mealType: 'lunch'     as const, icon: <UtensilsCrossed size={15} />, color: 'bg-orange-50 text-orange-600', items: todayLog.items.filter(i => i.mealType === 'lunch') },
    { title: t('dinner'),    mealType: 'dinner'    as const, icon: <Moon size={15} />,             color: 'bg-violet-50 text-violet-600', items: todayLog.items.filter(i => i.mealType === 'dinner') },
    { title: t('snack'),     mealType: 'snack'     as const, icon: <Cookie size={15} />,           color: 'bg-pink-50 text-pink-500',     items: todayLog.items.filter(i => i.mealType === 'snack') },
  ];

  return (
    <div className="pb-24 page-enter px-4 pt-6 space-y-4">
      <div className="glass rounded-3xl px-5 py-4">
        <h1 className="text-xl font-bold text-foreground text-balance">{t('food_diary')}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
        <div className="flex items-center gap-1 mt-2">
          <span className="text-2xl font-bold text-primary">{todayLog.totalCalories}</span>
          <span className="text-sm text-muted-foreground">/ {target} {t('kcal')}</span>
        </div>
      </div>

      {/* Macro summary bar */}
      <div className="glass rounded-3xl p-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { val: todayLog.totalCalories, label: t('kcal'),    color: 'text-primary' },
            { val: todayLog.totalProtein,  label: t('protein'), color: 'text-blue-500',   unit: t('g') },
            { val: todayLog.totalFat,      label: t('fat'),     color: 'text-yellow-500', unit: t('g') },
            { val: todayLog.totalCarbs,    label: t('carbs'),   color: 'text-primary',    unit: t('g') },
          ].map(({ val, label, color, unit }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <div className={`text-lg font-extrabold tabular-nums ${color}`}>
                {val}<span className="text-[10px] font-semibold opacity-70">{unit}</span>
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {meals.map(meal => (
        <MealSection
          key={meal.mealType}
          title={meal.title}
          mealType={meal.mealType}
          icon={meal.icon}
          color={meal.color}
          items={meal.items}
        />
      ))}

      <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-2xl btn-press"
        onClick={() => navigate('/add-food')}>
        <Plus size={18} className="mr-2" /> {t('add_food')}
      </Button>
    </div>
  );
};

export default DiaryPage;
