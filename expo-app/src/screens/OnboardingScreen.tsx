import React, { useMemo, useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/contexts/i18nContext';
import { createUserProfile } from '@/lib/calorieCalculator';
import { pb } from '@/lib/pocketbase';
import { COLORS, SIZES, FONTS } from '@/constants/theme';
import type { Gender, ActivityLevel, Goal } from '@/types';

export default function OnboardingScreen({ navigation }: any) {
  const { t } = useI18n();
  const { user, refreshProfile } = useAuth();
  const setProfile = useAppStore((s) => s.setProfile);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

  const [step, setStep] = useState(0);
  const [age, setAge] = useState('25');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [gender, setGender] = useState<Gender>('male');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const previewProfile = useMemo(() => createUserProfile({
    age: parseInt(age) || 25,
    weight: parseFloat(weight) || 70,
    height: parseFloat(height) || 175,
    gender,
    activityLevel: activity,
    goal,
  }), [activity, age, gender, goal, height, weight]);

  const steps = [
    { title: t('personal'), subtitle: t('body_stats') },
    { title: t('activity'), subtitle: t('activity') },
    { title: t('goal'), subtitle: t('goal') },
  ];

  const genders = [
    { key: 'male' as Gender, label: t('male') },
    { key: 'female' as Gender, label: t('female') },
  ];
  const activities = [
    { key: 'sedentary' as ActivityLevel, label: t('sedentary') },
    { key: 'low' as ActivityLevel, label: t('light') },
    { key: 'moderate' as ActivityLevel, label: t('moderate') },
    { key: 'high' as ActivityLevel, label: t('active') },
    { key: 'very_high' as ActivityLevel, label: t('very_active') },
  ];
  const goals = [
    { key: 'lose' as Goal, label: t('lose') },
    { key: 'maintain' as Goal, label: t('maintain') },
    { key: 'gain' as Goal, label: t('gain') },
  ];

  const handleFinish = async () => {
    const profile = createUserProfile({
      age: parseInt(age) || 25,
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 175,
      gender,
      activityLevel: activity,
      goal,
    });
    setProfile(profile);
    setOnboardingComplete(true);

    if (user) {
      try {
        await pb.collection('users').update(user.id, {
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          gender: profile.gender,
          activity_level: profile.activityLevel,
          goal: profile.goal,
          daily_calorie_target: profile.dailyCalorieTarget,
          protein_target: profile.proteinTarget,
          fat_target: profile.fatTarget,
          carbs_target: profile.carbsTarget,
          onboarding_complete: true,
        });
        await refreshProfile();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Profile save failed';
        Alert.alert('Profile save failed', msg);
        return;
      }
    }

    navigation.replace('Main');
  };

  const renderPills = (items: any[], selected: string, onSelect: (v: any) => void) => (
    <View style={styles.pillRow}>
      {items.map(item => (
        <TouchableOpacity key={item.key} onPress={() => onSelect(item.key)} style={[styles.pill, selected === item.key && styles.pillActive]}>
          <Text style={[styles.pillText, selected === item.key && styles.pillTextActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge} />
          <Text style={styles.brandText}>CalorAI</Text>
        </View>
        <View style={styles.progress}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.title}>{steps[step].title}</Text>
        <Text style={styles.subtitle}>{steps[step].subtitle}</Text>

        {step === 0 && (
          <GlassCard style={styles.glass}>
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>{t('age')}</Text>
                <TextInput value={age} onChangeText={setAge} keyboardType="numeric" style={styles.input} />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>{t('weight')} ({t('kg')})</Text>
                <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.input} />
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>{t('height')} ({t('cm')})</Text>
                <TextInput value={height} onChangeText={setHeight} keyboardType="numeric" style={styles.input} />
              </View>
            </View>
            {renderPills(genders, gender, setGender)}
          </GlassCard>
        )}

        {step === 1 && <GlassCard style={styles.glass}>{renderPills(activities, activity, setActivity)}</GlassCard>}
        {step === 2 && (
          <GlassCard style={styles.glass}>
            {renderPills(goals, goal, setGoal)}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{t('daily_targets')}</Text>
              <Text style={styles.summaryValue}>{previewProfile.dailyCalorieTarget} <Text style={styles.summaryUnit}>{t('kcal')}</Text></Text>
              <Text style={styles.summaryMacros}>
                {t('protein')} {previewProfile.proteinTarget}{t('g')} · {t('fat')} {previewProfile.fatTarget}{t('g')} · {t('carbs')} {previewProfile.carbsTarget}{t('g')}
              </Text>
            </View>
          </GlassCard>
        )}

        <View style={styles.btnRow}>
          {step > 0 && (
            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => setStep(step - 1)}>
              <Text style={styles.btnOutlineText}>{t('back')}</Text>
            </TouchableOpacity>
          )}
          {step < 2 ? (
            <TouchableOpacity style={styles.btn} onPress={() => setStep(step + 1)}>
              <Text style={styles.btnText}>{t('next')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btn} onPress={handleFinish}>
              <Text style={styles.btnText}>{t('finish')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SIZES.xxl, justifyContent: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  brandBadge: { width: 32, height: 32, borderRadius: 12, backgroundColor: COLORS.primary },
  brandText: { fontSize: 22, fontWeight: FONTS.bold, color: COLORS.text },
  progress: { flexDirection: 'row', gap: 8, marginBottom: SIZES.xxl },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.06)' },
  dotActive: { backgroundColor: COLORS.primary },
  title: { fontSize: 28, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginBottom: SIZES.xxl },
  glass: { padding: SIZES.lg },
  inputRow: { flexDirection: 'row', gap: SIZES.md, marginBottom: SIZES.lg },
  inputHalf: { flex: 1 },
  label: { fontSize: 12, color: COLORS.textMuted, marginBottom: 6 },
  input: { backgroundColor: COLORS.card, borderRadius: 14, padding: SIZES.md, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.cardBorder },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: SIZES.md },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', backgroundColor: COLORS.card },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 13, color: COLORS.textMuted },
  pillTextActive: { color: '#fff', fontWeight: FONTS.semibold },
  btnRow: { flexDirection: 'row', gap: SIZES.md, marginTop: SIZES.xxl },
  btn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 14, padding: SIZES.md, alignItems: 'center' },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.primary },
  btnText: { color: '#fff', fontSize: 16, fontWeight: FONTS.semibold },
  btnOutlineText: { color: COLORS.primary, fontSize: 16, fontWeight: FONTS.semibold },
  summaryCard: { marginTop: SIZES.lg, padding: SIZES.lg, borderRadius: 18, backgroundColor: `${COLORS.primary}10`, borderWidth: 1, borderColor: `${COLORS.primary}20`, alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  summaryValue: { fontSize: 28, fontWeight: FONTS.extrabold, color: COLORS.primary },
  summaryUnit: { fontSize: 13, fontWeight: FONTS.regular, color: COLORS.textMuted },
  summaryMacros: { marginTop: 6, fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
});
