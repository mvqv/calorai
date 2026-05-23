import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/i18nContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, ReferenceLine,
} from 'recharts';

const AnalyticsPage: React.FC = () => {
  const { t } = useI18n();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const dailyLogs = useAppStore((s) => s.dailyLogs);
  const weightEntries = useAppStore((s) => s.weightEntries);
  const storeProfile = useAppStore((s) => s.profile);
  const { profile: authProfile } = useAuth();

  const target = authProfile?.daily_calorie_target ?? storeProfile?.dailyCalorieTarget ?? 2000;
  const days = period === 'week' ? 7 : 30;

  const calorieData = React.useMemo(() => {
    return [...dailyLogs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-days)
      .map(log => ({
        date: new Date(log.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        calories: log.totalCalories,
        protein: log.totalProtein,
        fat: log.totalFat,
        carbs: log.totalCarbs,
      }));
  }, [dailyLogs, days]);

  const weightData = React.useMemo(() => {
    return [...weightEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-days)
      .map(e => ({
        date: new Date(e.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        weight: e.weight,
      }));
  }, [weightEntries, days]);

  const avgCalories = calorieData.length > 0
    ? Math.round(calorieData.reduce((s, d) => s + d.calories, 0) / calorieData.length)
    : 0;
  const weightChange = weightData.length >= 2
    ? weightData[weightData.length - 1].weight - weightData[0].weight
    : 0;

  const tooltipStyle = {
    borderRadius: 12, border: 'none',
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  };

  const empty = (
    <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
      {t('no_data')}
    </div>
  );

  return (
    <div className="pb-24 page-enter px-4 pt-6 space-y-4">
      <div className="glass rounded-3xl px-5 py-4">
        <h1 className="text-xl font-bold text-foreground text-balance">{t('analytics')}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t('track_nutrition')}</p>
      </div>

      <div className="glass rounded-2xl p-1 flex">
        {(['week', 'month'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              period === p ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'
            }`}>
            {p === 'week' ? t('seven_days') : t('thirty_days')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">{t('avg_calories')}</p>
          <p className="text-2xl font-bold text-primary mt-1">{avgCalories}</p>
          <p className="text-xs text-muted-foreground">{t('kcal')}/day</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">{t('weight_change')}</p>
          <p className={`text-2xl font-bold mt-1 ${weightChange <= 0 ? 'text-green-500' : 'text-primary'}`}>
            {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground">{t('kg')}</p>
        </div>
      </div>

      <div className="glass rounded-3xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">{t('calorie_intake')}</h2>
        {calorieData.length > 0 ? (
          <div className="w-full min-w-0 overflow-hidden h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={40} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} ${t('kcal')}`, t('calories')]} />
                <ReferenceLine y={target} stroke="#ff6b35" strokeDasharray="5 5" label={{ value: t('goal_label'), position: 'right', fontSize: 10, fill: '#ff6b35' }} />
                <Bar dataKey="calories" fill="#ff6b35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : empty}
      </div>

      <div className="glass rounded-3xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">{t('weight_trend')}</h2>
        {weightData.length > 0 ? (
          <div className="w-full min-w-0 overflow-hidden h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={36} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} ${t('kg')}`, t('weight_trend')]} />
                <Line type="monotone" dataKey="weight" stroke="#ff6b35" strokeWidth={2.5}
                  dot={{ fill: '#ff6b35', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : empty}
      </div>

      <div className="glass rounded-3xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">{t('macros')}</h2>
        {calorieData.length > 0 ? (
          <div className="w-full min-w-0 overflow-hidden h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={36} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="protein" name={t('protein')} fill="#60a5fa" radius={[2, 2, 0, 0]} />
                <Bar dataKey="fat"     name={t('fat')}     fill="#facc15" radius={[2, 2, 0, 0]} />
                <Bar dataKey="carbs"   name={t('carbs')}   fill="#ff6b35" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : empty}
      </div>
    </div>
  );
};

export default AnalyticsPage;
