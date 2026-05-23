import React from 'react';
import { useI18n } from '@/contexts/i18nContext';

interface MacroPanelProps {
  protein: number;    proteinMax: number;
  fat: number;        fatMax: number;
  carbs: number;      carbsMax: number;
}

interface MacroBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  barClass: string;
  icon: string;
  delay: number;
}

const MacroBar: React.FC<MacroBarProps> = ({ label, value, max, unit, barClass, icon, delay }) => {
  const pct       = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const remaining = Math.max(0, max - value);
  const isOver    = value > max;

  return (
    <div
      className="py-2.5 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <span className="text-xl shrink-0 select-none">{icon}</span>

        <div className="flex-1 min-w-0">
          {/* Top row: label + value / max */}
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-semibold text-foreground">{label}</span>
            <div className="flex items-baseline gap-0.5">
              <span
                className="text-lg font-extrabold tabular-nums leading-none text-foreground"
                style={{ animation: `countUp 0.4s cubic-bezier(0.22,1,0.36,1) ${delay + 80}ms both` }}
              >
                {value}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">{unit}</span>
              <span className="text-[10px] text-muted-foreground mx-0.5 opacity-50">/</span>
              <span className="text-[11px] text-muted-foreground font-medium tabular-nums">{max}{unit}</span>
            </div>
          </div>

          {/* Progress track */}
          <div className="h-2 rounded-full overflow-hidden bg-muted">
            <div
              className={`h-full rounded-full ${isOver ? 'bg-destructive' : barClass}`}
              style={{
                width: `${pct}%`,
                transition: `width 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay + 120}ms`,
              }}
            />
          </div>

          {/* Remaining hint */}
          <div className="mt-1 text-[10px] text-muted-foreground">
            {isOver
              ? <span className="text-destructive font-semibold">+{value - max}{unit} over</span>
              : <span>{remaining}{unit} {'\u2009'}remaining</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export const MacroPanel: React.FC<MacroPanelProps> = ({
  protein, proteinMax, fat, fatMax, carbs, carbsMax,
}) => {
  const { t } = useI18n();
  const total = protein + fat + carbs;

  // Proportional widths for the colour split bar
  const pBar = total > 0 ? (protein / total) * 100 : 33.3;
  const fBar = total > 0 ? (fat     / total) * 100 : 33.3;
  const cBar = total > 0 ? (carbs   / total) * 100 : 33.4;

  const macros = [
    { label: t('protein'), value: protein, max: proteinMax, barClass: 'bg-blue-400',   icon: '🥩', delay: 0   },
    { label: t('fat'),     value: fat,     max: fatMax,     barClass: 'bg-yellow-400', icon: '🧈', delay: 60  },
    { label: t('carbs'),   value: carbs,   max: carbsMax,   barClass: 'bg-orange-400', icon: '🌾', delay: 120 },
  ];

  return (
    <div className="glass rounded-3xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground">{t('macros')}</h2>
        <span className="text-xs tabular-nums px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
          {total}{t('g')} {t('total') ?? 'total'}
        </span>
      </div>

      {/* Colour split bar */}
      <div className="flex h-1.5 rounded-full overflow-hidden mb-5 bg-muted">
        <div
          className="h-full rounded-l-full bg-blue-400"
          style={{ width: `${pBar}%`, transition: 'width 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0ms' }}
        />
        <div
          className="h-full bg-yellow-400"
          style={{ width: `${fBar}%`, transition: 'width 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 60ms' }}
        />
        <div
          className="h-full rounded-r-full bg-orange-400"
          style={{ width: `${cBar}%`, transition: 'width 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 120ms' }}
        />
      </div>

      {/* Macro rows */}
      <div className="divide-y divide-border/40">
        {macros.map(m => (
          <MacroBar key={m.label} unit={t('g')} {...m} />
        ))}
      </div>
    </div>
  );
};
