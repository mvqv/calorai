import React from 'react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/i18nContext';
import { User, Target, Activity, Ruler, Calendar, LogOut, Weight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const storeProfile = useAppStore((s) => s.profile);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
  const { profile: authProfile, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setOnboardingComplete(false);
    toast.success(t('sign_out'));
    navigate('/login', { replace: true });
  };

  const activityLabels: Record<string, string> = {
    sedentary: t('sedentary'), low: t('light'), moderate: t('moderate'),
    high: t('active'), very_high: t('very_active'),
  };
  const goalLabels: Record<string, string> = {
    lose: t('lose'), maintain: t('maintain'), gain: t('gain'),
  };

  const displayName = authProfile?.display_name ?? 'User';
  const email = authProfile?.email ?? '';
  const age = authProfile?.age ?? storeProfile?.age;
  const weight = authProfile?.weight ?? storeProfile?.weight;
  const height = authProfile?.height ?? storeProfile?.height;
  const gender = authProfile?.gender ?? storeProfile?.gender;
  const activity = authProfile?.activity_level ?? storeProfile?.activityLevel;
  const goal = authProfile?.goal ?? storeProfile?.goal;
  const dailyTarget = authProfile?.daily_calorie_target ?? storeProfile?.dailyCalorieTarget;
  const proteinTarget = authProfile?.protein_target ?? storeProfile?.proteinTarget;
  const fatTarget = authProfile?.fat_target ?? storeProfile?.fatTarget;
  const carbsTarget = authProfile?.carbs_target ?? storeProfile?.carbsTarget;

  return (
    <div className="pb-24 page-enter px-4 pt-6 space-y-4">
      <div className="glass rounded-3xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
          <User size={30} className="text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-foreground truncate text-balance">{displayName}</h2>
          {email && <p className="text-sm text-muted-foreground truncate">{email}</p>}
          {gender && age && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {gender === 'male' ? t('male') : t('female')}, {age} {t('yrs')}
            </p>
          )}
        </div>
      </div>

      {(goal || activity) && (
        <div className="glass rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Target size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">{t('your_goal')}</h3>
          </div>
          {goal && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('goal')}</span>
              <span className="text-sm font-semibold text-foreground">{goalLabels[goal] ?? goal}</span>
            </div>
          )}
          {activity && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('activity')}</span>
              <span className="text-sm font-semibold text-foreground">{activityLabels[activity] ?? activity}</span>
            </div>
          )}
        </div>
      )}

      {dailyTarget && (
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">{t('daily_targets')}</h3>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center mb-4">
            <p className="text-xs text-muted-foreground mb-1">{t('calories')}</p>
            <p className="text-3xl font-bold text-primary">{dailyTarget} <span className="text-sm font-normal">{t('kcal')}</span></p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-blue-50 rounded-2xl p-3">
              <p className="text-lg font-bold text-blue-600">{proteinTarget}{t('g')}</p>
              <p className="text-xs text-muted-foreground">{t('protein')}</p>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-3">
              <p className="text-lg font-bold text-yellow-600">{fatTarget}{t('g')}</p>
              <p className="text-xs text-muted-foreground">{t('fat')}</p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-3">
              <p className="text-lg font-bold text-primary">{carbsTarget}{t('g')}</p>
              <p className="text-xs text-muted-foreground">{t('carbs')}</p>
            </div>
          </div>
        </div>
      )}

      {(weight || height) && (
        <div className="glass rounded-3xl p-5 space-y-3">
          <h3 className="font-semibold text-foreground mb-1">{t('body_stats_title')}</h3>
          {age && (
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm"><Calendar size={15} />{t('age')}</div>
              <span className="font-medium text-sm">{age} {t('yrs')}</span>
            </div>
          )}
          {weight && (
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm"><Weight size={15} />{t('weight')}</div>
              <span className="font-medium text-sm">{weight} {t('kg')}</span>
            </div>
          )}
          {height && (
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm"><Ruler size={15} />{t('height')}</div>
              <span className="font-medium text-sm">{height} {t('cm')}</span>
            </div>
          )}
        </div>
      )}

      <Button onClick={handleSignOut}
        className="w-full h-12 bg-white/80 border border-red-200 text-red-500 hover:bg-red-50 rounded-2xl font-semibold">
        <LogOut size={17} className="mr-2" /> {t('sign_out')}
      </Button>
    </div>
  );
};

export default ProfilePage;


