import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalorieProgress } from '@/components/ui/CalorieProgress';
import { MacroPanel } from '@/components/ui/MacroPanel';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/i18nContext';
import { Coffee, UtensilsCrossed, Moon, Cookie, Plus, BookOpen, Droplets, GlassWater } from 'lucide-react';

const WATER_GOAL = 8;
const TODAY = new Date().toISOString().split('T')[0];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { profile: authProfile } = useAuth();
  const storeProfile = useAppStore((s) => s.profile);

  // ─── Reactive selectors — re-renders automatically when state changes ───
  const todayLog = useAppStore((s) =>
    s.dailyLogs.find(l => l.date === TODAY) ?? {
      id: '', date: TODAY, totalCalories: 0,
      totalProtein: 0, totalFat: 0, totalCarbs: 0, items: [],
    }
  );
  const waterGlasses     = useAppStore((s) => s.waterLog[TODAY] ?? 0);
  const addWaterGlass    = useAppStore((s) => s.addWaterGlass);
  const removeWaterGlass = useAppStore((s) => s.removeWaterGlass);
  const getTodayLog      = useAppStore((s) => s.getTodayLog);

  // Ensure today's log exists on first render
  useEffect(() => { getTodayLog(); }, [getTodayLog]);

  const target        = authProfile?.daily_calorie_target ?? storeProfile?.dailyCalorieTarget ?? 2000;
  const proteinTarget = authProfile?.protein_target       ?? storeProfile?.proteinTarget       ?? 150;
  const fatTarget     = authProfile?.fat_target           ?? storeProfile?.fatTarget            ?? 67;
  const carbsTarget   = authProfile?.carbs_target         ?? storeProfile?.carbsTarget          ?? 200;
  const displayName   = authProfile?.display_name ?? 'there';

  const meals = useMemo(() => ({
    breakfast: todayLog.items.filter(i => i.mealType === 'breakfast'),
    lunch:     todayLog.items.filter(i => i.mealType === 'lunch'),
    dinner:    todayLog.items.filter(i => i.mealType === 'dinner'),
    snack:     todayLog.items.filter(i => i.mealType === 'snack'),
  }), [todayLog.items]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('good_morning') : hour < 18 ? t('good_afternoon') : t('good_evening');

  const mealCards = [
    { type: 'breakfast' as const, label: t('breakfast'), icon: <Coffee size={17} />,           bg: 'bg-amber-50',  text: 'text-amber-600',  items: meals.breakfast },
    { type: 'lunch'     as const, label: t('lunch'),     icon: <UtensilsCrossed size={17} />, bg: 'bg-orange-50', text: 'text-orange-600', items: meals.lunch },
    { type: 'dinner'    as const, label: t('dinner'),    icon: <Moon size={17} />,             bg: 'bg-violet-50', text: 'text-violet-600', items: meals.dinner },
    { type: 'snack'     as const, label: t('snack'),     icon: <Cookie size={17} />,           bg: 'bg-pink-50',   text: 'text-pink-500',   items: meals.snack },
  ];

  const waterFraction = Math.min(waterGlasses / WATER_GOAL, 1);

  return (
    <div className="pb-24 px-4 pt-6 space-y-4 page-enter stagger-children">
      {/* Greeting */}
      <div className="glass rounded-3xl px-5 py-5">
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="text-2xl font-bold text-foreground text-balance">{displayName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('goal_label')}: <span className="text-primary font-semibold">{target} {t('kcal')}</span>
        </p>
      </div>

      {/* Calories */}
      <div className="glass rounded-3xl p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">{t('calories')}</h2>
        <CalorieProgress consumed={todayLog.totalCalories} target={target} />
      </div>

      {/* Macros — beautiful redesigned panel */}
      <MacroPanel
        protein={todayLog.totalProtein} proteinMax={proteinTarget}
        fat={todayLog.totalFat}         fatMax={fatTarget}
        carbs={todayLog.totalCarbs}     carbsMax={carbsTarget}
      />

      {/* Water tracker */}
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-blue-500" />
            <h2 className="text-base font-semibold text-foreground">{t('water_today')}</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            <span className="font-bold text-blue-500">{waterGlasses}</span>
            {' '}/{' '}{WATER_GOAL} {t('glasses')}
          </span>
        </div>

        <div className="flex gap-1.5 mb-4 flex-wrap">
          {Array.from({ length: WATER_GOAL }).map((_, i) => (
            <div key={i}
              className={`w-8 h-8 rounded-xl flex items-center justify-center glass-pop cursor-pointer ${
                i < waterGlasses ? 'bg-blue-100 text-blue-500' : 'bg-muted text-muted-foreground/30'
              }`}
              style={{ transitionDelay: `${i * 18}ms` }}>
              <GlassWater size={16} />
            </div>
          ))}
        </div>

        <div className="h-2 bg-muted rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-blue-400 rounded-full progress-fill"
            style={{ width: `${waterFraction * 100}%` }} />
        </div>

        <div className="flex gap-2">
          <button onClick={removeWaterGlass} disabled={waterGlasses === 0}
            className="flex-1 h-10 rounded-xl border border-blue-200 text-blue-500 font-semibold text-sm hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors btn-press">
            − {t('remove_glass')}
          </button>
          <button onClick={addWaterGlass} disabled={waterGlasses >= 20}
            className="flex-1 h-10 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 btn-press">
            <Plus size={14} /> {t('add_glass')}
          </button>
        </div>
      </div>

      {/* Meal summary */}
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">{t('diary')}</h2>
          <button onClick={() => navigate('/diary')}
            className="text-xs text-primary font-semibold flex items-center gap-1 btn-press">
            <BookOpen size={13} /> {t('diary')}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {mealCards.map(m => {
            const kcal = m.items.reduce((s, i) => s + i.calories, 0);
            return (
              <button key={m.type} onClick={() => navigate(`/diary?mealType=${m.type}`)}
                className={`flex items-center gap-3 p-3 rounded-2xl ${m.bg} border border-white/60 text-left card-lift btn-press`}>
                <div className={`w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shrink-0 ${m.text}`}>
                  {m.icon}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-foreground">{m.label}</div>
                  <div className={`text-xs ${kcal > 0 ? m.text : 'text-muted-foreground'}`}>
                    {kcal > 0 ? `${kcal} ${t('kcal')}` : '—'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        className="w-full h-13 bg-primary hover:bg-primary/90 text-white font-semibold rounded-2xl btn-press btn-pulse"
        onClick={() => navigate('/add-food')}>
        <Plus size={18} className="mr-2" /> {t('add_food')}
      </Button>
    </div>
  );
};

export default DashboardPage;
