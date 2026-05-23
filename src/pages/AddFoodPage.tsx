import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { searchFoodItems } from '@/data/mockFoodDatabase';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/contexts/i18nContext';
import { calculateFoodNutrients } from '@/lib/calorieCalculator';
import { FoodCameraAnalyzer } from '@/components/food/FoodCameraAnalyzer';
import { toast } from 'sonner';
import type { FoodItem, MealType } from '@/types';
import { Search, ArrowLeft, Plus, Minus, Check, Camera } from 'lucide-react';

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: 'bg-amber-100 text-amber-700',
  lunch:     'bg-orange-100 text-orange-700',
  dinner:    'bg-violet-100 text-violet-700',
  snack:     'bg-pink-100 text-pink-600',
};

const AddFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const addLogItem = useAppStore((s) => s.addLogItem);

  const initialMealType = (searchParams.get('mealType') as MealType) || 'breakfast';
  const [mealType, setMealType]     = useState<MealType>(initialMealType);
  const [activeTab, setActiveTab]   = useState<'search' | 'camera'>(
    searchParams.get('tab') === 'camera' ? 'camera' : 'search'
  );
  const [query, setQuery]           = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity]     = useState(100);

  const searchResults  = useMemo(() => searchFoodItems(query), [query]);
  const displayedItems = query.trim() ? searchResults : [];

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealLabels: Record<MealType, string> = {
    breakfast: t('breakfast'), lunch: t('lunch'), dinner: t('dinner'), snack: t('snack'),
  };

  const handleSelectFood = (food: FoodItem) => { setSelectedFood(food); setQuantity(100); };

  const handleSave = () => {
    if (!selectedFood) return;
    addLogItem({ foodItem: selectedFood, mealType, quantityGrams: quantity });
    toast.success(t('food_added'));
    navigate('/diary');
  };

  const handleAddAIFood = (food: FoodItem, qtyGrams: number) => {
    addLogItem({ foodItem: food, mealType, quantityGrams: qtyGrams });
    toast.success(t('food_added'));
  };

  const nutrients = selectedFood
    ? calculateFoodNutrients(
        selectedFood.caloriesPer100g, selectedFood.proteinPer100g,
        selectedFood.fatPer100g,      selectedFood.carbsPer100g, quantity
      )
    : null;

  return (
    <div className="pb-24 page-enter min-h-screen">
      {/* Sticky header */}
      <div className="glass-strong sticky top-0 z-20 px-4 pt-5 pb-3 space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/diary')}
            className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center text-foreground shrink-0 btn-press"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-foreground text-balance">
            {activeTab === 'camera' ? t('ai_recognition') : t('add_food_title')}
          </h1>
        </div>

        {/* Meal type pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 whitespace-nowrap">
          {mealTypes.map(type => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 btn-press ${
                mealType === type
                  ? `${MEAL_COLORS[type]} border-current`
                  : 'bg-white/50 text-muted-foreground border-white/60'
              }`}
            >
              {mealLabels[type]}
            </button>
          ))}
        </div>

        {/* Search / Camera tab switcher */}
        <div className="glass rounded-xl p-1 flex">
          {(['search', 'camera'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedFood(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 btn-press ${
                activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {tab === 'search' ? <Search size={13} /> : <Camera size={13} />}
              {tab === 'search' ? t('search_food') : t('ai_camera')}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {activeTab === 'search' ? (
          <div>
            {selectedFood ? (
              /* ── Food detail + quantity picker ── */
              <div className="glass rounded-3xl p-5 space-y-4 animate-scale-in">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-foreground text-base text-balance flex-1 min-w-0 pr-3 truncate">
                    {selectedFood.name}
                  </h2>
                  <button onClick={() => setSelectedFood(null)} className="text-muted-foreground btn-press">
                    <ArrowLeft size={18} />
                  </button>
                </div>

                {/* Per-100g macros */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { val: selectedFood.caloriesPer100g, label: t('kcal'),    cls: 'bg-orange-50 text-primary' },
                    { val: `${selectedFood.proteinPer100g}${t('g')}`, label: t('protein'), cls: 'bg-blue-50 text-blue-500' },
                    { val: `${selectedFood.fatPer100g}${t('g')}`,     label: t('fat'),     cls: 'bg-yellow-50 text-yellow-500' },
                    { val: `${selectedFood.carbsPer100g}${t('g')}`,   label: t('carbs'),   cls: 'bg-orange-50 text-orange-500' },
                  ].map(({ val, label, cls }) => (
                    <div key={label} className={`rounded-xl p-2 ${cls.split(' ')[0]}`}>
                      <div className={`text-sm font-extrabold tabular-nums ${cls.split(' ')[1]}`}>{val}</div>
                      <div className="text-[10px] text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Quantity picker */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">{t('quantity')}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(10, quantity - 10))}
                        className="w-8 h-8 rounded-xl bg-white/70 border border-white/60 flex items-center justify-center text-foreground btn-press"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-lg font-bold text-primary w-16 text-center tabular-nums">
                        {quantity}{t('g')}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 10)}
                        className="w-8 h-8 rounded-xl bg-white/70 border border-white/60 flex items-center justify-center text-foreground btn-press"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <Slider value={[quantity]} onValueChange={v => setQuantity(v[0])} min={10} max={500} step={10} />
                </div>

                {/* Total nutrients */}
                {nutrients && (
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center animate-scale-in">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t('total_for')} {quantity}{t('g')}
                    </p>
                    <p className="text-3xl font-extrabold text-primary tabular-nums">
                      {nutrients.calories}
                      <span className="text-sm font-normal ml-1">{t('kcal')}</span>
                    </p>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                      <span className="text-blue-500 font-semibold">P: {nutrients.protein}{t('g')}</span>
                      <span className="text-yellow-500 font-semibold">F: {nutrients.fat}{t('g')}</span>
                      <span className="text-orange-500 font-semibold">C: {nutrients.carbs}{t('g')}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-2xl btn-press"
                  onClick={handleSave}
                >
                  <Check size={17} className="mr-2" /> {t('add_to')} {mealLabels[mealType]}
                </Button>
              </div>
            ) : (
              /* ── Search panel ── */
              <div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t('search_foods')}
                    className="pl-9 h-12 bg-white/70 border-white/60 focus:border-primary rounded-xl"
                  />
                </div>

                {query.trim() && (
                  <p className="text-xs text-muted-foreground mb-3">
                    {searchResults.length} {t('results')}
                  </p>
                )}

                <div className="space-y-2">
                  {displayedItems.map((food, idx) => (
                    <button
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className="w-full text-left glass rounded-2xl p-4 hover:bg-white/80 transition-colors btn-press card-lift animate-fade-in"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="min-w-0 flex-1 pr-3">
                          <h3 className="font-semibold text-foreground text-sm truncate">{food.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <span className="text-blue-400">P:{food.proteinPer100g}{t('g')}</span>
                            <span className="mx-1 opacity-40">·</span>
                            <span className="text-yellow-500">F:{food.fatPer100g}{t('g')}</span>
                            <span className="mx-1 opacity-40">·</span>
                            <span className="text-orange-400">C:{food.carbsPer100g}{t('g')}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-primary text-base tabular-nums">
                            {food.caloriesPer100g}
                          </span>
                          <div className="text-[10px] text-muted-foreground">{t('kcal')}</div>
                        </div>
                      </div>
                    </button>
                  ))}

                  {query.trim() && searchResults.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-sm animate-fade-in">
                      {t('no_foods_found')}
                    </div>
                  )}

                  {!query.trim() && (
                    <div className="text-center py-14 text-muted-foreground text-sm animate-fade-in">
                      <Search size={36} className="mx-auto mb-3 opacity-20" />
                      <p className="font-medium">{t('search_foods')}</p>
                      <p className="text-xs mt-1 opacity-60">45+ {t('results')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <FoodCameraAnalyzer onAddFood={handleAddAIFood} />
        )}
      </div>
    </div>
  );
};

export default AddFoodPage;
