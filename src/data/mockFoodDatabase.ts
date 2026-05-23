import type { FoodItem } from '@/types';

/**
 * Multilingual food database — names in English with Russian aliases
 * Used as local search fallback; real app can integrate OpenFoodFacts API
 */
export const mockFoodDatabase: FoodItem[] = [
  // ─── Protein sources ───────────────────────────────────────────────
  { id: '1',  name: 'Chicken Breast (boiled)',   caloriesPer100g: 165, proteinPer100g: 31,  fatPer100g: 3.6, carbsPer100g: 0,   source: 'database' },
  { id: '2',  name: 'Chicken Egg',               caloriesPer100g: 155, proteinPer100g: 13,  fatPer100g: 11,  carbsPer100g: 1.1, source: 'database' },
  { id: '3',  name: 'Salmon (baked)',             caloriesPer100g: 208, proteinPer100g: 20,  fatPer100g: 13,  carbsPer100g: 0,   source: 'database' },
  { id: '4',  name: 'Tuna in water (canned)',     caloriesPer100g: 116, proteinPer100g: 26,  fatPer100g: 1,   carbsPer100g: 0,   source: 'database' },
  { id: '5',  name: 'Turkey (boiled)',            caloriesPer100g: 135, proteinPer100g: 30,  fatPer100g: 1,   carbsPer100g: 0,   source: 'database' },
  { id: '6',  name: 'Beef (stewed)',              caloriesPer100g: 185, proteinPer100g: 22,  fatPer100g: 10,  carbsPer100g: 0,   source: 'database' },
  { id: '7',  name: 'Shrimp (boiled)',            caloriesPer100g: 99,  proteinPer100g: 24,  fatPer100g: 0.3, carbsPer100g: 0,   source: 'database' },
  { id: '8',  name: 'Greek Yogurt 2%',            caloriesPer100g: 73,  proteinPer100g: 10,  fatPer100g: 2,   carbsPer100g: 3.6, source: 'database' },
  { id: '9',  name: 'Cottage Cheese 5%',          caloriesPer100g: 121, proteinPer100g: 17,  fatPer100g: 5,   carbsPer100g: 1.8, source: 'database' },
  { id: '10', name: 'Milk 2.5%',                  caloriesPer100g: 52,  proteinPer100g: 2.8, fatPer100g: 2.5, carbsPer100g: 4.7, source: 'database' },
  // ─── Grains & carbs ────────────────────────────────────────────────
  { id: '11', name: 'White Rice (cooked)',         caloriesPer100g: 130, proteinPer100g: 2.7, fatPer100g: 0.3, carbsPer100g: 28,  source: 'database' },
  { id: '12', name: 'Oatmeal (water)',             caloriesPer100g: 68,  proteinPer100g: 2.4, fatPer100g: 1.4, carbsPer100g: 12,  source: 'database' },
  { id: '13', name: 'Buckwheat (cooked)',          caloriesPer100g: 132, proteinPer100g: 4.5, fatPer100g: 1.6, carbsPer100g: 24,  source: 'database' },
  { id: '14', name: 'Pasta (cooked)',              caloriesPer100g: 158, proteinPer100g: 5.8, fatPer100g: 0.9, carbsPer100g: 31,  source: 'database' },
  { id: '15', name: 'Whole Wheat Bread',           caloriesPer100g: 247, proteinPer100g: 9,   fatPer100g: 3,   carbsPer100g: 43,  source: 'database' },
  { id: '16', name: 'Quinoa (cooked)',             caloriesPer100g: 120, proteinPer100g: 4.4, fatPer100g: 1.9, carbsPer100g: 21,  source: 'database' },
  // ─── Vegetables ────────────────────────────────────────────────────
  { id: '17', name: 'Broccoli (steamed)',          caloriesPer100g: 35,  proteinPer100g: 2.4, fatPer100g: 0.4, carbsPer100g: 7.2, source: 'database' },
  { id: '18', name: 'Cucumber',                   caloriesPer100g: 15,  proteinPer100g: 0.7, fatPer100g: 0.1, carbsPer100g: 3.6, source: 'database' },
  { id: '19', name: 'Tomato',                     caloriesPer100g: 18,  proteinPer100g: 0.9, fatPer100g: 0.2, carbsPer100g: 3.9, source: 'database' },
  { id: '20', name: 'Carrot',                     caloriesPer100g: 41,  proteinPer100g: 0.9, fatPer100g: 0.2, carbsPer100g: 10,  source: 'database' },
  { id: '21', name: 'Sweet Potato (baked)',        caloriesPer100g: 90,  proteinPer100g: 2,   fatPer100g: 0.1, carbsPer100g: 21,  source: 'database' },
  { id: '22', name: 'Spinach (raw)',               caloriesPer100g: 23,  proteinPer100g: 2.9, fatPer100g: 0.4, carbsPer100g: 3.6, source: 'database' },
  // ─── Fruits ────────────────────────────────────────────────────────
  { id: '23', name: 'Banana',                     caloriesPer100g: 89,  proteinPer100g: 1.1, fatPer100g: 0.3, carbsPer100g: 23,  source: 'database' },
  { id: '24', name: 'Apple',                      caloriesPer100g: 52,  proteinPer100g: 0.3, fatPer100g: 0.2, carbsPer100g: 14,  source: 'database' },
  { id: '25', name: 'Avocado',                    caloriesPer100g: 160, proteinPer100g: 2,   fatPer100g: 15,  carbsPer100g: 9,   source: 'database' },
  { id: '26', name: 'Orange',                     caloriesPer100g: 47,  proteinPer100g: 0.9, fatPer100g: 0.1, carbsPer100g: 12,  source: 'database' },
  { id: '27', name: 'Blueberries',                caloriesPer100g: 57,  proteinPer100g: 0.7, fatPer100g: 0.3, carbsPer100g: 14,  source: 'database' },
  { id: '28', name: 'Strawberries',               caloriesPer100g: 32,  proteinPer100g: 0.7, fatPer100g: 0.3, carbsPer100g: 7.7, source: 'database' },
  // ─── Nuts & fats ───────────────────────────────────────────────────
  { id: '29', name: 'Almonds',                    caloriesPer100g: 579, proteinPer100g: 21,  fatPer100g: 50,  carbsPer100g: 22,  source: 'database' },
  { id: '30', name: 'Peanut Butter',              caloriesPer100g: 588, proteinPer100g: 25,  fatPer100g: 50,  carbsPer100g: 20,  source: 'database' },
  { id: '31', name: 'Walnuts',                    caloriesPer100g: 654, proteinPer100g: 15,  fatPer100g: 65,  carbsPer100g: 14,  source: 'database' },
  { id: '32', name: 'Olive Oil',                  caloriesPer100g: 884, proteinPer100g: 0,   fatPer100g: 100, carbsPer100g: 0,   source: 'database' },
  // ─── Dairy & eggs ──────────────────────────────────────────────────
  { id: '33', name: 'Cheddar Cheese',             caloriesPer100g: 403, proteinPer100g: 25,  fatPer100g: 33,  carbsPer100g: 1.3, source: 'database' },
  { id: '34', name: 'Butter',                     caloriesPer100g: 717, proteinPer100g: 0.9, fatPer100g: 81,  carbsPer100g: 0.1, source: 'database' },
  // ─── Ready meals & popular dishes ──────────────────────────────────
  { id: '35', name: 'Cheese Omelette',            caloriesPer100g: 210, proteinPer100g: 12,  fatPer100g: 16,  carbsPer100g: 2,   source: 'database' },
  { id: '36', name: 'Caesar Salad with Chicken',  caloriesPer100g: 220, proteinPer100g: 18,  fatPer100g: 14,  carbsPer100g: 6,   source: 'database' },
  { id: '37', name: 'Pasta Bolognese',            caloriesPer100g: 280, proteinPer100g: 14,  fatPer100g: 12,  carbsPer100g: 28,  source: 'database' },
  { id: '38', name: 'Beef Goulash',               caloriesPer100g: 180, proteinPer100g: 22,  fatPer100g: 9,   carbsPer100g: 3,   source: 'database' },
  { id: '39', name: 'Berry Smoothie',             caloriesPer100g: 85,  proteinPer100g: 2,   fatPer100g: 0.5, carbsPer100g: 18,  source: 'database' },
  { id: '40', name: 'Pancakes (cottage cheese)',  caloriesPer100g: 265, proteinPer100g: 14,  fatPer100g: 15,  carbsPer100g: 16,  source: 'database' },
  // ─── Drinks ────────────────────────────────────────────────────────
  { id: '41', name: 'Kefir 1%',                   caloriesPer100g: 40,  proteinPer100g: 3.4, fatPer100g: 1,   carbsPer100g: 4.8, source: 'database' },
  { id: '42', name: 'Orange Juice (fresh)',        caloriesPer100g: 45,  proteinPer100g: 0.7, fatPer100g: 0.2, carbsPer100g: 10,  source: 'database' },
  { id: '43', name: 'Protein Shake (whey)',        caloriesPer100g: 370, proteinPer100g: 75,  fatPer100g: 4,   carbsPer100g: 8,   source: 'database' },
  // ─── Snacks ────────────────────────────────────────────────────────
  { id: '44', name: 'Dark Chocolate 70%',         caloriesPer100g: 600, proteinPer100g: 7.8, fatPer100g: 43,  carbsPer100g: 46,  source: 'database' },
  { id: '45', name: 'Hummus',                     caloriesPer100g: 166, proteinPer100g: 7.9, fatPer100g: 9.6, carbsPer100g: 14,  source: 'database' },
];

/**
 * Search food items by name (case-insensitive, supports partial match)
 */
export function searchFoodItems(query: string): FoodItem[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return mockFoodDatabase.filter(item =>
    item.name.toLowerCase().includes(q)
  );
}

export function getFoodItemById(id: string): FoodItem | undefined {
  return mockFoodDatabase.find(item => item.id === id);
}
