import type { Gender, ActivityLevel, Goal, UserProfile } from '@/types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, low: 1.375, moderate: 1.55, high: 1.725, very_high: 1.9,
};

export function calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
  if (gender === 'male') return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export function calculateDailyCalories(
  weight: number, height: number, age: number, gender: Gender,
  activityLevel: ActivityLevel, goal: Goal
): number {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  switch (goal) {
    case 'lose': return Math.round(tdee - 500);
    case 'gain': return Math.round(tdee + 500);
    default: return Math.round(tdee);
  }
}

export function calculateMacroTargets(dailyCalories: number) {
  return {
    protein: Math.round((dailyCalories * 0.3) / 4),
    fat: Math.round((dailyCalories * 0.3) / 9),
    carbs: Math.round((dailyCalories * 0.4) / 4),
  };
}

export function createUserProfile(
  profileData: Omit<UserProfile, 'dailyCalorieTarget' | 'proteinTarget' | 'fatTarget' | 'carbsTarget'>
): UserProfile {
  const dailyCalorieTarget = calculateDailyCalories(
    profileData.weight, profileData.height, profileData.age,
    profileData.gender, profileData.activityLevel, profileData.goal
  );
  const macros = calculateMacroTargets(dailyCalorieTarget);
  return { ...profileData, dailyCalorieTarget, proteinTarget: macros.protein, fatTarget: macros.fat, carbsTarget: macros.carbs };
}

export function calculateFoodNutrients(
  caloriesPer100g: number, proteinPer100g: number, fatPer100g: number, carbsPer100g: number, quantityGrams: number
) {
  const ratio = quantityGrams / 100;
  return {
    calories: Math.round(caloriesPer100g * ratio),
    protein: Math.round(proteinPer100g * ratio * 10) / 10,
    fat: Math.round(fatPer100g * ratio * 10) / 10,
    carbs: Math.round(carbsPer100g * ratio * 10) / 10,
  };
}
