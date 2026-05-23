import React from 'react';
import { useI18n } from '@/contexts/i18nContext';

interface CalorieProgressProps {
  consumed: number;
  target: number;
}

export const CalorieProgress: React.FC<CalorieProgressProps> = ({ consumed, target }) => {
  const { t } = useI18n();
  const remaining = target - consumed;
  const percentage = Math.min((consumed / Math.max(target, 1)) * 100, 100);
  const over = remaining < 0;

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <div className="text-3xl font-bold text-foreground">
            {consumed}
            <span className="text-base font-medium text-muted-foreground ml-1">{t('kcal')}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{t('consumed')}</div>
        </div>
        <div className="text-right">
          <div className={`text-xl font-bold ${over ? 'text-destructive' : 'text-primary'}`}>
            {over ? Math.abs(remaining) : remaining}
            <span className="text-sm font-normal ml-1">{t('kcal')}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {over ? t('over_limit') : t('remaining')}
          </div>
        </div>
      </div>

      {/* Animated progress bar */}
      <div className="relative h-3 bg-white/40 rounded-full overflow-hidden">
        <div
          className="h-full progress-orange rounded-full progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>{t('goal_label')}: {target} {t('kcal')}</span>
      </div>
    </div>
  );
};
