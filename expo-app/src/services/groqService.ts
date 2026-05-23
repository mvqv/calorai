import { hasSupabaseEnv, supabase } from '@/lib/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const edgeFunctionUrl = supabaseUrl ? `${supabaseUrl}/functions/v1/analyze-food-image` : null;

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

export async function analyzeFoodImage(imageBase64: string, mimeType = 'image/jpeg'): Promise<AnalyzeFoodResponse> {
  if (!hasSupabaseEnv || !edgeFunctionUrl || !supabaseAnonKey) {
    throw new Error('Supabase env is not configured');
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token || supabaseAnonKey;

  const response = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      imageBase64,
      mimeType,
    }),
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
    rawResponse: typeof result.rawResponse === 'string' ? result.rawResponse : undefined,
  };
}
