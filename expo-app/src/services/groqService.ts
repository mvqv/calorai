import { hasPocketBaseEnv, pb } from '@/lib/pocketbase';

// The analyze-food-image endpoint — can be a PocketBase hook, a separate
// serverless function, or any HTTP endpoint that accepts the same payload.
const analyzeUrl = process.env.EXPO_PUBLIC_ANALYZE_FOOD_URL ?? null;

export interface AnalyzedFood {
  name: string;
  estimatedWeightGrams: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbsPer100g: number;
}

export interface AnalyzeFoodResponse {
  success: boolean;
  foods: AnalyzedFood[];
  rawResponse?: string;
}

const toNum = (value: unknown, decimals = 1): number => {
  const parsed = parseFloat(String(value));
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parseFloat(parsed.toFixed(decimals));
};

export async function analyzeFoodImage(
  imageBase64: string,
  mimeType = 'image/jpeg',
): Promise<AnalyzeFoodResponse> {
  if (!hasPocketBaseEnv || !analyzeUrl) {
    throw new Error('EXPO_PUBLIC_ANALYZE_FOOD_URL не настроен.');
  }

  // Use the PocketBase auth token if the user is logged in, otherwise send
  // an unauthenticated request (the server can decide whether to allow it).
  const token = pb.authStore.isValid ? pb.authStore.token : '';

  const response = await fetch(analyzeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ imageBase64, mimeType }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Image analysis failed');
  }

  return {
    success: Boolean(result.success),
    foods: (result.foods || []).map((food: Partial<AnalyzedFood>) => ({
      name: food.name || 'Unknown food',
      estimatedWeightGrams: Math.max(1, Math.round(toNum(food.estimatedWeightGrams, 0))),
      caloriesPer100g: Math.round(toNum(food.caloriesPer100g, 0)),
      proteinPer100g: toNum(food.proteinPer100g, 1),
      fatPer100g: toNum(food.fatPer100g, 1),
      carbsPer100g: toNum(food.carbsPer100g, 1),
    })),
    rawResponse:
      typeof result.rawResponse === 'string' ? result.rawResponse : undefined,
  };
}
