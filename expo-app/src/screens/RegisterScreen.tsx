import React, { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/i18nContext';
import { COLORS, SIZES, FONTS } from '@/constants/theme';
import { Eye, EyeOff, Flame } from 'lucide-react-native';

export default function RegisterScreen({ navigation }: any) {
  const { t } = useI18n();
  const { signUp, authEnabled } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', t('pwd_min6'));
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', t('pwd_mismatch'));
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password, name.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Registration failed', error);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Flame size={20} color="#fff" />
          </View>
          <Text style={styles.logoText}>CalorAI</Text>
        </View>

        <View style={styles.card}>
        <Text style={styles.title}>{t('sign_up')}</Text>
        {!authEnabled && (
          <Text style={styles.notice}>
            EXPO_PUBLIC_SUPABASE_URL и EXPO_PUBLIC_SUPABASE_ANON_KEY не настроены.
          </Text>
        )}

        <TextInput value={name} onChangeText={setName} placeholder={t('full_name')} style={styles.input} placeholderTextColor={COLORS.textMuted} />
        <TextInput value={email} onChangeText={setEmail} placeholder={t('email')} style={styles.input} placeholderTextColor={COLORS.textMuted} autoCapitalize="none" />
        <View style={styles.passwordWrap}>
          <TextInput value={password} onChangeText={setPassword} placeholder={t('password')} style={styles.passwordInput} placeholderTextColor={COLORS.textMuted} secureTextEntry={!showPw} />
          <TouchableOpacity onPress={() => setShowPw((v) => !v)}>
            {showPw ? <EyeOff size={18} color={COLORS.textMuted} /> : <Eye size={18} color={COLORS.textMuted} />}
          </TouchableOpacity>
        </View>
        <TextInput value={confirm} onChangeText={setConfirm} placeholder={t('confirm_password')} style={styles.input} placeholderTextColor={COLORS.textMuted} secureTextEntry={!showPw} />

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('sign_up_btn')}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>{t('have_account')}</Text>
        </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, justifyContent: 'center', padding: SIZES.xxl },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 },
  logoBadge: { width: 40, height: 40, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 28, fontWeight: FONTS.bold, color: COLORS.text },
  card: { backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: COLORS.cardBorder },
  title: { fontSize: 32, fontWeight: FONTS.bold, color: COLORS.text, marginBottom: SIZES.xl },
  notice: { fontSize: 12, color: COLORS.danger, marginBottom: SIZES.md, lineHeight: 18 },
  input: { backgroundColor: COLORS.card, borderRadius: 14, padding: SIZES.md, fontSize: 15, color: COLORS.text, marginBottom: SIZES.md, borderWidth: 1, borderColor: COLORS.cardBorder },
  passwordWrap: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SIZES.md, paddingHorizontal: SIZES.md, flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, height: 50, fontSize: 15, color: COLORS.text },
  btn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: SIZES.md, alignItems: 'center', marginTop: SIZES.sm },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: FONTS.semibold },
  link: { textAlign: 'center', color: COLORS.primary, fontWeight: FONTS.semibold, marginTop: SIZES.lg },
});
