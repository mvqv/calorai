import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n, LANG_LABELS, type Lang } from '@/contexts/i18nContext';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/db/supabase';
import {
  Globe, User, Lock, Trash2, ChevronRight, ArrowLeft,
  Check, AlertTriangle, LogOut, Bell, BellOff,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';

type Section = null | 'editProfile' | 'changePassword';

const REMINDER_KEY = 'calorie-reminders';

interface ReminderSettings {
  meals: boolean;
  water: boolean;
}

function loadReminders(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    return raw ? JSON.parse(raw) : { meals: false, water: false };
  } catch {
    return { meals: false, water: false };
  }
}

function saveReminders(settings: ReminderSettings) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
}

const SettingsPage: React.FC = () => {
  const { profile, refreshProfile, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

  const [section, setSection] = useState<Section>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Edit profile form
  const [name, setName] = useState(profile?.display_name ?? '');
  const [age, setAge] = useState(String(profile?.age ?? ''));
  const [weight, setWeight] = useState(String(profile?.weight ?? ''));
  const [height, setHeight] = useState(String(profile?.height ?? ''));

  // Change password form
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // Reminders
  const [reminders, setReminders] = useState<ReminderSettings>(loadReminders);
  const mealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Schedule reminders via Notification API
  useEffect(() => {
    if (mealIntervalRef.current) clearInterval(mealIntervalRef.current);
    if (reminders.meals && 'Notification' in window && Notification.permission === 'granted') {
      mealIntervalRef.current = setInterval(() => {
        const h = new Date().getHours();
        const m = new Date().getMinutes();
        if ((h === 8 || h === 12 || h === 18) && m === 0) {
          new Notification('🍽 ' + t('meal_reminders'), { body: t('reminder_note'), icon: '/favicon.ico' });
        }
      }, 60_000);
    }
    return () => { if (mealIntervalRef.current) clearInterval(mealIntervalRef.current); };
  }, [reminders.meals, t]);

  useEffect(() => {
    if (waterIntervalRef.current) clearInterval(waterIntervalRef.current);
    if (reminders.water && 'Notification' in window && Notification.permission === 'granted') {
      waterIntervalRef.current = setInterval(() => {
        new Notification('💧 ' + t('water_reminders'), { body: t('add_glass'), icon: '/favicon.ico' });
      }, 2 * 60 * 60 * 1000);
    }
    return () => { if (waterIntervalRef.current) clearInterval(waterIntervalRef.current); };
  }, [reminders.water, t]);

  const toggleReminder = async (key: keyof ReminderSettings) => {
    if (!('Notification' in window)) {
      toast.error(t('notif_denied'));
      return;
    }
    if (Notification.permission === 'denied') {
      toast.error(t('notif_denied'));
      return;
    }
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      if (result !== 'granted') {
        toast.error(t('notif_denied'));
        return;
      }
    }
    const updated = { ...reminders, [key]: !reminders[key] };
    setReminders(updated);
    saveReminders(updated);
    toast.success(updated[key] ? t('reminder_on') : t('reminder_off'));
  };

  const handleSignOut = async () => {
    await signOut();
    setOnboardingComplete(false);
    navigate('/login', { replace: true });
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('update_profile', {
        p_display_name: name.trim() || null,
        p_age: age ? parseInt(age) : null,
        p_weight: weight ? parseFloat(weight) : null,
        p_height: height ? parseFloat(height) : null,
      });
      if (error) throw error;
      await refreshProfile();
      toast.success(t('profile_updated'));
      setSection(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('error_deleting'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPwd.length < 6) { toast.error(t('pwd_min6')); return; }
    if (newPwd !== confirmPwd) { toast.error(t('pwd_mismatch')); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) throw error;
      toast.success(t('password_updated'));
      setNewPwd(''); setConfirmPwd('');
      setSection(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('error_deleting'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('delete_own_account');
      if (error) throw error;
      await signOut();
      setOnboardingComplete(false);
      toast.success(t('account_deleted'));
      navigate('/login', { replace: true });
    } catch {
      toast.error(t('error_deleting'));
    } finally {
      setIsLoading(false);
    }
  };

  const LANGS = Object.entries(LANG_LABELS) as [Lang, string][];

  // --- Sub-sections ---
  if (section === 'editProfile') {
    return (
      <div className="pb-24 min-h-screen page-enter">
        <div className="glass-strong sticky top-0 z-20 px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => setSection(null)}
            className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shrink-0 btn-press ripple-container">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t('edit_profile')}</h1>
        </div>
        <div className="px-4 pt-4 space-y-4">
          <div className="glass rounded-3xl p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('display_name')}</label>
              <Input value={name} onChange={e => setName(e.target.value)}
                className="bg-white/70 border-white/60 rounded-xl h-11" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('age')}</label>
              <Input value={age} onChange={e => setAge(e.target.value)} type="number" inputMode="numeric"
                className="bg-white/70 border-white/60 rounded-xl h-11" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('weight')} ({t('kg')})</label>
              <Input value={weight} onChange={e => setWeight(e.target.value)} type="number" inputMode="decimal"
                className="bg-white/70 border-white/60 rounded-xl h-11" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('height')} ({t('cm')})</label>
              <Input value={height} onChange={e => setHeight(e.target.value)} type="number" inputMode="decimal"
                className="bg-white/70 border-white/60 rounded-xl h-11" />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-2xl btn-press">
            <Check size={16} className="mr-2" /> {t('save')}
          </Button>
        </div>
      </div>
    );
  }

  if (section === 'changePassword') {
    return (
      <div className="pb-24 min-h-screen page-enter">
        <div className="glass-strong sticky top-0 z-20 px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => setSection(null)}
            className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shrink-0 btn-press ripple-container">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t('change_password')}</h1>
        </div>
        <div className="px-4 pt-4 space-y-4">
          <div className="glass rounded-3xl p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('new_password')}</label>
              <Input value={newPwd} onChange={e => setNewPwd(e.target.value)}
                type="password" className="bg-white/70 border-white/60 rounded-xl h-11" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('confirm_password')}</label>
              <Input value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                type="password" className="bg-white/70 border-white/60 rounded-xl h-11" />
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-2xl btn-press">
            <Lock size={16} className="mr-2" /> {t('save')}
          </Button>
        </div>
      </div>
    );
  }

  // --- Main settings page ---
  return (
    <div className="pb-24 px-4 pt-6 space-y-4 min-h-screen page-enter stagger-children">
      <div className="glass rounded-3xl px-5 py-4">
        <h1 className="text-xl font-bold text-foreground text-balance">{t('settings_title')}</h1>
      </div>

      {/* Language */}
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} className="text-primary" />
          <h2 className="font-semibold text-foreground">{t('language')}</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {LANGS.map(([code, label]) => (
            <button key={code} onClick={() => setLang(code)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition-all btn-press ${
                lang === code
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/60 text-foreground border-white/60 hover:border-primary/40'
              }`}>
              <span className="truncate">{label}</span>
              {lang === code && <Check size={14} className="shrink-0 ml-1" />}
            </button>
          ))}
        </div>
      </div>

      {/* Reminders */}
      <div className="glass rounded-3xl p-5 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <Bell size={18} className="text-primary" />
          <h2 className="font-semibold text-foreground">{t('reminders')}</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{t('reminder_note')}</p>

        {/* Meal reminders */}
        <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/60 transition-colors">
          <div className="flex items-center gap-3">
            {reminders.meals
              ? <Bell size={16} className="text-primary" />
              : <BellOff size={16} className="text-muted-foreground" />}
            <span className="text-sm font-medium text-foreground">{t('meal_reminders')}</span>
          </div>
          <button
            onClick={() => toggleReminder('meals')}
            className={`relative w-11 h-6 rounded-full toggle-track ${reminders.meals ? 'bg-primary' : 'bg-muted'}`}
            aria-label={t('meal_reminders')}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow toggle-thumb ${reminders.meals ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Water reminders */}
        <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/60 transition-colors">
          <div className="flex items-center gap-3">
            {reminders.water
              ? <Bell size={16} className="text-primary" />
              : <BellOff size={16} className="text-muted-foreground" />}
            <span className="text-sm font-medium text-foreground">{t('water_reminders')}</span>
          </div>
          <button
            onClick={() => toggleReminder('water')}
            className={`relative w-11 h-6 rounded-full toggle-track ${reminders.water ? 'bg-primary' : 'bg-muted'}`}
            aria-label={t('water_reminders')}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow toggle-thumb ${reminders.water ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="glass rounded-3xl p-5 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <User size={18} className="text-primary" />
          <h2 className="font-semibold text-foreground">{t('account')}</h2>
        </div>

        <button onClick={() => {
            setName(profile?.display_name ?? '');
            setAge(String(profile?.age ?? ''));
            setWeight(String(profile?.weight ?? ''));
            setHeight(String(profile?.height ?? ''));
            setSection('editProfile');
          }}
          className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/60 transition-colors btn-press ripple-container">
          <div className="flex items-center gap-3">
            <User size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t('edit_profile')}</span>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        <button onClick={() => { setNewPwd(''); setConfirmPwd(''); setSection('changePassword'); }}
          className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/60 transition-colors btn-press ripple-container">
          <div className="flex items-center gap-3">
            <Lock size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t('change_password')}</span>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        {/* Sign out */}
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/60 transition-colors btn-press">
          <LogOut size={16} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{t('sign_out')}</span>
        </button>
      </div>

      {/* Delete account */}
      <div className="glass rounded-3xl p-5">
        <button onClick={() => setShowDeleteDialog(true)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 transition-colors btn-press">
          <Trash2 size={16} className="text-destructive" />
          <span className="text-sm font-semibold text-destructive">{t('delete_account')}</span>
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground pb-2">{t('version')} 1.0.0</p>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-3xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-destructive" />
              </div>
              <AlertDialogTitle className="text-lg">{t('delete_account')}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {t('delete_account_confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 flex-col sm:flex-row">
            <AlertDialogCancel className="rounded-xl">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-xl">
              {t('delete_account_btn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsPage;
