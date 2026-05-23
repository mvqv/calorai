import type { Gender, ActivityLevel, Goal, UserProfile } from '@/types';

/**
 * Коэффициенты активности для расчета TDEE
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Сидячий образ жизни
  low: 1.375,            // Низкая активность (1-3 дня в неделю)
  moderate: 1.55,        // Средняя активность (3-5 дней в неделю)
  high: 1.725,           // Высокая активность (6-7 дней в неделю)
  very_high: 1.9,        // Очень высокая активность (интенсивные тренировки)
};

/**
 * Расчет базового метаболизма (BMR) по формуле Миффлина-Сан Жеора
 * @param weight - вес в кг
 * @param height - рост в см
 * @param age - возраст в годах
 * @param gender - пол
 * @returns BMR в ккал
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

/**
 * Расчет суточной нормы калорий (TDEE) с учетом активности и цели
 * @param weight - вес в кг
 * @param height - рост в см
 * @param age - возраст в годах
 * @param gender - пол
 * @param activityLevel - уровень активности
 * @param goal - цель (похудение/набор/поддержание)
 * @returns суточная норма калорий
 */
export function calculateDailyCalories(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  goal: Goal
): number {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];

  // Корректировка по цели
  switch (goal) {
    case 'lose':
      return Math.round(tdee - 500);
    case 'gain':
      return Math.round(tdee + 500);
    case 'maintain':
    default:
      return Math.round(tdee);
  }
}

/**
 * Расчет целевых значений БЖУ на основе суточной нормы калорий
 * Стандартное распределение: белки 30%, жиры 30%, углеводы 40%
 * @param dailyCalories - суточная норма калорий
 * @returns объект с целевыми значениями БЖУ в граммах
 */
export function calculateMacroTargets(dailyCalories: number): {
  protein: number;
  fat: number;
  carbs: number;
} {
  return {
    protein: Math.round((dailyCalories * 0.3) / 4), // 1г белка = 4 ккал
    fat: Math.round((dailyCalories * 0.3) / 9),       // 1г жира = 9 ккал
    carbs: Math.round((dailyCalories * 0.4) / 4),       // 1г углеводов = 4 ккал
  };
}

/**
 * Создание полного профиля пользователя с расчетом всех целевых значений
 * @param profileData - базовые данные профиля
 * @returns полный профиль с рассчитанными целями
 */
export function createUserProfile(
  profileData: Omit<UserProfile, 'dailyCalorieTarget' | 'proteinTarget' | 'fatTarget' | 'carbsTarget'>
): UserProfile {
  const dailyCalorieTarget = calculateDailyCalories(
    profileData.weight,
    profileData.height,
    profileData.age,
    profileData.gender,
    profileData.activityLevel,
    profileData.goal
  );

  const macros = calculateMacroTargets(dailyCalorieTarget);

  return {
    ...profileData,
    dailyCalorieTarget,
    proteinTarget: macros.protein,
    fatTarget: macros.fat,
    carbsTarget: macros.carbs,
  };
}

/**
 * Расчет калорий и БЖУ для указанного количества продукта
 * @param caloriesPer100g - калории на 100г
 * @param proteinPer100g - белки на 100г
 * @param fatPer100g - жиры на 100г
 * @param carbsPer100g - углеводы на 100г
 * @param quantityGrams - количество в граммах
 * @returns рассчитанные значения
 */
export function calculateFoodNutrients(
  caloriesPer100g: number,
  proteinPer100g: number,
  fatPer100g: number,
  carbsPer100g: number,
  quantityGrams: number
): { calories: number; protein: number; fat: number; carbs: number } {
  const ratio = quantityGrams / 100;
  return {
    calories: Math.round(caloriesPer100g * ratio),
    protein: Math.round(proteinPer100g * ratio * 10) / 10,
    fat: Math.round(fatPer100g * ratio * 10) / 10,
    carbs: Math.round(carbsPer100g * ratio * 10) / 10,
  };
}
