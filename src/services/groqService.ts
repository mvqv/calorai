import { supabase } from '@/db/supabase';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-food-image`;

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

/**
 * Преобразует File в base64 строку
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Сжимает изображение до заданных максимальных размеров и качества
 * Возвращает File с типом image/jpeg
 */
function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Не удалось получить canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Не удалось сжать изображение'));
            return;
          }
          const compressedFile = new File([blob], 'compressed.jpg', {
            type: 'image/jpeg',
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось загрузить изображение'));
    };

    img.src = url;
  });
}

/**
 * Отправляет изображение на Edge Function для анализа через Groq Vision API
 * @param file - файл изображения
 * @returns распознанные продукты с калорийностью
 */
export async function analyzeFoodImage(file: File): Promise<AnalyzeFoodResponse> {
  // Сжимаем изображение перед отправкой (Groq ограничивает размер)
  const compressed = await compressImage(file, 1024, 0.85);
  const base64 = await fileToBase64(compressed);

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      imageBase64: base64,
      mimeType: compressed.type,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Ошибка анализа изображения');
  }

  // Дополнительная нормализация на фронте — защита от некорректных типов
  const toNum = (v: unknown, decimals = 1): number => {
    const n = parseFloat(String(v));
    if (!isFinite(n) || n < 0) return 0;
    return parseFloat(n.toFixed(decimals));
  };

  const normalized: AnalyzeFoodResponse = {
    success: result.success,
    foods: (result.foods || []).map((food: Partial<AnalyzedFood>) => ({
      name: food.name || 'Неизвестный продукт',
      estimatedWeightGrams: Math.max(1, Math.round(toNum(food.estimatedWeightGrams, 0))),
      caloriesPer100g: Math.round(toNum(food.caloriesPer100g, 0)),
      proteinPer100g: toNum(food.proteinPer100g, 1),
      fatPer100g: toNum(food.fatPer100g, 1),
      carbsPer100g: toNum(food.carbsPer100g, 1),
    })),
  };

  return normalized;
}
