import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ChevronRight, Target, User, Activity, Ruler, Weight, Flame } from 'lucide-react';
import { createUserProfile } from '@/lib/calorieCalculator';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/i18nContext';
import { supabase } from '@/db/supabase';
import type { Gender, ActivityLevel, Goal } from '@/types';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const setProfile = useAppStore((s) => s.setProfile);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
  const { user, refreshProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<Gender>('male');
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [saving, setSaving] = useState(false);

  const STEPS = [t('personal'), t('body_stats'), t('activity'), t('goal')];

  const activityOptions: { value: ActivityLevel; label: string }[] = [
    { value: 'sedentary', label: t('sedentary') },
    { value: 'low',       label: t('light') },
    { value: 'moderate',  label: t('moderate') },
    { value: 'high',      label: t('active') },
    { value: 'very_high', label: t('very_active') },
  ];

  const goalOptions: { value: Goal; label: string; icon: string }[] = [
    { value: 'lose',     label: t('lose'),     icon: '🔥' },
    { value: 'maintain', label: t('maintain'), icon: '⚖️' },
    { value: 'gain',     label: t('gain'),     icon: '💪' },
  ];

  const handleFinish = async () => {
    setSaving(true);
    const profile = createUserProfile({ age, weight, height, gender, activityLevel, goal });
    setProfile(profile);
    setOnboardingComplete(true);

    if (user) {
      await supabase.from('profiles').update({
        age, weight, height, gender,
        activity_level: activityLevel,
        goal,
        daily_calorie_target: profile.dailyCalorieTarget,
        protein_target: profile.proteinTarget,
        fat_target: profile.fatTarget,
        carbs_target: profile.carbsTarget,
        onboarding_complete: true,
      }).eq('id', user.id);
      await refreshProfile();
    }

    setSaving(false);
    navigate('/', { replace: true });
  };

  return (
    <div className="app-bg min-h-screen flex flex-col px-5 pt-10 pb-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Flame size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold gradient-text">CalorAI</span>
      </div>

      <div className="flex gap-2 mb-7">
        {STEPS.map((s, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />
            <p className={`text-xs mt-1 text-center ${i === step ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{s}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-6 flex-1">
        {step === 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                <User size={20} className="text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground text-balance">{t('personal')}</h2>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">{t('male')}/{t('female')}</label>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female'] as Gender[]).map((g) => (
                  <button key={g} onClick={() => setGender(g)}
                    className={`py-3 rounded-2xl font-medium text-sm transition-all border ${
                      gender === g
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-white/60 text-foreground border-white/60 hover:border-primary/40'
                    }`}>
                    {g === 'male' ? `👨 ${t('male')}` : `👩 ${t('female')}`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-foreground">{t('age')}</label>
                <span className="text-2xl font-bold text-primary">{age} <span className="text-sm font-normal text-muted-foreground">{t('yrs')}</span></span>
              </div>
              <Slider value={[age]} onValueChange={v => setAge(v[0])} min={14} max={80} step={1} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Ruler size={20} className="text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground text-balance">{t('body_stats')}</h2>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Weight size={14} className="text-primary" /> {t('weight')}
                </label>
                <span className="text-2xl font-bold text-primary">{weight} <span className="text-sm font-normal text-muted-foreground">{t('kg')}</span></span>
              </div>
              <Slider value={[weight]} onValueChange={v => setWeight(v[0])} min={35} max={200} step={0.5} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Ruler size={14} className="text-primary" /> {t('height')}
                </label>
                <span className="text-2xl font-bold text-primary">{height} <span className="text-sm font-normal text-muted-foreground">{t('cm')}</span></span>
              </div>
              <Slider value={[height]} onValueChange={v => setHeight(v[0])} min={130} max={220} step={1} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Activity size={20} className="text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground text-balance">{t('activity')}</h2>
            </div>
            <div className="space-y-2">
              {activityOptions.map(o => (
                <button key={o.value} onClick={() => setActivityLevel(o.value)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${
                    activityLevel === o.value
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-white/50 border-white/60 hover:border-primary/30'
                  }`}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-foreground">{o.label}</p>
                    {activityLevel === o.value && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Target size={20} className="text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground text-balance">{t('goal')}</h2>
            </div>
            <div className="space-y-3">
              {goalOptions.map(o => (
                <button key={o.value} onClick={() => setGoal(o.value)}
                  className={`w-full text-left px-4 py-4 rounded-2xl border transition-all ${
                    goal === o.value
                      ? 'bg-primary/10 border-primary'
                      : 'bg-white/50 border-white/60 hover:border-primary/30'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{o.icon}</span>
                    <p className="font-bold text-sm text-foreground">{o.label}</p>
                    {goal === o.value && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {(() => {
              const p = createUserProfile({ age, weight, height, gender, activityLevel, goal });
              return (
                <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 text-center mt-2">
                  <p className="text-xs text-muted-foreground mb-1">{t('daily_targets')}</p>
                  <p className="text-3xl font-bold text-primary">{p.dailyCalorieTarget} <span className="text-sm font-normal">{t('kcal')}</span></p>
                  <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{t('protein')} {p.proteinTarget}{t('g')}</span>
                    <span>{t('fat')} {p.fatTarget}{t('g')}</span>
                    <span>{t('carbs')} {p.carbsTarget}{t('g')}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-5">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}
            className="flex-1 h-13 rounded-2xl border-white/60 bg-white/50">
            {t('back')}
          </Button>
        )}
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)}
            className="flex-1 h-13 bg-primary hover:bg-primary/90 text-white font-semibold rounded-2xl">
            {t('next')} <ChevronRight size={18} className="ml-1" />
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={saving}
            className="flex-1 h-13 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl">
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : `${t('finish')} 🚀`}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
