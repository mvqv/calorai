import React, { useState } from 'react';
import { Alert, View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/contexts/i18nContext';
import { createUserProfile } from '@/lib/calorieCalculator';
import { pb } from '@/lib/pocketbase';
import { COLORS, SIZES, FONTS } from '@/constants/theme';
import { ArrowLeft, Save } from 'lucide-react-native';
import type { Gender, ActivityLevel, Goal } from '@/types';

export default function ProfileScreen({ navigation }: any) {
  const { t } = useI18n();
  const storeProfile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const { user, profile: authProfile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(authProfile?.display_name ?? '');
  const [age, setAge] = useState((authProfile?.age ?? storeProfile?.age ?? 25).toString());
  const [weight, setWeight] = useState((authProfile?.weight ?? storeProfile?.weight ?? 70).toString());
  const [height, setHeight] = useState((authProfile?.height ?? storeProfile?.height ?? 175).toString());
  const [gender, setGender] = useState<Gender>(authProfile?.gender ?? storeProfile?.gender ?? 'male');
  const [activity, setActivity] = useState<ActivityLevel>(authProfile?.activity_level ?? storeProfile?.activityLevel ?? 'moderate');
  const [goal, setGoal] = useState<Goal>(authProfile?.goal ?? storeProfile?.goal ?? 'maintain');

  const genders: { key: Gender; label: string }[] = [
    { key: 'male', label: t('male') }, { key: 'female', label: t('female') },
  ];
  const activities: { key: ActivityLevel; label: string }[] = [
    { key: 'sedentary', label: t('sedentary') },
    { key: 'low', label: t('light') },
    { key: 'moderate', label: t('moderate') },
    { key: 'high', label: t('active') },
    { key: 'very_high', label: t('very_active') },
  ];
  const goals: { key: Goal; label: string }[] = [
    { key: 'lose', label: t('lose') },
    { key: 'maintain', label: t('maintain') },
    { key: 'gain', label: t('gain') },
  ];

  const handleSave = async () => {
    const newProfile = createUserProfile({
      id: user?.id,
      age: parseInt(age) || 25,
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 175,
      gender,
      activityLevel: activity,
      goal,
    });
    setProfile(newProfile);

    if (user) {
      try {
        await pb.collection('users').update(user.id, {
          display_name: displayName.trim() || null,
          age: newProfile.age,
          weight: newProfile.weight,
          height: newProfile.height,
          gender: newProfile.gender,
          activity_level: newProfile.activityLevel,
          goal: newProfile.goal,
          daily_calorie_target: newProfile.dailyCalorieTarget,
          protein_target: newProfile.proteinTarget,
          fat_target: newProfile.fatTarget,
          carbs_target: newProfile.carbsTarget,
        });
        await refreshProfile();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Profile update failed';
        Alert.alert('Profile update failed', msg);
        return;
      }
    }

    navigation.goBack();
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('edit_profile')}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.backBtn}>
          <Save size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.heroCard}>
          <Text style={styles.heroName}>{displayName || authProfile?.email || 'User'}</Text>
          {authProfile?.email ? <Text style={styles.heroEmail}>{authProfile.email}</Text> : null}
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.inputLabel}>{t('display_name')}</Text>
          <TextInput value={displayName} onChangeText={setDisplayName} style={[styles.input, { marginBottom: SIZES.md }]} />
          <Text style={styles.sectionTitle}>{t('body_stats_title')}</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>{t('age')}</Text>
              <TextInput value={age} onChangeText={setAge} keyboardType="numeric" style={styles.input} />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>{t('weight')} ({t('kg')})</Text>
              <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.input} />
            </View>
          </View>
          <View style={[styles.inputRow, { marginTop: SIZES.md }]}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>{t('height')} ({t('cm')})</Text>
              <TextInput value={height} onChangeText={setHeight} keyboardType="numeric" style={styles.input} />
            </View>
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>{t('personal')}</Text>
          {renderPills(genders, gender, setGender)}
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>{t('activity')}</Text>
          {renderPills(activities, activity, setActivity)}
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>{t('goal')}</Text>
          {renderPills(goals, goal, setGoal)}
        </GlassCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: FONTS.bold, color: COLORS.text },
  scroll: { padding: SIZES.lg, gap: SIZES.md },
  heroCard: { padding: SIZES.lg, marginBottom: SIZES.md },
  heroName: { fontSize: 22, fontWeight: FONTS.bold, color: COLORS.text },
  heroEmail: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  card: { padding: SIZES.lg },
  sectionTitle: { fontSize: 15, fontWeight: FONTS.semibold, color: COLORS.text, marginBottom: SIZES.md },
  inputRow: { flexDirection: 'row', gap: SIZES.md },
  inputHalf: { flex: 1 },
  inputLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 6 },
  input: { backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12, paddingHorizontal: SIZES.md, paddingVertical: 10, fontSize: 15, color: COLORS.text },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', backgroundColor: COLORS.background },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 12, color: COLORS.textMuted },
  pillTextActive: { color: '#fff', fontWeight: FONTS.semibold },
});
