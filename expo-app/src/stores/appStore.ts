import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, DailyLog, LogItem, FoodItem, WeightEntry } from '@/types';
import { calculateFoodNutrients } from '@/lib/calorieCalculator';

interface AppState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

  dailyLogs: DailyLog[];
  getTodayLog: () => DailyLog;
  addLogItem: (logItemData: { foodItem: FoodItem; mealType: LogItem['mealType']; quantityGrams: number }) => void;
  removeLogItem: (logId: string, itemId: string) => void;

  weightEntries: WeightEntry[];
  addWeightEntry: (entry: WeightEntry) => void;

  hasCompletedOnboarding: boolean;
  setOnboardingComplete: (complete: boolean) => void;

  waterLog: Record<string, number>;
  getTodayWater: () => number;
  addWaterGlass: () => void;
  removeWaterGlass: () => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function createEmptyDailyLog(date: string): DailyLog {
  return { id: generateId(), date, totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, items: [] };
}

function recalcTotals(items: LogItem[]): Pick<DailyLog, 'totalCalories' | 'totalProtein' | 'totalFat' | 'totalCarbs'> {
  let cal = 0, prot = 0, fat = 0, carb = 0;
  for (const i of items) { cal += i.calories; prot += i.protein; fat += i.fat; carb += i.carbs; }
  return {
    totalCalories: cal,
    totalProtein: Math.round(prot * 10) / 10,
    totalFat: Math.round(fat * 10) / 10,
    totalCarbs: Math.round(carb * 10) / 10,
  };
}

const storage = createJSONStorage<AppState>(() => AsyncStorage);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      dailyLogs: [],
      weightEntries: [],
      hasCompletedOnboarding: false,
      waterLog: {},

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) =>
        set((state) => ({ profile: state.profile ? { ...state.profile, ...updates } : null })),

      getTodayLog: () => {
        const today = getTodayDate();
        const existing = get().dailyLogs.find((l) => l.date === today);
        if (existing) return existing;
        const newLog = createEmptyDailyLog(today);
        set((state) => ({ dailyLogs: [...state.dailyLogs, newLog] }));
        return newLog;
      },

      addLogItem: (logItemData) => {
        const nutrients = calculateFoodNutrients(
          logItemData.foodItem.caloriesPer100g,
          logItemData.foodItem.proteinPer100g,
          logItemData.foodItem.fatPer100g,
          logItemData.foodItem.carbsPer100g,
          logItemData.quantityGrams
        );
        const newItem: LogItem = {
          id: generateId(),
          foodItemId: logItemData.foodItem.id,
          foodItem: logItemData.foodItem,
          mealType: logItemData.mealType,
          quantityGrams: logItemData.quantityGrams,
          ...nutrients,
        };
        const today = getTodayDate();
        set((state) => {
          const idx = state.dailyLogs.findIndex((l) => l.date === today);
          if (idx !== -1) {
            const logs = [...state.dailyLogs];
            const items = [...logs[idx].items, newItem];
            logs[idx] = { ...logs[idx], items, ...recalcTotals(items) };
            return { dailyLogs: logs };
          }
          const newLog = createEmptyDailyLog(today);
          newLog.items = [newItem];
          Object.assign(newLog, recalcTotals(newLog.items));
          return { dailyLogs: [...state.dailyLogs, newLog] };
        });
      },

      removeLogItem: (logId, itemId) => {
        set((state) => ({
          dailyLogs: state.dailyLogs.map((log) => {
            if (log.id !== logId) return log;
            const items = log.items.filter((i) => i.id !== itemId);
            return { ...log, items, ...recalcTotals(items) };
          }),
        }));
      },

      addWeightEntry: (entry) => set((state) => ({ weightEntries: [...state.weightEntries, entry] })),

      setOnboardingComplete: (complete) => set({ hasCompletedOnboarding: complete }),

      getTodayWater: () => get().waterLog[getTodayDate()] ?? 0,

      addWaterGlass: () => {
        const today = getTodayDate();
        set((state) => ({
          waterLog: { ...state.waterLog, [today]: Math.min(20, (state.waterLog[today] ?? 0) + 1) },
        }));
      },

      removeWaterGlass: () => {
        const today = getTodayDate();
        set((state) => ({
          waterLog: { ...state.waterLog, [today]: Math.max(0, (state.waterLog[today] ?? 0) - 1) },
        }));
      },
    }),
    { name: 'calorie-tracker-storage', storage }
  )
);
