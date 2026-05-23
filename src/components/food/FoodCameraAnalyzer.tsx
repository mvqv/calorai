import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Loader2, Check, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { analyzeFoodImage, type AnalyzedFood } from '@/services/groqService';
import { calculateFoodNutrients } from '@/lib/calorieCalculator';
import type { FoodItem } from '@/types';

interface FoodCameraAnalyzerProps {
  onAddFood: (food: FoodItem, quantityGrams: number) => void;
}

export const FoodCameraAnalyzer: React.FC<FoodCameraAnalyzerProps> = ({ onAddFood }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedFoods, setAnalyzedFoods] = useState<AnalyzedFood[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG)');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setAnalyzedFoods([]);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeFoodImage(selectedFile);
      if (result.foods && result.foods.length > 0) {
        setAnalyzedFoods(result.foods);
        const init: Record<number, number> = {};
        result.foods.forEach((food, idx) => { init[idx] = food.estimatedWeightGrams; });
        setQuantities(init);
      } else {
        setError('Could not identify food items in this photo. Try a clearer image.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error analyzing photo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToDiary = (food: AnalyzedFood, index: number) => {
    const qty = quantities[index] || food.estimatedWeightGrams;
    const foodItem: FoodItem = {
      id: `ai-${Date.now()}-${index}`,
      name: food.name,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      fatPer100g: food.fatPer100g,
      carbsPer100g: food.carbsPer100g,
      source: 'user',
    };
    onAddFood(foodItem, qty);
    toast.success(`${food.name} added to diary!`);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalyzedFoods([]);
    setError(null);
    setQuantities({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      {!previewUrl && (
        <div onClick={() => fileInputRef.current?.click()}
          className="glass border-2 border-dashed border-primary/30 rounded-3xl p-10 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all">
          <Camera size={36} className="mx-auto text-primary mb-3" />
          <p className="text-sm font-semibold text-foreground">Tap to select a food photo</p>
          <p className="text-xs text-muted-foreground mt-1">AI will identify items and calculate calories</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div className="relative rounded-3xl overflow-hidden">
          <img src={previewUrl} alt="Food photo" className="w-full h-52 object-cover" />
          <button onClick={handleReset}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Analyze button */}
      {previewUrl && analyzedFoods.length === 0 && !isAnalyzing && (
        <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-2xl" onClick={handleAnalyze}>
          <Upload size={16} className="mr-2" /> Analyze with AI
        </Button>
      )}

      {/* Loading */}
      {isAnalyzing && (
        <div className="glass rounded-3xl text-center py-8">
          <Loader2 size={28} className="mx-auto animate-spin text-primary mb-3" />
          <p className="text-sm font-medium text-foreground">AI is analyzing your photo…</p>
          <p className="text-xs text-muted-foreground mt-1">Identifying items & calculating nutrition</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Results */}
      {analyzedFoods.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground text-sm px-1">Recognized items:</h3>
          {analyzedFoods.map((food, idx) => {
            const quantity = quantities[idx] ?? food.estimatedWeightGrams;
            const nutrients = calculateFoodNutrients(food.caloriesPer100g, food.proteinPer100g, food.fatPer100g, food.carbsPer100g, quantity);
            return (
              <div key={idx} className="glass rounded-3xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-foreground text-sm flex-1 min-w-0 pr-2 truncate">{food.name}</h4>
                  <button onClick={() => handleAddToDiary(food, idx)}
                    className="flex items-center gap-1 text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-xl shrink-0">
                    <Check size={12} /> Add
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">Per 100g:</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-orange-50 rounded-xl p-2">
                    <div className="text-xs font-bold text-primary">{food.caloriesPer100g}</div>
                    <div className="text-[10px] text-muted-foreground">kcal</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-2">
                    <div className="text-xs font-bold text-blue-500">{food.proteinPer100g}</div>
                    <div className="text-[10px] text-muted-foreground">prot</div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-2">
                    <div className="text-xs font-bold text-yellow-500">{food.fatPer100g}</div>
                    <div className="text-[10px] text-muted-foreground">fat</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-2">
                    <div className="text-xs font-bold text-orange-500">{food.carbsPer100g}</div>
                    <div className="text-[10px] text-muted-foreground">carbs</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Portion weight</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuantities(p => ({ ...p, [idx]: Math.max(10, (p[idx] ?? food.estimatedWeightGrams) - 10) }))}
                        className="w-7 h-7 rounded-xl bg-white/70 border border-white/60 flex items-center justify-center">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold text-primary w-12 text-center">{quantity}g</span>
                      <button onClick={() => setQuantities(p => ({ ...p, [idx]: (p[idx] ?? food.estimatedWeightGrams) + 10 }))}
                        className="w-7 h-7 rounded-xl bg-white/70 border border-white/60 flex items-center justify-center">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <Slider value={[quantity]} onValueChange={v => setQuantities(p => ({ ...p, [idx]: v[0] }))} min={10} max={500} step={10} />

                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total for {quantity}g</p>
                    <p className="text-xl font-bold text-primary">{nutrients.calories} <span className="text-sm font-normal">kcal</span></p>
                    <div className="flex justify-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>P: {nutrients.protein}g</span>
                      <span>F: {nutrients.fat}g</span>
                      <span>C: {nutrients.carbs}g</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={handleReset}
            className="w-full h-11 glass rounded-2xl text-sm font-semibold text-foreground flex items-center justify-center gap-2">
            <Camera size={15} /> Take another photo
          </button>
        </div>
      )}
    </div>
  );
};


interface FoodCameraAnalyzerProps {
  onAddFood: (food: FoodItem, quantityGrams: number) => void;
}



