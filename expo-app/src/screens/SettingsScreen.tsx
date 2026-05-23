import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/lib/supabase';
import { cancelReminder, ensureNotificationPermissions, scheduleMealReminders, scheduleWaterReminders } from '@/lib/notifications';
import { GlassCard } from '@/components/ui/GlassCard';
import { useI18n, type Lang, LANG_LABELS } from '@/contexts/i18nContext';
import { COLORS, SIZES, FONTS } from '@/constants/theme';
import { Globe, User, LogOut, ChevronRight, Bell, BellOff, Lock, Trash2, ArrowLeft } from 'lucide-react-native';

type Section = null | 'changePassword';
const REMINDER_KEY = 'calorie-reminders';

interface ReminderSettings {
  meals: boolean;
  water: boolean;
}

export default function SettingsScreen({ navigation }: any) {
  const { t, lang, setLang } = useI18n();
  const { signOut, profile } = useAuth();
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
  const langs: Lang[] = ['en', 'ru', 'de', 'es', 'tr', 'az', 'zh', 'ja', 'ko', 'ar'];
  const [section, setSection] = useState<Section>(null);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [reminders, setReminders] = useState<ReminderSettings>({ meals: false, water: false });

  useEffect(() => {
    AsyncStorage.getItem(REMINDER_KEY).then((raw) => {
      if (!raw) return;
      try {
        setReminders(JSON.parse(raw) as ReminderSettings);
      } catch {
        setReminders({ meals: false, water: false });
      }
    });
  }, []);

  const persistReminders = async (value: ReminderSettings) => {
    setReminders(value);
    await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(value));
  };

  const handleSignOut = async () => {
    await signOut();
    setOnboardingComplete(false);
    Alert.alert('Done', t('sign_out'));
  };

  const toggleReminder = async (key: keyof ReminderSettings) => {
    const granted = await ensureNotificationPermissions();
    if (!granted) {
      Alert.alert('Notifications', t('notif_denied'));
      return;
    }

    const next = { ...reminders, [key]: !reminders[key] };
    await persistReminders(next);

    if (key === 'meals') {
      if (next.meals) await scheduleMealReminders();
      else await cancelReminder('meals');
    } else {
      if (next.water) await scheduleWaterReminders();
      else await cancelReminder('water');
    }
  };

  const handleChangePassword = async () => {
    if (newPwd.length < 6) {
      Alert.alert('Error', t('pwd_min6'));
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert('Error', t('pwd_mismatch'));
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) {
      Alert.alert('Password update failed', error.message);
      return;
    }

    setNewPwd('');
    setConfirmPwd('');
    setSection(null);
    Alert.alert('Done', t('password_updated'));
  };

  const handleDeleteAccount = async () => {
    Alert.alert(t('delete_account'), t('delete_account_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('confirm'),
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.rpc('delete_own_account');
          if (error) {
            Alert.alert('Delete failed', error.message);
            return;
          }
          await signOut();
          setOnboardingComplete(false);
        },
      },
    ]);
  };

  if (section === 'changePassword') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setSection(null)} style={styles.iconButton}>
            <ArrowLeft size={18} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.header}>${''}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.header}>{t('change_password')}</Text>
          <GlassCard style={styles.card}>
            <TextInput
              value={newPwd}
              onChangeText={setNewPwd}
              placeholder={t('new_password')}
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              placeholder={t('confirm_password')}
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              style={styles.input}
            />
          </GlassCard>
          <TouchableOpacity style={styles.primaryAction} onPress={handleChangePassword}>
            <Text style={styles.primaryActionText}>{t('save')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>{t('settings_title')}</Text>
        {profile?.email && <Text style={styles.subheader}>{profile.email}</Text>}

        <GlassCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Globe size={16} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t('language')}</Text>
          </View>
          <View style={styles.langGrid}>
            {langs.map(l => (
              <TouchableOpacity key={l} onPress={() => setLang(l)} style={[styles.langPill, lang === l && styles.langPillActive]}>
                <Text style={[styles.langText, lang === l && styles.langTextActive]}>{LANG_LABELS[l]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.rowLeft}>
              <User size={18} color={COLORS.primary} />
              <Text style={styles.rowText}>{t('edit_profile')}</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => setSection('changePassword')}>
            <View style={styles.rowLeft}>
              <Lock size={18} color={COLORS.primary} />
              <Text style={styles.rowText}>{t('change_password')}</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.sectionHeader}>
            {reminders.meals || reminders.water ? <Bell size={16} color={COLORS.primary} /> : <BellOff size={16} color={COLORS.primary} />}
            <Text style={styles.sectionTitle}>{t('reminders')}</Text>
          </View>
          <TouchableOpacity style={styles.row} onPress={() => toggleReminder('meals')}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowText}>{t('meal_reminders')}</Text>
            </View>
            <Text style={styles.valueText}>{reminders.meals ? t('reminder_on') : t('reminder_off')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => toggleReminder('water')}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowText}>{t('water_reminders')}</Text>
            </View>
            <Text style={styles.valueText}>{reminders.water ? t('reminder_on') : t('reminder_off')}</Text>
          </TouchableOpacity>
        </GlassCard>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Trash2 size={18} color={COLORS.danger} />
          <Text style={styles.deleteText}>{t('delete_account')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut size={18} color={COLORS.danger} />
          <Text style={styles.signOutText}>{t('sign_out')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.lg },
  header: { fontSize: 24, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: SIZES.lg },
  headerRow: { paddingHorizontal: SIZES.lg, paddingTop: SIZES.md },
  subheader: { fontSize: 13, color: COLORS.textMuted, marginTop: -12, marginBottom: SIZES.lg },
  card: { padding: SIZES.lg, marginBottom: SIZES.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SIZES.md },
  sectionTitle: { fontSize: 15, fontWeight: FONTS.semibold, color: COLORS.text },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', backgroundColor: COLORS.background },
  langPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langText: { fontSize: 12, color: COLORS.textMuted },
  langTextActive: { color: '#fff', fontWeight: FONTS.semibold },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { fontSize: 14, color: COLORS.text, fontWeight: FONTS.medium },
  valueText: { fontSize: 12, color: COLORS.textMuted, fontWeight: FONTS.semibold },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: SIZES.lg, padding: SIZES.md },
  signOutText: { color: COLORS.danger, fontSize: 15, fontWeight: FONTS.semibold },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: SIZES.md, padding: SIZES.md },
  deleteText: { color: COLORS.danger, fontSize: 15, fontWeight: FONTS.semibold },
  iconButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  input: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 14,
    padding: SIZES.md,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  primaryAction: {
    height: 48,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: { color: '#fff', fontSize: 15, fontWeight: FONTS.semibold },
});
