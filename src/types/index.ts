/**
 * Типы данных для приложения подсчета калорий
 */

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'low' | 'moderate' | 'high' | 'very_high';
export type Goal = 'lose' | 'maintain' | 'gain';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  id?: string;
  age: number;
  weight: number; // кг
  height: number; // см
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
  dailyCalorieTarget: number;
  proteinTarget: number; // г
  fatTarget: number; // г
  carbsTarget: number; // г
}

export interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbsPer100g: number;
  barcode?: string;
  source: 'database' | 'user';
}

export interface LogItem {
  id: string;
  foodItemId: string;
  mealType: MealType;
  quantityGrams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  foodItem?: FoodItem;
}

export interface DailyLog {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  weight?: number;
  items: LogItem[];
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface MacroTargets {
  protein: number;
  fat: number;
  carbs: number;
}

export interface MacroConsumed {
  protein: number;
  fat: number;
  carbs: number;
}
