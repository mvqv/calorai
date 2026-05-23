import React from 'react';
import { useI18n } from '@/contexts/i18nContext';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label: string;
  unit?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 100,
  strokeWidth = 8,
  color = '#10b981',
  bgColor = 'rgba(0,0,0,0.06)',
  label,
  unit,
}) => {
  const { t } = useI18n();
  const displayUnit = unit ?? t('g');
  const percentage = Math.min((value / Math.max(max, 1)) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="ring-draw"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-foreground">{Math.round(value)}</span>
          <span className="text-xs text-muted-foreground">{displayUnit}</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-semibold text-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground">{Math.round(max)}{displayUnit}</span>
    </div>
  );
};
